import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GHOST_DOSSIERS,DossierSchema,dossierFor,videoUrl} from '../src/hub/ghostDossiers';
import {CatalogSchema} from '../src/hub/model';
const catalog=CatalogSchema.parse(JSON.parse(readFileSync(new URL('../public/data/hub-catalog.json',import.meta.url),'utf8')));

test('all 30 current ghosts have individual field notes, valid cross references and media',()=>{
  assert.equal(catalog.ghosts.length,30);
  assert.deepEqual(GHOST_DOSSIERS.map(d=>d.id).sort(),catalog.ghosts.map(g=>g.id).sort());
  assert.equal(new Set(GHOST_DOSSIERS.map(d=>d.number)).size,30);
  assert.equal(new Set(GHOST_DOSSIERS.map(d=>d.focus)).size,30);
  for(const entry of GHOST_DOSSIERS){
    assert.ok(DossierSchema.safeParse(entry).success);
    assert.ok(entry.media.some(m=>m.kind==='youtube'));
    for(const id of entry.related){assert.notEqual(entry.id,id);assert.ok(dossierFor(id));}
    for(const media of entry.media){
      if(media.kind==='youtube'&&media.end)assert.ok(media.end>media.start);
      assert.ok(!/placeholder|not yet reviewed/i.test([entry.focus,...entry.facts,...entry.steps].join(' ')));
    }
  }
});
test('chapter links select the named ghost and never autoplay',()=>{
  for(const entry of GHOST_DOSSIERS){
    for(const media of entry.media){
      if(media.kind!=='youtube')continue;
      const url=new URL(videoUrl(media));
      assert.equal(url.hostname,'www.youtube-nocookie.com');
      assert.equal(url.searchParams.get('start'),String(media.start));
      assert.equal(url.searchParams.has('autoplay'),false);
      if(media.start)assert.ok(media.source.includes('&t='+media.start+'s'));
    }
  }
  assert.equal(dossierFor('spirit')!.media.find(m=>m.kind==='youtube')!.start,1258);
  assert.equal(dossierFor('yurei')!.media.find(m=>m.kind==='youtube')!.start,1560);
});
test('source review retains Mimic and reduced-evidence exceptions',()=>{
  const forced=catalog.ghosts.filter(g=>g.forcedEvidence).map(g=>[g.id,g.forcedEvidence]);
  assert.deepEqual(forced,[['hantu','freezing'],['goryo','dots'],['obake','uv'],['moroi','box'],['deogen','box']]);
  assert.ok(!catalog.ghosts.find(g=>g.id==='mimic')!.evidence.includes('orbs'));
  assert.match(dossierFor('mimic')!.facts.join(' '),/zero evidence/);
  assert.match(dossierFor('aswang')!.facts.join(' '),/available official/);
  assert.match(dossierFor('deildegast')!.facts.join(' '),/resets/);
  const manifest=JSON.parse(readFileSync(new URL('../public/data/manifest.json',import.meta.url),'utf8'));
  assert.equal(catalog.version,manifest.version);
});
test('third-party media schema rejects injected video ids and unsafe image origins',()=>{
  const original=dossierFor('shade')!;
  assert.equal(DossierSchema.safeParse({...original,media:[{...original.media[0],url:'http://localhost/private'}]}).success,false);
  const video=dossierFor('spirit')!.media[0];
  assert.equal(DossierSchema.safeParse({...original,media:[{...video,videoId:'x?autoplay=1'}]}).success,false);
});
