export async function sendLog(service, level, message, metadata = {}) {
  const base = process.env.LOGLOGIC_URL?.replace(/\/+$/, '');
  const key = process.env.LOGLOGIC_API_KEY;
  if (!base || !key) throw new Error('Set LOGLOGIC_URL and LOGLOGIC_API_KEY on the server');
  const response = await fetch(`${base}/v1/ingest`, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(5000),
    headers: { 'Content-Type': 'application/json', 'X-API-KEY': key },
    body: JSON.stringify({ service, level, message, metadata })
  });
  if (response.status !== 202) throw new Error(`LogLogic HTTP ${response.status}`);
  return response.json();
}
