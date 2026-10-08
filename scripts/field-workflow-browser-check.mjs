import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const base=process.env.FIELD_TEST_URL??'http://127.0.0.1:5173/';
const output='artifacts/field-workflow';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
const errors=[],checks=[],layouts=[],accessibility=[];
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(10000);
page.on('pageerror',error=>errors.push(error.message));
const shortcuts=page.getByRole('navigation',{name:'Investigation shortcuts'});
const notes='Upstairs landing. Test the room again after checking the escape route.';
async function visit(target,route) {
  await target.goto(base+'#/'+route);
  await target.waitForFunction(route=>{
    const main=document.querySelector('main');
    return main?.dataset.route===route.replace(/^casebook\//,'')&&main?.dataset.presentation===(route.startsWith('casebook/')?'casebook':'classic');
  },route);
  await target.locator('main h1').first().waitFor();
  await target.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
const go=route=>visit(page,route);
const savedTimer=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ghost-hub:timer')));
const tools=page.getByRole('region',{name:'Match tools'});
try {
  await go('evidence');
  await expect(page.locator('.sidebar')).toHaveAttribute('inert','');
  await expect(page.getByRole('button',{name:'Behaviour & telltales'})).toHaveAttribute('aria-expanded','false');
  await tools.getByRole('button',{name:/Timer & quick notes/}).click();
  await tools.getByLabel('Quick case notes').fill(notes);
  await page.getByRole('button',{name:'EMF Level 5: unknown. Click to change.',exact:true}).click();
  await tools.getByRole('button',{name:'60 sec',exact:true}).click();
  await tools.getByRole('button',{name:'Start investigation timer',exact:true}).click();
  const originalTimer=await savedTimer();
  assert.ok(originalTimer.endsAt>Date.now());
  await expect(tools.getByRole('button',{name:'90 sec',exact:true})).toBeDisabled();
  await shortcuts.getByRole('link',{name:/Tools/}).click();
  await expect(page.getByRole('heading',{name:'Field tools',exact:true})).toBeVisible();
  assert.equal((await savedTimer()).endsAt,originalTimer.endsAt);
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  const paused=await savedTimer();
  assert.equal(paused.endsAt,null);
  await shortcuts.getByRole('link',{name:'Notes',exact:true}).click();
  await expect(page.getByLabel('Field notes',{exact:true})).toHaveValue(notes);
  await page.getByLabel('Field notes',{exact:true}).fill(notes+' No conclusion yet.');
  await shortcuts.getByRole('link',{name:'Evidence',exact:true}).click();
  await expect(tools.getByLabel('Quick case notes')).toHaveValue(notes+' No conclusion yet.');
  await expect(page.getByRole('button',{name:'EMF Level 5: found. Click to change.',exact:true})).toBeVisible();
  assert.equal((await savedTimer()).remaining,paused.remaining);
  await tools.getByRole('button',{name:'Start investigation timer',exact:true}).click();
  const resumed=await savedTimer();
  await page.reload();
  await expect(tools.getByLabel('Quick case notes')).toHaveValue(notes+' No conclusion yet.');
  assert.equal((await savedTimer()).endsAt,resumed.endsAt);
  await tools.getByRole('button',{name:'Pause investigation timer',exact:true}).click();
  checks.push('Evidence, shared notes, timer pause/resume and end time survive navigation and reload');

  await go('casebook/evidence');
  await shortcuts.getByRole('link',{name:'Notes',exact:true}).click();
  assert.equal(new URL(page.url()).hash,'#/casebook/journal');
  await expect(page.getByLabel('Field notes',{exact:true})).toHaveValue(notes+' No conclusion yet.');
  await shortcuts.getByRole('link',{name:'Evidence',exact:true}).click();
  await expect(tools.getByLabel('Quick case notes')).toHaveValue(notes+' No conclusion yet.');
  checks.push('Shortcuts retain Casebook presentation and shared case state');

  await go('evidence');
  const toggle=page.getByRole('button',{name:'Toggle navigation',exact:true});
  await toggle.click();
  const menu=page.getByRole('dialog',{name:'Main navigation'});
  await expect(menu).toBeVisible();
  await expect(page.locator('.workspace')).toHaveAttribute('inert','');
  await expect(page.getByRole('button',{name:'Close menu',exact:true})).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  assert.ok(await menu.evaluate(el=>el.contains(document.activeElement)));
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button',{name:'Close menu',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(page.locator('.sidebar')).toHaveAttribute('inert','');
  assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  await toggle.click();
  await menu.getByRole('link',{name:'Field journal',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Field journal',exact:true})).toBeVisible();
  await expect(page.locator('.sidebar')).toHaveAttribute('inert','');
  await expect(page.locator('main')).toBeFocused();
  await toggle.click();
  await menu.getByRole('link',{name:'Field journal',exact:true}).click();
  await expect(toggle).toBeFocused();
  await expect(page.locator('.sidebar')).toHaveAttribute('inert','');
  checks.push('Mobile drawer traps focus, Escape restores focus, and navigation closes the drawer');

  await shortcuts.getByRole('link',{name:/Tools/}).click();
  await page.getByLabel('Custom timer seconds',{exact:true}).fill('1');
  await page.getByRole('button',{name:'Set timer',exact:true}).click();
  await page.getByRole('button',{name:'Start',exact:true}).click();
  await shortcuts.getByRole('link',{name:'Evidence',exact:true}).click();
  await expect(tools.getByText('Complete',{exact:true})).toBeVisible();
  await expect(shortcuts.getByLabel('Timer complete: 00:00')).toBeVisible();
  await tools.getByRole('button',{name:'Reset investigation timer',exact:true}).click();
  await expect(tools.getByText('Ready',{exact:true})).toBeVisible();
  checks.push('Timer completion and reset are shared between the Tools page, Evidence and shortcut badge');

  // A fresh context tests the default collapsed tools and observations, not stored chapter state.
  const fresh=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const screen=await fresh.newPage();
  screen.on('pageerror',error=>errors.push(error.message));
  for(const width of [320,390,768,1024,1440]) {
    await screen.setViewportSize({width,height:900});
    for(const route of ['evidence','tools','journal','maps','casebook/evidence']) {
      await visit(screen,route);
      await screen.evaluate(()=>document.fonts.ready);
      const overflow=await screen.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
      layouts.push({width,route,overflow});
      assert.equal(overflow,false,`Horizontal overflow at ${width}: ${route}`);
    }
  }
  await screen.setViewportSize({width:390,height:844});
  await visit(screen,'evidence');
  await screen.screenshot({path:`${output}/mobile-evidence.png`,animations:'disabled'});
  await screen.getByRole('button',{name:/View \d+ possible ghosts/}).click();
  await expect(screen.locator('.candidates-title h2')).toBeFocused();
  const box=await screen.locator('.candidates-title h2').boundingBox();
  assert.ok(box.y>=0&&box.y<250);
  await screen.getByRole('button',{name:'Toggle navigation',exact:true}).click();
  await screen.screenshot({path:`${output}/mobile-menu.png`,animations:'disabled'});
  await screen.setViewportSize({width:1440,height:1000});
  await expect(screen.locator('.sidebar')).not.toHaveAttribute('inert','');
  await expect(screen.locator('.workspace')).not.toHaveAttribute('inert','');
  assert.equal(await screen.evaluate(()=>document.body.style.overflow),'');
  await visit(screen,'evidence');
  await screen.getByRole('button',{name:/Timer & quick notes/}).click();
  await screen.screenshot({path:`${output}/desktop-evidence.png`,animations:'disabled'});
  checks.push('25 layout checks, mobile results jump, and menu-to-desktop resize');

  for(const theme of ['dark','light']) {
    for(const width of [390,1440]) {
      await screen.setViewportSize({width,height:1000});
      for(const route of ['evidence','casebook/evidence']) {
        await visit(screen,route);
        if(await screen.locator('html').getAttribute('data-theme')!==theme)await screen.getByRole('button',{name:theme==='light'?'Switch to light mode':'Switch to dark mode'}).click();
        const result=await new AxeBuilder({page:screen}).include('.field-desk').include('.investigation-shortcuts').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
        accessibility.push({theme,width,route,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
      }
    }
  }
  await visit(screen,'');
  await expect(screen.getByRole('navigation',{name:'Investigation shortcuts'})).toHaveCount(0);
  await expect(screen.getByRole('region',{name:'Match tools'})).toHaveCount(0);
  checks.push('Homepage has no added tool panel or shortcut bar');
  assert.equal(accessibility.filter(r=>r.violations.length).length,0,JSON.stringify(accessibility.filter(r=>r.violations.length)));
  assert.deepEqual(errors,[]);
} finally {
  await writeFile(`${output}/results.json`,JSON.stringify({checks,layouts,accessibility,errors},null,2));
  await browser.close();
}
console.log(JSON.stringify({checks,layouts:layouts.length,accessibility:accessibility.length,errors},null,2));
