import {useEffect,useRef,useState} from 'react';
import {ArrowRight,ExternalLink,Pause,Play,RotateCcw,ZoomIn,ZoomOut} from 'lucide-react';
import {Link,useHub} from './context';
import {type Ghost} from './model';
import {EvidenceTags,SourceLink} from './ui';
import {dossierFor,videoUrl,type Dossier,type DossierMedia} from './ghostDossiers';
import './ghost-dossier.css';

export function GhostEmblem({id,large=false}:{id:string;large?:boolean}){
  const entry=dossierFor(id);
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[id]);
  return <span className={'dossier-emblem'+(large?' large':'')} aria-hidden="true">{entry?.emblem&&!failed?<img src={entry.emblem.url} alt="" width="256" height="256" loading={large?'eager':'lazy'} decoding="async" onError={()=>setFailed(true)}/>:<span>{String(entry?.number??'—').padStart(2,'0')}</span>}</span>;
}

function MediaStage({media,entry,onPlay,audioActive}:{media:DossierMedia;entry:Dossier;onPlay:()=>void;audioActive:boolean}){
  const [playing,setPlaying]=useState(false);
  const [zoom,setZoom]=useState(false);
  const [failed,setFailed]=useState(false);
  const stage=useRef<HTMLDivElement>(null);
  const playButton=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(audioActive)setPlaying(false);},[audioActive]);
  function close(){setPlaying(false);requestAnimationFrame(()=>playButton.current?.focus());}
  useEffect(()=>{
    const hide=()=>{if(document.hidden)setPlaying(false);};
    document.addEventListener('visibilitychange',hide);
    return ()=>document.removeEventListener('visibilitychange',hide);
  },[]);
  const isVideo=media.kind==='youtube';
  const activeImage=media.kind==='image'||(media.kind==='animation'&&playing);
  return <>
    <div className={'dossier-stage'+(zoom?' zoomed':'')+(media.kind==='image'?' still':'')} ref={stage} data-media-kind={media.kind}>
      {isVideo&&playing?<iframe title={media.title+' by '+media.author} src={videoUrl(media)} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:activeImage&&!failed?<img src={media.url} alt={media.alt} width={media.width} height={media.height} decoding="async" onError={()=>setFailed(true)}/>:<div className="dossier-media-cover">
        <span className="dossier-cover-label">{failed?'SOURCE UNAVAILABLE':isVideo?'CREATOR FIELD GUIDE':'ANIMATED FIELD REFERENCE'}</span>
        <h2>{media.title}</h2>
        <p>{failed?'The written field notes remain available. Open the original source to check this reference.':entry.focus}</p>
        {!failed&&<button className="dossier-play" ref={playButton} onClick={()=>{onPlay();setPlaying(true);}}><Play size={20}/>{isVideo?'Load '+(media.start?'ghost chapter':'video player'):'Play animation'}{isVideo&&media.start>0&&<span>{Math.floor(media.start/60)}:{String(media.start%60).padStart(2,'0')}</span>}</button>}
        {isVideo&&!failed&&<small>YouTube loads when selected. Use the player to start sound.</small>}
      </div>}
    </div>
    <div className="dossier-media-controls">
      <span>{media.kind==='image'?'EVIDENCE STILL':media.kind==='animation'?'GAMEPLAY EXAMPLE':media.kind==='youtube'&&media.start?'TIMESTAMPED CHAPTER':'CREATOR VIDEO'}</span>
      {media.kind==='image'&&!failed&&<button onClick={()=>setZoom(!zoom)} aria-pressed={zoom}>{zoom?<ZoomOut size={16}/>:<ZoomIn size={16}/>} {zoom?'Fit image':'Inspect print'}</button>}
      {playing&&<button onClick={close}>{isVideo?<RotateCcw size={16}/>:<Pause size={16}/>} {isVideo?'Close video':'Stop animation'}</button>}
      <a href={media.source} target="_blank" rel="noopener noreferrer">Original source<ExternalLink size={14}/></a>
    </div>
    <div className="dossier-caption"><strong>{media.title}</strong><p>{media.context}</p><span>{media.author} · Source date: {media.date} · Capture build not independently verified</span></div>
  </>;
}

export function GhostDossier({ghost,onPlay,audioActive}:{ghost:Ghost;onPlay:()=>void;audioActive:boolean}){
  const {catalog}=useHub();
  const entry=dossierFor(ghost.id);
  const [selected,setSelected]=useState(0);
  const [test,setTest]=useState(false);
  if(!entry)return <header className="dossier-heading"><h1>{ghost.name}</h1><p>{ghost.summary}</p><EvidenceTags evidence={ghost.evidence}/></header>;
  const media=entry.media[selected]??entry.media[0];
  return <section className="ghost-dossier" data-dossier={ghost.id}>
    <header className="dossier-heading"><div><span className="eyebrow">ENTITY DOSSIER / {String(entry.number).padStart(3,'0')}</span><h1>{ghost.name}</h1><p>{ghost.summary}</p><EvidenceTags evidence={ghost.evidence}/></div><GhostEmblem id={ghost.id} large/></header>
    <div className="dossier-revision"><span>Field reference · Reviewed {entry.reviewedAt}</span><SourceLink url={entry.source+'?oldid='+entry.revision}>Reviewed source revision</SourceLink></div>
    <div className="dossier-review"><div className="dossier-viewer"><MediaStage key={ghost.id+'-'+selected} media={media} entry={entry} onPlay={onPlay} audioActive={audioActive}/>
      {entry.media.length>1&&<div className="dossier-gallery" role="group" aria-label="Media references">{entry.media.map((item,index)=><button key={item.source} aria-pressed={selected===index} onClick={()=>{onPlay();setSelected(index);}}><span>{String(index+1).padStart(2,'0')}</span>{item.title}<span>{item.kind==='image'?'STILL':item.kind==='animation'?'MOTION':'VIDEO'}</span></button>)}</div>}
    </div><aside className="dossier-notes" aria-label="Identification notes"><div className="dossier-note-tabs" role="group" aria-label="Field notes view"><button aria-pressed={!test} onClick={()=>setTest(false)}>What to notice</button><button aria-pressed={test} onClick={()=>setTest(true)}>How to test</button></div><span className="eyebrow">{test?'IN THE FIELD':'READ THE OBSERVATION'}</span><h2>{entry.focus}</h2><ol className="dossier-observations">{(test?entry.steps:entry.facts).map((item,index)=><li key={item}><span>{String(index+1).padStart(2,'0')}</span><p>{item}</p></li>)}</ol><div className="dossier-limit"><strong>Before you conclude</strong><p>{ghost.caution}</p>{ghost.id!=='mimic'&&<p>Behaviour may be imitated by The Mimic where its own evidence permits. Cross-check the evidence.</p>}</div><SourceLink url={entry.source}>Current behaviour reference</SourceLink></aside></div>
    <div className="dossier-related"><span>Compare the clues</span>{entry.related.map(id=>{const other=catalog.ghosts.find(g=>g.id===id);return other?<Link key={id} to={'ghosts/'+id}>{other.name}<ArrowRight size={14}/></Link>:null;})}<Link to="evidence">Open your evidence book<ArrowRight size={14}/></Link></div>
    {entry.emblem&&<details className="dossier-credits"><summary>Journal artwork credit</summary><p>{entry.emblem.credit}. Journal artwork is an identifier, not a unique ghost model. <SourceLink url={entry.emblem.source}>Original file and attribution</SourceLink></p></details>}
  </section>;
}
