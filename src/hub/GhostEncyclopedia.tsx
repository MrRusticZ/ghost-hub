import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowUpRight,BookOpen,Footprints,LayoutGrid,List,Search,Table2,Timer,X} from 'lucide-react';
import {z} from 'zod';
import {useChapterState} from './chapterState';
import {Link,useHub} from './context';
import {EVIDENCE,type Ghost} from './model';
import {Empty,EvidenceTags,Notice,PageHeading,SourceLink} from './ui';
import {readValue,writeValue} from './storage';
import {DEFAULT_MATCH,HUNT_SOURCE,INCENSE_SOURCE,MECHANICS_REVIEWED,MatchSettingsSchema,RHYTHM_SOURCE,mechanicsFor,paceRange,type GhostMechanics} from './ghostMechanics';
import {ActiveFieldTimer,FootstepPlayer,GhostTiming,MatchControls,SoundControls,useFootsteps} from './GhostFieldTools';
import './encyclopedia.css';

const ViewSchema=z.enum(['cards','list','comparison']);
type View=z.infer<typeof ViewSchema>;
const views=[{id:'cards',label:'Cards',icon:LayoutGrid},{id:'list',label:'Compact list',icon:List},{id:'comparison',label:'Detailed comparison',icon:Table2}] as const;
function MechanicsSummary({profile}:{profile:GhostMechanics}){
  return <dl className="ency-summary"><div><dt><Footprints size={14}/>Base speed · 100%</dt><dd>{profile.id==='mimic'?'Imitated ghost':paceRange(profile)+' m/s'}</dd></div><div><dt><Timer size={14}/>Incense prevention</dt><dd>{profile.id==='mimic'?'60–180 s':profile.incense+' s'}</dd></div></dl>;
}
function References({profile}:{profile:GhostMechanics}){
  return <div className="ency-references"><SourceLink url={profile.source}>Ghost mechanics</SourceLink><SourceLink url={HUNT_SOURCE}>Hunt rules</SourceLink><SourceLink url={INCENSE_SOURCE}>Incense rules</SourceLink><span>Reviewed {MECHANICS_REVIEWED} · community references</span></div>;
}

