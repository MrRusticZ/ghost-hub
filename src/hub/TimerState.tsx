import {createContext,useContext,useEffect,useRef,useState,type Dispatch,type SetStateAction,type ReactNode} from 'react';
import {z} from 'zod';
import {useHub} from './context';
import {readValue,writeValue} from './storage';
const TimerSchema=z.object({duration:z.number().int().min(1).max(3600),remaining:z.number().min(0).max(3600),endsAt:z.number().nullable(),finished:z.boolean(),label:z.string().max(120).optional()});
type TimerData=z.infer<typeof TimerSchema>;
type TimerValue={timer:TimerData;setTimer:Dispatch<SetStateAction<TimerData>>;left:number;start:(seconds?:number,label?:string)=>void};
const TimerContext=createContext<TimerValue|null>(null);
export function TimerProvider({children}:{children:ReactNode}){
  const {notice,sound}=useHub();const [timer,setTimer]=useState(()=>readValue('timer',TimerSchema,{duration:90,remaining:90,endsAt:null,finished:false})),[now,setNow]=useState(Date.now());const audio=useRef<AudioContext|null>(null),completed=useRef<number|null>(null);
  const left=timer.endsAt?Math.max(0,Math.ceil((timer.endsAt-now)/1000)):timer.remaining;
  useEffect(()=>{if(!writeValue('timer',timer))notice('The timer could not be saved. It will continue in this tab.');},[timer,notice]);
  useEffect(()=>{if(!timer.endsAt)return;const tick=setInterval(()=>setNow(Date.now()),200);return()=>clearInterval(tick);},[timer.endsAt]);
  useEffect(()=>{if(timer.endsAt&&left===0&&completed.current!==timer.endsAt){completed.current=timer.endsAt;setTimer(t=>({...t,endsAt:null,remaining:0,finished:true}));notice('Timer complete.');if(sound&&audio.current?.state==='running'){const ctx=audio.current;for(let i=0;i<3;i++){const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.connect(gain);gain.connect(ctx.destination);oscillator.frequency.value=660;gain.gain.setValueAtTime(.12,ctx.currentTime+i*.25);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.25+.16);oscillator.start(ctx.currentTime+i*.25);oscillator.stop(ctx.currentTime+i*.25+.18);}}}},[left,timer.endsAt,sound,notice]);
  useEffect(()=>()=>{void audio.current?.close();},[]);
  function start(seconds?:number,label?:string){if(sound){audio.current??=new AudioContext();void audio.current.resume();}const remaining=seconds??(left||timer.duration);setNow(Date.now());completed.current=null;setTimer({...timer,duration:seconds??timer.duration,remaining,endsAt:Date.now()+remaining*1000,finished:false,label:label??timer.label??'Investigation timer'});}
  return <TimerContext.Provider value={{timer,setTimer,left,start}}>{children}</TimerContext.Provider>;
}
export function useTimer(){const value=useContext(TimerContext);if(!value)throw Error('Timer unavailable');return value;}
