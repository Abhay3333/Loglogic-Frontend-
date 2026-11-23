import { sendLog } from './loglogic.mjs';
const accepted = await sendLog('node-demo', 'info', 'Hello from Node.js', { source: 'quickstart' });
console.log('Accepted log count', accepted.count);
