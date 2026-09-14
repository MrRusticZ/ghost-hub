export type Presentation = 'classic' | 'casebook';
export type NavigationTarget = {path:string; presentation:Presentation};
export function readTarget(hash:string):NavigationTarget {
  const path=hash.replace(/^#\/?/,'');
  return path==='casebook'||path.startsWith('casebook/') ? {path:path.slice(9),presentation:'casebook'} : {path,presentation:'classic'};
}
export function destination(path:string, presentation:Presentation):string {
  if(path==='casebook'||path.startsWith('casebook/'))return '#/'+path;
  return '#/'+(presentation==='casebook'?'casebook/':'')+(presentation==='casebook'&&!path?'overview':path);
}
export const chapters=[['evidence','Evidence'],['detective','Detective'],['journal','Notes'],['ghosts','Ghosts'],['maps','Maps'],['equipment','Equipment'],['guides','Guides'],['cursed','Cursed possessions'],['bugs','Known bugs'],['tools','Tools'],['voice','Voice'],['updates','News'],['community','Community'],['chat','Chat']] as const;
