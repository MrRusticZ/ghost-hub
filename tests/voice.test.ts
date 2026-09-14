import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseVoiceCommand } from '../src/hub/voiceCommands';
test('explicit voice commands cover evidence, sanity, timer, navigation and snapshots',()=>{
  assert.equal(parseVoiceCommand('Add EMF')?.kind,'evidence');
  assert.deepEqual(parseVoiceCommand('set sanity 40'),{kind:'sanity',value:40,label:'Set team sanity to 40%',intentSource:'command'});
  assert.equal((parseVoiceCommand('start timer 3') as {seconds:number}).seconds,180);
  assert.equal((parseVoiceCommand('start timer 3 seconds') as {seconds:number}).seconds,3);
  assert.equal((parseVoiceCommand('switch to maps') as {to:string}).to,'maps');
  assert.equal(parseVoiceCommand('snapshot')?.kind,'snapshot');
  assert.equal((parseVoiceCommand('set map to Tanglewood') as {id:string}).id,'tanglewood');
  assert.equal((parseVoiceCommand('set map to nells diner') as {id:string}).id,'nells');
});
test('out-of-range values and observational speech cannot silently become commands',()=>{for(const input of ['set sanity 101','set sanity -5','start timer -3','start timer 0','start timer 61 minutes','It is not showing EMF 5','delete everything','set map to nowhere'])assert.equal(parseVoiceCommand(input),null,input);});
