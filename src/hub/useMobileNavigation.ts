import {useEffect,useLayoutEffect,useRef,useState} from 'react';

/** Keep the off-canvas menu out of the tab order and contain focus while open. */
export function useMobileNavigation(open:boolean,setOpen:(open:boolean)=>void) {
  const sidebarRef=useRef<HTMLElement>(null);
  const workspaceRef=useRef<HTMLDivElement>(null);
  const toggleRef=useRef<HTMLButtonElement>(null);
  const restoreFocus=useRef(false);
  const [compact,setCompact]=useState(()=>matchMedia('(max-width: 1020px)').matches);
  useEffect(()=>{
    const query=matchMedia('(max-width: 1020px)');
    const change=()=>{setCompact(query.matches);if(!query.matches)setOpen(false);};
    query.addEventListener('change',change);
    return()=>query.removeEventListener('change',change);
  },[setOpen]);
  useLayoutEffect(()=>{
    if(sidebarRef.current)sidebarRef.current.inert=compact&&!open;
    if(workspaceRef.current)workspaceRef.current.inert=compact&&open;
    if(!open&&restoreFocus.current){
      restoreFocus.current=false;
      if(compact)toggleRef.current?.focus({preventScroll:true});
    }
    if(!compact||!open)return;
    const sidebar=sidebarRef.current;
    if(!sidebar)return;
    const initialHash=location.hash;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const focusable=()=>Array.from(sidebar.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),[tabindex="0"]')).filter(el=>el.getClientRects().length>0);
    focusable()[0]?.focus({preventScroll:true});
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();setOpen(false);}
      if(event.key!=='Tab')return;
      const items=focusable(),first=items[0],last=items[items.length-1];
      if(!first)return;
      if(event.shiftKey&&(document.activeElement===first||!sidebar.contains(document.activeElement))){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||!sidebar.contains(document.activeElement))){event.preventDefault();first.focus();}
    };
    const onNavigate=(event:MouseEvent)=>{
      if(event.target instanceof Element&&event.target.closest('a[href],.sidebar-search'))setOpen(false);
    };
    sidebar.addEventListener('click',onNavigate);
    document.addEventListener('keydown',onKey);
    return()=>{
      document.body.style.overflow=overflow;
      document.removeEventListener('keydown',onKey);
      sidebar.removeEventListener('click',onNavigate);
      if(workspaceRef.current)workspaceRef.current.inert=false;
      restoreFocus.current=location.hash===initialHash;
    };
  },[compact,open,setOpen]);
  return {sidebarRef,workspaceRef,toggleRef,compact};
}
