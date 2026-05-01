# LogLogic API Documentation

LogLogic is a high-performance, centralized logging API for modern services.

## 1. Quick Start Guide (The "Time to Value" Section)

Get from signup to first live log in about 60 seconds.

### Step 1: Get your API Key.

1. Open your LogLogic dashboard.
2. Go to **Settings -> API Keys**.
3. Create a key for your environment (`development`, `staging`, or `production`).

### Step 2: Make your first request.

Send a `POST` request to:

`https://api.loglogic.io/v1/ingest`

Include your API key in the `X-API-KEY` header.

### Step 3: View it on the Live-Tail dashboard.

1. Open **Live-Tail** in the LogLogic dashboard.
2. Filter by your `service` field.
3. Confirm your event appears in real time.

## 2. Authentication

Authenticate every request with the `X-API-KEY` header.

```http
X-API-KEY: YOUR_LOGLOGIC_API_KEY
```

> Security warning: Never commit your API key to public GitHub repositories. Store secrets in environment variables or a secret manager.

## 3. API Reference: The Ingestion Endpoint

**Endpoint**

`POST https://api.loglogic.io/v1/ingest`

### Request Body Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `level` | String | Yes | Must be one of `INFO`, `WARN`, `ERROR`, or `DEBUG`. |
| `service` | String | Yes | The name of the microservice sending the log. |
| `message` | String | Yes | The core log message. |
| `meta` | Object | No | Flexible JSON object for custom data such as user IDs, latency, region, or stack traces. |

## 4. Code Examples (Crucial)

### Raw cURL

```bash
curl -X POST https://api.loglogic.io/v1/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: YOUR_LOGLOGIC_API_KEY" \
  -d '{
    "level": "INFO",
    "service": "billing-service",
    "message": "Invoice generated successfully",
    "meta": {
      "requestId": "req_01J9XZ...",
      "userId": "usr_4831",
      "latencyMs": 42
    }
  }'
```

### Node.js (using fetch)

```javascript
const apiKey = process.env.LOGLOGIC_API_KEY;

const payload = {
  level: 'INFO',
  service: 'billing-service',
  message: 'Invoice generated successfully',
  meta: {
    requestId: 'req_01J9XZ...',
    userId: 'usr_4831',
    latencyMs: 42,
  },
};

const response = await fetch('https://api.loglogic.io/v1/ingest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': apiKey,
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  console.error('LogLogic ingest failed:', response.status, await response.text());
}
```

### Python (using the requests library)

```python
import os
import requests

api_key = os.environ.get("LOGLOGIC_API_KEY")

payload = {
    "level": "INFO",
    "service": "billing-service",
    "message": "Invoice generated successfully",
    "meta": {
        "requestId": "req_01J9XZ...",
        "userId": "usr_4831",
        "latencyMs": 42
    }
}

response = requests.post(
    "https://api.loglogic.io/v1/ingest",
    headers={
        "Content-Type": "application/json",
        "X-API-KEY": api_key
    },
    json=payload,
    timeout=5,
)

if response.status_code != 202:
    print("LogLogic ingest failed:", response.status_code, response.text)
```

## 5. Response Codes & Error Handling

| Status | Meaning |
|---|---|
| `202 Accepted` | Log successfully queued. |
| `401 Unauthorized` | Invalid or missing API Key. |
| `429 Too Many Requests` | Rate limit exceeded. |
| `413 Payload Too Large` | JSON body exceeds the 1MB limit. |

## 6. Best Practices

### Pro-Tips

- Send logs asynchronously so ingestion never blocks your app's main thread or request path.
- Keep your `meta` object structure consistent across services to make filtering and search easier in Live-Tail and dashboards.
- Use stable field names (for example: `requestId`, `userId`, `latencyMs`) to improve team-wide query consistency.
