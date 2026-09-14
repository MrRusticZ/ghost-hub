export function combinations(items,count){if(count===0)return [[]];return items.flatMap((v,i)=>combinations(items.slice(i+1),count-1).map(rest=>[v,...rest]));}
export function possibleEvidenceSets(ghost,count){return combinations(ghost.evidence,count).filter(set=>count===0||!ghost.forcedEvidence||set.includes(ghost.forcedEvidence)).map(set=>ghost.id==='mimic'?[...set,'orbs']:set);}
export function matchingEvidenceSets(ghost,session){return possibleEvidenceSets(ghost,session.evidenceCount).filter(set=>Object.entries(session.evidence).every(([id,state])=>state==='unknown'||(state==='found'?set.includes(id):!set.includes(id))));}
export const DIAGNOSTIC_EXCLUSIONS={'salt-stepped':['wraith'],'light-on':['mare']};
export function diagnosticConflicts(ghostId,observationIds){return observationIds.filter(id=>DIAGNOSTIC_EXCLUSIONS[id]?.includes(ghostId));}
