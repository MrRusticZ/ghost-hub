import {useState,type Dispatch,type SetStateAction} from 'react';
const values=new Map<string,unknown>();
function initialValue<T>(key:string,initial:T|(()=>T)):T {
  if(values.has(key))return values.get(key) as T;
  const fallback=typeof initial==='function'?(initial as ()=>T)():initial;
  let value=fallback;
  try{const saved=sessionStorage.getItem('ghost-hub:chapter:'+key);if(saved){const parsed=JSON.parse(saved);if(typeof parsed===typeof fallback&&Array.isArray(parsed)===Array.isArray(fallback))value=parsed;}}catch{}
  values.set(key,value);return value;
}
/** Presentation state only: never use for credentials, case authority or browser handles. */
export function useChapterState<T>(key:string,initial:T|(()=>T)):[T,Dispatch<SetStateAction<T>>] {
  const [value,setValue]=useState<T>(()=>initialValue(key,initial));
  const update:Dispatch<SetStateAction<T>>=next=>setValue(previous=>{
    const result=typeof next==='function'?(next as (p:T)=>T)(previous):next;
    values.set(key,result);
    try{sessionStorage.setItem('ghost-hub:chapter:'+key,JSON.stringify(result));}catch{}
    return result;
  });
  return [value,update];
}
