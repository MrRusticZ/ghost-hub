import { test } from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../public/data/hub-catalog.json';
import { freshSession } from '../src/hub/model';
// @ts-expect-error Native server ESM is validated through HTTP integration.
import { createHubServer,passwordHash } from '../server/app.mjs';
test('the server rejects a stale Detective reference before any AI request',async()=>{
  let called=false;
  const hub=createHubServer({secret:'version-check-secret'.repeat(4),adminHash:passwordHash('test-only-password'),allowedOrigins:['http://localhost:5173'],catalog,aiKey:'test-only',aiModel:'test-only',fetchImpl:async()=>{called=true;throw Error('Must not call the provider');}});
  await new Promise<void>(resolve=>hub.server.listen(0,'127.0.0.1',resolve));
  try{const r=await fetch(`http://127.0.0.1:${hub.server.address().port}/api/detective`,{method:'POST',headers:{Origin:'http://localhost:5173','Content-Type':'application/json'},body:JSON.stringify({text:'What should we check?',session:freshSession(),contentVersion:'a-different-reference'})});assert.equal(r.status,409);assert.equal(called,false);assert.match((await r.json() as {error:string}).error,/different reference versions/);}finally{await hub.close();}
});
