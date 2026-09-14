import {stepInterval} from './ghostMechanics';

// Local recordings are deliberately unavailable to the production bundle.
export const LOCAL_FOOTSTEP_SAMPLE_URL: string | undefined = import.meta.env.DEV
  ? import.meta.env.VITE_LOCAL_FOOTSTEP_SAMPLE_URL || undefined
  : undefined;

/** One audio clock for the encyclopedia, with an optional locally configured game recording. */
export class FootstepAudio {
  private context:AudioContext|null=null;
  private sample:AudioBuffer|null=null;
  private output:GainNode|null=null;
  private clock:ReturnType<typeof setInterval>|undefined;
  private finish:ReturnType<typeof setTimeout>|undefined;
  private generation=0;
  private nodes=new Set<AudioBufferSourceNode>();
  private disposed=false;
  private volume=.35;
  private sampleLoad:Promise<AudioBuffer>|null=null;
  private download:AbortController|null=null;

  private loadRecording(context:AudioContext,url:string):Promise<AudioBuffer>{
    if(this.sampleLoad)return this.sampleLoad;
    const controller=new AbortController();this.download=controller;
    const timeout=setTimeout(()=>controller.abort(),10000);
    this.sampleLoad=(async()=>{
      try{
        const response=await fetch(url,{signal:controller.signal});
        if(!response.ok)throw new Error('The game footstep sample could not be loaded.');
        const bytes=await response.arrayBuffer();
        if(bytes.byteLength>1024*1024)throw new Error('The footstep sample is too large.');
        const sample=await context.decodeAudioData(bytes);
        if(sample.duration<=0||sample.duration>2)throw new Error('The footstep sample must contain a single short step.');
        return sample;
      }finally{clearTimeout(timeout);this.download=null;}
    })();
    // A failed download can be retried on the next user gesture.
    void this.sampleLoad.catch(()=>{this.sampleLoad=null;});
    return this.sampleLoad;
  }

  setVolume(value:number){
    this.volume=Math.max(0,Math.min(1,value));
    if(this.context&&this.output)this.output.gain.setTargetAtTime(this.volume,this.context.currentTime,.02);
  }
  async play(speed:number,onEnd:()=>void){
    const interval=stepInterval(speed);
    this.stop();
    const generation=this.generation;
    if(this.disposed)return false;
    if(!this.context){
      if(typeof AudioContext==='undefined')throw new Error('This browser cannot play footstep audio.');
      const context=new AudioContext();this.context=context;
      this.output=context.createGain();this.output.gain.value=this.volume;this.output.connect(context.destination);
      if(!LOCAL_FOOTSTEP_SAMPLE_URL){
      const sample=context.createBuffer(1,Math.ceil(context.sampleRate*.18),context.sampleRate),data=sample.getChannelData(0);
      // Original soft heel impact and short sole scuff, with a deterministic noise bed.
      let noise=173;
      for(let i=0;i<data.length;i++){
        const t=i/context.sampleRate;noise=(noise*1664525+1013904223)>>>0;
        const impact=Math.sin(2*Math.PI*(95*t-90*t*t))*Math.exp(-t*38);
        const scuff=(noise/4294967296*2-1)*Math.exp(-t*55);
        data[i]=(impact*.6+scuff*.22)*Math.min(1,t/.003);
      }
      this.sample=sample;
      }
    }
    const context=this.context;
    await context.resume();
    if(this.disposed||generation!==this.generation)return false;
    if(LOCAL_FOOTSTEP_SAMPLE_URL&&!this.sample)this.sample=await this.loadRecording(context,LOCAL_FOOTSTEP_SAMPLE_URL);
    if(this.disposed||generation!==this.generation)return false;
    if(context.state!=='running')throw new Error('Audio is paused by the browser. Press Play footsteps again.');
    let next=context.currentTime+.035;
    const until=context.currentTime+12;
    const schedule=()=>{
      if(next<context.currentTime)next=context.currentTime+.02;
      while(next<context.currentTime+.1&&next<until){
        const node=context.createBufferSource();node.buffer=this.sample;node.connect(this.output!);
        this.nodes.add(node);node.onended=()=>{node.disconnect();this.nodes.delete(node);};node.start(next);next+=interval;
      }
    };
    schedule();this.clock=setInterval(schedule,25);
    this.finish=setTimeout(()=>{this.stop();onEnd();},12200);
    return true;
  }
  stop(){
    this.generation++;clearInterval(this.clock);clearTimeout(this.finish);this.clock=undefined;this.finish=undefined;
    for(const node of this.nodes){node.onended=null;try{node.stop();}catch{}node.disconnect();}
    this.nodes.clear();
  }
  dispose(){this.disposed=true;this.stop();this.download?.abort();if(this.context)void this.context.close().catch(()=>{});}
}
