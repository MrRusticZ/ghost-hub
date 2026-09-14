import {useChapterState} from './chapterState';
import {useTimer} from './TimerState';
import { useEffect,useRef,useState } from 'react';
import { ArrowRight,Check,Mic,MicOff,Radio,ShieldCheck } from 'lucide-react';
import { Link,route,useHub } from './context';
import { parseVoiceCommand } from './voiceCommands';
import { writeValue } from './storage';
import { Notice,PageHeading } from './ui';

type Recognition={lang:string;continuous:boolean;interimResults:boolean;onresult:((event:{results:ArrayLike<ArrayLike<{transcript:string}>>})=>void)|null;onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void;abort:()=>void};
type SpeechWindow=Window&{SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};
export function VoicePage(){
  const timer=useTimer();
  const {session,setSession,snapshots,setSnapshots,notice}=useHub();
  const [input,setInput]=useChapterState('VoicePage-input',''),[listening,setListening]=useState(false),[applied,setApplied]=useState(false);
  const recognition=useRef<Recognition|null>(null),timeout=useRef<ReturnType<typeof setTimeout>>();
  const Constructor=(window as SpeechWindow).SpeechRecognition??(window as SpeechWindow).webkitSpeechRecognition;
  const command=parseVoiceCommand(input);
  useEffect(()=>()=>{if(recognition.current){recognition.current.onend=null;recognition.current.onerror=null;recognition.current.onresult=null;recognition.current.abort();}clearTimeout(timeout.current);},[]);
  function listen(){
    if(listening){recognition.current?.stop();return;}
    if(!Constructor)return;
    const speech=new Constructor();recognition.current=speech;speech.lang='en-US';speech.continuous=false;speech.interimResults=false;
    speech.onresult=event=>{setInput(event.results[0]?.[0]?.transcript??'');setApplied(false);};
    speech.onerror=event=>{setListening(false);notice(event.error==='not-allowed'?'Microphone access was not allowed. You can still type a command.':'Speech recognition was unavailable. Please type your command.');};
    speech.onend=()=>{setListening(false);clearTimeout(timeout.current);};
    try{speech.start();setListening(true);timeout.current=setTimeout(()=>speech.stop(),18000);}catch{setListening(false);notice('The microphone could not start. Typed commands still work.');}
  }
  function apply(){
    if(!command||applied)return;
    if(command.kind==='evidence')setSession({...session,evidence:{...session.evidence,[command.id]:'found'}});
    if(command.kind==='sanity')setSession({...session,sanity:command.value});
    if(command.kind==='map')setSession({...session,map:command.id});
    if(command.kind==='snapshot'){if(snapshots.length>=100){notice('Journal full. Export and remove an older case first.');return;}setSnapshots([{id:crypto.randomUUID(),date:new Date().toISOString(),session:structuredClone(session),result:'Unresolved'},...snapshots]);}
    if(command.kind==='timer'){timer.start(command.seconds);route('tools');}
    if(command.kind==='navigate')route(command.to);
    setApplied(true);notice(command.label+'.');
  }
  return <><PageHeading eyebrow="INVESTIGATE / HANDS-FREE INPUT" title="Voice console" description="Say it or type it. Review it before anything changes."/><div className="two-columns"><section className="panel voice-panel"><div className="section-title"><h2><Radio size={21}/>Field commands</h2><span className="tag">{listening?'Listening':'Push to talk'}</span></div><button className={'button '+(listening?'':'primary')} disabled={!Constructor} onClick={listen} aria-label={listening?'Stop microphone':'Start microphone'}>{listening?<MicOff size={18}/>:<Mic size={18}/>} {listening?'Stop listening':'Use microphone'}</button><label>Command<input aria-label="Voice command" maxLength={2000} value={input} placeholder="Set sanity 40" onChange={e=>{setInput(e.target.value);setApplied(false);}}/></label>{command?<div className="next-test"><ShieldCheck size={23}/><div><span className="eyebrow">COMMAND PREVIEW</span><h3>{command.label}</h3><p>Matched by explicit command rules. No game state changes until you confirm.</p><button className="button primary" onClick={apply} disabled={applied}>{applied?<Check size={16}/>:<ArrowRight size={16}/>} {applied?'Applied':'Apply command'}</button></div></div>:<Notice>{input?'That command is not recognised. For a behaviour description, ask the Detective instead.':'Choose an example or enter your own command.'}</Notice>}<Link className="text-link" to={'detective'+(input?'?q='+encodeURIComponent(input):'')}>Describe a behaviour to the Detective<ArrowRight size={16}/></Link></section><aside className="panel prose"><span className="eyebrow">QUICK COMMANDS</span><h2>Less typing. Same control.</h2><div className="voice-examples">{['Add EMF','Set sanity 40','Start timer 3 minutes','Switch to maps','Set map to Tanglewood','Snapshot'].map(text=><button className="button" key={text} onClick={()=>{setInput(text);setApplied(false);}}>{text}<ArrowRight size={14}/></button>)}</div><p>Sanity is a manual estimate, not live game telemetry. Timers without units use minutes, shown in the preview.</p><Notice>{Constructor?'Microphone access starts only when you press the button.':'This browser does not offer speech recognition. All typed commands remain available.'} Your browser's speech provider may process audio online. Ghost Hub does not record or store microphone audio.</Notice></aside></div></>;
}
