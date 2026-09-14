export function combinations<T>(items:T[],count:number):T[][];
export function possibleEvidenceSets<E extends string>(ghost:{id:string;evidence:E[];forcedEvidence?:E},count:number):E[][];
export function matchingEvidenceSets<E extends string>(ghost:{id:string;evidence:E[];forcedEvidence?:E},session:{evidenceCount:number;evidence:Partial<Record<E,'unknown'|'found'|'ruled-out'>>}):E[][];
export const DIAGNOSTIC_EXCLUSIONS:Record<string,string[]>;
export function diagnosticConflicts(ghostId:string,observationIds:string[]):string[];
