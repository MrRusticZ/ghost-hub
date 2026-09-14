import {useLayoutEffect,useRef} from 'react';

const positions=new Map<string,{top:number;left:number}>();
/** Preserve an inner reading surface without re-rendering React on every scroll. */
export function useReadingPosition(key:string,ready=true){
  const ref=useRef<HTMLDivElement>(null);
  useLayoutEffect(()=>{
    const element=ref.current;if(!element||!ready)return;
    let position=positions.get(key);
    if(!position){try{const saved=JSON.parse(sessionStorage.getItem('ghost-hub:reading:'+key)??'null');if(saved&&Number.isFinite(saved.top)&&Number.isFinite(saved.left))position=saved;}catch{}}
    if(position){element.scrollTop=position.top;element.scrollLeft=position.left;}
    const remember=()=>{const value={top:element.scrollTop,left:element.scrollLeft};positions.set(key,value);try{sessionStorage.setItem('ghost-hub:reading:'+key,JSON.stringify(value));}catch{}};
    element.addEventListener('scroll',remember,{passive:true});
    return()=>{remember();element.removeEventListener('scroll',remember);};
  },[key,ready]);
  return ref;
}
