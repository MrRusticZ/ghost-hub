import {useEffect,useState} from 'react';
import {dossierFor} from './ghostDossiers';
import './ghost-emblem.css';

export function GhostEmblem({id,large=false}:{id:string;large?:boolean}){
  const entry=dossierFor(id);
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[id]);
  const available=Boolean(entry?.emblem&&!failed);
  return <span className={'dossier-emblem'+(large?' large':'')} aria-hidden="true" data-artwork={available?'journal':'unavailable'} title={available?'Original journal artwork':failed?'Journal artwork could not load':'Official journal artwork unavailable'}>{entry?.emblem&&available?<img src={entry.emblem.url} alt="" width="256" height="256" loading={large?'eager':'lazy'} decoding="async" onError={()=>setFailed(true)}/>:<span>?</span>}</span>;
}
