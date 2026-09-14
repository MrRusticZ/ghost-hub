import {useReadingPosition} from './useReadingPosition';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,Check,Download,Ghost,Send,Undo2} from 'lucide-react';
import {useHub,Link} from './context';
import {useWorkspace,type ConversationMessage} from './Workspace';
import {caseFingerprint} from './detectiveEngine';
import {EVIDENCE,type Evidence} from './model';
import {PageHeading,SourceLink} from './ui';
import {downloadJson} from './storage';
import {useChapterState} from './chapterState';

function Proposal({message}:{message:ConversationMessage}){
  const {session,catalog}=useHub();const {data,apply}=useWorkspace();const proposal=message.proposal!;
  const [selected,setSelected]=useChapterState('proposal:'+message.id,()=>proposal.items.map((_,i)=>i)),[replace,setReplace]=useState(false);
  const stale=proposal.caseId!==data.caseId||proposal.fingerprint!==caseFingerprint(session,catalog.version);
  const replacement=selected.some(i=>{const s=proposal.items[i];return !!s&&s.type==='evidence'&&session.evidence[s.id as Evidence]&&session.evidence[s.id as Evidence]!=='unknown'&&session.evidence[s.id as Evidence]!==s.state;});
  if(proposal.status==='applied')return <p className="detective-recorded"><Check size={16}/>Added to case</p>;
  if(stale||proposal.status==='stale')return <p className="small muted">Earlier suggestion · new information needs a fresh review.</p>;
  return <div className="suggestion-review"><strong>Add this to your case?</strong><div className="proposal-items">{proposal.items.map((s,i)=><label key={s.type+s.id}><input type="checkbox" checked={selected.includes(i)} onChange={e=>setSelected(e.target.checked?[...selected,i]:selected.filter(x=>x!==i))}/><span>{s.label}{s.type==='evidence'?' · '+(session.evidence[s.id as Evidence]??'unknown').replace('ruled-out','ruled out')+' → '+s.state:''}</span></label>)}</div>{replacement&&<label className="replacement-confirm"><input type="checkbox" checked={replace} onChange={e=>setReplace(e.target.checked)}/>Replace the selected previously recorded result</label>}<button className="button" disabled={!selected.length||(replacement&&!replace)} onClick={()=>apply(message.id,selected,replace)}>Add to case</button></div>;
}
export function Detective(){
  const {session,candidates,undo,canUndo,catalog}=useHub();const {data,ready,saveStatus,setDraft,send,clear}=useWorkspace();const [visible,setVisible]=useState(40);
  const reading=useReadingPosition('detective',ready);
  const last=data.messages.at(-1),end=useRef<HTMLDivElement>(null),initialized=useRef('');
  const q=new URLSearchParams(location.hash.split('?')[1]).get('q')??'';
  useEffect(()=>{if(ready&&q&&initialized.current!==q){initialized.current=q;if(!data.draft)setDraft(q);}},[ready,q]);
  const lastId=useRef(last?.id);useEffect(()=>{if(lastId.current!==last?.id){lastId.current=last?.id;end.current?.scrollIntoView({block:'nearest'});}},[last?.id]);
  const active=candidates.filter(c=>!c.eliminated);const currentQuestion=data.dialogue.fingerprint===caseFingerprint(session,catalog.version);
  return <><PageHeading eyebrow="INVESTIGATE / YOUR SECOND PAIR OF EYES" title="Ghost Detective" description="Tell me what happened. We’ll take it one clue at a time." action={<button className="button" onClick={undo} disabled={!canUndo}><Undo2 size={16}/>Undo case change</button>}/>
  <div className="detective-layout detective-v2"><section className="detective-main panel"><div className="detective-status"><div className="detective-avatar"><Ghost size={24}/></div><div><strong>The Detective</strong><small>Your local field companion</small></div><span className="status-dot"/></div>
  <div ref={reading} className="conversation" aria-label="Detective conversation">{!data.messages.length&&<div className="detective-welcome"><div className="orb-emblem"><Ghost size={42}/></div><h2>One clue is a good place to start.</h2><p>Something the ghost did, an equipment result, or just a hunch.</p><div className="prompt-grid">{['The ghost is shy','It is not stepping in salt','We have EMF 5 and ghost writing','What should we test next?'].map(p=><button key={p} disabled={!ready} onClick={()=>send(p)}>{p}<ArrowRight size={16}/></button>)}</div></div>}
  {data.messages.length>visible&&<button className="text-button" onClick={()=>setVisible(visible+40)}>Show earlier notes ({data.messages.length-visible})</button>}
  {data.messages.slice(-visible).map(m=>m.role==='divider'?<p key={m.id} className="conversation-divider">{m.text}</p>:<article className={'chat-answer '+m.role} key={m.id}><span className="eyebrow">{m.role==='user'?'YOU':'THE DETECTIVE'}</span><p>{m.text}</p>{m.reply?.details&&<details className="reply-details"><summary>Why this helps</summary><p>{m.reply.details}</p></details>}{m.proposal&&<Proposal message={m}/>} {!!m.reply?.sources.length&&<details className="reply-details"><summary>References</summary>{m.reply.sources.map(s=><SourceLink key={s} url={s}/>)}</details>}{m.id===last?.id&&currentQuestion&&!!m.reply?.choices.length&&<div className="quick-replies" aria-label="Suggested replies">{m.reply.choices.map(c=><button className="button" key={c.id} onClick={()=>send(c.label,c.id)}>{c.label}</button>)}</div>}</article>)}<div ref={end}/></div>
  <div className="sr-only" role="status">{last?.role==='detective'?last.text:''}</div>
  <form className="detective-compose" onSubmit={e=>{e.preventDefault();send();}}><textarea aria-label="Message the Ghost Detective" maxLength={2000} value={data.draft} disabled={!ready} placeholder={ready?'Tell me what you noticed…':'Opening your notes…'} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();send();}}}/><button className="button primary" type="submit" disabled={!ready||!data.draft.trim()} aria-label="Send to the Detective"><Send size={18}/></button></form><p className="compose-hint small muted">Enter to send · Shift + Enter for a new line · {saveStatus}</p></section>
  <aside className="detective-context"><section className="panel"><span className="eyebrow">YOUR CASE</span><h3>{session.name==='Untitled investigation'?'Following the clues':session.name}</h3><div className="case-evidence">{EVIDENCE.filter(e=>session.evidence[e.id]==='found').map(e=><span className="tag" key={e.id}>{e.short}</span>)}</div><div className="case-count">{active.length}<span>possible ghosts</span></div><Link to="evidence" className="button full">Open evidence book<ArrowRight size={16}/></Link><button className="text-button" onClick={()=>send('What should we test next?')}>Something to try next<ArrowRight size={16}/></button></section><details className="panel detective-about"><summary>About your companion</summary><p>A local guide to the references bundled with Ghost Hub. It remembers this conversation on your device and asks when a description needs clarification.</p><p>Messages do not go to an AI service. Suggestions change evidence only when you add them.</p><button className="text-button" onClick={()=>downloadJson('ghost-hub-detective.json',{format:'ghost-hub-detective-v1',messages:data.messages,draft:data.draft})}><Download size={16}/>Export conversation</button><button className="text-button" onClick={clear}>Clear conversation</button></details></aside></div></>;
}
