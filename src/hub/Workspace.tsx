import {createContext,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {z} from 'zod';
import {useHub} from './context';
import {applyProposal,buildKnowledge,caseFingerprint,detectiveTurn,freshDialogue,type DetectiveReply,type DialogueState,type EvidenceProposal} from './detectiveEngine';
import type {Session} from './model';

export type ConversationMessage={id:string;role:'user'|'detective'|'divider';text:string;reply?:DetectiveReply;proposal?:EvidenceProposal};
type WorkspaceData={schema:1;caseId:string;draft:string;dialogue:DialogueState;messages:ConversationMessage[]};
const uid=()=>Date.now().toString(36)+'-'+crypto.getRandomValues(new Uint32Array(2)).join('-');
const fresh=():WorkspaceData=>({schema:1,caseId:uid(),draft:'',dialogue:freshDialogue(),messages:[]});
const suggestion=z.object({id:z.string().max(80),label:z.string().max(150),type:z.enum(['evidence','observation']),state:z.enum(['found','unknown','ruled-out']).optional()});
const choice=z.object({id:z.string().max(80),label:z.string().max(150)});
const pending=z.object({id:z.string(),question:z.string(),why:z.string(),choices:z.array(choice).max(3),observationId:z.string().optional()});
const replySchema=z.object({text:z.string(),details:z.string().optional(),sources:z.array(z.string().url().startsWith('https://')),choices:z.array(choice).max(3),suggestions:z.array(suggestion),topic:z.string(),retirePending:z.boolean().optional()});
const schema=z.object({schema:z.literal(1),caseId:z.string(),draft:z.string().max(2000),dialogue:z.object({turn:z.number(),topic:z.string(),pending:pending.optional(),attempted:z.array(z.enum(['emf','writing','freezing','orbs','uv','dots','box'])),misses:z.number(),fingerprint:z.string(),recentReplies:z.array(z.string())}),messages:z.array(z.object({id:z.string(),role:z.enum(['user','detective','divider']),text:z.string(),reply:replySchema.optional(),proposal:z.object({items:z.array(suggestion),fingerprint:z.string(),status:z.enum(['pending','applied','stale']),caseId:z.string()}).optional()}))});
function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{
  const request=indexedDB.open('ghost-hub-workspace',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('workspace');
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Workspace storage is busy.'));
});}
async function readWorkspace(){const db=await database();return new Promise<WorkspaceData|undefined>((resolve,reject)=>{const tx=db.transaction('workspace','readonly');const request=tx.objectStore('workspace').get('current');request.onsuccess=()=>{try{resolve(request.result?schema.parse(request.result):undefined);}catch(e){reject(e);}};request.onerror=()=>reject(request.error);tx.oncomplete=()=>db.close();tx.onabort=()=>{db.close();reject(tx.error);};});}
async function saveWorkspace(data:WorkspaceData){const db=await database();return new Promise<void>((resolve,reject)=>{const tx=db.transaction('workspace','readwrite');tx.objectStore('workspace').put(data,'current');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};tx.onabort=()=>{db.close();reject(tx.error);};});}
type WorkspaceValue={data:WorkspaceData;ready:boolean;saveStatus:string;setDraft:(v:string)=>void;send:(text?:string,choiceId?:string)=>void;apply:(id:string,selected:number[],replace:boolean)=>void;clear:()=>void};
const WorkspaceContext=createContext<WorkspaceValue|null>(null);
export function WorkspaceProvider({children}:{children:ReactNode}){
  const {session,setSession,catalog,notice}=useHub();const [data,setData]=useState(fresh),[ready,setReady]=useState(false),[saveStatus,setSaveStatus]=useState('Opening your notes…');
  const current=useRef(data),saveQueue=useRef<Promise<void>>(Promise.resolve()),canSave=useRef(true),hydrated=useRef(false),revision=useRef(0);
  const knowledge=useMemo(()=>buildKnowledge(catalog),[catalog]);
  function persist(value:WorkspaceData){if(!canSave.current)return;setSaveStatus('Saving on this device…');saveQueue.current=saveQueue.current.catch(()=>{}).then(()=>saveWorkspace(value)).then(()=>{if(current.current===value)setSaveStatus('Saved on this device');}).catch(()=>{canSave.current=false;setSaveStatus('Not saved · kept in this tab');notice('Conversation storage is unavailable. Your current conversation stays in this tab; export it before closing.');});}
  function commit(value:WorkspaceData){revision.current++;current.current=value;setData(value);persist(value);}
  useEffect(()=>{let alive=true;readWorkspace().then(saved=>{if(!alive)return;if(saved&&revision.current===0){current.current=saved;setData(saved);}setSaveStatus('Saved on this device');}).catch(()=>{if(alive){canSave.current=false;setSaveStatus('Not saved · kept in this tab');notice('Conversation storage could not open. You can still use the Detective in this tab.');}}).finally(()=>{if(alive){hydrated.current=true;setReady(true);}});return()=>{alive=false;};},[notice]);
  useEffect(()=>{const replace=()=>{const old=current.current;commit({...old,caseId:uid(),draft:'',dialogue:freshDialogue(),messages:[...old.messages.map(m=>m.proposal?.status==='pending'?{...m,proposal:{...m.proposal,status:'stale' as const}}:m),{id:uid(),role:'divider',text:'A different case starts here. Earlier notes are kept as history.'}]});};window.addEventListener('ghost-hub:replace-case',replace);return()=>window.removeEventListener('ghost-hub:replace-case',replace);},[]);
  const value:WorkspaceValue={data,ready,saveStatus,setDraft:draft=>{if(hydrated.current)commit({...current.current,draft:draft.slice(0,2000)});},send:(input,choiceId)=>{
    if(!ready)return;const old=current.current;const text=(input??old.draft).trim().slice(0,2000);if(!text)return;
    const mappings:Record<string,string>={'quiet-topic':'The ghost is shy','lights-topic':'The lights keep changing','next-topic':'What should we test next?','evidence-topic':'We have EMF 5'};
    const result=detectiveTurn(mappings[choiceId??'']??text,old.dialogue,session,catalog,mappings[choiceId??'']?undefined:choiceId,knowledge);
    const proposal:EvidenceProposal|undefined=result.reply.suggestions.length?{items:result.reply.suggestions,fingerprint:caseFingerprint(session,catalog.version),status:'pending',caseId:old.caseId}:undefined;
    const messages=result.reply.retirePending?old.messages.map(m=>m.proposal?.status==='pending'?{...m,proposal:{...m.proposal,status:'stale' as const}}:m):old.messages;
    commit({...old,draft:'',dialogue:result.state,messages:[...messages,{id:uid(),role:'user',text},{id:uid(),role:'detective',text:result.reply.text,reply:result.reply,proposal}]});
  },apply:(id,selected,replace)=>{
    const old=current.current;const message=old.messages.find(m=>m.id===id);if(!message?.proposal||!selected.length)return;
    const next=applyProposal(session,message.proposal,selected,catalog.version,old.caseId,replace);
    if(!next){notice('This suggestion needs a fresh review. Your case has not been changed.');return;}
    setSession(next);commit({...old,messages:old.messages.map(m=>m.id===id?{...m,proposal:{...message.proposal!,status:'applied'}}:m)});notice('Selected observations added. You can undo this change.');
  },clear:()=>{if(confirm('Clear the Detective conversation on this device? Your evidence and journal will remain.'))commit(fresh());}};
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
export function useWorkspace(){const value=useContext(WorkspaceContext);if(!value)throw Error('Workspace unavailable');return value;}
export function replaceCase(next:Session,setSession:(s:Session)=>void){window.dispatchEvent(new Event('ghost-hub:replace-case'));setSession(next);}
