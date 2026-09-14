import { EVIDENCE, OBSERVATIONS, type Candidate, type Evidence, type Ghost, type Session } from './model';
import { possibleEvidenceSets,matchingEvidenceSets,diagnosticConflicts } from '../../shared/deduction.mjs';

export const normalize = (v:string) => v.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
export function combinations<T>(items:T[], count:number):T[][] {
  if (count === 0) return [[]];
  return items.flatMap((v,i) => combinations(items.slice(i+1),count-1).map(rest => [v,...rest]));
}
export function evidenceSets(ghost:Ghost, count:number):Evidence[][] {
  return possibleEvidenceSets(ghost,count);
}
export function findCandidates(ghosts:Ghost[], session:Session):Candidate[] {
  const found=EVIDENCE.filter(e=>session.evidence[e.id]==='found').map(e=>e.id);
  const absent=EVIDENCE.filter(e=>session.evidence[e.id]==='ruled-out').map(e=>e.id);
  return ghosts.map(ghost=>{
    const sets=evidenceSets(ghost,session.evidenceCount);
    const possibleSets=matchingEvidenceSets(ghost,session);
    const observations=OBSERVATIONS.filter(o=>session.observations.includes(o.id));
    const conflicts=observations.filter(o=>diagnosticConflicts(ghost.id,session.observations).includes(o.id));
    const reasons:string[]=[];
    if (!possibleSets.length) reasons.push('No possible evidence set matches these results at this evidence count.');
    conflicts.forEach(o=>reasons.push(o.detail));
    if (possibleSets.length && found.length) reasons.push(`Compatible with ${found.length} confirmed observation${found.length===1?'':'s'} at ${session.evidenceCount} evidence.`);
    if (ghost.id==='mimic') reasons.push('Its ghost orbs are extra and do not consume an evidence slot.');
    if (ghost.forcedEvidence&&session.evidenceCount>0&&session.evidenceCount<3) reasons.push(`${EVIDENCE.find(e=>e.id===ghost.forcedEvidence)?.name} must be in its available evidence set.`);
    return {ghost,eliminated:!possibleSets.length||!!conflicts.length,reasons,support:observations.filter(o=>o.supports.includes(ghost.id)).map(o=>o.label),possibleSets};
  }).sort((a,b)=>Number(a.eliminated)-Number(b.eliminated)||b.support.length-a.support.length||a.ghost.name.localeCompare(b.ghost.name));
}
export function nextTest(candidates:Candidate[],session:Session) {
  const active=candidates.filter(c=>!c.eliminated);
  if(!active.length)return {title:'Review your last observation',detail:'These results conflict. Check the evidence count, distinguish an unobserved result from a ruled-out one, and use Undo.'};
  const options=EVIDENCE.filter(e=>!session.evidence[e.id]||session.evidence[e.id]==='unknown').map(e=>{
    const eligible=active.filter(c=>c.possibleSets.some(set=>set.includes(e.id))).length;
    return {...e,eligible,score:Math.min(eligible,active.length-eligible)};
  }).filter(e=>e.eligible>0).sort((a,b)=>b.score-a.score);
  if(options.length&&active.length>1) return {title:`Check ${options[0].name}`,detail:`A confirmed positive is compatible with ${options[0].eligible} of ${active.length} remaining candidates. ${options[0].hint} A missing result alone is not a rule-out.`};
  return {title:active.length===1?`Confirm ${active[0].ghost.name}`:'Compare behaviour under controlled conditions',detail:active[0].ghost.test+' '+active[0].ghost.caution};
}
export type ParsedObservation={id:string;label:string;type:'evidence'|'observation';state?:'found'|'ruled-out'|'unknown'};
const aliases:Record<Evidence,string[]>={emf:['emf 5','emf five','emf level 5'],dots:['dots','d o t s'],uv:['uv','ultraviolet','fingerprints'],freezing:['freezing','sub zero'],orbs:['orbs','ghost orb'],writing:['ghost writing','writing','wrote in the book'],box:['spirit box','spiritbox']};
export function parseObservations(text:string):ParsedObservation[]{
  const normalized=normalize(text);
  const clauses=text.split(/[.,;!\n]|\b(?:but|however|although|except)\b/i).map(raw=>({text:normalize(raw),question:raw.includes('?')}));
  const output:ParsedObservation[]=[];
  for(const e of EVIDENCE){
    const states:('unknown'|'found')[]=[];
    for(const clause of clauses){
      for(const term of aliases[e.id]){
        const match=new RegExp('(?:^| )'+term+'(?= |$)').exec(clause.text);if(!match)continue;
        const at=match.index+(match[0].startsWith(' ')?1:0);
        const before=clause.text.slice(0,at);
        const after=clause.text.slice(at+term.length);
        const negated=/\b(no|not|without|haven t|hasn t|isn t|didn t|don t|can t|cannot|ruled out|no sign of)\b/.test(before)||/^\s+(?:(?:is|was|has been)\s+)?(?:not|no|missing|absent|isn t|wasn t|didn t|doesn t|hasn t|failed|unconfirmed)\b/.test(after);
        const hypothetical=clause.question||/\b(if|maybe|perhaps|could|might|check|checking|checked|test|testing|tested|try|trying|tried|using|used|looking for|waiting for)\b/.test(before);
        states.push(negated||hypothetical?'unknown':'found');break;
      }
    }
    if(states.length)output.push({id:e.id,label:e.name,type:'evidence',state:states.includes('unknown')?'unknown':'found'});
  }
  for(const o of OBSERVATIONS){
    const term=o.aliases.find(a=>normalized.includes(normalize(a)));if(!term)continue;
    const before=normalized.slice(Math.max(0,normalized.indexOf(normalize(term))-20),normalized.indexOf(normalize(term)));
    if(/\b(not|never|didn t|isn t)\s*$/.test(before)&&o.id!=='salt-unknown')continue;
    output.push({id:o.id,label:o.label,type:'observation'});
  }
  if(output.some(o=>o.id==='salt-unknown'))return output.filter(o=>o.id!=='salt-stepped');
  return output;
}
export function applySuggestions(session:Session,suggestions:ParsedObservation[]):Session {
  const next={...session,evidence:{...session.evidence},observations:[...session.observations]};
  for(const item of suggestions){
    if(item.type==='evidence')next.evidence[item.id as Evidence]=item.state??'unknown';
    else if(!next.observations.includes(item.id))next.observations.push(item.id);
  }
  return next;
}
