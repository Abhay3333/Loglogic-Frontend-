import { createPortal } from 'react-dom';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { LuSparkles, LuX, LuRefreshCw, LuDownload } from 'react-icons/lu';
import { analyzeLog, aiQuery, generatePostMortem, downloadMarkdown } from '../api/ai';

function AIAction({ mode, orgId, logId, incidentId, onApply, disabled }) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState('');
    const request = useRef(null), dialog = useRef(null), trigger = useRef(null);
    const titleId = useId();
    const title = mode === 'analyze' ? 'Analyze with AI' : mode === 'query' ? 'AI Search' : 'AI Post-Mortem';
    const close = useCallback(() => {
        request.current?.abort(); setOpen(false); setBusy(false); trigger.current?.focus();
    }, []);
    useEffect(() => () => request.current?.abort(), []);
    useEffect(() => {
        if (!open) return;
        dialog.current?.querySelector('textarea, button')?.focus();
        const keyboard = event => {
            if (event.key === 'Escape') { event.preventDefault(); close(); }
            if (event.key !== 'Tab') return;
            const items = [...(dialog.current?.querySelectorAll('button:not(:disabled),textarea') || [])];
            const first = items[0], last = items.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        };
        document.addEventListener('keydown', keyboard);
        return () => document.removeEventListener('keydown', keyboard);
    }, [open, close]);
    async function run() {
        request.current?.abort();
        const controller = new AbortController(); request.current = controller;
        setBusy(true); setError(''); setAnswer('');
        try {
            if (mode === 'analyze') {
                const result = await analyzeLog(orgId, { id: logId }, controller.signal);
                if (!controller.signal.aborted) setAnswer(result.analysis);
            } else if (mode === 'query') {
                const result = await aiQuery(orgId, prompt.trim(), controller.signal);
                if (!controller.signal.aborted) { onApply(result.filter); close(); }
            } else {
                const result = await generatePostMortem(orgId, incidentId, controller.signal);
                if (!controller.signal.aborted) {
                    setAnswer(result.markdown);
                    downloadMarkdown(result.markdown, incidentId);
                }
            }
        } catch {
            if (!controller.signal.aborted) setError('AI assistance could not complete this request. Check configuration or limits and try again.');
        } finally { if (!controller.signal.aborted) setBusy(false); }
    }
    return <>
        <button ref={trigger} type="button" disabled={disabled || !orgId || (mode === 'analyze' && !logId)} onClick={() => {
            setOpen(true); setError(''); setAnswer(''); if (mode !== 'query') run();
        }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#8ff5ff]/25 bg-[#8ff5ff]/5 px-3 py-2 text-xs font-medium text-[#8ff5ff] transition-colors hover:bg-[#8ff5ff]/10 disabled:cursor-not-allowed disabled:opacity-40">
            <LuSparkles className="h-3.5 w-3.5" aria-hidden="true" />{title}
        </button>
        {open && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05080d]/85 p-4 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
            <section ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#44484f]/40 bg-[#11161d] shadow-2xl">
                <header className="flex items-center justify-between gap-4 border-b border-[#44484f]/25 px-5 py-4">
                    <h2 id={titleId} className="flex items-center gap-2 font-headline text-lg font-semibold text-[#f1f3fc]"><LuSparkles className="h-4 w-4 text-[#8ff5ff]" />{title}</h2>
                    <button type="button" aria-label="Close AI dialog" className="rounded-lg p-2 text-[#7f8594] hover:bg-white/5 hover:text-white" onClick={close}><LuX size={18} /></button>
                </header>
                <div className="space-y-4 p-5">
                    <p className="text-xs leading-relaxed text-[#a8abb3]">{mode === 'query' ? 'Describe the logs you need. Your prompt is sent to the configured AI provider; generated filters are validated before use.' : 'Redacted evidence is sent to the configured AI provider. AI output is a draft: verify hypotheses before taking action.'}</p>
                    {mode === 'query' && <form onSubmit={event => { event.preventDefault(); if (!busy && prompt.trim().length >= 3) run(); }} className="space-y-3">
                        <label htmlFor={`${titleId}-prompt`} className="block text-xs font-medium text-[#f1f3fc]">What would you like to find?</label>
                        <textarea id={`${titleId}-prompt`} rows={3} maxLength={1000} value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Errors in the last hour from auth-service" className="w-full rounded-lg border border-[#44484f]/40 bg-[#0a0e14] p-3 text-sm text-[#f1f3fc] outline-none focus:border-[#8ff5ff]/60" />
                        <button type="submit" disabled={busy || prompt.trim().length < 3} className="rounded-lg bg-[#8ff5ff] px-4 py-2 text-xs font-semibold text-[#062b32] disabled:opacity-40">Apply AI filters</button>
                    </form>}
                    {busy && <p role="status" className="flex items-center gap-2 text-xs text-[#8ff5ff]"><LuRefreshCw className="h-4 w-4 animate-spin" />{mode === 'query' ? 'Translating your search…' : 'Analyzing available evidence…'}</p>}
                    {error && <div role="alert" className="space-y-2 rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300"><p>{error}</p>{mode !== 'query' && <button type="button" className="underline" onClick={run}>Try again</button>}</div>}
                    {answer && <div className="rounded-xl border border-[#44484f]/30 bg-[#0a0e14] p-4"><pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-[#d5d9e2]">{answer}</pre></div>}
                    {answer && mode === 'post-mortem' && <button type="button" onClick={() => downloadMarkdown(answer, incidentId)} className="inline-flex items-center gap-2 text-xs text-[#8ff5ff]"><LuDownload size={14} />Download Markdown</button>}
                </div>
            </section>
        </div>, document.body)}
    </>;
}
export function AIAnalyzeButton(props) { return <AIAction {...props} mode="analyze" />; }
export function AIQueryButton(props) { return <AIAction {...props} mode="query" />; }
export function AIPostMortemButton(props) { return <AIAction {...props} mode="post-mortem" />; }
