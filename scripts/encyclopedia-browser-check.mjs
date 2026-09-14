import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';

const base=process.env.ENCYCLOPEDIA_TEST_URL??'http://127.0.0.1:5173/';
const catalog=JSON.parse(await readFile('public/data/hub-catalog.json','utf8'));
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:process.platform==='win32'?{channel:'msedge'}:{})});
const results=[],errors=[];
await mkdir('artifacts/encyclopedia',{recursive:true});
async function makeContext(viewport={width:1440,height:1000}){
  const c=await browser.newContext({viewport,reducedMotion:'reduce'});
  await c.addInitScript(()=>{
    const audit={contexts:[],starts:[],stops:0,samplePeak:0};window.__footstepsAudit=audit;
    const Native=window.AudioContext;
    if(Native)window.AudioContext=class extends Native{
      constructor(...args){super(...args);audit.contexts.push(this);}
      createBufferSource(){
        const node=super.createBufferSource(),start=node.start.bind(node),stop=node.stop.bind(node);
        node.start=(when,...args)=>{audit.starts.push(when);const data=node.buffer?.getChannelData(0);if(data){let peak=0;for(const value of data)peak=Math.max(peak,Math.abs(value));audit.samplePeak=Math.max(audit.samplePeak,peak);}return start(when,...args);};
        node.stop=(...args)=>{audit.stops++;return stop(...args);};return node;
      }
    };
  });
  c.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
  return c;
}
async function ready(p){await p.locator('main h1').waitFor();await p.evaluate(()=>document.fonts.ready);}
async function screenshot(p,name){await p.screenshot({path:'artifacts/encyclopedia/'+name+'.png',animations:'disabled'});}
async function noOverflow(p){assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
try{
  const c=await makeContext(),p=await c.newPage();await p.goto(base+'#/ghosts');await ready(p);
  await expect(p.locator('[data-ghost-entry]')).toHaveCount(30);
  await expect(p.getByRole('button',{name:'Cards',exact:true})).toHaveAttribute('aria-pressed','true');
  assert.equal(await p.evaluate(()=>window.__footstepsAudit.contexts.length),0);
  await screenshot(p,'cards-desktop');
  await p.getByRole('button',{name:'Play footsteps for Aswang',exact:true}).click();
  await expect.poll(()=>p.evaluate(()=>window.__footstepsAudit.starts.length)).toBeGreaterThanOrEqual(3);
  const audio=await p.evaluate(()=>({starts:window.__footstepsAudit.starts,peak:window.__footstepsAudit.samplePeak,state:window.__footstepsAudit.contexts[0].state}));
  assert.ok(audio.peak>.1);assert.equal(audio.state,'running');assert.ok(Math.abs(audio.starts[1]-audio.starts[0]-(1/1.53-.075))<.002);
  await p.getByRole('button',{name:'Play footsteps for Banshee',exact:true}).click();
  await expect(p.locator('.ency-play[aria-pressed=true]')).toHaveCount(1);
  assert.equal(await p.evaluate(()=>window.__footstepsAudit.contexts.length),1);
  await p.getByRole('button',{name:'Compact list',exact:true}).click();
  await expect(p.locator('.ency-play[aria-pressed=true]')).toHaveCount(0);
  await expect(p.locator('.ency-list [data-ghost-entry]')).toHaveCount(30);
  await screenshot(p,'list-desktop');
  await p.reload();await ready(p);await expect(p.getByRole('button',{name:'Compact list',exact:true})).toHaveAttribute('aria-pressed','true');
  await p.getByLabel('Search ghosts',{exact:true}).fill('spirit box');
  const boxCount=catalog.ghosts.filter(g=>g.evidence.includes('box')).length;
  assert.ok(await p.locator('[data-ghost-entry]').count()>=boxCount);
  await p.getByLabel('Search ghosts',{exact:true}).fill('no-such-ghost-123');await expect(p.getByText('No matching dossier',{exact:true})).toBeVisible();
  await p.getByRole('button',{name:'Clear ghost search',exact:true}).click();
  for(const name of ['Spirit','Demon','Moroi'])await p.getByRole('checkbox',{name:'Compare '+name,exact:true}).check();
  await expect(p.getByRole('checkbox',{name:'Compare Wraith',exact:true})).toBeDisabled();
  await p.getByRole('button',{name:'Compare selected',exact:true}).click();
  await expect(p.locator('.ency-table tbody tr')).toHaveCount(3);
  for(const [id,seconds] of [['spirit',180],['demon',60],['moroi',90]])await expect(p.locator('[data-ghost-entry='+id+'] .ency-timer-button').first()).toContainText(seconds+' s');
  await screenshot(p,'comparison-desktop');
  await p.getByRole('button',{name:'Clear selection',exact:true}).click();await expect(p.locator('.ency-table tbody tr')).toHaveCount(30);
  await p.getByLabel('Search ghosts',{exact:true}).fill('revenant');await expect(p.locator('[data-ghost-entry]')).toHaveCount(1);
  await p.getByLabel('Revenant footstep condition',{exact:true}).selectOption('detected');
  await expect(p.locator('.ency-pace-value strong')).toContainText('3 m/s');
  await p.locator('.ency-settings>summary').click();await p.getByLabel('Ghost speed',{exact:true}).selectOption('150');
  await expect(p.locator('.ency-pace-value strong')).toContainText('4.5 m/s');
  await p.getByLabel('Blood Moon (+15% speed)',{exact:true}).check();await expect(p.locator('.ency-pace-value strong')).toContainText('5.175 m/s');
  await p.getByLabel('Ghost speed',{exact:true}).selectOption('100');await p.getByLabel('Blood Moon (+15% speed)',{exact:true}).uncheck();
  await p.getByRole('button',{name:'Clear ghost search',exact:true}).click();
  results.push('30 ghosts across all three views; persistent view; search; comparison limit; speed modifiers; real audio scheduling');

  // Reference browsing must not adopt the elimination state of the user's investigation.
  const storedCase={evidence:{emf:'ruled-out'},evidenceCount:3,observations:[],map:'tanglewood',sanity:60,notes:'Preserve my case',name:'Reference test'};
  await p.evaluate(value=>localStorage.setItem('ghost-hub:session',JSON.stringify(value)),storedCase);await p.reload();await ready(p);
  await expect(p.locator('[data-ghost-entry]')).toHaveCount(30);assert.equal(await p.locator('main').getByText('Ruled out',{exact:true}).count(),0);
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('ghost-hub:session')).notes),'Preserve my case');
  for(const g of catalog.ghosts){
    await p.goto(base+'#/ghosts/'+g.id);await ready(p);
    await expect(p.getByRole('heading',{name:g.name,exact:true})).toBeVisible();
    await expect(p.locator('[data-ghost-player='+g.id+']')).toBeVisible();await noOverflow(p);
  }
  await p.goto(base+'#/ghosts/mimic');await ready(p);
  await p.getByLabel('The Mimic imitated ghost',{exact:true}).selectOption('deogen');await p.getByLabel('The Mimic footstep condition',{exact:true}).selectOption('near');
  await expect(p.locator('.ency-pace-value strong')).toContainText('0.4 m/s');
  await p.getByLabel('The Mimic timing imitation',{exact:true}).selectOption('demon');await expect(p.getByRole('button',{name:'Start 60 second incense timer for The Mimic',exact:true})).toBeVisible();
  await p.goto(base+'#/ghosts/spirit');await ready(p);await p.getByRole('button',{name:'Start 180 second incense timer for Spirit',exact:true}).click();
  await expect(p.locator('.ency-active-timer')).toBeVisible();await p.locator('.ency-active-timer').getByRole('button',{name:'Pause',exact:true}).click();
  await expect(p.getByText('Field timer paused',{exact:true})).toBeVisible();await p.reload();await ready(p);await expect(p.getByText('Field timer paused',{exact:true})).toBeVisible();
  await p.locator('.ency-active-timer').getByRole('button',{name:'Resume',exact:true}).click();await p.getByRole('link',{name:'Open field tools',exact:true}).click();
  await expect(p.locator('.timer-panel')).toContainText('Running');
  await p.goto(base+'#/ghosts/obambo');await ready(p);await expect(p.locator('.ency-facts')).toContainText('24 s aggressive');
  await p.locator('.ency-active-timer').getByRole('button',{name:'Reset',exact:true}).click();
  results.push('all 30 direct dossiers; independent reference data; Mimic imitation; linked timer start/pause/resume/reload/navigation; Obambo timing');
  await screenshot(p,'obambo-dossier');

  const accessibility=[];
  for(const width of [1440,390,320]){
    await p.setViewportSize({width,height:1000});
    for(const theme of ['dark','light']){
      const current=await p.evaluate(()=>document.documentElement.dataset.theme);
      if(current!==theme)await p.getByRole('button',{name:'Switch to '+theme+' mode',exact:true}).click();
      for(const view of ['Cards','Compact list','Detailed comparison']){
        await p.goto(base+'#/ghosts');await ready(p);await p.getByRole('button',{name:view,exact:true}).click();await noOverflow(p);
        if(width===390)await screenshot(p,theme+'-'+view.toLowerCase().replaceAll(' ','-')+'-mobile');
        if(width!==320){const axe=await new AxeBuilder({page:p}).include('.ency-page').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();accessibility.push({width,theme,view,violations:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});}
      }
      await p.goto(base+'#/ghosts/gallu');await ready(p);await noOverflow(p);
    }
  }
  await p.setViewportSize({width:1440,height:1000});await p.goto(base+'#/casebook/ghosts/spirit');await ready(p);
  await expect(p.getByRole('button',{name:'Play footsteps for Spirit',exact:true})).toBeVisible();await noOverflow(p);
  await p.getByRole('button',{name:'Play footsteps for Spirit',exact:true}).click();await expect(p.locator('.ency-play[aria-pressed=true]')).toHaveCount(1);
  await p.locator('.back-link').click();await ready(p);await expect.poll(()=>p.evaluate(()=>window.__footstepsAudit.contexts.at(-1)?.state)).toBe('closed');
  await p.goto(base+'#/ghosts');await ready(p);await p.evaluate(()=>document.documentElement.style.fontSize='200%');await noOverflow(p);await p.evaluate(()=>document.documentElement.style.fontSize='');
  const denied=await makeContext({width:390,height:844});await denied.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new Error('Storage blocked');};Storage.prototype.getItem=()=>{throw new Error('Storage blocked');};});
  const dp=await denied.newPage();await dp.goto(base+'#/ghosts');await ready(dp);await dp.getByRole('button',{name:'Compact list',exact:true}).click();await expect(dp.locator('[data-ghost-entry]')).toHaveCount(30);await denied.close();
  results.push('desktop/390px/320px layouts; dark/light themes; Casebook; 200% text; audio disposal; unavailable storage');
  await writeFile('artifacts/encyclopedia/browser-results.json',JSON.stringify({base,results,errors,accessibility},null,2));
  assert.deepEqual(errors,[]);assert.deepEqual(accessibility.filter(r=>r.violations.length),[]);
  await c.close();console.log(JSON.stringify({results,errors,accessibilityRuns:accessibility.length}));
}finally{await browser.close();}
