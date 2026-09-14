import { z } from 'zod';

export const EvidenceId = z.enum(['emf', 'dots', 'uv', 'freezing', 'orbs', 'writing', 'box']);
export type Evidence = z.infer<typeof EvidenceId>;
export const EVIDENCE: { id: Evidence; name: string; short: string; hint: string }[] = [
  { id: 'emf', name: 'EMF Level 5', short: 'EMF 5', hint: 'Confirm a level-five reading at an interaction, outside equipment interference.' },
  { id: 'dots', name: 'D.O.T.S. Projector', short: 'D.O.T.S.', hint: 'Look for the ghost silhouette, not breath or another player.' },
  { id: 'uv', name: 'Ultraviolet', short: 'UV', hint: 'Inspect recently touched surfaces or footprints with a UV light.' },
  { id: 'freezing', name: 'Freezing Temperatures', short: 'Freezing', hint: 'Use the thermometer. Visible player breath alone is not freezing evidence.' },
  { id: 'orbs', name: 'Ghost Orbs', short: 'Orbs', hint: 'Check the room through a night-vision camera. The Mimic also produces orbs.' },
  { id: 'writing', name: 'Ghost Writing', short: 'Writing', hint: 'Place an open book in an active area. Silence or a long wait is not a negative test.' },
  { id: 'box', name: 'Spirit Box', short: 'Spirit Box', hint: 'Check room lighting, response conditions, range, and the device feedback.' }
];
export const GhostSchema = z.object({ id: z.string().regex(/^[a-z-]+$/), name: z.string().min(1).max(60), evidence: z.array(EvidenceId).length(3).refine(v => new Set(v).size === 3), forcedEvidence: EvidenceId.optional(), summary: z.string().max(800), test: z.string().max(1000), caution: z.string().max(1000), sources: z.array(z.string().url().startsWith('https://')).min(1) }).refine(g => !g.forcedEvidence || g.evidence.includes(g.forcedEvidence), 'Forced evidence must belong to the ghost');
export type Ghost = z.infer<typeof GhostSchema>;
export const CatalogSchema = z.object({ version: z.string().min(1), reviewedAt: z.string(), coverage: z.string(), ghosts: z.array(GhostSchema).min(1).max(100).refine(gs => new Set(gs.map(g => g.id)).size === gs.length, 'Duplicate ghost ID') });
export type Catalog = z.infer<typeof CatalogSchema>;
export const ReportSchema = z.object({ id: z.string().regex(/^[a-z0-9-]+$/), title: z.string().min(1).max(180), category: z.string(), date: z.string(), version: z.string(), summary: z.string().max(1000), body: z.array(z.string().max(2500)).min(1).max(12), sources: z.array(z.object({title:z.string(),url:z.string().url().startsWith('https://')})).min(1), status: z.string(), related: z.array(z.string()) });
export type Report = z.infer<typeof ReportSchema>;
export const NewsSchema = z.object({ lastCheckedAt: z.string().nullable(), reports: z.array(ReportSchema) });
export type News = z.infer<typeof NewsSchema>;
export type Observation = { id: string; label: string; category: string; kind: 'supporting' | 'diagnostic' | 'ambiguous'; supports: string[]; excludes?: string[]; detail: string; question?: string; aliases: string[] };
export const OBSERVATIONS: Observation[] = [
  { id:'electric', label:'Playing with electricity',category:'Electricity',kind:'ambiguous',supports:[],detail:'Many ghosts interact with electrical objects. This alone does not narrow the list.',question:'Was it a light switch, the fuse box, or a speed change near active equipment?',aliases:['electric','electricity','lights','light switches','power'] },
  { id:'salt-unknown',label:'Not stepping in salt',category:'Interactions',kind:'supporting',supports:['wraith','gallu','mimic'],detail:'An untouched pile is not proof of a crossing. Wraith, enraged Gallu and some Mimic behaviours warrant consideration.',question:'Did you confirm its path crossed the pile, and was this during a hunt?',aliases:['not stepping in salt','no salt','avoiding salt','untouched salt','wont step in salt','won t step in salt'] },
  { id:'salt-stepped',label:'Definitely disturbed salt',category:'Interactions',kind:'diagnostic',supports:[],excludes:['wraith'],detail:'A confirmed disturbed salt pile conflicts with Wraith. UV footprints are a separate observation.',aliases:['stepped in salt','disturbed salt','walked in salt'] },
  { id:'quiet',label:'Very little activity',category:'Interactions',kind:'supporting',supports:['shade'],detail:'Quiet behaviour is supporting context only. Room location, player presence and chance affect activity.',question:'Have you tried leaving the ghost room empty while watching equipment?',aliases:['quiet','shy','not giving clues','little activity','inactive','not much evidence'] },
  { id:'throws',label:'Several objects thrown together',category:'Interactions',kind:'supporting',supports:['poltergeist','mimic'],detail:'A simultaneous burst of throws is useful. A series of ordinary throws is less specific.',aliases:['throwing lots','multiple objects','multi throw','throws everything','throwing things'] },
  { id:'fast-electronics',label:'Faster near active electronics',category:'Hunts',kind:'supporting',supports:['raiju','mimic'],detail:'Compare pace near and away from powered equipment, accounting for line of sight and settings.',aliases:['fast near electronics','faster near electronics','gets faster near electronics','faster near equipment','speeds up near electronics'] },
  { id:'slow-near',label:'Very slow when close to a player',category:'Hunts',kind:'supporting',supports:['deogen','mimic'],detail:'A strong distance-related slowdown is worth investigating. Speed changes alone are not a confirmed identification.',aliases:['slow near me','slows down close','slow when close','slow near player'] },
  { id:'shape',label:'Changed model during the hunt',category:'Hunts',kind:'supporting',supports:['obake','mimic'],detail:'Look for a genuinely different ghost model, not the ordinary visibility flicker.',aliases:['shapeshift','changed model','shape shift','different model'] },
  { id:'six-fingers',label:'Six-fingered handprint',category:'Evidence behaviour',kind:'supporting',supports:['obake','mimic'],detail:'An unusual fingerprint pattern points towards Obake or a Mimic copying it. Confirm the print and UV evidence separately.',aliases:['six fingers','six fingered','6 fingers','six finger'] },
  { id:'camera-dots',label:'D.O.T.S. only visible on camera',category:'Evidence behaviour',kind:'supporting',supports:['goryo'],detail:'Confirm that the same silhouette cannot be seen directly and nobody is in the ghost room.',aliases:['dots only on camera','camera only dots','dots on camera'] },
  { id:'early-hunt',label:'Hunted at high sanity',category:'Hunts',kind:'supporting',supports:['demon','mimic','thaye','yokai','raiju','dayan','obambo','kormos','onryo'],detail:'Several ghosts have conditional early hunts. Cursed hunts bypass ordinary thresholds.',question:'What was team sanity, and was a cursed possession used?',aliases:['early hunt','high sanity','hunted straight away','hunting early'] },
  { id:'cold-breath',label:'I can see my breath',category:'Evidence behaviour',kind:'ambiguous',supports:[],detail:'Visible player breath is not enough to mark freezing. Confirm a sub-zero thermometer reading.',aliases:['see my breath','cold breath','visible breath'] },
  { id:'light-on',label:'Ghost turned a room light on',category:'Electricity',kind:'diagnostic',supports:[],excludes:['mare'],detail:'A confirmed ordinary light-switch activation conflicts with Mare. Exclude motion-triggered lights and player actions.',aliases:['turned light on','turned the light on','switched a light on'] }
];
export const SessionSchema = z.object({ evidence: z.record(EvidenceId,z.enum(['found','ruled-out','unknown'])).default({}), evidenceCount: z.union([z.literal(0),z.literal(1),z.literal(2),z.literal(3)]).default(3), observations:z.array(z.string()).max(60).default([]), map:z.string().max(80).default('tanglewood'), sanity:z.number().min(0).max(100).default(100), notes:z.string().max(12000).default(''), name:z.string().max(80).default('Untitled investigation') });
export type Session = z.infer<typeof SessionSchema>;
export const freshSession = (): Session => SessionSchema.parse({});
export type Candidate = { ghost:Ghost; eliminated:boolean; reasons:string[]; support:string[]; possibleSets:Evidence[][] };
export const SnapshotSchema = z.object({id:z.string(),date:z.string(),session:SessionSchema,result:z.string().max(60).default('Unresolved')});
export type Snapshot = z.infer<typeof SnapshotSchema>;
