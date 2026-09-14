import { chromium,expect } from '@playwright/test';
import { readFile,writeFile } from 'node:fs/promises';
import { createHubServer,passwordHash } from '../server/app.mjs';
const origin='http://127.0.0.1:5173';
const catalog=JSON.parse(await readFile('public/data/hub-catalog.json','utf8'));
const hub=createHubServer({secret:'browser-integration-test-secret-'.repeat(3),adminHash:passwordHash('browser-test-password'),allowedOrigins:[origin],catalog});
await new Promise(resolve=>hub.server.listen(0,'127.0.0.1',resolve));
const service='http://127.0.0.1:'+hub.server.address().port;
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
const results=[],errors=[];
async function page(){const context=await browser.newContext();await context.route(origin+'/api/**',async route=>{const request=route.request();const response=await route.fetch({url:service+new URL(request.url()).pathname,headers:{...request.headers(),origin}});await route.fulfill({response});});const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));return p;}
try{
 const alice=await page(),bob=await page(),owner=await page();
 for(const [p,name] of [[alice,'Browser Alice'],[bob,'Browser Bob']]){await p.goto(origin+'/#/chat');await p.getByLabel('Chat nickname',{exact:true}).fill(name);await p.getByRole('button',{name:'Join chat',exact:true}).click();await p.getByLabel('Global chat message',{exact:true}).waitFor();}
 const first='That hunt was bloody close. Good teamwork.';
 await alice.getByLabel('Global chat message',{exact:true}).fill(first);await alice.getByRole('button',{name:'Send chat message',exact:true}).click();
 await expect(bob.locator('.public-message').filter({hasText:first})).toHaveCount(1,{timeout:10000});
 results.push('Two independent browser guests exchange a server-stored message');
 bob.once('dialog',dialog=>dialog.accept('Test report for the owner review queue.'));
 await bob.locator('.public-message').filter({hasText:first}).getByRole('button',{name:'Report',exact:true}).click();await expect(bob.locator('.toast')).toContainText('Report sent');
 await expect(bob.locator('.public-message').filter({hasText:first})).toHaveCount(1);
 results.push('Reporting does not automatically hide or ban another guest');
 const markup='<img src=x onerror=alert(1)> A text-only screening test';
 await bob.getByLabel('Global chat message',{exact:true}).fill(markup);await bob.getByRole('button',{name:'Send chat message',exact:true}).click();await expect(bob.locator('.toast')).toContainText('held for review');
 await expect(bob.locator('.public-message').filter({hasText:markup})).toHaveCount(0);
 await owner.goto(origin+'/#/admin');await owner.getByLabel('Owner password',{exact:true}).fill('browser-test-password');await owner.getByRole('button',{name:'Sign in',exact:true}).click();
 const held=owner.locator('.admin-row').filter({hasText:markup});await held.waitFor();await expect(held.locator('img')).toHaveCount(0);
 await held.getByRole('button',{name:'Approve & resolve',exact:true}).click();
 const published=bob.locator('.public-message').filter({hasText:markup});await expect(published).toHaveCount(1,{timeout:10000});await expect(published.locator('img')).toHaveCount(0);
 results.push('Held messages require owner approval and remain escaped text, not executable markup');
 await owner.getByRole('button',{name:'Pause posting',exact:true}).click();await expect(bob.getByLabel('Global chat message',{exact:true})).toBeDisabled({timeout:10000});
 await owner.getByRole('button',{name:'Resume posting',exact:true}).click();await expect(bob.getByLabel('Global chat message',{exact:true})).toBeEnabled({timeout:10000});
 results.push('Owner can pause and resume the real room');
 const signedOut=owner.waitForResponse(r=>r.url().endsWith('/api/admin/logout')&&r.status()===200);await owner.getByRole('button',{name:'Sign out',exact:true}).click();await signedOut;await owner.getByRole('button',{name:'Sign in',exact:true}).waitFor();
 results.push('Owner sign-out revokes the server session');
 await writeFile('artifacts/chat-browser-results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({passed:results.length,results,errors}));if(errors.length)process.exitCode=1;
}finally{await browser.close();await hub.close();}
