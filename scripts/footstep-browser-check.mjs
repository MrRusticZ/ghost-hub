import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const base=process.env.FOOTSTEP_TEST_URL??process.env.PRODUCTION_PREVIEW_URL??'http://127.0.0.1:4173/ghost-hub/';
const records=JSON.parse(await readFile('src/hub/ghost-reference-media.json','utf8'));
const expected=records.filter(item=>item.kind==='audio');
for(const item of expected){
  const bytes=await readFile('src/hub/'+item.file);
  assert.equal(bytes.length,item.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
}
assert.equal(expected.length,12);
await mkdir('artifacts/footsteps',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:process.platform==='win32'?{channel:'msedge'}:{})});
const errors=[],results=[];
async function context(options={}){
  const c=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',serviceWorkers:'block',...options});
  c.on('page',p=>p.on('pageerror',error=>errors.push(error.message)));
  await c.addInitScript(()=>{
    const audit={contexts:[],decodes:[],starts:[],stops:0,syntheticBuffers:0,gain:null};
    window.__realFootsteps=audit;
    const buffers=new WeakMap();
    const Native=window.AudioContext;
    window.AudioContext=class extends Native{
      constructor(...args){super(...args);audit.contexts.push(this);}
      createBuffer(...args){audit.syntheticBuffers++;return super.createBuffer(...args);}
      createGain(){const gain=super.createGain();audit.gain=gain;return gain;}
      async decodeAudioData(bytes){
        const copy=bytes.slice(0),buffer=await super.decodeAudioData(bytes);
        const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',copy)),n=>n.toString(16).padStart(2,'0')).join('');
        let peak=0,energy=0;
        for(const value of buffer.getChannelData(0)){peak=Math.max(peak,Math.abs(value));energy+=value*value;}
        const record={hash,duration:buffer.duration,channels:buffer.numberOfChannels,sampleRate:buffer.sampleRate,peak,rms:Math.sqrt(energy/buffer.length)};
        audit.decodes.push(record);buffers.set(buffer,hash);return buffer;
      }
      createBufferSource(){
        const source=super.createBufferSource(),start=source.start.bind(source),stop=source.stop.bind(source);
        source.start=(when,...args)=>{audit.starts.push({when,hash:buffers.get(source.buffer),rate:source.playbackRate.value});return start(when,...args);};
        source.stop=(...args)=>{audit.stops++;return stop(...args);};return source;
      }
    };
  });
  return c;
}
async function ready(p){await p.locator('main h1').waitFor();await p.evaluate(()=>document.fonts.ready);}
const listen=p=>p.getByRole('button',{name:'Play footsteps for Spirit',exact:true});
try{
  const c=await context(),p=await c.newPage();await p.goto(base+'#/ghosts/spirit');await ready(p);
  await expect(p.getByLabel('Floor surface',{exact:true})).toBeVisible();
  assert.equal(await p.evaluate(()=>window.__realFootsteps.contexts.length),0,'no autoplay');
  for(const surface of ['standard','wood','carpet','gravel','asphalt','metal']){
    await p.getByLabel('Floor surface',{exact:true}).selectOption(surface);
    const before=await p.evaluate(()=>window.__realFootsteps.starts.length);
    await listen(p).click();
    await expect.poll(()=>p.evaluate(()=>window.__realFootsteps.starts.length)).toBeGreaterThanOrEqual(before+3);
    await expect(p.locator('.ency-play')).toHaveAttribute('aria-busy','false');
    const starts=await p.evaluate(n=>window.__realFootsteps.starts.slice(n),before);
    const hashes=new Set(expected.filter(item=>item.surface===surface).map(item=>item.sha256));
    assert.ok(starts.every(item=>hashes.has(item.hash)&&item.rate===1));
    assert.equal(new Set(starts.map(item=>item.hash)).size,hashes.size,'alternates the original surface recordings');
    assert.ok(Math.abs(starts[1].when-starts[0].when-(1/1.7-.075))<.002,'correct base cadence');
    // Surface changes must stop the current sound before another preview starts.
    await p.getByLabel('Floor surface',{exact:true}).selectOption(surface==='wood'?'carpet':'wood');
    await expect(p.locator('.ency-play')).toHaveAttribute('aria-pressed','false');
  }
  const audio=await p.evaluate(()=>({decodes:window.__realFootsteps.decodes,syntheticBuffers:window.__realFootsteps.syntheticBuffers}));
  assert.equal(audio.syntheticBuffers,0);
  assert.equal(audio.decodes.length,12);
  for(const recording of audio.decodes){assert.ok(recording.duration>0&&recording.duration<=2);assert.ok(recording.peak>.02&&recording.rms>.001);}
  results.push('All 12 original MP3 hashes decoded and scheduled at native pitch across six surfaces; no synthesized buffers; correct cadence; surface changes stop playback');
  await p.getByLabel('Volume',{exact:true}).fill('60');await listen(p).click();
  await expect.poll(()=>p.evaluate(()=>window.__realFootsteps.gain.gain.value)).toBeGreaterThan(.59);
  await p.getByRole('button',{name:'Stop audio',exact:true}).click();
  await listen(p).click();
  await expect(p.locator('.ency-play')).toHaveAttribute('aria-pressed','false',{timeout:15000});
  results.push('Volume, global stop and automatic 12-second stop');
  await listen(p).click();await p.goto(base+'#/detective');await ready(p);
  await expect.poll(()=>p.evaluate(()=>window.__realFootsteps.contexts.at(-1).state)).toBe('closed');
  results.push('Navigating to Ghost Detective disposes the audio context');

  await p.goto(base+'#/ghosts');await ready(p);
  await expect(p.locator('[data-ghost-entry]')).toHaveCount(30);
  await expect(p.locator('[data-ghost-entry=gallu] [data-artwork=unavailable]')).toContainText('?');
  assert.equal(await p.locator('.ency-pace-value').filter({hasText:'simulation'}).count(),0);
  const accessibility=[];
  for(const width of [1440,390,320]){
    await p.setViewportSize({width,height:1000});
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    const axe=await new AxeBuilder({page:p}).include('.ency-sound-note').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    assert.deepEqual(axe.violations,[]);accessibility.push(width);
    await p.screenshot({path:'artifacts/footsteps/recordings-'+width+'.png',animations:'disabled'});
  }
  await c.close();

  const failure=await context(),fp=await failure.newPage();
  await fp.route('**/*.mp3*',route=>route.fulfill({status:503,body:'Unavailable'}));
  await fp.goto(base+'#/ghosts/spirit');await ready(fp);await listen(fp).click();
  await expect(fp.getByText('The game footstep recording could not be loaded. Check your connection and try Listen again.',{exact:true})).toBeVisible();
  assert.equal(await fp.evaluate(()=>window.__realFootsteps.starts.length),0);
  assert.equal(await fp.evaluate(()=>window.__realFootsteps.syntheticBuffers),0);
  await fp.unroute('**/*.mp3*');await listen(fp).click();
  await expect.poll(()=>fp.evaluate(()=>window.__realFootsteps.starts.length)).toBeGreaterThan(0);
  await failure.close();results.push('Failed download reports an error without fake audio; next click retries successfully');

  for(const action of ['stop','navigate']){
    const delayed=await context(),dp=await delayed.newPage();
    let intercepted,release;const hit=new Promise(resolve=>intercepted=resolve),gate=new Promise(resolve=>release=resolve);
    await dp.route('**/*.mp3*',async route=>{intercepted();await gate;await route.continue().catch(()=>{});});
    await dp.goto(base+'#/ghosts/spirit');await ready(dp);await listen(dp).click();await hit;
    await expect(dp.locator('.ency-play')).toContainText('Loading…');
    if(action==='stop')await dp.getByRole('button',{name:'Stop footsteps for Spirit',exact:true}).click();
    else await dp.goto(base+'#/detective');
    release();
    if(action==='stop'){
      await expect.poll(()=>dp.evaluate(()=>window.__realFootsteps.decodes.length)).toBe(1);
      assert.equal(await dp.evaluate(()=>window.__realFootsteps.starts.length),0);
      await listen(dp).click();await expect.poll(()=>dp.evaluate(()=>window.__realFootsteps.starts.length)).toBeGreaterThan(0);
    }else{
      await expect.poll(()=>dp.evaluate(()=>window.__realFootsteps.contexts[0].state)).toBe('closed');
      assert.equal(await dp.evaluate(()=>window.__realFootsteps.starts.length),0);
    }
    await delayed.close();
  }
  results.push('Stop and route exit during loading cannot start delayed playback');

  if(base.includes(':4173')){
    const offline=await context({serviceWorkers:'allow'}),op=await offline.newPage();
    await op.goto(base+'#/ghosts/spirit');await ready(op);
    await op.evaluate(()=>navigator.serviceWorker.ready);
    await expect.poll(()=>op.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
    const manifest=await op.evaluate(async()=>await(await fetch('offline-assets.json')).json());
    assert.equal(manifest.filter(path=>path.endsWith('.mp3')).length,12);
    await offline.setOffline(true);await op.reload();await ready(op);
    await op.getByLabel('Floor surface',{exact:true}).selectOption('metal');await listen(op).click();
    await expect.poll(()=>op.evaluate(()=>window.__realFootsteps.starts.length)).toBeGreaterThanOrEqual(3);
    assert.equal(await op.evaluate(()=>window.__realFootsteps.syntheticBuffers),0);
    await offline.close();results.push('Pages-base build caches all 12 MP3s and plays real recordings after offline reload');
  }
  assert.deepEqual(errors,[]);
  const report={base,results,errors,accessibility,audio};
  await writeFile('artifacts/footsteps/browser-results.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
