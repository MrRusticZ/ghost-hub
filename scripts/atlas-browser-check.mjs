import {chromium, expect} from '@playwright/test';
import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const base=process.env.ATLAS_TEST_URL??'http://127.0.0.1:5173/';
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
const results=[],errors=[];
await mkdir('artifacts/atlas',{recursive:true});
async function context(viewport={width:1920,height:1080},options={}){
  const c=await browser.newContext({viewport,reducedMotion:'reduce',...options});
  await c.addInitScript(()=>{if(location.protocol==='http:'||location.protocol==='https:')localStorage.setItem('ghost-hub:effects','false');});
  c.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
  return c;
}
async function ready(p){await p.waitForFunction(()=>{const img=document.querySelector('.atlas-floor-crop img');return !!document.querySelector('.atlas-vector-plan')||(img?.complete&&img.naturalWidth>0);});await p.evaluate(()=>document.fonts.ready);}
async function select(p,name){await p.locator('.atlas-location').filter({has:p.getByText(name,{exact:true})}).click();await ready(p);}
async function stored(p){return p.evaluate(()=>JSON.parse(localStorage.getItem('ghost-hub:map-markers')??'[]'));}
try{
  const c=await context(),p=await c.newPage();await p.goto(base+'#/maps');await ready(p);
  await expect(p.locator('.atlas-vector-plan')).toHaveAttribute('aria-label',/Tanglewood/);
  assert.equal(await p.locator('.atlas-location strong').first().innerText(),'6 Tanglewood Drive');
  await p.locator('.atlas-board').click({position:{x:100,y:100}});assert.equal(await p.locator('.atlas-pin').count(),0);
  await p.getByRole('button',{name:'Place ghost room',exact:true}).click();
  let bounds=await p.locator('.atlas-board').boundingBox();await p.locator('.atlas-board').click({position:{x:bounds.width*.6,y:bounds.height*.5}});
  let markers=await stored(p);assert.equal(markers.length,1);assert.ok(Math.abs(parseFloat(await p.locator('.atlas-pin').evaluate(e=>e.style.left))-60)<1);assert.equal(markers[0].surface,'reference');
  await p.getByRole('button',{name:'Zoom map in',exact:true}).click();assert.equal(await p.getByLabel('Map zoom',{exact:true}).innerText(),'125%');
  for(let n=0;n<5;n++)await p.getByRole('button',{name:'Zoom map in',exact:true}).click();
  await p.getByRole('button',{name:'Pan map',exact:true}).click();let box=await p.locator('.atlas-viewport').boundingBox();
  await p.mouse.move(box.x+box.width*.6,box.y+box.height*.8);await p.mouse.down();await p.mouse.move(box.x+box.width*.6-100,box.y+box.height*.3,{steps:5});await p.mouse.up();
  assert.ok(await p.locator('.atlas-viewport').evaluate(e=>e.scrollTop)>50);assert.equal((await stored(p)).length,1);
  await p.getByRole('button',{name:'Fit map to view',exact:true}).click();assert.equal(await p.getByLabel('Map zoom',{exact:true}).innerText(),'100%');
  await p.locator('.atlas-floors button').filter({hasText:'Basement'}).click();assert.equal(await p.locator('.atlas-pin').count(),0);
  await p.getByRole('button',{name:'Add at centre',exact:true}).click();assert.equal((await stored(p)).length,2);
  await p.locator('.atlas-floors button').filter({hasText:'Ground floor'}).click();assert.equal(await p.locator('.atlas-pin').count(),1);
  await p.getByRole('button',{name:'Hide markers',exact:true}).click();assert.equal(await p.locator('.atlas-pin').count(),0);await p.getByRole('button',{name:'Show markers',exact:true}).click();
  await p.reload();await ready(p);assert.equal(await p.locator('.atlas-pin').count(),1);
  const beforeDisplay=await stored(p),beforeBounds=await p.locator('.atlas-board').boundingBox();
  await p.getByRole('button',{name:'Original colour',exact:true}).click();
  await p.reload();await ready(p);await expect(p.getByRole('button',{name:'Original colour',exact:true})).toHaveAttribute('aria-pressed','true');
  assert.equal(await p.locator('.atlas-floor-crop img').evaluate(e=>getComputedStyle(e).filter),'none');
  assert.ok(Math.abs(parseFloat(await p.locator('.atlas-pin').evaluate(e=>e.style.left))-beforeDisplay[0].x)<.01);
  await p.getByRole('button',{name:'Schematic',exact:true}).click();await ready(p);
  assert.equal(await p.locator('.atlas-vector-plan').count(),1);
  assert.deepEqual(await stored(p),beforeDisplay);assert.deepEqual(await p.locator('.atlas-board').boundingBox(),beforeBounds);
  results.push('Schematic and original-colour displays preserve canonical marker coordinates; display preference survives reload');
  results.push('Bundled map loads; pan cannot add markers; zoom, coordinates, floor isolation, visibility and reload persistence work');
  await p.getByLabel('Find a location',{exact:true}).fill('not-a-location');await p.getByText('No locations found',{exact:true}).waitFor();await p.getByRole('button',{name:'Clear search',exact:true}).click();
  await select(p,'13 Willow Street');await expect(p.locator('.atlas-vector-plan')).toHaveAttribute('aria-label',/Willow/);await expect(p.locator('.atlas-canvas-footer')).toContainText('21 Jul 2026');
  await p.getByRole('button',{name:'Full sheet',exact:true}).click();assert.equal(await p.getByRole('button',{name:'Add at centre',exact:true}).isDisabled(),true);
  assert.equal(await p.locator('.atlas-floor-crop img').evaluate(e=>getComputedStyle(e).filter),'none');
  await select(p,'Grafton Farmhouse');await p.locator('.atlas-floors button').filter({hasText:'Attic'}).click();await ready(p);
  await select(p,'Sunny Meadows Restricted');await p.locator('#atlas-wing').selectOption('Female wing');await p.getByRole('button',{name:'Add at centre',exact:true}).click();await p.locator('#atlas-wing').selectOption('Male wing');assert.equal(await p.locator('.atlas-pin').count(),0);await p.locator('#atlas-wing').selectOption('Female wing');assert.equal(await p.locator('.atlas-pin').count(),1);
  await select(p,'Prison Restricted');await p.locator('.atlas-reference-warning').getByText(/Full-site reference/).waitFor();
  results.push('Search, reworked Willow, full-sheet read-only view, Grafton attic, restricted warnings and isolated wing markers work');
  await select(p,'Point Hope');assert.equal(await p.getByLabel('Select floor',{exact:true}).locator('option').count(),10);await p.getByLabel('Select floor',{exact:true}).selectOption('Floor 10');await ready(p);
  await select(p,'6 Tanglewood Drive');
  const legacy={format:'ghost-hub-map-markers-v1',markers:[{id:'old-note',map:'tanglewood',floor:'Ground floor',label:'Original board note',x:23,y:71}]};
  await p.locator('input[type=file]').nth(1).setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});
  assert.equal((await stored(p)).length,3);await p.getByRole('button',{name:'Replace all markers',exact:true}).click();
  assert.equal(await p.locator('.atlas-pin').count(),0);await p.getByRole('button',{name:'My board',exact:false}).click();assert.equal(await p.locator('.atlas-pin').count(),1);
  await p.locator('input[type=file]').first().setInputFiles({name:'personal.png',mimeType:'image/png',buffer:await readFile('src/hub/assets/maps/tanglewood.png')});
  await p.locator('.atlas-board>img').waitFor();assert.equal((await stored(p))[0].x,23);
  assert.equal(await p.locator('.atlas-board>img').evaluate(e=>getComputedStyle(e).filter),'none');
  await p.reload();await p.locator('.atlas-board>img').waitFor();assert.equal(await p.locator('.atlas-pin').count(),1);
  await p.locator('.atlas-manage summary').click();
  const downloadPromise=p.waitForEvent('download');await p.getByRole('button',{name:'Export all markers',exact:true}).click();const download=await downloadPromise;
  const exported=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(exported.format,'ghost-hub-map-markers-v2');assert.equal(exported.markers[0].label,'Original board note');
  await p.locator('input[type=file]').nth(1).setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...legacy,markers:[...legacy.markers,...legacy.markers]}))});
  await p.getByText('This is not a valid Ghost Hub marker export. Nothing was changed.',{exact:true}).waitFor();assert.equal((await stored(p)).length,1);
  await p.getByRole('button',{name:'Reference map',exact:true}).click();await ready(p);assert.equal(await p.locator('.atlas-pin').count(),0);
  results.push('Legacy import requires confirmation, preserves personal coordinates, and remains separate from reference maps; local images survive reload; backups and invalid import handling pass');
  await p.getByRole('button',{name:'Expand atlas',exact:true}).click();await p.locator('.atlas-expanded').waitFor();await p.keyboard.press('Escape');assert.equal(await p.locator('.atlas-expanded').count(),0);
  await p.evaluate(()=>location.hash='/casebook/maps');await ready(p);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await p.evaluate(()=>location.hash='/maps');await ready(p);await p.screenshot({path:'artifacts/atlas/desktop.png',fullPage:true});
  for(const theme of ['dark','light']){await p.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);const a11y=await new AxeBuilder({page:p}).include('.atlas-v2').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(a11y.violations,[],theme+' atlas accessibility violations');}
  results.push('Ten individual Point Hope floors are available; automated WCAG A/AA checks report no violations in either theme');await c.close();
  const mobile=await context({width:390,height:844}),m=await mobile.newPage();await m.goto(base+'#/maps');await ready(m);
  assert.equal(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await m.locator('.atlas-mobile-select').click();await m.getByLabel('Find a location',{exact:true}).fill('willow');await select(m,'13 Willow Street');assert.equal(await m.locator('.atlas-mobile-select').getAttribute('aria-expanded'),'false');
  await m.getByRole('button',{name:'Place breaker',exact:true}).click();await m.getByRole('button',{name:'Add at centre',exact:true}).click();assert.equal(await m.locator('.atlas-pin').count(),1);
  await m.evaluate(()=>window.scrollTo(0,0));await m.screenshot({path:'artifacts/atlas/mobile.png',fullPage:true});
  await m.evaluate(()=>{document.documentElement.dataset.theme='light';});await m.screenshot({path:'artifacts/atlas/mobile-light.png',fullPage:true});
  await m.setViewportSize({width:820,height:1180});assert.equal(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await mobile.close();
  results.push('Expanded view exits with Escape; Casebook, mobile search, mobile markers, light mode and tablet width fit without horizontal page overflow');
  const rooms=await context(),r=await rooms.newPage();await r.goto(base+'#/maps');await ready(r);
  await r.getByRole('button',{name:'Select Kitchen',exact:true}).click();await expect(r.getByLabel('Select a room',{exact:true})).toHaveValue('kitchen');assert.equal((await stored(r)).length,0);
  await r.getByRole('button',{name:'Select Master bedroom',exact:true}).focus();await r.keyboard.press('Enter');await expect(r.getByLabel('Select a room',{exact:true})).toHaveValue('master');
  await r.getByRole('button',{name:'Hide room labels',exact:true}).click();assert.equal(await r.locator('.atlas-plan-label').count(),0);await r.getByRole('button',{name:'Show room labels',exact:true}).click();
  await r.getByRole('button',{name:'Mark this room',exact:true}).click();const roomMarker=(await stored(r))[0];assert.match(roomMarker.label,/Master bedroom/);assert.ok(Math.abs(roomMarker.x-(305-39.15)/704.7*100)<.001);assert.ok(Math.abs(roomMarker.y-(423-276.21)/481.14*100)<.001);
  await r.getByRole('button',{name:'Original colour',exact:true}).click();await ready(r);assert.ok(Math.abs(parseFloat(await r.locator('.atlas-pin').evaluate(e=>e.style.left))-roomMarker.x)<.001);await rooms.close();results.push('Rooms support mouse and keyboard selection, label visibility and room-centred markers aligned to the original source');
  // Disable the production service worker here so a cached image cannot mask
  // the deliberately failed transport. Offline recovery is tested separately.
  const failed=await context(undefined,{serviceWorkers:'block'}),f=await failed.newPage();await f.route('**/*tanglewood*.png*',route=>route.request().resourceType()==='image'?route.abort():route.continue());await f.goto(base+'#/maps');await ready(f);await f.getByRole('button',{name:'Original colour',exact:true}).click();await f.getByRole('heading',{name:'This floor image could not load',exact:true}).waitFor();assert.equal(await f.getByRole('button',{name:'Add at centre',exact:true}).isDisabled(),true);await f.getByRole('button',{name:'Schematic',exact:true}).click();await ready(f);assert.equal(await f.getByRole('button',{name:'Add at centre',exact:true}).isDisabled(),false);await failed.close();results.push('A failed reference image shows an actionable error; the independent room schematic remains available');
  assert.deepEqual(errors,[]);await writeFile('artifacts/atlas/results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));
}finally{await browser.close();}



