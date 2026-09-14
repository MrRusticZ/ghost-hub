import { chromium } from '@playwright/test';
import { readFile,writeFile } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
const results=[],errors=[];
const dev='http://127.0.0.1:5173/';
const manifest=JSON.parse(await readFile('public/data/manifest.json','utf8'));
const catalog=JSON.parse(await readFile('public/data/hub-catalog.json','utf8'));
const news=JSON.parse(await readFile('public/data/news.json','utf8'));
async function context(){const c=await browser.newContext();c.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));return c;}
async function seed(c,values){await c.addInitScript(values=>{if(location.origin!=='http://127.0.0.1:5173')return;for(const [key,value] of Object.entries(values))localStorage.setItem(key,value);},values);}
try{
  const corrupt=await context();
  await seed(corrupt,Object.fromEntries(['session','journal','timer'].map(key=>['ghost-hub:'+key,'{broken json'])));
  const p=await corrupt.newPage();await p.goto(dev+'#/evidence');await p.getByRole('heading',{name:'Evidence book',exact:true}).waitFor();
  if(await p.locator('.ghost-card').count()!==30)throw Error('Corrupt storage did not recover to a fresh case.');
  await p.goto(dev+'#/journal');await p.getByRole('heading',{name:'Your first case starts here',exact:true}).waitFor();
  results.push('Corrupt persisted state recovers safely');await corrupt.close();

  const remote=await context();
  await seed(remote,{'ghost-hub:remote':JSON.stringify('https://reference.example/data')});
  await remote.route('https://reference.example/data/**',route=>{const file=route.request().url().split('/').pop();const data=file==='manifest.json'?{...manifest,version:'browser-source-test'}:file==='hub-catalog.json'?{...catalog,version:'browser-source-test'}:news;return route.fulfill({json:data});});
  const r=await remote.newPage();await r.goto(dev+'#/settings');await r.getByText('Remote reference',{exact:true}).waitFor();await r.getByText('browser-source-test',{exact:true}).waitFor();
  results.push('Manifest-driven remote content replaces local reference immediately');await remote.close();

  const failure=await context();
  await seed(failure,{'ghost-hub:remote':JSON.stringify('https://reference.example/data')});
  await failure.route('https://reference.example/data/**',route=>route.fulfill({status:503,json:{error:'Test source failure'}}));
  const f=await failure.newPage();await f.goto(dev+'#/settings');await f.getByText('Bundled reference',{exact:true}).waitFor();await f.getByText(/Remote update unavailable/).waitFor();
  results.push('Broken remote source falls back with a visible reason');await failure.close();

  const embedded=await context();await embedded.route('http://127.0.0.1:5173/data/**',route=>route.fulfill({json:{invalid:true}}));
  const e=await embedded.newPage();await e.goto(dev+'#/settings');await e.getByText('Embedded fallback',{exact:true}).waitFor();
  results.push('Malformed hosted data falls back to embedded validated content');await embedded.close();

  const legacy=await context();await seed(legacy,{'phasmophobia-finder-filters-v1':JSON.stringify({includeEvidence:['EMF 5']}),'phasmophia-journal-snapshots-v1':JSON.stringify([{id:'legacy',note:'Recovered old field notes',filters:{includeEvidence:['Ghost Writing']},createdAt:'2026-09-10T12:00:00Z'}])});
  const l=await legacy.newPage();await l.goto(dev+'#/evidence');await l.getByRole('button',{name:'EMF Level 5: found. Click to change.',exact:true}).waitFor();await l.goto(dev+'#/journal');await l.getByText('Recovered old field notes',{exact:true}).waitFor();
  results.push('Legacy evidence and misspelled journal key migrate');await legacy.close();

  const voice=await context();const v=await voice.newPage();await v.goto(dev+'#/voice');await v.getByLabel('Voice command',{exact:true}).fill('Set sanity 40');
  const before=await v.evaluate(()=>JSON.parse(localStorage.getItem('ghost-hub:session')).sanity);if(before!==100)throw Error('Command changed state before confirmation');
  await v.getByRole('button',{name:'Apply command',exact:true}).click();
  await v.waitForFunction(()=>JSON.parse(localStorage.getItem('ghost-hub:session')).sanity===40);
  await v.getByLabel('Voice command',{exact:true}).fill('Snapshot');await v.getByRole('button',{name:'Apply command',exact:true}).click();
  await v.waitForFunction(()=>JSON.parse(localStorage.getItem('ghost-hub:journal')).length===1);
  results.push('Typed voice commands require review and persist applied state');await voice.close();

  const production=await context();const prod=await production.newPage();const base=process.env.PRODUCTION_PREVIEW_URL??'http://127.0.0.1:4173/ghost-hub/';const broken=[];
  prod.on('response',r=>{if(r.status()>=400)broken.push(r.url());});
  await prod.goto(base+'#/evidence',{waitUntil:'networkidle'});await prod.getByRole('heading',{name:'Evidence book',exact:true}).waitFor();
  await prod.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:20000});
  await production.setOffline(true);await prod.reload({waitUntil:'domcontentloaded'});await prod.getByRole('heading',{name:'Evidence book',exact:true}).waitFor();
  if(await prod.locator('.ghost-card').count()!==30)throw Error('Offline evidence catalog did not render');
  if(broken.length)throw Error('Production resources failed: '+broken.join(', '));
  results.push('GitHub-style subdirectory loads directly and reloads offline after cache installation');await production.close();
  await writeFile('artifacts/extended-browser-results.json',JSON.stringify({results,errors},null,2));
  console.log(JSON.stringify({passed:results.length,results,errors}));if(errors.length)process.exitCode=1;
}finally{await browser.close();}
