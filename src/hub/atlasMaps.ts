import {z} from 'zod';
import {MAPS} from './content';

export type MapCrop = readonly [number, number, number, number];
export type AtlasReference = {
  image: string;
  source: string;
  date: string;
  version: string;
  width: number;
  height: number;
  floors: Record<string, MapCrop>;
  notice?: string;
};
const images = import.meta.glob('./assets/maps/*.png', {eager: true, query: '?url', import: 'default'}) as Record<string,string>;
function reference(id:string,hash:string,width:number,height:number,floors:Record<string,MapCrop>,date='11 Nov 2025',version='0.15.0.0'):AtlasReference {
  return {image:images[`./assets/maps/${id}.png`],source:`https://imgur.com/${hash}`,date,version,width,height,floors};
}
// Crops are viewport windows into the unmodified, attributed reference sheets.
// Coordinates are percentages of the source; map geometry is never generated.
export const ATLAS_REFERENCES:Record<string,AtlasReference> = {
  tanglewood:reference('tanglewood','3xkV8jL',1305,891,{'Ground floor':[3,31,54,54],Basement:[58,32,17,28]},'3 Mar 2026','0.16.0.0'),
  willow:reference('willow','q0MCYVg',1114,1201,{'Ground floor':[44,29,50,53],Basement:[10,37.5,34,30.5]},'21 Jul 2026','0.18.0.0'),
  edgefield:reference('edgefield','m3iSAAZ',1265,1372,{'Ground floor':[5,61,51,34],'First floor':[2,21.8,54.5,33],Basement:[63,75.5,20,18]}),
  ridgeview:reference('ridgeview','Vi1lABj',1203,1395,{'Ground floor':[1,58.5,55,36.5],'First floor':[4,20,50,31.2],Basement:[61,67,23,25]}),
  grafton:reference('grafton','m5l6oTC',1490,1298,{'Ground floor':[4,55,50,41],'First floor':[55.5,55.5,39,43.5],Attic:[71.5,21,23.5,26]}),
  bleasdale:reference('bleasdale','2KUtZho',1767,1608,{'Ground floor':[0,57,51,42],'First floor':[9,16,49,34],Attic:[60,15,37,34]}),
  woodwind:reference('woodwind','OPZ2dY6',932,1051,{Camp:[3,14,94,62]}),
  maple:reference('maple','akM5vKv',1732,1500,{Camp:[0,9.5,100,90],'Cabin ground floor':[64,35.4,20,20.5],'Cabin upper floor':[56,64,25,19]}),
  nells:reference('nells','wFTDWgA',925,1199,{'Ground floor':[2,25,96,54.5]}),
  prison:reference('prison','MRFb7d2',3829,2003,{'Ground floor':[1,12,51,85],'First floor':[52,12,47,85]}),
  brownstone:reference('brownstone','5PT0t5g',2656,3213,{'Ground floor':[1,54,98,44],'First floor':[1,9,98,42]}),
  sunny:reference('sunny','A7w3x5P',3720,2556,{'Ground floor':[1,11,98,64],Basement:[1,76,92,21]}),
  'point-hope':reference('point-hope','gUAT0b0',1805,1873,{'Ground floor':[34.5,15,28.5,22.5],'Floor 2':[15.5,25.5,16,15.5],'Floor 3':[8,45.8,16,14.2],'Floor 4':[10,66.5,20,14],'Floor 5':[25,80,22,19.5],'Floor 6':[47,82.5,27,16.5],'Floor 7':[72,74,27.5,19.5],'Floor 8':[69,57.5,24,11.5],'Floor 9':[67.5,43.5,19,10.3],'Floor 10':[38,49,32.5,15]}),
  'sunny-restricted':reference('sunny-courtyard','iJ3hkRq',2045,2082,{'Available wing':[10,16,83,78]}),
};
for(const [restricted,full] of [['prison-restricted','prison'],['brownstone-restricted','brownstone'],['point-hope-restricted','point-hope']] as const) {
  ATLAS_REFERENCES[restricted]={...ATLAS_REFERENCES[full],floors:{'Accessible area':[0,0,100,100]},notice:'Full-site reference. The August 2026 restricted layout is not included in this sheet; check the open areas in your contract.'};
}
export const SUNNY_VARIANTS:Record<string,AtlasReference> = {
  Courtyard:ATLAS_REFERENCES['sunny-restricted'],
  'Female wing':reference('sunny-female','1k07JDJ',2212,1520,{'Available wing':[1,13,98,86]}),
  'Hospital wing':reference('sunny-hospital','HnT8mA3',2470,1699,{'Available wing':[1,13,98,86]}),
  'Male wing':reference('sunny-male','JaQqTzQ',2470,1520,{'Available wing':[1,13,98,86]}),
  'Restricted wing':reference('sunny-restricted','06rPPv0',2349,1699,{'Available wing':[1,13,98,86]}),
};
export const atlasFloors=(id:string)=>Object.keys(ATLAS_REFERENCES[id].floors);
export const MarkerSchema=z.object({
  id:z.string().min(1).max(100),map:z.string().max(80),floor:z.string().max(100),
  label:z.string().min(1).max(60),x:z.number().min(0).max(100),y:z.number().min(0).max(100),
  kind:z.enum(['ghost','breaker','hiding','cursed','note']).optional(),
  surface:z.enum(['reference','personal']).optional(),variant:z.string().max(40).optional(),
});
export const MarkersSchema=z.array(MarkerSchema).max(300);
export type AtlasMarker=z.infer<typeof MarkerSchema>;
export function parseMarkerImport(input:unknown):AtlasMarker[] {
  const data=z.object({format:z.enum(['ghost-hub-map-markers-v1','ghost-hub-map-markers-v2']),markers:MarkersSchema}).parse(input);
  if(new Set(data.markers.map(m=>m.id)).size!==data.markers.length||data.markers.some(m=>
    !MAPS.some(map=>map.id===m.map&&(map.floors.includes(m.floor)||atlasFloors(map.id).includes(m.floor)))||
    (m.variant!==undefined&&(m.map!=='sunny-restricted'||!SUNNY_VARIANTS[m.variant]))
  ))throw new Error('The file has unknown locations, floors, variants or duplicate marker IDs.');
  return data.markers;
}
export function cropStyle(crop:MapCrop) {
  return {width:`${10000/crop[2]}%`,height:`${10000/crop[3]}%`,left:`${-crop[0]/crop[2]*100}%`,top:`${-crop[1]/crop[3]*100}%`};
}
