import {z} from 'zod';
import data from './ghostDossiers.json';

const secureUrl=z.string().url().refine(value=>new URL(value).protocol==='https:');
const wikiImage=secureUrl.refine(value=>new URL(value).hostname==='static.wikia.nocookie.net');
const base={title:z.string().min(1),author:z.string().min(1),date:z.string().min(4),source:secureUrl,context:z.string().min(1)};
const VideoSchema=z.object({...base,kind:z.literal('youtube'),videoId:z.string().regex(/^[\w-]{11}$/),start:z.number().int().nonnegative(),end:z.number().int().positive().optional()});
const ImageSchema=z.object({...base,kind:z.enum(['image','animation']),url:wikiImage,alt:z.string().min(10),width:z.number().positive(),height:z.number().positive()});
export const DossierSchema=z.object({
  id:z.string(),number:z.number().int().positive(),focus:z.string().min(1),facts:z.array(z.string()).length(3),steps:z.array(z.string()).length(3),related:z.array(z.string()).min(2),
  emblem:z.object({url:wikiImage,source:secureUrl,credit:z.string()}).nullable(),media:z.array(z.union([VideoSchema,ImageSchema])).min(1),source:secureUrl,revision:z.number().int().positive(),reviewedAt:z.string(),
});
export type Dossier=z.infer<typeof DossierSchema>;
export type DossierMedia=Dossier['media'][number];
export const GHOST_DOSSIERS=z.array(DossierSchema).parse(data);
const dossiers=new Map(GHOST_DOSSIERS.map(d=>[d.id,d]));
export const dossierFor=(id:string)=>dossiers.get(id);
export function videoUrl(media:Extract<DossierMedia,{kind:'youtube'}>){
  const url=new URL('https://www.youtube-nocookie.com/embed/'+media.videoId);
  url.searchParams.set('start',String(media.start));
  if(media.end)url.searchParams.set('end',String(media.end));
  url.searchParams.set('rel','0');url.searchParams.set('playsinline','1');
  return url.href;
}
