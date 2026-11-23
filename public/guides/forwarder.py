# Minimal one-record-per-request Docker/CRI example. See the guide for limits.
import glob
import os
import sqlite3
import sys
import time
from pathlib import Path
from urllib.error import HTTPError
from loglogic_client import send_log

MAX_LINE = 262144

def ship(raw, metadata):
    message = raw.decode('utf-8', errors='replace').rstrip('\r\n')
    if not message:
        return
    delay = 1
    while True:
        try:
            send_log('container-logs', 'info', message[:64000],
                     {**metadata, 'truncated': len(message) > 64000})
            return
        except HTTPError as error:
            print('LogLogic HTTP', error.code, '- event remains pending', file=sys.stderr, flush=True)
        except Exception:
            print('LogLogic transport unavailable - event remains pending', file=sys.stderr, flush=True)
        time.sleep(delay)
        delay = min(delay * 2, 30)

def follow_node():
    state = sqlite3.connect(os.environ.get('LOGLOGIC_STATE', '/state/positions.sqlite3'))
    state.execute('create table if not exists positions (path text primary key, inode text, offset integer)')
    while True:
        for name in sorted(glob.glob('/var/log/containers/*.log'))[:1000]:
            if 'loglogic-forwarder-' in Path(name).name:
                continue  # Do not recursively forward this collector's own diagnostics.
            try:
                with open(name, 'rb') as stream:
                    stat = os.fstat(stream.fileno())
                    inode = str(stat.st_dev) + ':' + str(stat.st_ino)
                    row = state.execute('select inode, offset from positions where path=?', (name,)).fetchone()
                    offset = row[1] if row and row[0] == inode and row[1] <= stat.st_size else 0
                    stream.seek(offset)
                    for _ in range(100):
                        start = stream.tell()
                        raw = stream.readline(MAX_LINE + 1)
                        if not raw or not raw.endswith(b'\n') or len(raw) > MAX_LINE:
                            stream.seek(start)
                            break  # Incomplete/oversize records stay pending for operator review.
                        parts = raw.split(b' ', 3)
                        metadata = {'node': os.environ.get('NODE_NAME', ''), 'file': Path(name).name}
                        if len(parts) == 4:
                            metadata.update({'stream': parts[1].decode(errors='replace'), 'criTag': parts[2].decode(errors='replace')})
                            raw = parts[3]
                        ship(raw, metadata)
                        state.execute('insert or replace into positions values (?, ?, ?)', (name, inode, stream.tell()))
                        state.commit()  # Advance only after a 202 response or an empty line.
            except (OSError, sqlite3.Error):
                print('Collector file/state unavailable', file=sys.stderr, flush=True)
        time.sleep(1)

if __name__ == '__main__':
    if '--stdin' in sys.argv:
        while True:
            line = sys.stdin.buffer.readline(MAX_LINE)
            if not line:
                break
            ship(line, {'source': 'docker-stdin'})
    else:
        follow_node()
