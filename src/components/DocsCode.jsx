import { useState } from 'react';

export default function DocsCode({ code, label = 'Example' }) {
    const [message, setMessage] = useState('');
    async function copy() {
        try { await navigator.clipboard.writeText(code); setMessage('Copied'); }
        catch { setMessage('Select the code and copy it.'); }
    }
    return <div className="rounded-lg border border-outline-variant overflow-hidden my-3">
        <div className="flex justify-between items-center gap-3 px-4 py-2 bg-surface-container-high">
            <span className="text-sm font-mono">{label}</span>
            <div className="flex gap-3 items-center"><span role="status" className="text-xs">{message}</span>
                <button type="button" aria-label={`Copy ${label}`} onClick={copy} className="text-primary text-sm">Copy</button>
            </div>
        </div>
        <pre className="max-h-96 overflow-auto p-4 text-sm bg-background"><code>{code}</code></pre>
    </div>;
}
