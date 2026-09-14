import {z} from 'zod';

export type Pace = {id:string; label:string; speed:number; maxSpeed?:number};
export type GhostMechanics = {
  id:string; pace:Pace[]; movement:string; listening:string; incense:number;
  cooldown:number; blind:string; timing:string; source:string;
};
export const MECHANICS_REVIEWED = '2026-09-14';
export const HUNT_SOURCE = 'https://phasmophobia.fandom.com/wiki/Hunt';
export const INCENSE_SOURCE = 'https://phasmophobia.fandom.com/wiki/Incense';
export const RHYTHM_SOURCE = 'https://tybayn.github.io/phasmo-cheat-sheet/';
const wiki = (name:string) => 'https://phasmophobia.fandom.com/wiki/'+name;
const standardPace = ():Pace[] => [{id:'base',label:'Base pace',speed:1.7,maxSpeed:2.805}];
function standard(id:string,listening:string,extra:Partial<GhostMechanics>={}):GhostMechanics {
  return {id,pace:standardPace(),movement:'Accelerates while chasing a visible player.',listening,
    incense:90,cooldown:25,blind:'5 s',timing:'Use the match settings for hunt length. The cooldown is a minimum wait, not a promise of another hunt.',
    source:wiki(id.charAt(0).toUpperCase()+id.slice(1)),...extra};
}
const fixed = (id:string,label:string,speed:number):Pace => ({id,label,speed});
const los = (id:string,label:string,speed:number,maxSpeed=speed*1.65):Pace => ({id,label,speed,maxSpeed});

