import { z } from 'zod';
import { SessionSchema, SnapshotSchema, freshSession, type Session } from './model';
const prefix='ghost-hub:';
export function readValue<S extends z.ZodTypeAny>(key:string,schema:S,fallback:z.output<S>):z.output<S> {try {const raw=localStorage.getItem(prefix+key);return raw?schema.parse(JSON.parse(raw)):fallback;}catch{return fallback;}}
export function writeValue(key:string,value:unknown):boolean {try{localStorage.setItem(prefix+key,JSON.stringify(value));return true;}catch{return false;}}
const evidenceAlias:Record<string,string>={'EMF 5':'emf','EMF Level 5':'emf','Spirit Box':'box','Ghost Writing':'writing','UV':'uv','Fingerprints':'uv','Ghost Orb':'orbs','Ghost Orbs':'orbs','D.O.T.S.':'dots','D.O.T.S. Projector':'dots','Freezing Temperatures':'freezing'};
function migrateLegacyFilters(old:Record<string,unknown>):Session {
  const s=freshSession();
  for(const [key,state] of [['includeEvidence','found'],['excludeEvidence','ruled-out']] as const){
    if(Array.isArray(old[key]))for(const v of old[key] as unknown[])if(typeof v==='string'&&evidenceAlias[v])s.evidence[evidenceAlias[v] as keyof typeof s.evidence]=state;
  }
  return s;
}
export function readSession():Session {
  try{if(localStorage.getItem(prefix+'session'))return readValue('session',SessionSchema,freshSession());
    const old=JSON.parse(localStorage.getItem('phasmophobia-finder-filters-v1')??'null');if(old&&typeof old==='object')return migrateLegacyFilters(old);
  }catch{}return freshSession();
}
export function readSnapshots(){
  const schema=z.array(SnapshotSchema).max(100);
  try{
    if(localStorage.getItem(prefix+'journal'))return readValue('journal',schema,[]);
    for(const key of ['phasmophobia-journal-snapshots-v1','phasmophia-journal-snapshots-v1']){
      const old=JSON.parse(localStorage.getItem(key)??'null');if(Array.isArray(old))return old.slice(0,100).flatMap((item,i)=>{
        if(!item||typeof item!=='object')return [];
        const session=migrateLegacyFilters(item.filters??{});session.notes=typeof item.note==='string'?item.note.slice(0,12000):'';
        return [{id:String(item.id??i),date:typeof item.createdAt==='string'?item.createdAt:new Date().toISOString(),session,result:'Unresolved'}];
      });
    }
  }catch{}return [];
}
export function downloadJson(name:string,value:unknown){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
