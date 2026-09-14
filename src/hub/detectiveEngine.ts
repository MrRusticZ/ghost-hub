import {EVIDENCE,OBSERVATIONS,type Catalog,type Evidence,type Session} from './model';
import {findCandidates,normalize,parseObservations,type ParsedObservation} from './engine';
import {EQUIPMENT,GUIDES} from './content';

export type Choice={id:string;label:string};
export type PendingQuestion={id:string;question:string;why:string;choices:Choice[];observationId?:string};
export type DialogueState={turn:number;topic:string;pending?:PendingQuestion;attempted:Evidence[];misses:number;fingerprint:string;recentReplies:string[]};
export type DetectiveReply={text:string;details?:string;sources:string[];choices:Choice[];suggestions:ParsedObservation[];topic:string;retirePending?:boolean};
export type KnowledgeTopic={id:string;phrases:string[];short:string;detail:string;sources:string[];contentVersion:string};
export type EvidenceProposal={items:ParsedObservation[];fingerprint:string;status:'pending'|'applied'|'stale';caseId:string};
const wiki=(topic:string)=>'https://phasmophobia.fandom.com/wiki/'+topic;
export function caseFingerprint(session:Session,version:string){return JSON.stringify([version,session.map,session.evidenceCount,session.sanity,EVIDENCE.map(e=>session.evidence[e.id]??'unknown'),[...session.observations].sort()]);}
export function freshDialogue():DialogueState{return {turn:0,topic:'',attempted:[],misses:0,fingerprint:'',recentReplies:[]};}
const observationCopy:Record<string,{short:string;question?:string;why?:string;choices?:Choice[]}>= {
  quiet:{short:'Sounds like it’s been pretty quiet.',question:'Does it get more active when everyone leaves the room?',why:'Activity around players can be useful context, but quiet behaviour alone does not identify a ghost.',choices:[{id:'yes',label:'Only when we leave'},{id:'no',label:'Quiet all the time'},{id:'unsure',label:'Not sure'}]},
  electric:{short:'Let’s follow what happened with the electricity.',question:'Was it a light switch, the breaker, or a change in speed near equipment?',why:'These are different observations, so separating them helps us choose a useful check.',choices:[{id:'switch',label:'Light switch'},{id:'breaker',label:'Breaker'},{id:'speed',label:'Speed near equipment'}]},
  'salt-unknown':{short:'We can keep the untouched salt as a clue for now.',question:'Did you see the ghost’s path cross the pile?',why:'An untouched pile and a confirmed crossing are different observations.',choices:[{id:'yes',label:'Saw it cross'},{id:'no',label:'Didn’t see a crossing'},{id:'unsure',label:'Not sure'}]},
  throws:{short:'A burst of thrown objects is worth keeping track of.',question:'Did the objects move at the same time?',why:'Simultaneous throws are more useful context than several separate interactions.'},
  'fast-electronics':{short:'That change in pace is worth keeping as a clue.',question:'Did it slow down again away from the powered equipment?',why:'Comparing near and far helps separate equipment effects from other speed changes.'},
  'slow-near':{short:'That slowdown gives us something to compare.',question:'Did the ghost speed up again when farther from a player?',why:'Distance-related changes matter more than a single impression of speed.'},
  shape:{short:'A different model during a hunt is worth noting.',question:'Was its shape different, rather than briefly disappearing?',why:'Ordinary hunt flickering can look like a change when the model has stayed the same.'},
  'six-fingers':{short:'We can keep that unusual handprint as a clue.',question:'Was the extra finger clear under UV?',why:'The print pattern and confirmed UV evidence should be checked separately.'},
  'camera-dots':{short:'Let’s keep the camera view and the direct view separate.',question:'Was the same silhouette invisible to someone watching directly?',why:'A camera-only report needs a comparison under the relevant room conditions.'},
  'early-hunt':{short:'An early hunt is useful context.',question:'Was a cursed possession used before it started?',why:'A cursed hunt changes how we interpret the timing.'},
  'cold-breath':{short:'We can note the cold breath for now.',question:'Have you checked the room with a thermometer?',why:'Breath and a confirmed freezing reading are different observations.'},
  'salt-stepped':{short:'Let’s confirm the salt result before narrowing the case.',question:'Did you see the salt pile itself become disturbed?',why:'Confirm the disturbed pile itself; UV footprints are a separate observation.'},
  'light-on':{short:'Let’s check that light-switch observation before narrowing the case.',question:'Was it an ordinary room switch, with no player operating it and no motion-triggered light?',why:'Those conditions distinguish the diagnostic observation from other lighting changes.'}
};
const yesNo:Choice[]=[{id:'yes',label:'Yes'},{id:'no',label:'No'},{id:'unsure',label:'Not sure'}];
const evidenceTerms:Record<Evidence,string[]>={emf:['emf','emf 5','emf five','emf level 5'],writing:['writing','ghost writing','book'],freezing:['freezing','thermometer','temperature','sub zero'],orbs:['orbs','orb','ghost orbs'],box:['spirit box','spiritbox'],uv:['uv','ultraviolet','fingerprints'],dots:['dots','d o t s']};
const phrase=(text:string,term:string)=>(' '+text+' ').includes(' '+normalize(term)+' ');
export function buildKnowledge(catalog:Catalog):KnowledgeTopic[]{
  return [
    ...EVIDENCE.map(e=>({id:e.id,phrases:evidenceTerms[e.id],short:e.hint,detail:e.hint,sources:[wiki(e.name.replaceAll(' ','_'))],contentVersion:catalog.version})),
    ...OBSERVATIONS.map(o=>({id:o.id,phrases:o.aliases,short:observationCopy[o.id]?.short??o.label,detail:o.detail,sources:[...new Set([...o.supports,...(o.excludes??[])].flatMap(id=>catalog.ghosts.find(g=>g.id===id)?.sources??[]).concat(wiki('Evidence')))],contentVersion:catalog.version})),
    ...catalog.ghosts.map(g=>({id:'ghost:'+g.id,phrases:[g.name],short:g.summary,detail:g.test+' '+g.caution,sources:g.sources,contentVersion:catalog.version})),
    ...EQUIPMENT.map(e=>({id:'equipment:'+e.id,phrases:[e.name,e.id.replaceAll('-',' ')],short:e.summary,detail:e.steps.join(' ')+' '+e.caution,sources:[wiki(e.wiki)],contentVersion:catalog.version})),
    ...GUIDES.map(g=>({id:'guide:'+g.id,phrases:[g.title,g.id.replaceAll('-',' ')],short:g.summary,detail:g.sections.map(s=>s[1]).join(' '),sources:[g.source],contentVersion:catalog.version}))
  ];
}
function recommendation(session:Session,catalog:Catalog,attempted:Evidence[]):{text:string;details:string;sources:string[]} {
  const candidates=findCandidates(catalog.ghosts,session).filter(c=>!c.eliminated);
  if(!candidates.length)return {text:'These clues don’t quite fit together yet. Let’s review the last change in the evidence book; you can undo it there.',details:'Check the evidence-count setting and any result marked ruled out. An inconclusive test can stay unknown.',sources:[]};
  if(candidates.length===1)return {text:`${candidates[0].ghost.name} is the remaining match. We can check its distinguishing behaviour before settling on it.`,details:candidates[0].ghost.test+' '+candidates[0].ghost.caution,sources:candidates[0].ghost.sources};
  const options=EVIDENCE.filter(e=>(session.evidence[e.id]??'unknown')==='unknown'&&!attempted.includes(e.id)).map(e=>({e,count:candidates.filter(c=>c.possibleSets.some(s=>s.includes(e.id))).length})).filter(x=>x.count>0).sort((a,b)=>Math.min(b.count,candidates.length-b.count)-Math.min(a.count,candidates.length-a.count)||a.e.name.localeCompare(b.e.name));
  if(session.evidenceCount===0||!options.length)return {text:'Let’s compare behaviour next. The remaining ghosts’ reference pages can help you choose a distinguishing observation.',details:session.evidenceCount===0?'This is a zero-evidence case. Compare the available behaviours and their conditions.':'We’ve covered the available evidence checks for now. An inconclusive result stays open; use “retry tests” if you want to revisit them.',sources:[]};
  const next=options[0];return {text:`One thing to try next: ${next.e.name}. Keep an inconclusive result open for now.`,details:`A confirmed positive fits ${next.count} of ${candidates.length} remaining candidates. ${next.e.hint}`,sources:[wiki(next.e.name.replaceAll(' ','_'))]};
}
export function detectiveTurn(text:string,previous:DialogueState,session:Session,catalog:Catalog,choiceId?:string,knowledge=buildKnowledge(catalog)):{state:DialogueState;reply:DetectiveReply} {
  const fingerprint=caseFingerprint(session,catalog.version);
  const state:DialogueState={...previous,attempted:[...previous.attempted],recentReplies:[...previous.recentReplies],turn:previous.turn+1,fingerprint};
  if(previous.fingerprint&&previous.fingerprint!==fingerprint){state.pending=undefined;state.attempted=[];state.misses=0;}
  const raw=normalize(text.replace(/[’‘]/g,"'"));
  // Corrections are interpreted as a new subject; do not let a leading “no” answer the old question.
  const correction=/\b(?:i meant|i mean|actually|correction|sorry i meant)\b/.test(raw);
  const n=correction?raw.replace(/^.*?\b(?:i meant|i mean|actually|correction)\b\s*/,''):raw;
  const lookup=n.replace(/\bfreezin\b/g,'freezing').replace(/\bspirt box\b/g,'spirit box').replace(/\belectonics\b/g,'electronics').replace(/\bshie\b/g,'shy');
  if(!choiceId&&state.pending){
    const chosen=state.pending.choices.find(c=>normalize(c.label)===n||c.id===n);
    if(chosen)choiceId=chosen.id;
  }
  const informational=/^(?:how|what|why|tell me|explain|who|does|do|is|are|can|could|would|should|where|when|i (?:want|need|would like) to know)\b/.test(n)||(/\?$/.test(text.trim())&&!/\b(?:we have|i saw|we saw)\b/.test(n));
  if(correction)state.pending=undefined;
  const reply:DetectiveReply={text:'',sources:[],choices:[],suggestions:[],topic:state.topic,retirePending:correction||!informational&&/\b(?:no|not|never|unsure|maybe|don t|didn t|isn t|aren t|wasn t|weren t)\b/.test(raw)};
  function finish(message:string,details?:string){reply.text=state.pending&&previous.recentReplies.at(-1)===message?'We can keep that clue open. You can answer the question above, or tell me about something else.':message;reply.details=details;reply.topic=state.topic;state.recentReplies=[...state.recentReplies.slice(-3),reply.text];return {state,reply};}
  function ask(id:string,question:string,why:string,choices=yesNo,observationId?:string){state.pending={id,question,why,choices,observationId};reply.choices=choices;}
  function propose(items:ParsedObservation[]){reply.suggestions=items.filter(s=>s.type==='evidence'?s.state==='found'&&session.evidence[s.id as Evidence]!=='found':!session.observations.includes(s.id));}
  if(/^(?:why|why are you asking|why that question|what do you mean)$/.test(n)&&state.pending){reply.choices=state.pending.choices;return finish(state.pending.why);}
  if(/^(?:hi|hello|hey|hello detective|hi detective|hey detective)$/.test(n)){state.misses=0;return finish(state.turn%2?'Hello. Tell me what you noticed, and we’ll take it one clue at a time.':'I’m here. We can work from an observation or look at what to try next.');}
  if(/^(?:thanks|thank you|cheers|ok|okay)$/.test(n)){return finish('You’re welcome. I’m here when you have another clue.');}
  if(/\b(?:retry tests|try tests again)\b/.test(n)){state.attempted=[];state.pending=undefined;const next=recommendation(session,catalog,[]);reply.sources=next.sources;return finish(next.text,next.details);}
  if(/\b(?:what next|test next|try next|next test|next step|what should|help me|what do i do)\b/.test(n)){state.pending=undefined;state.misses=0;const next=recommendation(session,catalog,state.attempted);reply.sources=next.sources;return finish(next.text,next.details);}
  if(/\b(?:case summary|summari[sz]e|what do we know|remaining ghosts|what have we found|which ghosts remain)\b/.test(n)){state.pending=undefined;state.misses=0;const names=findCandidates(catalog.ghosts,session).filter(c=>!c.eliminated).map(c=>c.ghost.name);const found=EVIDENCE.filter(e=>session.evidence[e.id]==='found').map(e=>e.name);return finish(`${found.length?'Recorded evidence: '+found.join(', ')+'.':'No confirmed evidence is recorded yet.'} ${names.length} ${names.length===1?'ghost remains':'ghosts remain'} compatible.`,names.length?names.join(', '):'Review your last change in the evidence book.');}
  const unsure=choiceId==='unsure'||/^(?:i )?(?:don t know|do not know|not sure|unsure|maybe|no idea)$/.test(n);
  const yes=choiceId==='yes'||/^(?:yes|yeah|yep|yup|it did|it does|only when we leave|only outside|when we leave|saw it cross|same)$/.test(n);
  const no=choiceId==='no'||/^(?:no|nope|nah|it didn t|it doesn t|quiet all the time|didn t see a crossing)$/.test(n);
  if(state.pending&&(yes||no||unsure||choiceId)){
    const pending=state.pending;state.pending=undefined;state.misses=0;
    if(unsure)return finish('That’s okay—we can leave that open for now. Tell me about another clue whenever you’re ready.');
    if(pending.id==='scared'){
      if(no)return finish('Thanks for clearing that up. What did you notice the ghost doing?');
      state.topic='quiet';const copy=observationCopy.quiet;ask('quiet',copy.question!,copy.why!,copy.choices);
      return finish('Sounds like it’s been quiet around you. '+copy.question);
    }
    if(pending.id==='electric'){
      const answer=choiceId??n;
      if(answer==='speed'){state.topic='fast-electronics';const copy=observationCopy['fast-electronics'];ask(state.topic,copy.question!,copy.why!);return finish(copy.short+' '+copy.question);}
      if(answer==='breaker')return finish('Let’s keep the breaker separate from individual room lights. You can note what changed and compare it with the equipment guide.');
      ask('light-direction','Did the room light switch turn on or off?','Turning a light on and turning it off are different observations.',[{id:'on',label:'On'},{id:'off',label:'Off'},{id:'unsure',label:'Not sure'}]);return finish('Let’s look at the room switch. Did it turn on or off?');
    }
    if(pending.id==='light-direction'){
      if(choiceId==='on'){const copy=observationCopy['light-on'];ask('diagnostic',copy.question!,copy.why!,yesNo,'light-on');return finish(copy.short+' '+copy.question,OBSERVATIONS.find(o=>o.id==='light-on')!.detail);}
      return finish('We can note the light turning off. That alone won’t narrow the ghost list.');
    }
    if(pending.id==='diagnostic'){
      if(yes&&pending.observationId){const o=OBSERVATIONS.find(o=>o.id===pending.observationId)!;propose([{id:o.id,label:o.label,type:'observation'}]);return finish('That confirms the condition we needed. You can review this observation before adding it.',o.detail);}
      return finish('We’ll leave that diagnostic observation out for now. The rest of your evidence stays as it was.');
    }
    if(pending.observationId&&yes){const o=OBSERVATIONS.find(o=>o.id===pending.observationId)!;propose([{id:o.id,label:o.label,type:'observation'}]);}
    return finish(yes?'That helps describe the pattern. We can keep it as supporting context while checking the remaining evidence.':'Thanks—that gives us a clearer picture. We’ll keep the observation open and follow another clue.');
  }
  if(unsure){state.pending=undefined;return finish('That’s okay—we can leave that open for now. You can describe another clue or ask what to try next.');}
  if(/\b(?:scared|afraid|frightened|timid)\b/.test(n)&&!phrase(n,'i am scared')){state.topic='quiet';ask('scared','Do you mean the ghost seems to go quiet when you’re nearby?','I want to understand the behaviour you noticed before recording a clue.');return finish(state.pending!.question);}
  if(/\b(?:i am scared|i m scared|this is scary)\b/.test(n))return finish('We can take this one step at a time. You can use the evidence book whenever you’d rather skip the conversation.');
  const namedGhost=catalog.ghosts.find(g=>phrase(n,g.name)&&!(g.id==='spirit'&&phrase(n,'spirit box')));
  if(informational||namedGhost){
    const topic=namedGhost?knowledge.find(k=>k.id==='ghost:'+namedGhost.id):knowledge.find(k=>k.phrases.some(p=>phrase(lookup,p)));
    if(topic){state.topic=topic.id;state.pending=undefined;state.misses=0;reply.sources=topic.sources;return finish(topic.short,topic.detail);}
  }
  const corrected=n.replace(/\bfreezin\b/g,'freezing').replace(/\bspirt box\b/g,'spirit box').replace(/\belectonics\b/g,'electronics').replace(/\bshie\b/g,'shy');
  // Curated spelling fixes are for understanding. Evidence recognition uses the original report.
  const parsed=parseObservations(correction?n:text.replace(/[’‘]/g,"'"));
  const uncertain=/\b(?:think|guess|possibly|maybe|perhaps|might|could|if|not sure)\b/.test(n)||informational;
  const evidence=parsed.filter(s=>s.type==='evidence').map(s=>uncertain?{...s,state:'unknown' as const}:s);
  const observations=OBSERVATIONS.filter(o=>o.aliases.some(a=>phrase(corrected,a))).filter(o=>{
    if(o.id==='salt-unknown')return true;
    return !o.aliases.some(a=>{const at=corrected.indexOf(normalize(a));return at>=0&&/\b(?:not|never|didn t|isn t)\s*$/.test(corrected.slice(0,at));});
  }).filter(o=>!(o.id==='salt-stepped'&&parsed.some(s=>s.id==='salt-unknown')));
  const topic=observations.find(o=>o.kind==='diagnostic')??observations.find(o=>o.id!=='electric')??observations[0];
  if(topic&&!informational){
    state.topic=topic.id;state.pending=undefined;state.misses=0;const copy=observationCopy[topic.id];
    const sources=knowledge.find(k=>k.id===topic.id)?.sources??[];reply.sources=[...new Set(sources)].slice(0,2);
    if(topic.kind==='diagnostic'){
      if(uncertain)return finish('Let’s leave that as a possibility for now. We can check the conditions before using it to narrow the case.',topic.detail);
      ask('diagnostic',copy.question!,copy.why!,yesNo,topic.id);propose(evidence);
      return finish(copy.short+' '+copy.question,topic.detail);
    }
    propose([...evidence,...(!uncertain?observations.filter(o=>o.kind!=='diagnostic').map(o=>({id:o.id,label:o.label,type:'observation' as const})):[])]);
    if(copy.question)ask(topic.id,copy.question,copy.why!,copy.choices??yesNo,topic.id);
    return finish(copy.short+(copy.question?' '+copy.question:''),topic.detail);
  }
  if(evidence.length){
    state.pending=undefined;state.misses=0;state.topic=evidence[0].id;
    const attempted=evidence.filter(e=>e.state==='unknown').map(e=>e.id as Evidence);state.attempted=[...new Set([...state.attempted,...attempted])];propose(evidence);
    if(reply.suggestions.length)return finish('We can add those results to the case. Choose the confirmed observations below before recording them.','Your candidate list updates only when you add the selected results.');
    if(evidence.some(e=>e.state==='unknown'))return finish('We can leave that result open for now. Anything you already confirmed stays recorded.',recommendation(session,catalog,state.attempted).text);
    return finish('That result is already in your case. We can build on it when you have another observation.');
  }
  // Answer curated reference requests even when the wording omits a question mark.
  if(informational){state.pending=undefined;return finish('I can help with the ghost and equipment references in this guide. Try naming the item or ghost you want to look at.');}
  state.pending=undefined;state.misses++;
  if(state.misses===1){reply.choices=[{id:'quiet-topic',label:'Very little activity'},{id:'lights-topic',label:'Lights changing'},{id:'next-topic',label:'What to try next'}];return finish('I’m not quite sure which part to follow yet. Was it something the ghost did, or an equipment result?');}
  if(state.misses===2){reply.choices=[{id:'quiet-topic',label:'The ghost is shy'},{id:'evidence-topic',label:'We have EMF 5'},{id:'next-topic',label:'What to try next'}];return finish('We can try a small example: “the ghost is shy” or “we have EMF 5.” You can also ask for a next step.');}
  return finish('Let’s leave that description open. You can use the evidence book, browse a reference, or tell me about a different clue.');
}
export function applyProposal(session:Session,proposal:EvidenceProposal,selected:number[],version:string,caseId:string,allowReplacement=false):Session|null {
  if(proposal.status!=='pending'||proposal.caseId!==caseId||proposal.fingerprint!==caseFingerprint(session,version))return null;
  const next={...session,evidence:{...session.evidence},observations:[...session.observations]};
  for(const i of new Set(selected)){
    const item=proposal.items[i];if(!item)continue;
    if(item.type==='evidence'){
      if(!EVIDENCE.some(e=>e.id===item.id)||item.state!=='found')continue;
      const id=item.id as Evidence,current=session.evidence[id]??'unknown';
      if(current!=='unknown'&&current!==item.state&&!allowReplacement)return null;
      next.evidence[id]=item.state;
    }else if(OBSERVATIONS.some(o=>o.id===item.id)&&!next.observations.includes(item.id))next.observations.push(item.id);
  }
  return next;
}
