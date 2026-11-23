import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {JSDOM} from 'jsdom';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';

for(const mode of ['sse','poll']) test('Live Tail '+mode+' keeps streaming across on-demand AI success, provider failure and timeout',{timeout:20000},async t=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/'});
 globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const {createElement,act}=await import('react'),{createRoot}=await import('react-dom/client');
 const {MemoryRouter,Routes,Route,Outlet}=await import('react-router-dom');
 const root=createRoot(document.getElementById('root')),calls=[];
 const orgId='11111111-1111-4111-8111-111111111111';
 let opens=0,closes=0,pulls=0,resolveAI,rejectAI;
 const listeners=new Map();
 const source={closed:false,addEventListener(name,handler){listeners.set(name,handler);},close(){this.closed=true;closes++;}};
 const makeLog=(id,message)=>({id,service:'auth-service',level:'error',message,timestamp:new Date().toISOString()});
 const pollLog=()=>{const log=makeLog(String(++pulls).padStart(24,'0'),'polling fixture '+pulls);return {...log,_id:log.id,id:undefined};};
 globalThis.__liveAi={
  logs:{getOrgServices:async()=>({services:[]}),openLogStream:async()=>{opens++;return source;},queryLogs:async()=>({logs:[pollLog()]})},
  billing:{getBilling:async()=>({plan_tier:mode==='sse'?'pro':'free'})},
  ai:{analyzeLog:async(id,log,signal)=>{calls.push({orgId:id,log,signal});return new Promise((resolve,reject)=>{resolveAI=resolve;rejectAI=reject;});},
   aiQuery:async()=>({}),generatePostMortem:async()=>({}),downloadMarkdown(){}}
 };
 const server=await createServer({configFile:false,cacheDir:fileURLToPath(new URL('../../.gravitas/sessions/phase18-live-ai/vite-'+mode,import.meta.url)),
  plugins:[{name:'live-ai-fixtures',enforce:'pre',resolveId(id){for(const name of ['logs','billing','ai'])if(id.endsWith('/api/'+name))return '\0live-ai-'+name;},
   load(id){if(id.startsWith('\0live-ai-')){const name=id.slice('\0live-ai-'.length);return Object.keys(globalThis.__liveAi[name]).map(key=>'export const '+key+'=(...args)=>globalThis.__liveAi.'+name+'.'+key+'(...args);').join('\n');}}},react()],
  server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',optimizeDeps:{noDiscovery:true,include:[]}});
 t.after(async()=>{await act(async()=>root.unmount());await server.close();dom.window.close();delete globalThis.window;delete globalThis.document;delete globalThis.IS_REACT_ACT_ENVIRONMENT;delete globalThis.__liveAi;});
 const {default:LiveTail}=await server.ssrLoadModule('/src/pages/LiveTail.jsx');
 await act(async()=>root.render(createElement(MemoryRouter,{},createElement(Routes,{},createElement(Route,{element:createElement(Outlet,{context:{currentOrg:{id:orgId,name:'Fixture workspace',role:'owner'},isAccessExpired:false}})},createElement(Route,{index:true,element:createElement(LiveTail)}))))));
 async function emit(id,message){await act(async()=>listeners.get('logs')({data:JSON.stringify([makeLog(id,message)])}));}
 async function waitForPoll(){const previous=pulls;await act(async()=>{await new Promise(resolve=>setTimeout(resolve,2700));});assert.ok(pulls>previous,'polling transport must continue');}
 const button=text=>[...document.querySelectorAll('button')].find(el=>el.textContent.includes(text));
 async function click(text){assert.ok(button(text),text);await act(async()=>button(text).click());}
 async function closeModal(){await act(async()=>document.querySelector('[aria-label="Close AI dialog"]').click());}
 const assertConnected=()=>{assert.equal(closes,0);assert.equal(source.closed,false);assert.equal(opens,mode==='sse'?1:0);};
 if(mode==='sse'){assert.equal(opens,1);await act(async()=>source.onopen());await emit('a'.repeat(24),'initial stream fixture');}
 assert.equal(calls.length,0,'stream arrival must not analyze automatically');
 await click('Expand JSON');
 assert.equal(calls.length,0,'inspecting a row must not analyze automatically');
 const toolbar=document.querySelector('button[title="Copy JSON"]').parentElement;
 assert.match(toolbar.textContent,/Copy Message/);assert.match(toolbar.textContent,/Analyze with AI/);
 await click('Analyze with AI');
 assert.equal(calls.length,1);
 assert.deepEqual(calls[0].log,{id:mode==='sse'?'a'.repeat(24):'1'.padStart(24,'0')});assert.equal(calls[0].orgId,orgId);
 assert.match(document.querySelector('[role="dialog"]').textContent,/Analyzing available evidence/);
 assert.ok(document.querySelector('[role="dialog"]').parentElement.parentElement === document.body,'reuse the shared portal modal');
 if(mode==='sse'){await emit('b'.repeat(24),'arrived while AI pending');assert.match(document.body.textContent,/arrived while AI pending/);}else await waitForPoll();
 assertConnected();assert.equal(calls.length,1);
 await act(async()=>resolveAI({analysis:'An upstream dependency timed out. Check its health and timeout configuration.'}));
 assert.match(document.querySelector('[role="dialog"]').textContent,/upstream dependency timed out/);await closeModal();assertConnected();
 await click('Analyze with AI');
 await act(async()=>rejectAI(Object.assign(new Error('private provider failure'),{response:{status:503}})));
 assert.ok(document.querySelector('[role="dialog"] [role="alert"]'));assert.doesNotMatch(document.body.textContent,/private provider failure/);assertConnected();
 await click('Try again');
 await act(async()=>rejectAI(Object.assign(new Error('timed out'),{code:'ECONNABORTED'})));
 assert.match(document.querySelector('[role="dialog"] [role="alert"]').textContent,/could not complete/);
 if(mode==='sse'){await emit('c'.repeat(24),'arrived after AI timeout');assert.match(document.body.textContent,/arrived after AI timeout/);}else await waitForPoll();
 assertConnected();assert.equal(calls.length,3,'only clicks may request analysis');
 await closeModal();assertConnected();
});
