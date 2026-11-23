import json
import os
from urllib.request import Request, HTTPRedirectHandler, build_opener

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def send_log(service, level, message, metadata=None):
    base = os.environ['LOGLOGIC_URL'].rstrip('/')
    payload = json.dumps({'service': service, 'level': level, 'message': message,
                          'metadata': metadata or {}}).encode('utf-8')
    request = Request(base + '/v1/ingest', data=payload, method='POST', headers={
        'Content-Type': 'application/json', 'X-API-KEY': os.environ['LOGLOGIC_API_KEY']})
    with build_opener(NoRedirect()).open(request, timeout=5) as response:
        if response.status != 202:
            raise RuntimeError('LogLogic rejected the event')
        return json.load(response)
