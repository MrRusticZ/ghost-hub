import {useEffect,useRef,useState} from 'react';
import {Flame,Pause,Play,RotateCcw,Square,Timer,Volume2} from 'lucide-react';
import {Link,useHub} from './context';
import {useTimer} from './TimerState';
import {FootstepAudio,LOCAL_FOOTSTEP_SAMPLE_URL} from './footstepAudio';
import {effectiveSpeed,GHOST_MECHANICS,huntDuration,mechanicsFor,rhythmBpm,speedLabel,type GhostMechanics,type MatchSettings} from './ghostMechanics';

export function useFootsteps(){
  const {notice}=useHub();
  const engine=useRef<FootstepAudio|null>(null),request=useRef(0);
  const [active,setActive]=useState<string|null>(null),[volume,setVolume]=useState(35);
  function stop(){request.current++;engine.current?.stop();setActive(null);}
  async function play(key:string,speed:number){
    if(active===key){stop();return;}
    const current=++request.current;
    try{
      engine.current??=new FootstepAudio();engine.current.setVolume(volume/100);setActive(key);
      const started=await engine.current.play(speed,()=>{if(current===request.current)setActive(null);});
      if(!started&&current===request.current)setActive(null);
    }catch(error){if(current===request.current){engine.current?.stop();setActive(null);notice(error instanceof Error?error.message:'Footstep audio is unavailable. Speed and timing references remain available.');}}
  }
  useEffect(()=>{
    const hide=()=>{if(document.hidden){request.current++;engine.current?.stop();setActive(null);}};
    document.addEventListener('visibilitychange',hide);
    return()=>{document.removeEventListener('visibilitychange',hide);request.current++;engine.current?.dispose();engine.current=null;};
  },[]);
  function changeVolume(value:number){setVolume(value);engine.current?.setVolume(value/100);}
  return {active,play,stop,volume,changeVolume,recorded:Boolean(LOCAL_FOOTSTEP_SAMPLE_URL)};
}
export type Footsteps=ReturnType<typeof useFootsteps>;

export function SoundControls({audio}:{audio:Footsteps}){
  return <div className="ency-audio-settings"><Volume2 size={16} aria-hidden="true"/><label>Volume<input type="range" min="0" max="100" step="5" value={audio.volume} onChange={e=>audio.changeVolume(Number(e.target.value))}/></label><span>{audio.volume}%</span><button className="button" disabled={!audio.active} onClick={audio.stop}><Square size={14}/>Stop audio</button></div>;
}
export function MatchControls({settings,onChange}:{settings:MatchSettings;onChange:(s:MatchSettings)=>void}){
  return <details className="ency-settings"><summary>Match settings <span>{settings.speed}% speed · {settings.size} map · {settings.duration} hunts{settings.cursed?' · cursed extension':''}{settings.bloodMoon?' · Blood Moon':''}</span></summary><div className="ency-settings-grid">
    <label>Ghost speed<select aria-label="Ghost speed" value={settings.speed} onChange={e=>onChange({...settings,speed:Number(e.target.value) as MatchSettings['speed']})}>{[50,75,100,125,150].map(n=><option key={n} value={n}>{n}%</option>)}</select></label>
    <label>Map size<select aria-label="Map size" value={settings.size} onChange={e=>onChange({...settings,size:e.target.value as MatchSettings['size']})}><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></label>
    <label>Hunt duration setting<select aria-label="Hunt duration setting" value={settings.duration} onChange={e=>onChange({...settings,duration:e.target.value as MatchSettings['duration']})}><option value="low">Low · Amateur</option><option value="medium">Medium · Intermediate</option><option value="high">High · Professional+</option></select></label>
    <label className="ency-checkbox"><input type="checkbox" checked={settings.cursed} onChange={e=>onChange({...settings,cursed:e.target.checked})}/>Cursed hunt has occurred (+20 s)</label>
    <label className="ency-checkbox"><input type="checkbox" checked={settings.bloodMoon} onChange={e=>onChange({...settings,bloodMoon:e.target.checked})}/>Blood Moon (+15% speed)</label>
  </div><p>Hunt length excludes the grace period and any extension from kills. Special event modifiers other than Blood Moon are not included.</p></details>;
}

