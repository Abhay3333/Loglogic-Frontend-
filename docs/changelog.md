# What's New

We ship fast, document every meaningful change, and keep developers unblocked with transparent release notes.

[Subscribe via RSS](#) | [Follow us on Twitter](#)

## 2. Changelog Formatting Rules

- Every entry must have a Date (example: March 30, 2026).
- Every entry must have a Title.
- Every bullet point must start with one strict category tag: [Feature], [Improvement], [Performance], or [Fix].

## 3. Generate 3 Realistic Release Entries

### April 18, 2026 (Today)

#### Automated Alerts and Slack Integrations are live.

We launched a Python-based background worker that continuously polls indexed logs, evaluates alert conditions, and triggers outbound webhooks for operational tooling such as Slack.

- [Feature] Added a Python alerting worker with cron-safe polling and deduplicated alert dispatch.
- [Feature] Added Slack webhook integration with channel-level routing and configurable severity mapping.
- [Feature] Added alert rule support for threshold windows and message templates backed by MongoDB rule metadata.

### April 04, 2026 (Two weeks ago)

#### Sub-50ms Ingestion with Redis BullMQ.

We migrated the Node.js ingestion path to Redis-backed BullMQ queues so traffic spikes no longer cause direct MongoDB contention or lockups during burst workloads.

- [Performance] Reduced p95 ingest latency from 180ms to 47ms by introducing queued writes and batched MongoDB inserts.
- [Performance] Improved backpressure handling with worker concurrency controls to maintain stable throughput under spike traffic.
- [Fix] Fixed stale API key cache invalidation in the auth middleware that could briefly reject newly rotated keys.

### March 18, 2026 (One month ago)

#### Real-time logging with WebSockets.

We released the first beta of Live-Tail in the React dashboard, streaming log events to connected clients over persistent Socket.io channels.

- [Feature] Added Socket.io Live-Tail channels for low-latency event streaming from the ingest pipeline to dashboard clients.
- [Improvement] Added server-side filtering by org_id to isolate tenant traffic and reduce noisy cross-project streams.

## 4. Design & UX Notes for the Developer

- Render changelog text from Markdown files so product and engineering can publish updates without frontend code edits.
- Use a vertical timeline aesthetic with clear date anchors and card-like release blocks for fast chronological scanning.
- Color-code tags consistently: [Feature] green, [Improvement] cyan, [Performance] amber, and [Fix] red.
