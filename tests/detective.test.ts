import {test} from 'node:test';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import raw from '../public/data/hub-catalog.json';
import {CatalogSchema,EVIDENCE,OBSERVATIONS,freshSession,type Evidence} from '../src/hub/model';
import {applyProposal,buildKnowledge,caseFingerprint,detectiveTurn,freshDialogue,type EvidenceProposal} from '../src/hub/detectiveEngine';
import {applySuggestions,parseObservations} from '../src/hub/engine';
import {destination,readTarget} from '../src/hub/navigation';
const catalog=CatalogSchema.parse(raw),knowledge=buildKnowledge(catalog);
const utterances:{label:string;text:string;check:(r:ReturnType<typeof detectiveTurn>)=>void}[]=[];
const names:Record<Evidence,string>={emf:'EMF 5',writing:'ghost writing',freezing:'freezing',orbs:'ghost orbs',box:'spirit box',uv:'UV',dots:'D.O.T.S.'};
for(const e of EVIDENCE){
  for(const prefix of ['We have ','We found ','Confirmed ','We recorded ','I saw '])utterances.push({label:e.id+' positive '+prefix,text:prefix+names[e.id],check:r=>assert.ok(r.reply.suggestions.some(s=>s.id===e.id&&s.state==='found'))});
  for(const prefix of ['No ','We have not found ','We tried ','Maybe ','We are checking '])utterances.push({label:e.id+' inconclusive '+prefix,text:prefix+names[e.id],check:r=>assert.ok(!r.reply.suggestions.some(s=>s.type==='evidence'&&s.state==='found'))});
  for(const prefix of ['How does ','What is ','Tell me about '])utterances.push({label:e.id+' reference '+prefix,text:prefix+names[e.id]+'?',check:r=>{assert.equal(r.reply.suggestions.length,0);assert.ok(r.reply.text.length>0);}});
}
for(const o of OBSERVATIONS){for(const prefix of ['', 'We noticed '])utterances.push({label:o.id+' observation '+prefix,text:prefix+o.aliases[0],check:r=>{assert.equal(r.state.topic,o.id);if(o.kind==='diagnostic'){assert.equal(r.state.pending?.id,'diagnostic');assert.ok(!r.reply.suggestions.some(s=>s.id===o.id));}else assert.ok(r.reply.suggestions.some(s=>s.id===o.id));}});}
for(const text of ['hi','hello','hey','thanks','I don’t know','he is scared','The ghost is shy','i am scared','What should we test next?','case summary','banana sandwich','spirt box?','No, I meant the lights.'])utterances.push({label:'conversation '+text,text,check:r=>assert.ok(r.reply.text.length>0)});
test('the labelled utterance corpus has at least 120 distinct inputs',()=>{assert.ok(utterances.length>=120);assert.equal(new Set(utterances.map(x=>x.text)).size,utterances.length);});
for(const example of utterances)test('utterance: '+example.label,()=>{const result=detectiveTurn(example.text,freshDialogue(),freshSession(),catalog,undefined,knowledge);example.check(result);assert.ok((result.reply.text.match(/\?/g)??[]).length<=1,'one question maximum');assert.ok(result.reply.choices.length<=3);assert.ok(!/precise observation|proper test|you should know/i.test(result.reply.text));});

