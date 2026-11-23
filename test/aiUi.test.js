import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { JSDOM } from 'jsdom';
test('AI UI applies filters to real query/export controls, renders safe analysis and downloads scoped post-mortems',async t=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/'});
 globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const {createElement,act}=await import('react'),{createRoot}=await import('react-dom/client'),{MemoryRouter,Routes,Route,Outlet}=await import('react-router-dom');
 const root=createRoot(document.getElementById('root')),calls=[];
 const orgId='11111111-1111-4111-8111-111111111111',logId='a'.repeat(24),incidentId='33333333-3333-4333-8333-333333333333';
 const filter={level:'error',timestamp:{$gte:'2026-11-23T00:00:00.000Z'}};
 const log={_id:logId,orgId,service:'auth',level:'error',message:'fixture connection refused',timestamp:new Date().toISOString(),metadata:{}};
 let rejectAnalysis=false,delayAnalysis=false,resolveAnalysis,analysisSignal;
 globalThis.__aiUi={
  logs:{
   queryLogs:async(params,signal)=>{calls.push(['queryLogs',params,signal]);return{logs:[log],pagination:{page:1,total:1,totalPages:1}};},
   getOrgServices:async()=>({services:['auth']}),getSavedQueries:async()=>({savedQueries:[]}),createSavedQuery:async()=>({}),getLogStats:async()=>({}),
   exportLogsCsv:async(params)=>{calls.push(['export',params]);}
  },
  integrations:{listIntegrations:async()=>({integrations:[]}),createIssueFromLog:async()=>({}),
   listIncidents:async()=>({incidents:[{id:incidentId,title:'Fixture incident',status:'resolved'}]}),
   getIncident:async()=>({incident:{id:incidentId,org_id:orgId,title:'Fixture incident',status:'resolved'},events:[]}),addIncidentNote:async()=>({}),updateIncidentStatus:async()=>({})},
  ai:{
   aiQuery:async(id,prompt,signal)=>{calls.push(['aiQuery',id,prompt,signal]);return{filter};},
   analyzeLog:async(id,entry,signal)=>{calls.push(['analyze',id,entry]);analysisSignal=signal;if(rejectAnalysis)throw new Error('private provider error');if(delayAnalysis)return new Promise(resolve=>{resolveAnalysis=resolve;});return{analysis:'<script>unsafe()</script> Likely timeout. Check the upstream.'};},
   generatePostMortem:async(id,incident)=>{calls.push(['post',id,incident]);return{markdown:'# Draft\n<script>unsafe()</script>'};},
   downloadMarkdown:(text,id)=>calls.push(['download',text,id])
  }
 };
 const server=await createServer({configFile:false,cacheDir:fileURLToPath(new URL('../../.gravitas/sessions/phase18-ai/vite-cache',import.meta.url)),
  plugins:[{name:'ai-ui-boundaries',enforce:'pre',resolveId(id){for(const name of ['logs','integrations','ai'])if(id.endsWith('/api/'+name))return '\0ai-fixture-'+name;},
  load(id){if(id.startsWith('\0ai-fixture-')){const name=id.slice('\0ai-fixture-'.length);return Object.keys(globalThis.__aiUi[name]).map(key=>'export const '+key+'=(...args)=>globalThis.__aiUi.'+name+'.'+key+'(...args);').join('\n');}}},react()],
  server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',optimizeDeps:{noDiscovery:true,include:[]}});
 t.after(async()=>{await act(async()=>root.unmount());await server.close();dom.window.close();delete globalThis.window;delete globalThis.document;delete globalThis.IS_REACT_ACT_ENVIRONMENT;delete globalThis.__aiUi;});
 const {default:Historical}=await server.ssrLoadModule('/src/pages/HistoricalLogs.jsx');
 const {default:Incidents}=await server.ssrLoadModule('/src/pages/Incidents.jsx');
 const {AIAnalyzeButton}=await server.ssrLoadModule('/src/components/AIActions.jsx');
 async function render(Page,key='logs',role='owner'){
  await act(async()=>root.render(createElement(MemoryRouter,{key,initialEntries:['/']},createElement(Routes,{},createElement(Route,{element:createElement(Outlet,{context:{currentOrg:{id:orgId,role,name:'Fixture workspace'},isAccessExpired:false}})},createElement(Route,{index:true,element:createElement(Page)}))))));
 }
 const button=text=>[...document.querySelectorAll('button')].find(el=>el.textContent.includes(text));
 async function click(text){assert.ok(button(text),text);await act(async()=>button(text).click());}
 await render(Historical);
 await click('AI Search');assert.ok(document.querySelector('[role="dialog"]'));
 const textarea=document.querySelector('textarea');
 await act(async()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype,'value').set.call(textarea,'errors in the last hour');textarea.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});
 await act(async()=>document.querySelector('[role="dialog"] form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));
 assert.match(document.body.textContent,/AI filters applied/);
 const query=calls.filter(([name])=>name==='queryLogs').at(-1)[1];assert.deepEqual(query.aiFilter,filter);assert.equal(query.orgId,orgId);assert.equal(query.startDate,undefined);assert.equal(query.levels,undefined);
 const exportButton=document.querySelector('button[title="Export current view to CSV"]');assert.ok(exportButton);
 await act(async()=>exportButton.click());assert.deepEqual(JSON.parse(calls.find(([name])=>name==='export')[1].aiFilter),filter);
 await click('Clear AI filters');assert.equal(calls.filter(([name])=>name==='queryLogs').at(-1)[1].aiFilter,undefined);
 const row=[...document.querySelectorAll('tr')].find(el=>el.textContent.includes(log.message));assert.ok(row);await act(async()=>row.click());
 await click('Analyze with AI');assert.match(document.querySelector('[role="dialog"]').textContent,/Likely timeout/);assert.equal(document.querySelector('script'),null);
 assert.deepEqual(calls.find(([name])=>name==='analyze').slice(1),[orgId,{id:logId}]);
 await act(async()=>document.querySelector('[aria-label="Close AI dialog"]').click());
 rejectAnalysis=true;await click('Analyze with AI');assert.match(document.querySelector('[role="alert"]').textContent,/could not complete/);assert.doesNotMatch(document.body.textContent,/private provider/);
 await act(async()=>document.querySelector('[aria-label="Close AI dialog"]').click());rejectAnalysis=false;
 await render(Incidents,'incidents');await click('Fixture incident');await click('AI Post-Mortem');
 assert.deepEqual(calls.find(([name])=>name==='post'),['post',orgId,incidentId]);assert.equal(calls.find(([name])=>name==='download')[2],incidentId);assert.equal(document.querySelector('script'),null);
 await render(Incidents,'viewer','viewer');await click('Fixture incident');assert.ok(!button('AI Post-Mortem'));
 delayAnalysis=true;
 await act(async()=>root.render(createElement(AIAnalyzeButton,{key:'old',orgId,logId})));
 await click('Analyze with AI');assert.ok(resolveAnalysis);
 await act(async()=>root.render(createElement(AIAnalyzeButton,{key:'new',orgId:'foreign-workspace',logId})));
 assert.equal(analysisSignal.aborted,true);
 await act(async()=>resolveAnalysis({analysis:'late private result'}));assert.doesNotMatch(document.body.textContent,/late private result/);
});
