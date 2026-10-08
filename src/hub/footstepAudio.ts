import {stepInterval} from './ghostMechanics';
import {footstepSampleUrls,type FootstepSurface} from './footstepSamples';

/** One audio clock; original game recordings at an approximate reference cadence. */
export class FootstepAudio {
  private context:AudioContext|null=null;
  private output:GainNode|null=null;
  private clock:ReturnType<typeof setInterval>|undefined;
  private finish:ReturnType<typeof setTimeout>|undefined;
  private generation=0;
  private nodes=new Set<AudioBufferSourceNode>();
  private disposed=false;
  private volume=.35;
  private sampleLoads=new Map<string,Promise<AudioBuffer>>();
  private downloads=new Set<AbortController>();

  private loadRecording(context:AudioContext,url:string):Promise<AudioBuffer>{
    const cached=this.sampleLoads.get(url);if(cached)return cached;
    const controller=new AbortController();this.downloads.add(controller);
    const timeout=setTimeout(()=>controller.abort(),10000);
    const loading=(async()=>{
      try{
        const response=await fetch(url,{signal:controller.signal});
        if(!response.ok)throw new Error('The game footstep recording could not be loaded. Check your connection and try Listen again.');
        const bytes=await response.arrayBuffer();
        if(bytes.byteLength>1024*1024)throw new Error('The footstep sample is too large.');
        const sample=await context.decodeAudioData(bytes);
        if(sample.duration<=0||sample.duration>2)throw new Error('The footstep sample must contain a single short step.');
        return sample;
      }finally{clearTimeout(timeout);this.downloads.delete(controller);}
    })();
    // A failed download can be retried on the next user gesture.
    this.sampleLoads.set(url,loading);
    void loading.catch(()=>{this.sampleLoads.delete(url);});
    return loading;
  }

  setVolume(value:number){
    this.volume=Math.max(0,Math.min(1,value));
    if(this.context&&this.output)this.output.gain.setTargetAtTime(this.volume,this.context.currentTime,.02);
  }
  async play(speed:number,onEnd:()=>void,surface:FootstepSurface='standard'){
    const interval=stepInterval(speed);
    this.stop();
    const generation=this.generation;
    if(this.disposed)return false;
    if(!this.context){
      if(typeof AudioContext==='undefined')throw new Error('This browser cannot play footstep audio.');
      const context=new AudioContext();this.context=context;
      this.output=context.createGain();this.output.gain.value=this.volume;this.output.connect(context.destination);
    }
    const context=this.context;
    await context.resume();
    if(this.disposed||generation!==this.generation)return false;
    const samples=await Promise.all(footstepSampleUrls(surface).map(url=>this.loadRecording(context,url)));
    if(this.disposed||generation!==this.generation)return false;
    if(context.state!=='running')throw new Error('Audio is paused by the browser. Press Play footsteps again.');
    let next=context.currentTime+.035;
    let step=0;
    const until=context.currentTime+12;
    const schedule=()=>{
      if(next<context.currentTime)next=context.currentTime+.02;
      while(next<context.currentTime+.1&&next<until){
        const node=context.createBufferSource();node.buffer=samples[step++%samples.length];
        node.playbackRate.value=1;node.connect(this.output!);
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
  dispose(){this.disposed=true;this.stop();for(const controller of this.downloads)controller.abort();this.sampleLoads.clear();if(this.context)void this.context.close().catch(()=>{});}
}
