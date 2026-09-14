import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_MATCH,GHOST_MECHANICS,MatchSettingsSchema,effectiveSpeed,huntDuration,mechanicsFor,rhythmBpm,stepInterval} from '../src/hub/ghostMechanics';

test('every bundled ghost has reviewed movement, audio conditions and timing references',()=>{
  const catalog=JSON.parse(readFileSync(new URL('../public/data/hub-catalog.json',import.meta.url),'utf8'));
  assert.deepEqual(GHOST_MECHANICS.map(g=>g.id).sort(),catalog.ghosts.map((g:{id:string})=>g.id).sort());
  for(const g of GHOST_MECHANICS){
    assert.ok(g.pace.length&&g.listening&&g.movement&&g.timing&&g.source.startsWith('https://'));
    assert.equal(new Set(g.pace.map(p=>p.id)).size,g.pace.length);
    for(const p of g.pace){assert.ok(p.speed>0);if(p.maxSpeed)assert.ok(p.maxSpeed>=p.speed);}
  }
  assert.equal(mechanicsFor('unreviewed-new-ghost'),undefined);
});
test('incense prevention, blinding, and hunt cooldown remain distinct',()=>{
  assert.equal(mechanicsFor('spirit')!.incense,180);
  assert.equal(mechanicsFor('demon')!.incense,60);
  assert.equal(mechanicsFor('demon')!.cooldown,20);
  assert.equal(mechanicsFor('moroi')!.incense,90);
  assert.equal(mechanicsFor('moroi')!.blind,'7 s');
  assert.equal(mechanicsFor('gallu')!.blind,'5 / 4 / 6 s');
});
test('current Twins speeds use additive offsets through line-of-sight acceleration',()=>{
  const [slow,fast]=mechanicsFor('twins')!.pace;
  assert.equal(slow.speed,1.5);assert.equal(fast.speed,1.9);
  assert.equal(slow.maxSpeed,2.605);assert.equal(fast.maxSpeed,3.005);
});
test('temperature, distance, age and object-sensitive profiles preserve their extremes',()=>{
  const range=(id:string)=>{const speeds=mechanicsFor(id)!.pace.map(p=>p.speed);return [Math.min(...speeds),Math.max(...speeds)];};
  assert.deepEqual(range('hantu'),[1.4,2.7]);assert.deepEqual(range('deogen'),[.4,3]);
  assert.deepEqual(range('thaye'),[1,2.75]);assert.deepEqual(range('deildegast'),[.4,3]);
  for(const id of ['hantu','deogen','thaye','deildegast','revenant'])assert.ok(mechanicsFor(id)!.pace.every(p=>!p.maxSpeed));
});
test('hunt length respects map and duration settings, cursed extension and aggressive Obambo',()=>{
  assert.equal(huntDuration(DEFAULT_MATCH),30);
  assert.equal(huntDuration({...DEFAULT_MATCH,size:'large'}),60);
  assert.equal(huntDuration({...DEFAULT_MATCH,size:'medium',duration:'medium'}),40);
  assert.equal(huntDuration({...DEFAULT_MATCH,duration:'low'}),15);
  assert.equal(huntDuration({...DEFAULT_MATCH,cursed:true}),50);
  assert.equal(huntDuration(DEFAULT_MATCH,true),24);
  assert.equal(huntDuration({...DEFAULT_MATCH,cursed:true},true),40);
});
test('cadence follows effective speed rather than applying modifiers to the final BPM',()=>{
  assert.equal(effectiveSpeed(2, {...DEFAULT_MATCH,speed:150}),3);
  assert.ok(Math.abs(effectiveSpeed(2,{...DEFAULT_MATCH,speed:150,bloodMoon:true})-3.45)<1e-9);
  assert.ok(Math.abs(rhythmBpm(1.7)-116.9054)<.001);
  assert.ok(stepInterval(.4)>stepInterval(1.7)&&stepInterval(1.7)>stepInterval(3));
  for(const speed of [0,-1,Infinity,NaN,11])assert.throws(()=>stepInterval(speed),RangeError);
});
test('invalid saved match settings cannot enter the audio or timing calculation',()=>{
  assert.ok(MatchSettingsSchema.safeParse(DEFAULT_MATCH).success);
  for(const bad of [{speed:0},{size:'huge'},{duration:'infinite'},{cursed:'true'}])assert.equal(MatchSettingsSchema.safeParse({...DEFAULT_MATCH,...bad}).success,false);
});