const conversations:{name:string;turns:string[];check:(r:ReturnType<typeof detectiveTurn>)=>void}[]=[
 {name:'quiet yes',turns:['The ghost is shy','yes'],check:r=>assert.match(r.reply.text,/pattern/)} ,
 {name:'quiet outside',turns:['The ghost is shy','only outside'],check:r=>assert.match(r.reply.text,/pattern/)},
 {name:'quiet no',turns:['The ghost is shy','no'],check:r=>assert.match(r.reply.text,/clearer/)},
 {name:'quiet unsure',turns:['The ghost is shy','not sure'],check:r=>assert.match(r.reply.text,/okay/)},
 {name:'scared clarify',turns:['he is scared','yes'],check:r=>assert.equal(r.state.pending?.id,'quiet')},
 {name:'scared deny',turns:['he is scared','no'],check:r=>assert.match(r.reply.text,/clearing/)},
 {name:'why quiet',turns:['The ghost is shy','why are you asking'],check:r=>assert.equal(r.state.pending?.id,'quiet')},
 {name:'correct lights',turns:['The ghost is shy','No, I meant the lights'],check:r=>assert.equal(r.state.pending?.id,'electric')},
 {name:'switch direction',turns:['lights','light switch'],check:r=>assert.equal(r.state.pending?.id,'light-direction')},
 {name:'light on check',turns:['lights','light switch','on'],check:r=>assert.equal(r.state.pending?.id,'diagnostic')},
 {name:'light off',turns:['lights','light switch','off'],check:r=>assert.equal(r.reply.suggestions.length,0)},
 {name:'breaker',turns:['lights','breaker'],check:r=>assert.match(r.reply.text,/breaker/)},
 {name:'salt confirmed',turns:['disturbed salt','yes'],check:r=>assert.ok(r.reply.suggestions.some(s=>s.id==='salt-stepped'))},
 {name:'salt uncertain',turns:['disturbed salt','not sure'],check:r=>assert.equal(r.reply.suggestions.length,0)},
 {name:'salt denied',turns:['disturbed salt','no'],check:r=>assert.equal(r.reply.suggestions.length,0)},
 {name:'untouched crossing',turns:['not stepping in salt','yes'],check:r=>assert.ok(!r.reply.suggestions.some(s=>s.id==='salt-stepped'))},
 {name:'throws followup',turns:['multiple objects','yes'],check:r=>assert.equal(r.state.pending,undefined)},
 {name:'speed followup',turns:['faster near electronics','yes'],check:r=>assert.equal(r.state.pending,undefined)},
 {name:'shape followup',turns:['changed model','no'],check:r=>assert.equal(r.reply.suggestions.length,0)},
 {name:'early hunt',turns:['early hunt','not sure'],check:r=>assert.equal(r.state.pending,undefined)},
 {name:'reference interrupts question',turns:['The ghost is shy','How does spirit box work?'],check:r=>{assert.equal(r.state.pending,undefined);assert.equal(r.reply.suggestions.length,0);}},
 {name:'negative then next',turns:['We tried spirit box','What should we test next?'],check:r=>assert.ok(!r.reply.text.includes('Spirit Box'))},
 {name:'two attempts then leave open',turns:['banana sandwich','purple pancakes','rubber umbrella'],check:r=>{assert.equal(r.reply.choices.length,0);assert.ok(!r.reply.text.includes('?'));}},
 {name:'correct evidence',turns:['The ghost is shy','No, I meant EMF 5'],check:r=>assert.ok(r.reply.suggestions.some(s=>s.id==='emf'&&s.state==='found'))}
];
test('at least 24 multi-turn scenarios are covered',()=>assert.ok(conversations.length>=24));
for(const c of conversations)test('dialogue: '+c.name,()=>{let state=freshDialogue();let result:ReturnType<typeof detectiveTurn>|undefined;for(const text of c.turns){result=detectiveTurn(text,state,freshSession(),catalog,undefined,knowledge);state=result.state;}c.check(result!);});
test('an inconclusive suggestion preserves previously confirmed evidence',()=>{for(const old of ['found','ruled-out'] as const){const session=freshSession();session.evidence.writing=old;assert.equal(applySuggestions(session,parseObservations('no ghost writing')).evidence.writing,old);}});
test('proposals validate current case, revision, selection, replacement and application status',()=>{
 const session=freshSession();session.evidence.writing='ruled-out';const proposal:EvidenceProposal={items:[{id:'writing',label:'Writing',type:'evidence',state:'found'},{id:'emf',label:'EMF 5',type:'evidence',state:'found'}],caseId:'a',fingerprint:caseFingerprint(session,catalog.version),status:'pending'};
 assert.equal(applyProposal(session,proposal,[0],catalog.version,'a'),null);
 assert.equal(applyProposal(session,proposal,[0],catalog.version,'a',true)?.evidence.writing,'found');
 assert.equal(applyProposal(session,proposal,[1],catalog.version,'a')?.evidence.writing,'ruled-out');
 assert.equal(applyProposal(session,proposal,[1],catalog.version,'b'),null);
 assert.equal(applyProposal({...session,map:'other'},proposal,[1],catalog.version,'a'),null);
 assert.equal(applyProposal(session,{...proposal,status:'applied'},[1],catalog.version,'a'),null);
 assert.equal(applyProposal(session,proposal,[1],'other-version','a'),null);
});
test('case changes invalidate a pending question and attempted tests',()=>{const s=freshSession();const first=detectiveTurn('The ghost is shy',freshDialogue(),s,catalog);s.map='prison';const next=detectiveTurn('yes',first.state,s,catalog);assert.equal(next.state.pending,undefined);assert.equal(next.reply.suggestions.length,0);});
test('contradictory reports do not create confirmed evidence',()=>{const r=detectiveTurn('We have spirit box, but no spirit box',freshDialogue(),freshSession(),catalog);assert.equal(r.reply.suggestions.length,0);});
test('all evidence modes produce usable recommendations without changing the case',()=>{for(const count of [0,1,2,3] as const){const s=freshSession();s.evidenceCount=count;const r=detectiveTurn('what next',freshDialogue(),s,catalog);assert.ok(r.reply.text);assert.equal(r.reply.suggestions.length,0);if(count===0)assert.match(r.reply.text,/behaviour/);}});
test('zero and one candidate replies are safe',()=>{const zero=freshSession();zero.evidence={emf:'found',writing:'found',box:'found',uv:'found',freezing:'found',orbs:'found',dots:'found'};assert.match(detectiveTurn('what next',freshDialogue(),zero,catalog).reply.text,/don’t quite fit/);const one=freshSession();one.evidenceCount=0;one.evidence.orbs='found';assert.match(detectiveTurn('what next',freshDialogue(),one,catalog).reply.text,/remaining match/);});
test('book destinations preserve query and detail routes',()=>{assert.deepEqual(readTarget('#/casebook/ghosts/shade?q=quiet'),{path:'ghosts/shade?q=quiet',presentation:'casebook'});assert.equal(destination('detective?q=shy','casebook'),'#/casebook/detective?q=shy');assert.equal(destination('','casebook'),'#/casebook/overview');assert.equal(destination('evidence','classic'),'#/evidence');});
test('local utterance processing stays under the 100ms p95 budget',()=>{const times=utterances.map(c=>{const start=performance.now();detectiveTurn(c.text,freshDialogue(),freshSession(),catalog,undefined,knowledge);return performance.now()-start;}).sort((a,b)=>a-b);const p95=times[Math.floor(times.length*.95)];console.log(JSON.stringify({utterances:utterances.length,conversations:conversations.length,localTurnP95ms:p95}));assert.ok(p95<100);});

for(const text of ['Is ghost writing evidence','Can you tell me about EMF 5','I want to know how spirit box works','Does freezing mean the ghost is here'])test('instruction is not evidence: '+text,()=>{const r=detectiveTurn(text,freshDialogue(),freshSession(),catalog);assert.equal(r.reply.suggestions.length,0);});

for(const text of ['Actually, I meant the lights','No, we did not see it cross the salt','I am not sure','We have not found EMF 5'])test('retracted information retires pending proposals: '+text,()=>{const r=detectiveTurn(text,freshDialogue(),freshSession(),catalog);assert.equal(r.reply.retirePending,true);});
test('asking for an explanation does not retire a pending proposal',()=>{for(const text of ['How does ghost writing work?','Why does no EMF result matter?']){const r=detectiveTurn(text,freshDialogue(),freshSession(),catalog);assert.equal(r.reply.retirePending,false);}});
