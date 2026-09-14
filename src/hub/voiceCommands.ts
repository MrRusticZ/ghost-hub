import { EVIDENCE, type Evidence } from './model';
import { MAPS } from './content';
import { normalize } from './engine';

export type VoiceCommand =
  | {kind:'evidence';id:Evidence;label:string;intentSource:'command'}
  | {kind:'sanity';value:number;label:string;intentSource:'command'}
  | {kind:'timer';seconds:number;label:string;intentSource:'command'}
  | {kind:'navigate';to:string;label:string;intentSource:'command'}
  | {kind:'map';id:string;label:string;intentSource:'command'}
  | {kind:'snapshot';label:string;intentSource:'command'};

export function parseVoiceCommand(input:string):VoiceCommand|null {
  if(/[-\u2212]\s*\d/.test(input))return null;
  const text=normalize(input).replace(/^(?:please|can you) /,'');
  const sanity=/^(?:set )?sanity(?: to)? (\d{1,3})(?: percent)?$/.exec(text);
  if(sanity){const value=Number(sanity[1]);return value<=100?{kind:'sanity',value,label:`Set team sanity to ${value}%`,intentSource:'command'}:null;}
  const timer=/^(?:start|set)(?: a)? timer(?: for)? (\d{1,4})(?: (seconds?|secs?|minutes?|mins?))?$/.exec(text);
  if(timer){const seconds=Number(timer[1])*(timer[2]?.startsWith('s')?1:60);return seconds>=1&&seconds<=3600?{kind:'timer',seconds,label:`Start a ${seconds}-second timer${!timer[2]?' (unspecified units mean minutes)':''}`,intentSource:'command'}:null;}
  if(/^(?:save )?(?:snapshot|case|investigation)$/.test(text))return {kind:'snapshot',label:'Save a new journal snapshot',intentSource:'command'};
  const destinations:Record<string,string>={maps:'maps',map:'maps',tools:'tools',journal:'journal',evidence:'evidence','evidence book':'evidence',detective:'detective',home:'',hub:'',news:'updates',chat:'chat',ghosts:'ghosts',equipment:'equipment'};
  const go=/^(?:switch to|go to|open|show) (.+)$/.exec(text);
  if(go&&Object.hasOwn(destinations,go[1]))return {kind:'navigate',to:destinations[go[1]],label:`Open ${go[1]}`,intentSource:'command'};
  const location=/^(?:set|change)(?: the)? (?:map|location)(?: to)? (.+)$/.exec(text);
  if(location){const short:Record<string,string>={tanglewood:'tanglewood',edgefield:'edgefield',ridgeview:'ridgeview',willow:'willow',bleasdale:'bleasdale',grafton:'grafton','high school':'brownstone','sunny meadows':'sunny','nells diner':'nells'};const map=MAPS.find(m=>normalize(m.name)===location[1]||normalize(m.id)===location[1]||m.id===short[location[1]]);if(map)return {kind:'map',id:map.id,label:`Set location to ${map.name}`,intentSource:'command'};}
  const add=/^(?:add|confirm|mark)(?: evidence)? (.+?)(?: as found)?$/.exec(text);
  const aliases:Record<string,Evidence>={emf:'emf','emf 5':'emf','emf level 5':'emf',dots:'dots','d o t s':'dots',uv:'uv',ultraviolet:'uv',fingerprints:'uv',freezing:'freezing','freezing temperatures':'freezing',orbs:'orbs','ghost orbs':'orbs',writing:'writing','ghost writing':'writing','spirit box':'box',spiritbox:'box'};
  if(add&&aliases[add[1]]){const id=aliases[add[1]];return {kind:'evidence',id,label:`Mark ${EVIDENCE.find(e=>e.id===id)!.name} as found`,intentSource:'command'};}
  return null;
}
