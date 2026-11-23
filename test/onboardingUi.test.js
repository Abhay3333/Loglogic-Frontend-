import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

test('onboarding UI protects keys, correlates persistence, confirms delivery and discards stale workspace responses', async t => {
 const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
 globalThis.window=dom.window; globalThis.document=dom.window.document; globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const {createElement,act,useState}=await import('react'), {createRoot}=await import('react-dom/client'), {MemoryRouter,Routes,Route,Outlet}=await import('react-router-dom');
 const root=createRoot(document.getElementById('root')), calls=[];
 let deliveries=0; function onDelivered(){deliveries++;}
 let key=false, persisted=false, viewed=false, manager=true, denied=false, delayed=false, resolveDelayed;
 const eventId='11111111-1111-4111-8111-111111111111';
 globalThis.__onboard={
  async getOnboarding(orgId,signal,filter) {
   calls.push(['status',orgId,filter]);
   if(delayed) return new Promise(resolve=>{resolveDelayed=resolve;});
   return {orgId,steps:{workspace:true,key,firstLog:persisted,dashboard:viewed},canManageKeys:manager,elapsedMs:viewed?3000:null,
    firstLog:persisted?{id:'a'.repeat(24),service:'loglogic-onboarding',level:'info',message:'<script>unsafe()</script>',timestamp:new Date().toISOString()}:null};
  },
  async sendTestEvent(orgId){calls.push(['send',orgId]);if(denied)throw {response:{status:429}};return {status:'accepted',eventId};},
  async confirmDashboard(orgId,id){calls.push(['view',orgId,id]);viewed=true;return {recorded:true};},
  async createOrganization(body){calls.push(['workspace',body]);return {};},
  async createApiKey(body){calls.push(['key',body]);key=true;return {rawKey:'fixture-one-time-key'};}
 };
 const server=await createServer({configFile:false,cacheDir:fileURLToPath(new URL('../../.gravitas/sessions/phase17-onboarding/vite-cache',import.meta.url)),
  plugins:[{name:'onboard-fixtures',enforce:'pre',resolveId(id){if(id.endsWith('/api/onboarding')||id.endsWith('/api/apiKey')||id.endsWith('/api/organization'))return '\0onboard';},
   load(id){if(id==='\0onboard')return Object.keys(globalThis.__onboard).map(key=>`export const ${key}=(...args)=>globalThis.__onboard.${key}(...args);`).join('\n');}},react()],
  server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',optimizeDeps:{noDiscovery:true,include:[]}});
 t.after(async()=>{await act(async()=>root.unmount());await server.close();dom.window.close();delete globalThis.window;delete globalThis.document;delete globalThis.IS_REACT_ACT_ENVIRONMENT;delete globalThis.__onboard;});
 const {default:Checklist}=await server.ssrLoadModule('/src/components/OnboardingChecklist.jsx');
 async function render(orgId='org-a'){await act(async()=>root.render(createElement(MemoryRouter,{},createElement(Checklist,{key:orgId,orgId,dashboard:true,onDelivered}))));}
 const button=text=>[...document.querySelectorAll('button')].find(el=>el.textContent.includes(text));
 async function click(text){assert.ok(button(text),text);await act(async()=>button(text).click());}
 await render();
 const idleCalls=calls.filter(([name])=>name==='status').length;
 await act(async()=>{await new Promise(resolve=>setTimeout(resolve,2200));});
 assert.equal(calls.filter(([name])=>name==='status').length,idleCalls,'an idle workspace must not poll');
 await click('Generate ingestion key');
 assert.match(document.body.textContent,/fixture-one-time-key/);assert.equal(window.localStorage.length,0);assert.equal(window.sessionStorage.length,0);
 assert.deepEqual(calls.find(([name])=>name==='key')[1].scopes,['logs:ingest']);
 await click('Hide key');assert.doesNotMatch(document.body.textContent,/fixture-one-time-key/);
 denied=true;await click('Send Test Event');assert.match(document.body.textContent,/Please wait/);
 denied=false;await click('Send Test Event');assert.match(document.body.textContent,/queued/);assert.doesNotMatch(document.body.textContent,/Confirm dashboard delivery/);
 assert.ok(calls.some(([name,,filter])=>name==='status'&&filter===eventId));
 persisted=true;
 await act(async()=>{await new Promise(resolve=>setTimeout(resolve,2200));});
 assert.match(document.body.textContent,/Persisted log/);assert.equal(document.querySelector('script'),null);assert.equal(deliveries,1);
 const persistedCalls=calls.filter(([name])=>name==='status').length;
 await act(async()=>{await new Promise(resolve=>setTimeout(resolve,2200));});
 assert.equal(calls.filter(([name])=>name==='status').length,persistedCalls,'polling must stop after persistence');
 await click('Confirm dashboard delivery');assert.match(document.body.textContent,/Workspace setup complete/);
 assert.deepEqual(calls.find(([name])=>name==='view'),['view','org-a','a'.repeat(24)]);
 delayed=true;await click('Refresh setup');assert.ok(resolveDelayed);
 delayed=false;manager=false;key=false;persisted=false;viewed=false;
 await render('org-b');assert.match(document.body.textContent,/Ask a workspace key manager/);
 await act(async()=>resolveDelayed({orgId:'org-a',steps:{workspace:true,key:true,firstLog:true,dashboard:true},canManageKeys:true}));
 assert.doesNotMatch(document.body.textContent,/Workspace setup complete|Generate ingestion key|Send Test Event|fixture-one-time-key/);
 // Creating the first workspace keeps the remaining checklist reachable.
 const {default:Onboarding}=await server.ssrLoadModule('/src/pages/Onboarding.jsx');
 function WorkspaceProvider(){
  const [org,setOrg]=useState(null);
  return createElement(Outlet,{context:{currentOrg:org,refreshOrganizations:async()=>{setOrg({id:'created-org'});}}});
 }
 manager=true;
 await act(async()=>root.render(createElement(MemoryRouter,{key:'create-flow',initialEntries:['/app/onboarding']},
  createElement(Routes,{},createElement(Route,{element:createElement(WorkspaceProvider)},
   createElement(Route,{path:'/app/onboarding',element:createElement(Onboarding)}))))));
 const input=document.getElementById('workspace-name');assert.ok(input);
 await act(async()=>{
  Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(input,'New test workspace');
  input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 });
 await act(async()=>document.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));
 assert.ok(calls.some(([name,body])=>name==='workspace'&&body.orgName==='New test workspace'));
 assert.match(document.body.textContent,/Connect your first application/);assert.equal(document.querySelector('form'),null);

});