export function GhostLibrary({id}:{id?:string}){
  const {catalog,notice}=useHub();
  const [query,setQuery]=useChapterState('GhostLibrary-query','');
  const [selected,setSelected]=useChapterState<string[]>('GhostLibrary-compare',[]);
  const [view,setView]=useState<View>(()=>readValue('ghost-library-view',ViewSchema,'cards'));
  const [settings,setSettings]=useState(()=>readValue('ghost-library-match',MatchSettingsSchema,DEFAULT_MATCH));
  const audio=useFootsteps();
  const ghost=catalog.ghosts.find(g=>g.id===id);
  const selectedIds=Array.isArray(selected)?selected.filter((value,index)=>typeof value==='string'&&catalog.ghosts.some(g=>g.id===value)&&selected.indexOf(value)===index).slice(0,3):[];
  useEffect(()=>{writeValue('ghost-library-view',view);},[view]);
  useEffect(()=>{writeValue('ghost-library-match',settings);},[settings]);
  const all=[...catalog.ghosts].sort((a,b)=>a.name.localeCompare(b.name));
  const words=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matching=all.filter(g=>{
    const profile=mechanicsFor(g.id);
    const text=[g.name,g.summary,g.test,g.caution,...g.evidence.flatMap(e=>{const item=EVIDENCE.find(x=>x.id===e);return [e,item?.name,item?.short];}),profile?.movement,profile?.listening,profile?.timing].join(' ').toLowerCase();
    return words.every(word=>text.includes(word));
  });
  function toggleCompare(value:string){
    audio.stop();
    if(selectedIds.includes(value))setSelected(selectedIds.filter(x=>x!==value));
    else if(selectedIds.length<3)setSelected([...selectedIds,value]);
  }
  function compareCheck(g:Ghost){return <label className="ency-checkbox ency-compare"><input type="checkbox" aria-label={'Compare '+g.name} checked={selectedIds.includes(g.id)} disabled={selectedIds.length>=3&&!selectedIds.includes(g.id)} onChange={()=>toggleCompare(g.id)}/>Compare{view==='list'?' '+g.name:''}</label>;}
  const matchControls=<MatchControls settings={settings} onChange={value=>{audio.stop();setSettings(value);}}/>;
  const soundNote=<details className="ency-sound-note"><summary><Footprints size={16}/>Footstep audio <span>{audio.recorded?'Recorded game footsteps':'Synthetic footsteps'} · 12-second previews</span></summary><SoundControls audio={audio}/><p>{audio.recorded?'The original Phasmophobia footstep sample is repeated at the selected approximate rhythm, preserving its pitch. The sound is shared across ghost types; their speed and conditions change the cadence.':'These examples use an approximate community cadence model and an original synthesized impact sound.'} Surface sounds, turning, frame rate and chase acceleration affect what you hear in game. <SourceLink url={RHYTHM_SOURCE}>Rhythm reference</SourceLink></p>{audio.recorded&&<p className="small muted">Game audio: Kinetic Games. Sample reference: <SourceLink url="https://github.com/tybayn/phasmo-cheat-sheet">Ty Bayn / Zero-Network</SourceLink></p>}</details>;
  if(id&&!ghost)return <><Link className="back-link" to="ghosts"><ArrowLeft size={15}/>Ghost encyclopaedia</Link><Empty title="Ghost not found">Choose a ghost from the encyclopedia.</Empty></>;
  if(ghost){
    const profile=mechanicsFor(ghost.id);
    return <div className="ency-page"><Link className="back-link" to="ghosts"><ArrowLeft size={15}/>Ghost encyclopaedia</Link><PageHeading eyebrow="ENTITY DOSSIER" title={ghost.name} description={ghost.summary}/><EvidenceTags evidence={ghost.evidence}/><ActiveFieldTimer/>{matchControls}{soundNote}
      {profile?<div className="ency-dossier-tools"><section className="panel"><h2><Footprints size={21}/>Footsteps & movement</h2><FootstepPlayer name={ghost.name} profile={profile} audio={audio} settings={settings} instance="dossier"/><p>{profile.movement}</p></section><section className="panel"><GhostTiming profile={profile} name={ghost.name} settings={settings}/></section></div>:<Notice>Movement and timing details for this reference have not been reviewed yet.</Notice>}
      <div className="two-columns"><section className="panel prose"><h2>What to investigate</h2><p>{ghost.test}</p><h3>What can mislead you</h3><p>{ghost.caution}</p>{ghost.forcedEvidence&&<Notice>{EVIDENCE.find(e=>e.id===ghost.forcedEvidence)?.name} is forced when at least one evidence is available. Zero evidence is a separate mode.</Notice>}<Link to="evidence" className="button primary">Compare with your case<ArrowUpRight size={16}/></Link></section><section className="panel prose"><h2>Evidence checklist</h2>{ghost.evidence.map(e=><div className="reference-row" key={e}><strong>{EVIDENCE.find(x=>x.id===e)?.name}</strong><p>{EVIDENCE.find(x=>x.id===e)?.hint}</p></div>)}<h3>Reference & revision</h3><p className="small muted">Catalog {catalog.version}. {catalog.coverage}</p>{profile&&<References profile={profile}/>}<div className="ency-references">{ghost.sources.map(s=><SourceLink key={s} url={s}>Catalog source</SourceLink>)}</div></section></div></div>;
  }
  const comparing=view==='comparison'&&selectedIds.length>0;
  const displayed=comparing?all.filter(g=>selectedIds.includes(g.id)):matching;
  return <div className="ency-page"><PageHeading eyebrow="EXPLORE / THE ENTITIES" title="Ghost encyclopaedia" description={`${catalog.ghosts.length} ghosts. Find a clue, listen to a pace, compare the timing.`}/>
    <div className="ency-toolbar"><div className="input-icon"><Search size={18}/><input aria-label="Search ghosts" placeholder="Ghost, evidence or behaviour…" value={query} onChange={e=>{audio.stop();setQuery(e.target.value);}}/>{query&&<button className="icon-button" aria-label="Clear ghost search" onClick={()=>{audio.stop();setQuery('');}}><X size={16}/></button>}</div><div className="ency-view-switch" role="group" aria-label="Ghost listing view">{views.map(v=><button key={v.id} aria-pressed={view===v.id} onClick={()=>{audio.stop();setView(v.id);}}><v.icon size={17}/><span>{v.label}</span></button>)}</div></div>
    <div className="ency-results-meta"><span role="status">{comparing?`${displayed.length} selected for comparison`:`${matching.length} of ${catalog.ghosts.length} ghosts`}</span><span>Select up to 3 ghosts for a focused comparison</span></div>
    {selectedIds.length>0&&<div className="ency-selection"><strong>{selectedIds.length}/3 selected</strong>{selectedIds.map(value=><button className="chip" key={value} onClick={()=>toggleCompare(value)} aria-label={'Remove '+catalog.ghosts.find(g=>g.id===value)?.name+' from comparison'}>{catalog.ghosts.find(g=>g.id===value)?.name}<X size={13}/></button>)}<button className="button" onClick={()=>{audio.stop();setView('comparison');}}>Compare selected</button><button className="text-button" onClick={()=>{audio.stop();setSelected([]);}}>Clear selection</button></div>}
    <ActiveFieldTimer/>{matchControls}{soundNote}
    {comparing&&query&&<p className="ency-scope-note">Showing your selected ghosts. Clear selection to compare the search results.</p>}
    {view==='comparison'?<div className="ency-table-scroll" role="region" aria-label="Ghost details comparison" tabIndex={0}><table className="ency-table"><caption>{comparing?'Selected ghosts':'Ghost comparison'} · base speeds at 100%; player uses your match settings</caption><thead><tr><th scope="col">Ghost / evidence</th><th scope="col">Footsteps</th><th scope="col">Timing</th><th scope="col">Distinguishing test</th></tr></thead><tbody>{displayed.map(g=>{const profile=mechanicsFor(g.id);return <tr key={g.id} data-ghost-entry={g.id}><th scope="row"><Link to={'ghosts/'+g.id} className="ency-name">{g.name}<ArrowUpRight size={16}/></Link><EvidenceTags evidence={g.evidence}/>{compareCheck(g)}<Link to={'ghosts/'+g.id} className="ency-dossier-link">Open dossier</Link></th><td>{profile?<><FootstepPlayer profile={profile} name={g.name} audio={audio} settings={settings}/><p>{profile.movement}</p></>:<p>Not yet reviewed</p>}</td><td>{profile?<GhostTiming profile={profile} name={g.name} settings={settings}/>:<p>Not yet reviewed</p>}</td><td><p>{g.test}</p><details><summary>What can mislead you</summary><p>{g.caution}</p></details>{profile&&<References profile={profile}/>}</td></tr>;})}</tbody></table></div>:<div className={view==='cards'?'ency-cards':'ency-list'}>{matching.map((g,index)=>{const profile=mechanicsFor(g.id);return <article className="ency-entry" key={g.id} data-ghost-entry={g.id}><div className="ency-entry-heading"><span className="ency-entry-number">{String(index+1).padStart(2,'0')}</span><Link to={'ghosts/'+g.id} className="ency-name">{g.name}<ArrowUpRight size={17}/></Link>{compareCheck(g)}</div><EvidenceTags evidence={g.evidence}/>{view==='cards'&&<p className="ency-description">{g.summary}</p>}{profile&&<MechanicsSummary profile={profile}/>}
      {profile&&<div className="ency-entry-player"><FootstepPlayer profile={profile} name={g.name} audio={audio} settings={settings}/></div>}
      <details className="ency-entry-details"><summary><BookOpen size={15}/>Tests & timing</summary><div>{profile&&<GhostTiming profile={profile} name={g.name} settings={settings}/>}<h3>Distinguishing test</h3><p>{g.test}</p><h3>What can mislead you</h3><p>{g.caution}</p>{profile&&<References profile={profile}/>}</div></details><Link to={'ghosts/'+g.id} className="ency-dossier-link">Open dossier<ArrowUpRight size={14}/></Link></article>;})}</div>}
    {!displayed.length&&<Empty title="No matching dossier">Try another name, evidence type or behaviour. <button className="text-button" onClick={()=>{setQuery('');notice('Showing all ghost dossiers.');}}>Clear search</button></Empty>}
  </div>;
}