export function FootstepPlayer({profile,name,audio,settings,instance='entry'}:{profile:GhostMechanics;name:string;audio:Footsteps;settings:MatchSettings;instance?:string}){
  const [paceId,setPace]=useState(profile.pace[0].id),[chase,setChase]=useState(false),[imitation,setImitation]=useState('spirit');
  const target=profile.id==='mimic'?mechanicsFor(imitation)??profile:profile;
  const pace=target.pace.find(p=>p.id===paceId)??target.pace[0];
  const speed=effectiveSpeed(chase&&pace.maxSpeed?pace.maxSpeed:pace.speed,settings);
  const key=instance+':'+profile.id;
  function changePace(value:string){audio.stop();setPace(value);setChase(false);}
  return <div className="ency-player" data-ghost-player={profile.id}>
    {profile.id==='mimic'&&<label className="ency-imitation">Imitated ghost<select aria-label={name+' imitated ghost'} value={imitation} onChange={e=>{audio.stop();setImitation(e.target.value);setPace('');setChase(false);}}>{GHOST_MECHANICS.filter(p=>p.id!=='mimic').map(p=><option key={p.id} value={p.id}>{p.id==='twins'?'The Twins':p.id.charAt(0).toUpperCase()+p.id.slice(1)}</option>)}</select></label>}
    <label className="ency-condition">Footstep condition<select aria-label={name+' footstep condition'} value={pace.id} onChange={e=>changePace(e.target.value)}>{target.pace.map(p=><option value={p.id} key={p.id}>{p.label}</option>)}</select></label>
    <div className="ency-player-line"><button className={'button ency-play '+(audio.active===key?'playing':'')} aria-label={(audio.active===key?'Stop footsteps for ':'Play footsteps for ')+name} aria-pressed={audio.active===key} onClick={()=>void audio.play(key,speed)}>{audio.active===key?<Square size={16}/>:<Play size={16}/>}<span>{audio.active===key?'Stop':'Listen'}</span></button><div className="ency-pace-value"><strong>{speedLabel(speed)} <span>m/s</span></strong><small>≈{Math.round(rhythmBpm(speed))} BPM · {audio.recorded?'game sample':'simulation'}</small></div></div>
    {pace.maxSpeed&&<label className="ency-checkbox ency-chase"><input type="checkbox" checked={chase} onChange={e=>{audio.stop();setChase(e.target.checked);}}/>At full chase acceleration</label>}
    <p className="ency-listening-note">{profile.listening}</p>
  </div>;
}

export function GhostTiming({profile,name,settings}:{profile:GhostMechanics;name:string;settings:MatchSettings}){
  const {start}=useTimer(),{notice}=useHub();
  const [imitation,setImitation]=useState('spirit');
  const target=profile.id==='mimic'?mechanicsFor(imitation)??profile:profile;
  const length=huntDuration(settings);
  function begin(seconds:number,label:string){start(seconds,name+' · '+label);notice(name+' · '+label+' timer started ('+seconds+' s).');}
  return <div className="ency-timing">
    <h3><Timer size={17}/>Timing reference</h3>
    {profile.id==='mimic'&&<label>Timing imitation<select aria-label="The Mimic timing imitation" value={imitation} onChange={e=>setImitation(e.target.value)}>{GHOST_MECHANICS.filter(p=>p.id!=='mimic').map(p=><option key={p.id} value={p.id}>{p.id.charAt(0).toUpperCase()+p.id.slice(1)}</option>)}</select></label>}
    <div className="ency-timing-grid"><button className="ency-timer-button" onClick={()=>begin(target.incense,'incense')} aria-label={'Start '+target.incense+' second incense timer for '+name}><Flame size={17}/><span><strong>{target.incense} s</strong>Incense prevention</span><Play size={14}/></button><button className="ency-timer-button" onClick={()=>begin(target.cooldown,'hunt cooldown')} aria-label={'Start '+target.cooldown+' second cooldown timer for '+name}><RotateCcw size={17}/><span><strong>{target.cooldown} s</strong>Hunt cooldown</span><Play size={14}/></button></div>
    <dl className="ency-facts"><div><dt>Incense blinding</dt><dd>{target.blind}</dd></div><div><dt>Hunt length · current settings</dt><dd>{length} s{target.id==='obambo'?' / '+huntDuration(settings,true)+' s aggressive':''}</dd></div></dl>
    <div className="ency-hunt-actions"><button className="button" onClick={()=>begin(length,'hunt length')} aria-label={'Start '+length+' second hunt timer for '+name}><Play size={14}/>Time hunt · {length} s</button>{target.id==='obambo'&&<button className="button" onClick={()=>begin(huntDuration(settings,true),'aggressive hunt')}>Aggressive · {huntDuration(settings,true)} s</button>}</div>
    <p>{profile.timing}</p>{profile.id==='mimic'&&<p>{target.timing}</p>}
    <p className="ency-timing-help">Start prevention when incense successfully affects the ghost; using more during an active prevention window does not restart it. Start cooldown when a hunt ends. Cursed hunts bypass these protections.</p>
  </div>;
}
export function ActiveFieldTimer(){
  const {timer,setTimer,left,start}=useTimer();
  if(!timer.label&&!timer.endsAt&&!timer.finished&&timer.remaining===timer.duration)return null;
  return <div className="ency-active-timer"><Timer size={18}/><strong role="timer" aria-label={left+' seconds remaining'}>{Math.floor(left/60)}:{String(left%60).padStart(2,'0')}</strong><span>{timer.label}</span><span>{timer.finished?'Timer complete':timer.endsAt?'Field timer running':'Field timer paused'}</span>{!timer.finished&&<button className="button" onClick={timer.endsAt?()=>setTimer({...timer,endsAt:null,remaining:left}):()=>start()}>{timer.endsAt?<Pause size={14}/>:<Play size={14}/>} {timer.endsAt?'Pause':'Resume'}</button>}<button className="button" onClick={()=>setTimer({...timer,endsAt:null,remaining:timer.duration,finished:false,label:undefined})}>Reset</button><Link to="tools">Open field tools</Link></div>;
}
