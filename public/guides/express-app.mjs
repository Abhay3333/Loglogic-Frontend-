import express from 'express';
import { sendLog } from './loglogic.mjs';
const app = express();
app.get('/demo', async (req, res) => {
  try {
    await sendLog('express-demo', 'info', 'Demo route completed', { route: '/demo' });
    res.json({ ok: true });
  } catch {
    res.status(503).json({ error: 'Logging service unavailable' });
  }
});
app.listen(3000);
