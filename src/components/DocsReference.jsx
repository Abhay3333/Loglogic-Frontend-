import { useState } from 'react';
import specification from '../docs/openapi.json';
import DocsCode from './DocsCode';

function resolve(schema, depth = 0) {
    if (!schema || typeof schema !== 'object' || depth > 12) return schema;
    if (Array.isArray(schema)) return schema.map((value) => resolve(value, depth + 1));
    if (schema.$ref) return resolve(specification.components.schemas[schema.$ref.split('/').at(-1)], depth + 1);
    return Object.fromEntries(Object.entries(schema).map(([key, value]) => [key, resolve(value, depth + 1)]));
}

export default function DocsReference() {
    const [search, setSearch] = useState('');
    const operations = Object.entries(specification.paths).flatMap(([path, methods]) => Object.entries(methods).map(([method, operation]) => ({ path, method, ...operation })))
        .filter((operation) => `${operation.path} ${operation.summary} ${operation.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase()));
    return <section id="reference" className="scroll-mt-28 space-y-4">
        <div className="flex justify-between gap-4 flex-wrap items-center"><h2 className="text-2xl font-bold">API reference</h2>
            <a href={new URL('../docs/openapi.json', import.meta.url).href} download="loglogic-openapi.json" className="text-primary underline">Download OpenAPI</a>
        </div>
        <p>Logging, workspace discovery, API keys and saved queries. Workspace permissions, key scopes, CIDR restrictions and SSO policy are checked by the backend.</p>
        <label className="block">Find an endpoint<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="block mt-2 rounded border border-outline-variant bg-surface-container-high p-3 w-full" /></label>
        {operations.length === 0 && <p>No matching endpoints.</p>}
        {operations.map((operation) => {
            const media = operation.requestBody?.content?.['application/json'];
            const schema = resolve(media?.schema);
            return <details key={operation.operationId} id={operation.operationId} className="rounded-xl border border-outline-variant p-5 scroll-mt-28">
                <summary className="cursor-pointer font-mono break-all"><span className="text-primary uppercase mr-3">{operation.method}</span>{operation.path}<span className="block font-sans text-on-surface-variant mt-2">{operation.summary}</span></summary>
                <div className="mt-4 space-y-4">
                    <p>{operation.description}</p>
                    <p className="text-sm">Authentication {operation.security.length ? operation.security.map((item) => Object.keys(item).map((key) => key === 'ApiKey' ? 'X-API-KEY' : 'Bearer session').join(' + ')).join(' or ') : 'public'}</p>
                    {operation.parameters && <div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr>{['Parameter', 'Location', 'Type'].map((name) => <th key={name} className="p-2">{name}</th>)}</tr></thead>
                        <tbody>{operation.parameters.map((parameter) => <tr key={parameter.name} className="border-t border-outline-variant/40"><td className="p-2 font-mono">{parameter.name}{parameter.required ? ' *' : ''}</td><td className="p-2">{parameter.in}</td><td className="p-2">{parameter.schema.type}</td></tr>)}</tbody></table></div>}
                    {schema && <details><summary className="text-primary cursor-pointer">Request schema</summary><DocsCode label="JSON request schema" code={JSON.stringify(schema, null, 2)} /></details>}
                    {media?.example && <DocsCode label="JSON body" code={JSON.stringify(media.example, null, 2)} />}
                    <div className="space-y-2"><h3 className="font-bold">Responses</h3>{Object.entries(operation.responses).map(([status, response]) => <div key={status}>
                        <p><span className="font-mono mr-2">{status}</span>{response.description}</p>
                        {status.startsWith('2') && response.content && <details><summary className="text-primary text-sm cursor-pointer">Response formats and schema</summary>
                            <DocsCode label="Response formats" code={JSON.stringify(Object.fromEntries(Object.entries(response.content).map(([type, value]) => [type, { schema: resolve(value.schema), ...(value.example ? { example: value.example } : {}) }])), null, 2)} />
                        </details>}
                    </div>)}</div>
                </div>
            </details>;
        })}
    </section>;
}
