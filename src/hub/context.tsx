import { createContext,useContext,type ReactNode } from 'react';
import type { Candidate,Catalog,News,Session,Snapshot } from './model';
export type HubContextValue={catalog:Catalog;news:News;session:Session;setSession:(s:Session)=>void;candidates:Candidate[];snapshots:Snapshot[];setSnapshots:(s:Snapshot[])=>void;notice:(s:string)=>void;source:string;issues:string[];remote:string;setRemote:(s:string)=>void;api:string;effects:boolean;setEffects:(v:boolean)=>void;sound:boolean;setSound:(v:boolean)=>void;undo:()=>void;canUndo:boolean};
export const HubContext=createContext<HubContextValue|null>(null);
export function useHub(){const value=useContext(HubContext);if(!value)throw Error('Hub context unavailable');return value;}
export function route(path:string){location.hash='/'+path;}
export function Link({to,children,className='',...props}:{to:string;children:ReactNode;className?:string}&Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>,'href'>){return <a href={'#/'+to} className={className} {...props}>{children}</a>;}
export const imagePath=(import.meta.env.BASE_URL||'/')+'assets/haunted-house.png';
