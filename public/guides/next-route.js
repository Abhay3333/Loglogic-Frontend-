// Save as app/api/demo/route.js. Place loglogic.mjs in root/lib/.
import 'server-only';
import { sendLog } from '../../../lib/loglogic.mjs';
export const runtime = 'nodejs';
export async function POST() {
  try {
    await sendLog('next-demo', 'info', 'Server route completed', { route: '/api/demo' });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Logging service unavailable' }, { status: 503 });
  }
}