/** Reviewed reference facts, separate from the evidence/candidate engine. Values assume 100% speed and ordinary weather. */
export const GHOST_MECHANICS:GhostMechanics[] = [
  standard('spirit','Ordinary footstep pace. Its longer incense window is the useful comparison.',{incense:180,timing:'A confirmed cleanse blocks normal hunts for 180 seconds. A long wait alone does not identify Spirit.'}),
  standard('wraith','Wraith has audible hunt footsteps. Undisturbed salt and UV footprints are separate observations.'),
  standard('phantom','Listen for normal pace; its longer invisible intervals are a visual hunt clue.'),
  standard('poltergeist','Ordinary pace. Simultaneous object throws are more informative than rhythm.'),
  standard('banshee','Ordinary pace. The special parabolic scream is a separate sound; this player simulates footsteps only.'),
  standard('jinn','Compare the special chase pace with its normal movement.',{
    pace:[...standardPace(),fixed('powered','Powered breaker, visible target >3 m',2.5)],
    movement:'The 2.5 m/s override needs a powered breaker, line of sight and a target more than 3 m away. Otherwise normal acceleration applies.'}),
  standard('mare','Normal footstep pace. Track room lights separately when assessing hunt behaviour.'),
  standard('revenant','Listen for the sharp change after player detection.',{
    pace:[fixed('hidden','No player detected',1),fixed('detected','Player detected',3)],
    movement:'No gradual line-of-sight acceleration. Detection changes its speed; it slows after reaching the last known position.'}),
  standard('shade','Normal pace. Low activity or slow evidence collection does not make its footsteps slower.'),
  standard('demon','Normal pace; compare incense and the interval between hunts.',{incense:60,cooldown:20,timing:'A confirmed cleanse blocks normal hunts for 60 seconds. Its minimum post-hunt cooldown is 20 seconds.'}),
  standard('yurei','Ordinary pace. Listen for door behaviour separately.',{timing:'Incense also restricts roaming for 90 seconds; ghost events can still move it outside the room.'}),
  standard('oni','Normal pace. Longer visible periods during hunts are a visual clue, not a unique footstep sound.'),
  standard('yokai','Normal pace. Its restricted hearing during hunts changes detection, not its basic rhythm.'),
  standard('hantu','Listen for pace changes as it crosses rooms with different temperatures.',{
    pace:[fixed('warm','Above 15°C',1.4),fixed('12','12–15°C',1.75),fixed('9','9–12°C',2.1),fixed('6','6–9°C',2.3),fixed('3','3–6°C',2.4),fixed('0','0–3°C',2.5),fixed('freezing','Below 0°C',2.7)],
    movement:'Temperature controls speed. No line-of-sight acceleration.'}),
  standard('goryo','Normal pace. Camera-only D.O.T.S. under the correct conditions is more useful than footsteps.'),
  standard('myling','Hunt footsteps and voices have a shorter audible range: 12 m instead of 20 m. This rhythm demo does not simulate distance or loudness.'),
  standard('onryo','Normal pace. Track flame extinguishes separately from footsteps.'),
  standard('twins','Compare multiple hunts. The selected twin does not switch halfway through a hunt.',{
    source:wiki('The_Twins'),pace:[los('slow','Slow twin',1.5,2.605),los('fast','Fast twin',1.9,3.005)],
    movement:'Uses a fixed −0.2 or +0.2 m/s offset to standard movement, including its chase acceleration.'}),
  standard('raiju','Compare pace near active equipment and away from it.',{
    pace:[...standardPace(),fixed('electronics','Near active electronics',2.5)],
    movement:'Nearby active equipment overrides speed to 2.5 m/s. Normal chase acceleration applies outside that range.'}),
  standard('obake','Ordinary pace. A change of ghost model during a hunt is a visual clue.'),
  standard('mimic','Choose the ghost being imitated to hear its possible pace. No single rhythm identifies The Mimic.',{
    source:wiki('The_Mimic'),movement:'Inherits the movement rules of the ghost it currently imitates.',
    blind:'Depends on imitation',timing:'First imitation change is attempted after 60 seconds; later attempts occur every 30–120 seconds, outside hunts and events. Incense and cooldown can follow the imitated ghost.'}),
  standard('moroi','Compare known team sanity levels; chase acceleration can make it faster still.',{
    pace:[los('45','Team sanity ≥45%',1.5),los('40','40–45%',1.583),los('35','35–40%',1.66),los('30','30–35%',1.749),los('25','25–30%',1.832),los('20','20–25%',1.915),los('15','15–20%',1.998),los('10','10–15%',2.081),los('5','5–10%',2.164),los('0','0–5%',2.25)],
    movement:'Base speed follows average team sanity; it can also accelerate in a chase.',blind:'7 s',timing:'Hunt prevention lasts 90 seconds. The community reference reports a 7-second blinding effect during hunts.'}),
  standard('deogen','Fast at a distance and very slow close to its target. Hiding does not conceal players from Deogen.',{
    pace:[fixed('far','Path distance above 5.32 m',3),fixed('near','Path distance below 2.42 m',.4)],
    movement:'Speed follows 0.15 × 2^(path distance − 1), capped at 0.4–3 m/s. No line-of-sight acceleration. During incense blindness its base pace is 0.4 m/s at 50–100% settings, or 1.6 m/s at 125–150% settings.'}),
  standard('thaye','Compare hunts as it ages near players. Elapsed time alone does not establish age.',{
    pace:Array.from({length:11},(_,age)=>fixed('age-'+age,age===0?'Age 0 · youngest':age===10?'Age 10 · oldest':'Age '+age,2.75-age*.175)),
    movement:'Speed is fixed for its age; no line-of-sight acceleration.',
    timing:'First ageing check: 60 seconds after opening an exit. Later checks: 60–120 seconds after success, or a 30-second retry without a nearby player. Age changes during a hunt take effect afterwards.'}),
  standard('dayan','A nearby player moving or standing still changes the rhythm, even without a direct view.',{
    pace:[...standardPace(),fixed('moving','Nearby player moving (within 10 m)',2.25),fixed('still','Nearby player still (within 10 m)',1.2)],
    movement:'The closest player within 10 m determines its movement override, including across floors. With no player within 10 m, normal chase acceleration applies.'}),
  standard('gallu','Protective equipment can change its state. Listen again after the protection effect ends.',{
    pace:[los('normal','Normal',1.7),los('enraged','Enraged',1.955),los('weakened','Weakened',1.36)],
    movement:'State controls its base pace; chase acceleration also applies.',blind:'5 / 4 / 6 s',
    timing:'Incense blinds for 5 seconds in normal state, 4 when enraged, or 6 when weakened. These are separate from its 90-second hunt-prevention window.'}),
  standard('obambo','It can switch pace during a hunt. Compare this with The Twins, which keep their selected pace.',{
    pace:[los('calm','Calm',1.445),los('aggressive','Aggressive',1.955)],
    movement:'State sets base pace, with chase acceleration on top.',
    timing:'Starts calm, switches after 60 seconds from opening an exit, then every 120 seconds. A hunt starting aggressive is 20% shorter, even if it changes state later.'}),
  standard('aswang','Its base pace is slower than normal, but it accelerates more quickly in a chase.',{
    pace:[los('base','Base pace',1.53,2.5245)],movement:'Reaches its chase cap in about 8.67 seconds of line of sight, compared with about 13 seconds for a normal ghost.',
    timing:'A hunt can end early when it reaches a player correctly using an available official hiding spot; the normal duration is an upper reference.'}),
  standard('kormos','Its hearing of player footsteps is separate from the ghost footsteps played here.',{
    pace:[...standardPace(),los('sound','Following sound, without line of sight',2.21,3.6465)],
    movement:'Sound pursuit without line of sight multiplies current speed by 1.3. Limited visual detection can first build chase acceleration.',
    timing:'Hearing checks occur every second. A detected-sound waypoint can refresh after 5–10 seconds.'}),
  standard('deildegast','Compare hunts after interacting with different house objects. Reusing the same object does not add another reduction.',{
    pace:[fixed('0','0 unique objects',3),fixed('13','13 unique objects',1.7),fixed('26','26+ unique objects',.4)],
    movement:'Each distinct qualifying object reduces the next hunt speed by 0.1 m/s, down to 0.4 m/s. No chase acceleration.',
    timing:'Its object counter resets after a hunt or blocked hunt attempt. Speed is locked for the next hunt; player equipment does not count.',
    source:wiki('Deildegast')})
];
const byId = new Map(GHOST_MECHANICS.map(g=>[g.id,g]));
export function mechanicsFor(id:string){return byId.get(id);}
export function speedLabel(value:number){return Number(value.toFixed(3)).toString();}
export function paceRange(profile:GhostMechanics){
  const values=profile.pace.map(p=>p.speed),low=Math.min(...values),high=Math.max(...values);
  return low===high?speedLabel(low):speedLabel(low)+'–'+speedLabel(high);
}
export const MatchSettingsSchema=z.object({speed:z.union([z.literal(50),z.literal(75),z.literal(100),z.literal(125),z.literal(150)]),size:z.enum(['small','medium','large']),duration:z.enum(['low','medium','high']),cursed:z.boolean(),bloodMoon:z.boolean()});
export type MatchSettings=z.infer<typeof MatchSettingsSchema>;
export const DEFAULT_MATCH:MatchSettings={speed:100,size:'small',duration:'high',cursed:false,bloodMoon:false};
const huntSeconds={low:{small:15,medium:30,large:40},medium:{small:20,medium:40,large:50},high:{small:30,medium:50,large:60}};
export function huntDuration(settings:MatchSettings,aggressiveObambo=false){
  return (huntSeconds[settings.duration][settings.size]+(settings.cursed?20:0))*(aggressiveObambo?.8:1);
}
export function effectiveSpeed(speed:number,settings:MatchSettings){return speed*settings.speed/100*(settings.bloodMoon?1.15:1);}
/** Empirical cadence model used by the community cheat sheet, not an exact game measurement. No third-party audio or player code is bundled. */
export function stepInterval(speed:number){
  if(!Number.isFinite(speed)||speed<=0||speed>10)throw new RangeError('Unsupported footstep speed');
  return 1/speed-.075;
}
export function rhythmBpm(speed:number){return 60/stepInterval(speed);}
