import { test } from 'node:test';
import assert from 'node:assert/strict';
// Backend is deliberately plain ESM and tested as deployed.
// @ts-expect-error JavaScript server module has runtime validation.
import { createHubServer,passwordHash,hashToken } from '../server/app.mjs';
// @ts-expect-error JavaScript service module.
import { screenMessage } from '../server/ai.mjs';
test('guest chat, authentication, moderation, findings, limits and origins',async()=>{
 const origin='http://127.0.0.1:5173';const hub=createHubServer({adminHash:passwordHash('test-only-password'),allowedOrigins:[origin]});
 await new Promise<void>(resolve=>hub.server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${hub.server.address().port}/api`;
 const post=async(path:string,body:unknown,token='',customOrigin=origin)=>{const r=await fetch(base+path,{method:'POST',headers:{Origin:customOrigin,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};};
 try{
  assert.equal((await post('/guest',{nickname:'Tester'},'','https://attacker.example')).status,403);
  assert.equal((await post('/chat',{body:'not authorised'})).status,401);
  const join=await post('/guest',{nickname:'Researcher'});assert.equal(join.status,201);const guest=join.data;
  const posted=await post('/chat',{body:'That ghost scared the shit out of me.'},guest.token);assert.equal(posted.status,201);assert.equal(posted.data.status,'public');
  assert.equal((await post('/chat',{body:'spam'},guest.token)).status,429);
  let publicData=await(await fetch(base+'/chat',{headers:{Origin:origin}})).json();assert.equal(publicData.messages.length,1);assert.ok(!('tokenHash' in publicData.messages[0]));
  const report=await post('/reports',{messageId:posted.data.id,reason:'Test report'},guest.token);assert.equal(report.status,201);
  publicData=await(await fetch(base+'/chat',{headers:{Origin:origin}})).json();assert.equal(publicData.messages.length,1,'reports alone must not hide content');
  const finding=await post('/findings',{observation:'Observed a ghost crossing the salt without disturbing it.',version:'test-version',conditions:'Controlled test, no hunt, one observer.',source:'https://example.com/reference',credit:''},guest.token);assert.equal(finding.status,201);
  assert.equal((await post('/findings',{observation:'This should not be fetched anywhere.',version:'test',conditions:'Enough conditions',source:'http://127.0.0.1/secret',credit:''},guest.token)).status,400);
  assert.equal((await post('/admin/action',{action:'pause',paused:true},guest.token)).status,401);
  const login=await post('/admin/login',{password:'test-only-password'});assert.equal(login.status,200);const owner=login.data.token;
  assert.equal((await post('/admin/action',{action:'hide',messageId:posted.data.id},owner)).status,200);
  publicData=await(await fetch(base+'/chat',{headers:{Origin:origin}})).json();assert.equal(publicData.messages.length,0);
  await post('/admin/action',{action:'approve',messageId:posted.data.id},owner);
  await post('/admin/action',{action:'timeout',guestId:guest.id,minutes:60},owner);
  assert.equal((await post('/chat',{body:'Should be timed out'},guest.token)).status,403);
  await post('/admin/action',{action:'timeout',guestId:guest.id,minutes:0},owner);
  await post('/admin/action',{action:'pause',paused:true},owner);
  assert.equal((await post('/chat',{body:'Should be paused'},guest.token)).status,503);
  const admin=await(await fetch(base+'/admin',{headers:{Origin:origin,Authorization:'Bearer '+owner}})).json();assert.equal(admin.findings.length,1);assert.ok(admin.audit.length>=4);
  await post('/admin/logout',{},owner);assert.equal((await fetch(base+'/admin',{headers:{Origin:origin,Authorization:'Bearer '+owner}})).status,401);
  assert.equal(hub.db.prepare('SELECT tokenHash FROM guests WHERE id=?').get(guest.id).tokenHash,hashToken(guest.token));
 }finally{await hub.close();}
});
test('screening allows ordinary game language but holds links and targeted harm',async()=>{
 assert.equal((await screenMessage('Holy shit that hunt was terrifying')).status,'public');assert.equal((await screenMessage('visit https://example.com')).status,'held');assert.equal((await screenMessage('kill yourself')).status,'held');
 await assert.rejects(()=>screenMessage('Hello',{key:'test',fetchImpl:async()=>new Response('',{status:503})}));
});
test('public mode rejects missing moderation, owner setup or persistent secret',()=>{assert.throws(()=>createHubServer({production:true}));assert.throws(()=>createHubServer({dailyAiLimit:NaN}));});
