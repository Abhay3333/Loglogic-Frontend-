export const docsApiBase = (import.meta.env.VITE_API_DEPLOYED_URL || import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:5000')
    .replace(/\/health\/?$/, '').replace(/\/+$/, '');

export const playgroundOperations = {
    ingest: { method: 'POST', path: '/v1/ingest', label: 'Ingest a log', auth: ['key'],
        sample: { service: 'docs-demo', level: 'info', message: 'Hello from the API playground', metadata: { source: 'playground' } } },
    query: { method: 'POST', path: '/v1/logs/query', label: 'Query logs', auth: ['session', 'key'], sample: { limit: 25, sort: 'desc' } },
    stats: { method: 'POST', path: '/v1/logs/stats', label: 'Read statistics', auth: ['session', 'key'], sample: { timeRange: '24h' } }
};

export function redactDocsText(text, secrets = []) {
    let value = String(text);
    for (const secret of secrets) if (secret) value = value.split(secret).join('[REDACTED]');
    return value.replace(/ll_prod_[a-f0-9]{64}/gi, '[REDACTED]')
        .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [REDACTED]');
}

export function docsCurl(operation, body, authMode) {
    const endpoint = playgroundOperations[operation];
    if (!endpoint) return '';
    const safe = redactDocsText(body).replaceAll("'", "'\\''");
    const header = authMode === 'session' ? 'Authorization: Bearer $LOGLOGIC_SESSION_TOKEN' : 'X-API-KEY: $LOGLOGIC_API_KEY';
    return `curl --max-time 20 -X ${endpoint.method} "$LOGLOGIC_URL${endpoint.path}" -H "Content-Type: application/json" -H "${header}" --data '${safe}'`;
}
