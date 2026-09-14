import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';

const base=process.env.DOSSIER_TEST_URL??process.env.ENCYCLOPEDIA_TEST_URL??'http://127.0.0.1:5173/';
const entries=JSON.parse(await readFile('src/hub/ghostDossiers.json','utf8'));
const catalog=JSON.parse(await readFile('public/data/hub-catalog.json','utf8'));
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
// Third-party transport is stubbed for deterministic interaction tests. Real source
// availability is checked separately in the release audit and browser review.
await context.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html lang="en"><title>Source transport fixture</title><body>External player transport fixture</body></html>'}));
const pixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=','base64');
await context.route('https://static.wikia.nocookie.net/**',r=>r.fulfill({contentType:'image/png',body:pixel}));
const page=await context.newPage();
const errors=[],checks=[],accessibility=[];
page.on('pageerror',e=>errors.push(e.message));
await mkdir('artifacts/dossiers',{recursive:true});
try{
  await page.goto(base+'#/ghosts/spirit');
  for(const entry of entries){
    const ghost=catalog.ghosts.find(g=>g.id===entry.id);
    await page.evaluate(id=>{location.hash='/ghosts/'+id;},entry.id);
    await expect(page.locator('[data-dossier]')).toHaveAttribute('data-dossier',entry.id);
    await expect(page.locator('main h1')).toHaveText(ghost.name);
    await expect(page.locator('.dossier-observations li')).toHaveCount(3);
    await expect(page.locator('.dossier-stage iframe')).toHaveCount(0);
    await page.getByRole('button',{name:'How to test',exact:true}).click();
    await expect(page.locator('.dossier-observations li').first()).toContainText(entry.steps[0]);
    await page.getByRole('button',{name:'What to notice',exact:true}).click();
    for(let i=0;i<entry.media.length;i++){
      const media=entry.media[i];
      if(entry.media.length>1)await page.getByRole('group',{name:'Media references'}).getByRole('button').nth(i).click();
      await expect(page.getByRole('link',{name:'Original source',exact:true})).toHaveAttribute('href',media.source);
      if(media.kind==='youtube'){
        await page.getByRole('button',{name:/Load (ghost chapter|video player)/}).click();
        const url=new URL(await page.locator('.dossier-stage iframe').getAttribute('src'));
        assert.equal(Number(url.searchParams.get('start')),media.start);
        assert.equal(url.searchParams.has('autoplay'),false);
        await page.getByRole('button',{name:'Close video',exact:true}).click();
        await expect(page.locator('.dossier-stage iframe')).toHaveCount(0);
      }else if(media.kind==='animation'){
        await expect(page.locator('.dossier-stage img')).toHaveCount(0);
        await page.getByRole('button',{name:'Play animation',exact:true}).click();
        await expect(page.locator('.dossier-stage img')).toHaveAttribute('alt',media.alt);
        await page.getByRole('button',{name:'Stop animation',exact:true}).click();
        await expect(page.locator('.dossier-stage img')).toHaveCount(0);
      }else{
        await expect(page.locator('.dossier-stage img')).toHaveAttribute('alt',media.alt);
        await page.getByRole('button',{name:'Inspect print',exact:true}).click();
        await expect(page.locator('.dossier-stage')).toHaveClass(/zoomed/);
        await page.getByRole('button',{name:'Fit image',exact:true}).click();
      }
    }
    checks.push(entry.id+': notes, steps, sources and '+entry.media.length+' media controls');
  }
  await page.evaluate(()=>{location.hash='/ghosts/spirit';});
  await page.getByRole('button',{name:/Load ghost chapter/}).click();
  await page.getByRole('button',{name:'Play footsteps for Spirit',exact:true}).click();
  await expect(page.locator('.dossier-stage iframe')).toHaveCount(0);
  await page.getByRole('button',{name:/Load ghost chapter/}).click();
  await expect(page.getByRole('button',{name:'Play footsteps for Spirit',exact:true})).toBeVisible();
  await page.evaluate(()=>{location.hash='/ghosts/obake';});
  await expect(page.locator('.dossier-stage iframe')).toHaveCount(0);
  await page.evaluate(()=>{location.hash='/ghosts/mimic';});
  await page.getByLabel('The Mimic timing imitation',{exact:true}).selectOption('moroi');
  await expect(page.locator('.ency-facts').first()).toContainText('5 s');
  await expect(page.getByText(/current Mimic reference reports a 5-second/)).toBeVisible();
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:1000});
    for(const theme of ['dark','light']){
      await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
      for(const id of ['obake','shade','spirit','deildegast']){
        await page.evaluate(id=>{location.hash='/ghosts/'+id;},id);
        await expect(page.locator('[data-dossier]')).toHaveAttribute('data-dossier',id);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),id+' overflow at '+width);
        const a=await new AxeBuilder({page}).include('.ghost-dossier').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        accessibility.push({id,width,theme,violations:a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
      }
    }
  }
  await page.route('https://static.wikia.nocookie.net/**',r=>r.abort());
  await page.goto(base+'#/ghosts/obake');
  await page.reload();
  await expect(page.getByRole('heading',{name:'Six-fingered handprint',exact:true})).toBeVisible();
  await expect(page.locator('.dossier-media-cover')).toContainText('SOURCE UNAVAILABLE');
  await expect(page.getByRole('link',{name:'Original source',exact:true})).toBeVisible();
  await expect(page.locator('.dossier-observations li')).toHaveCount(3);
  checks.push('Reduced-motion opt-in; exclusive audio playback; route reset; remote-image failure retains written guidance');
  assert.deepEqual(errors,[]);
  assert.ok(accessibility.every(a=>a.violations.length===0),JSON.stringify(accessibility.filter(a=>a.violations.length)));
}finally{
  await writeFile('artifacts/dossiers/browser-results.json',JSON.stringify({base,checks,errors,accessibility},null,2));
  await browser.close();
}
console.log(JSON.stringify({dossiers:checks.length-1,media:entries.reduce((n,e)=>n+e.media.length,0),accessibilityRuns:accessibility.length,errors}));
