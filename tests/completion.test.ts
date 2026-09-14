import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { freshSession } from '../src/hub/model';
import { encodeCase,decodeCase } from '../src/hub/sharing';
import { searchRecords } from '../src/hub/search';
import { EQUIPMENT,MAPS } from '../src/hub/content';
import { CURSED_ITEMS,KNOWN_ISSUES } from '../src/hub/reference';
import { parseObservations } from '../src/hub/engine';
// @ts-expect-error The plain ESM backend is validated through real HTTP tests.
import { createHubServer,passwordHash } from '../server/app.mjs';

test('shared cases round-trip Unicode and preserve explicit evidence states',()=>{
 const session={...freshSession(),name:'Caf\u00e9 investigation',evidence:{emf:'found' as const,writing:'ruled-out' as const},notes:'Private note'};
 const value=decodeCase(encodeCase(session,'test-v1'));assert.equal(value.session.name,session.name);assert.deepEqual(value.session.evidence,session.evidence);assert.equal(value.session.notes,'');assert.equal(value.contentVersion,'test-v1');
});
test('sharing notes is opt-in and oversized links fail explicitly',()=>{
 const session={...freshSession(),notes:'Team note'};assert.equal(decodeCase(encodeCase(session,'v1',true)).session.notes,'Team note');assert.throws(()=>encodeCase({...session,notes:'x'.repeat(12000)},'v1',true),/too large/);
});
test('malformed, oversized and unsupported shared cases are rejected',()=>{
 for(const value of ['','bad!!!','a'.repeat(15001),btoa('{"format":"other"}')])assert.throws(()=>decodeCase(value));
});
test('search matches reordered words and aliases without pretending to perform research',()=>{
 const rows=[{title:'Spirit Box',description:'Check the room conditions.',type:'Equipment',path:'equipment/box',aliases:['radio response']},{title:'Radio',description:'Team communications.',type:'Other',path:'radio'}];assert.equal(searchRecords(rows,'box spirit')[0]?.title,'Spirit Box');assert.equal(searchRecords(rows,'radio response')[0]?.title,'Spirit Box');assert.equal(searchRecords(rows,'radio','Other').length,1);assert.equal(searchRecords(rows,'completely unrecognised phrase').length,0);
});
test('reference expansion has unique IDs, valid tiers and all seven cursed items',()=>{
 assert.equal(EQUIPMENT.length,21);assert.equal(new Set(EQUIPMENT.map(x=>x.id)).size,21);assert.ok(EQUIPMENT.every(x=>x.tiers.length===3&&x.steps.length>=3));assert.equal(CURSED_ITEMS.length,7);assert.equal(new Set(CURSED_ITEMS.map(x=>x.id)).size,7);assert.ok(KNOWN_ISSUES.every(x=>x.source.startsWith('https://')&&x.version));assert.equal(MAPS.find(x=>x.id==='brownstone-restricted')?.type,'Medium');
});
test('the Detective recognises its own faster-near-electronics example',()=>{assert.ok(parseObservations('It gets faster near electronics').length>0);});

async function service(t:any){
 const password='test-only-owner-password';const app=createHubServer({adminHash:passwordHash(password),allowedOrigins:['http://localhost:5173']});app.server.listen(0,'127.0.0.1');await once(app.server,'listening');t.after(()=>app.close());const address=app.server.address() as {port:number};
 async function call(path:string,method='GET',data?:unknown,token=''){const response=await fetch(`http://127.0.0.1:${address.port}/api${path}`,{method,headers:{Origin:'http://localhost:5173',...(method==='POST'?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},...(data!==undefined?{body:JSON.stringify(data)}:{})});return {status:response.status,data:await response.json()};}
 const owner=await call('/admin/login','POST',{password});const first=await call('/guest','POST',{nickname:'First investigator'});const second=await call('/guest','POST',{nickname:'Second investigator'});assert.equal(owner.status,200);assert.equal(first.status,201);return {call,owner:owner.data.token,first:first.data,second:second.data,app};
}
test('timed-out guests can appeal but cannot post or read another guest appeal',async t=>{
 const {call,owner,first,second}=await service(t);assert.equal((await call('/admin/action','POST',{action:'timeout',guestId:first.id,minutes:60},owner)).status,200);assert.equal((await call('/chat','POST',{body:'A normal message'},first.token)).status,403);
 const appeal=await call('/appeals','POST',{reason:'Please reconsider this timeout. I think the context was misunderstood.'},first.token);assert.equal(appeal.status,201);assert.equal((await call('/appeals','GET',undefined,first.token)).data.appeals.length,1);assert.equal((await call('/appeals','GET',undefined,second.token)).data.appeals.length,0);assert.equal((await call('/appeals')).status,401);
 assert.equal((await call('/appeals','POST',{reason:'Another explanation that should be rejected.'},first.token)).status,409);assert.equal((await call('/admin/action','POST',{action:'appeal-resolve',appealId:appeal.data.id,reply:'Reviewed the context. Timeout lifted.',outcome:'lift'},second.token)).status,401);
 assert.equal((await call('/admin/action','POST',{action:'appeal-resolve',appealId:appeal.data.id,reply:'Reviewed the context. Timeout lifted.',outcome:'lift'},owner)).status,200);const own=await call('/appeals','GET',undefined,first.token);assert.equal(own.data.appeals[0].status,'resolved');assert.equal(own.data.timeoutUntil,0);assert.equal((await call('/chat','POST',{body:'Thank you for reviewing the context.'},first.token)).status,201);
 assert.equal((await call('/admin/action','POST',{action:'appeal-resolve',appealId:appeal.data.id,reply:'Duplicate decision.',outcome:'lift'},owner)).status,404);
});
test('appeal validation, daily limits, owner queue and retention are enforced',async t=>{
 const {call,owner,first,app}=await service(t);assert.equal((await call('/appeals','POST',{reason:'short'},first.token)).status,400);assert.equal((await call('/appeals','POST',{reason:'x'.repeat(1001)},first.token)).status,400);
 const appeal=await call('/appeals','POST',{reason:'Please review the moderator decision.'},first.token);assert.equal(appeal.status,201);const queue=await call('/admin','GET',undefined,owner);assert.equal(queue.data.appeals[0].id,appeal.data.id);
 assert.equal((await call('/admin/action','POST',{action:'appeal-resolve',appealId:appeal.data.id,reply:'The original decision stands.',outcome:'uphold'},owner)).status,200);assert.equal((await call('/appeals','POST',{reason:'A second appeal within the same day.'},first.token)).status,429);
 app.db.prepare('UPDATE appeals SET createdAt=?').run(new Date(Date.now()-91*86400000).toISOString());app.cleanup();assert.equal((await call('/appeals','GET',undefined,first.token)).data.appeals.length,0);
});
