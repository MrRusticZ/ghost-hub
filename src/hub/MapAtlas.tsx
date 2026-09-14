import {useEffect, useRef, useState, type PointerEvent} from 'react';
import {ArrowUpRight, Check, ChevronRight, Crosshair, Download, Eye, Hand, ImagePlus, Layers, Map as MapIcon, MapPin, Maximize2, Minimize2, Minus, Plus, RotateCcw, Search, Shield, StickyNote, Trash2, TriangleAlert, Upload, X, Zap} from 'lucide-react';
import {MAPS} from './content';
import {route,useHub} from './context';
import {useChapterState} from './chapterState';
import {getFloorImage, putFloorImage, removeFloorImage, type FloorImage} from './atlasStorage';
import {downloadJson, readValue, writeValue} from './storage';
import {ATLAS_REFERENCES, SUNNY_VARIANTS, atlasFloors, cropStyle, MarkersSchema, parseMarkerImport, type AtlasMarker} from './atlasMaps';
import {Notice} from './ui';
import {AtlasFloorPlan} from './AtlasFloorPlan';
import {HOUSE_PLANS,sourceFrame,markerFrame,convertPoint,containsPoint,roomName,type Frame} from './atlasPlans';
import './atlas.css';

const MARKER_TOOLS = [
  {id:'ghost',label:'Ghost room',icon:Crosshair},
  {id:'breaker',label:'Breaker',icon:Zap},
  {id:'hiding',label:'Hiding spot',icon:Shield},
  {id:'cursed',label:'Cursed item',icon:TriangleAlert},
  {id:'note',label:'Note',icon:StickyNote},
] as const;
const GROUPS = [
  {label:'Houses',ids:['tanglewood','edgefield','ridgeview','willow']},
  {label:'Rural & outdoor',ids:['grafton','bleasdale','woodwind','maple']},
  {label:'Larger locations',ids:['nells','point-hope','prison','brownstone','sunny']},
  {label:'Restricted contracts',ids:['sunny-restricted','prison-restricted','brownstone-restricted','point-hope-restricted']},
];
const clamp=(value:number)=>Math.max(0,Math.min(100,value));

function MonitorFilter() {
  // Flatten chromatic room fills while retaining neutral walls and antialiased text.
  // This is a reversible display filter; the attributed source images stay intact.
  return <svg className="atlas-display-filters" aria-hidden="true" focusable="false" width="0" height="0"><defs>
    <filter id="atlas-monitor-tone" colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="luminance"/>
      <feColorMatrix in="SourceGraphic" values="1 -1 0 0 0  0 1 -1 0 0  -1 0 1 0 0  0 0 0 1 0" result="channel-differences"/>
      <feColorMatrix in="channel-differences" values="0 0 0 0 .14  0 0 0 0 .14  0 0 0 0 .14  8 8 8 0 0" result="room-tone"/>
      <feBlend in="room-tone" in2="luminance" mode="normal"/>
    </filter>
  </defs></svg>;
}

export function MapAtlas() {
  const {session,setSession,notice}=useHub();
  const [selected,setSelected]=useChapterState('MapAtlas-selected',()=>new URLSearchParams(location.hash.split('?')[1]).get('map')??session.map);
  const [floor,setFloor]=useChapterState('MapAtlas-floor','');
  const [query,setQuery]=useChapterState('MapAtlas-query','');
  const [label,setLabel]=useChapterState('MapAtlas-label','Ghost room');
  const [zoom,setZoom]=useChapterState('MapAtlas-zoom',100);
  const [view,setView]=useChapterState<'reference'|'personal'>('MapAtlas-view','reference');
  const [display,setDisplay]=useChapterState<'monitor'|'colour'>('MapAtlas-display','monitor');
  const [roomId,setRoomId]=useState('');
  const [roomLabels,setRoomLabels]=useChapterState('MapAtlas-room-labels',true);
  const [variant,setVariant]=useChapterState('MapAtlas-variant','Courtyard');
  const [kind,setKind]=useState<NonNullable<AtlasMarker['kind']>>('ghost');
  const [tool,setTool]=useState<'pan'|'mark'>('pan');
  const [showMarkers,setShowMarkers]=useState(true);
  const [overview,setOverview]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const [locationsOpen,setLocationsOpen]=useState(false);
  const [image,setImage]=useState<FloorImage|null>(null);
  const [imageUrl,setImageUrl]=useState('');
  const [busy,setBusy]=useState(false);
  const [pending,setPending]=useState<AtlasMarker[]|null>(null);
  const [markers,setMarkers]=useState(()=>readValue('map-markers',MarkersSchema,[]));
  const [activeId,setActiveId]=useState('');
  const [size,setSize]=useState({width:800,height:600});
  const [imageFailed,setImageFailed]=useState(false);
  const upload=useRef<HTMLInputElement>(null),importFile=useRef<HTMLInputElement>(null);
  const viewport=useRef<HTMLDivElement>(null),generation=useRef(0);
  const board=useRef<HTMLDivElement>(null);
  const drag=useRef<{x:number;y:number;left:number;top:number;pointer:number}|null>(null);
  const dragged=useRef(false);
  const map=MAPS.find(m=>m.id===selected)??MAPS.find(m=>m.id==='tanglewood')!;
  const floors=[...atlasFloors(map.id),...map.floors.filter(f=>!atlasFloors(map.id).includes(f)&&view==='personal'&&markers.some(m=>m.map===map.id&&m.floor===f&&(m.surface??'personal')==='personal'))];
  const currentFloor=floors.includes(floor)?floor:floors[0];
  const key=map.id+':'+currentFloor;
  const currentVariant=SUNNY_VARIANTS[variant]?variant:'Courtyard';
  const ref=map.id==='sunny-restricted'?SUNNY_VARIANTS[currentVariant]:ATLAS_REFERENCES[map.id];
  const localImage=image?.key===key?image:null;
  const personal=view==='personal';
  const crop=ref.floors[currentFloor]??[0,0,100,100] as const;
  const current=markers.filter(m=>m.map===map.id&&m.floor===currentFloor&&(m.surface??'personal')===view&&
    (personal||map.id!=='sunny-restricted'||(m.variant??'Courtyard')===currentVariant));
  const plan=HOUSE_PLANS[map.id]?.[currentFloor];
  const schematic=!!plan&&!personal&&!overview&&display!=='colour';
  const canonical=sourceFrame(crop,ref.width,ref.height);
  const frame:Frame=schematic?markerFrame(plan.bounds,canonical,current):canonical;
  const activeRoom=plan?.rooms.find(room=>room.id===roomId);
  const ratio=personal?(localImage?localImage.width/localImage.height:1.6):(overview?ref.width/ref.height:frame[2]/frame[3]);
  const boundedZoom=Math.max(100,Math.min(300,Number.isFinite(zoom)?zoom:100));
  const boardWidth=Math.max(120,Math.min(size.width-56,(size.height-56)*ratio))*boundedZoom/100;
  const legacyCount=markers.filter(m=>m.map===map.id&&m.floor===currentFloor&&(m.surface??'personal')==='personal').length;
  const canMark=!overview&&(schematic||!imageFailed);
  const selectedMarker=current.find(m=>m.id===activeId);
  const term=query.trim().toLowerCase();
  const mapQuery=new URLSearchParams(location.hash.split('?')[1]).get('map');
  const desiredMap=mapQuery&&MAPS.some(m=>m.id===mapQuery)?mapQuery:session.map;
  const visibleCount=MAPS.filter(m=>(m.name+' '+m.setting+' '+m.type).toLowerCase().includes(term)).length;

  useEffect(()=>{
    if(selected!==desiredMap){setSelected(desiredMap);setFloor('');setZoom(100);}
  },[desiredMap]);

  useEffect(()=>{
    const id=++generation.current;
    setImage(null);
    getFloorImage(key).then(value=>{if(id===generation.current)setImage(value??null);}).catch(e=>{if(id===generation.current)notice(e.message);});
    return()=>{generation.current++;};
  },[key,notice]);
  useEffect(()=>{
    if(!localImage){setImageUrl('');return;}
    const url=URL.createObjectURL(localImage.blob);setImageUrl(url);
    return()=>URL.revokeObjectURL(url);
  },[localImage]);
  useEffect(()=>{
    const node=viewport.current;if(!node)return;
    const observer=new ResizeObserver(entries=>{const r=entries[0].contentRect;setSize({width:r.width,height:r.height});});
    observer.observe(node);return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    setImageFailed(false);setActiveId('');
    viewport.current?.scrollTo(0,0);
  },[key,view,variant,overview,display]);
  useEffect(()=>setRoomId(''),[key,view,variant]);
  useEffect(()=>{
    if(!expanded)return;
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setExpanded(false);};
    window.addEventListener('keydown',escape);
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',escape);};
  },[expanded]);

  function update(next:AtlasMarker[]) {
    if(next.length>300){notice('The atlas holds up to 300 markers. Export and remove unused markers first.');return;}
    setMarkers(next);
    if(!writeValue('map-markers',next))notice('Markers remain in this tab but could not be saved. Export a backup before closing.');
  }
  function add(x:number,y:number) {
    const name=label.trim();if(!name){notice('Give the marker a label first.');return;}
    if(!canMark)return;
    const marker:AtlasMarker={id:crypto.randomUUID(),map:map.id,floor:currentFloor,label:name.slice(0,60),x:clamp(x),y:clamp(y),kind,surface:view,
      ...(!personal&&map.id==='sunny-restricted'?{variant:currentVariant}:{})};
    update([...markers,marker]);setActiveId(marker.id);setShowMarkers(true);
  }
  function selectRoom(id:string) {
    const room=plan?.rooms.find(r=>r.id===id);setRoomId(room?.id??'');
    if(room)setLabel((MARKER_TOOLS.find(t=>t.id===kind)!.label+' · '+roomName(room)).slice(0,60));
  }
  function addOnBoard(x:number,y:number) {const point=schematic?convertPoint([x,y],frame,canonical):[x,y];add(point[0],point[1]);}
  function finishPan(e:PointerEvent<HTMLDivElement>) {
    const wasPan=drag.current;drag.current=null;
    if(!wasPan||dragged.current||!schematic||!plan||!board.current)return;
    const rect=board.current.getBoundingClientRect();
    const point:[number,number]=[frame[0]+(e.clientX-rect.left)/rect.width*frame[2],frame[1]+(e.clientY-rect.top)/rect.height*frame[3]];
    selectRoom(plan.rooms.find(r=>containsPoint(point,r.points))?.id??'');
  }
  function chooseMap(id:string) {
    setSelected(id);setFloor('');setZoom(100);setOverview(false);setLocationsOpen(false);setSession({...session,map:id});
    if(mapQuery)route('maps');
  }
  function chooseFloor(value:string) {setFloor(value);setZoom(100);setOverview(false);}
  function chooseTool(value:typeof MARKER_TOOLS[number]) {setKind(value.id);setLabel(activeRoom?(value.label+' · '+roomName(activeRoom)).slice(0,60):value.label);setTool('mark');setOverview(false);setShowMarkers(true);}
  function startPan(e:PointerEvent<HTMLDivElement>) {
    dragged.current=false;
    if(tool!=='pan'||e.button!==0||(e.target as HTMLElement).closest('button'))return;
    drag.current={x:e.clientX,y:e.clientY,left:e.currentTarget.scrollLeft,top:e.currentTarget.scrollTop,pointer:e.pointerId};
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function movePan(e:PointerEvent<HTMLDivElement>) {
    const start=drag.current;if(!start||start.pointer!==e.pointerId)return;
    const dx=e.clientX-start.x,dy=e.clientY-start.y;
    if(Math.abs(dx)+Math.abs(dy)>4)dragged.current=true;
    e.currentTarget.scrollLeft=start.left-dx;e.currentTarget.scrollTop=start.top-dy;
  }
  async function loadImage(file:File) {
    const captured=key,id=generation.current;setBusy(true);
    try {
      if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>8*1024*1024)throw new Error('Choose a PNG, JPEG or WebP image smaller than 8 MB.');
      const bitmap=await createImageBitmap(file),width=bitmap.width,height=bitmap.height;bitmap.close();
      if(width*height>24000000||width<100||height<100)throw new Error('Use an image between 100 pixels per side and 24 megapixels.');
      const value={key:captured,blob:file,name:file.name.slice(0,160),width,height};await putFloorImage(value);
      if(id===generation.current){setImage(value);setImageFailed(false);setView('personal');setOverview(false);setZoom(100);}
      notice('Floor image saved on this device. Your existing personal markers are kept.');
    }catch(e){notice((e as Error).message);}finally{setBusy(false);}
  }
  async function importMarkers(file:File) {
    try{if(file.size>200000)throw Error('File is too large.');setPending(parseMarkerImport(JSON.parse(await file.text())));}
    catch{notice('This is not a valid Ghost Hub marker export. Nothing was changed.');}
  }

  return <div className={'atlas-v2 atlas-operations'+(expanded?' atlas-expanded':'')} data-display={display==='colour'?'colour':'monitor'} data-schematic={schematic}>
    <MonitorFilter/>
    <header className="atlas-heading">
      <div><h1>Map atlas</h1><p>Location plans & investigation notes</p></div>
      <div className="atlas-heading-actions"><span className="atlas-local-status"><Check size={14}/>Notes saved on this device</span><button className="button" onClick={()=>setExpanded(!expanded)} aria-label={expanded?'Close expanded atlas':'Expand atlas'}>{expanded?<Minimize2 size={16}/>:<Maximize2 size={16}/>}<span>{expanded?'Close':'Expand'}</span></button></div>
    </header>
    <div className="atlas-workspace">
      <aside className={'atlas-directory'+(locationsOpen?' is-open':'')} aria-label="Locations">
        <button className="atlas-mobile-select" onClick={()=>setLocationsOpen(!locationsOpen)} aria-expanded={locationsOpen}><MapIcon size={18}/><span>{map.name}</span><ChevronRight size={17}/></button>
        <div className="atlas-directory-content">
          <div className="atlas-directory-head"><div><strong>Locations</strong><span>{MAPS.length}</span></div><label className="atlas-search"><Search size={16}/><input id="atlas-search" aria-label="Find a location" placeholder="Search locations…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Clear location search" onClick={()=>setQuery('')}><X size={14}/></button>}</label></div>
          <div className="atlas-location-scroll">{GROUPS.map(group=>{
            const entries=group.ids.map(id=>MAPS.find(m=>m.id===id)!).filter(m=>(m.name+' '+m.setting+' '+m.type).toLowerCase().includes(term));
            return entries.length>0&&<section className="atlas-location-group" key={group.label}><h2>{group.label}</h2>{entries.map(m=><button className={'atlas-location '+(m.id===map.id?'selected':'')} aria-pressed={m.id===map.id} key={m.id} onClick={()=>chooseMap(m.id)}><span className="atlas-location-thumb"><img src={ATLAS_REFERENCES[m.id].image} alt="" loading="lazy"/></span><span><strong>{m.name}</strong><small>{m.type} · {atlasFloors(m.id).length} {atlasFloors(m.id).length===1?'view':'views'}</small></span>{m.id===map.id&&<ChevronRight size={15}/>}</button>)}</section>;
          })}{visibleCount===0&&<div className="atlas-no-results"><Search size={22}/><strong>No locations found</strong><p>Try a name, setting or map size.</p><button className="text-link" onClick={()=>setQuery('')}>Clear search</button></div>}</div>
          <div className="atlas-directory-foot"><MapPin size={14}/><span>Reference maps by <a href="https://imgur.com/a/iEI0tJo" target="_blank" rel="noreferrer">Fantismal <ArrowUpRight size={12}/></a></span></div>
        </div>
      </aside>
      <section className="atlas-map-section" aria-label={map.name+' map workspace'}>
        <div className="atlas-map-header"><div><div className="atlas-map-kicker"><span className="atlas-size">{map.type}</span><span>{map.setting}</span></div><h2>{map.name}</h2></div><span className="atlas-sheet-id"><strong>{String(floors.length).padStart(2,'0')}</strong>{floors.length===1?'LEVEL / VIEW':'LEVELS / VIEWS'}</span></div>
        <div className="atlas-floorbar"><div className="atlas-floors" aria-label="Map floor">{floors.length>5?<label className="atlas-floor-select"><Layers size={15}/><select aria-label="Select floor" value={currentFloor} onChange={e=>chooseFloor(e.target.value)}>{floors.map(f=><option key={f}>{f}</option>)}</select></label>:floors.map((f,i)=><button key={f} className={f===currentFloor&&!overview?'selected':''} aria-pressed={f===currentFloor&&!overview} onClick={()=>chooseFloor(f)}><span>{f==='Basement'?'B':String(i)}</span>{f}</button>)}</div><button className={'atlas-overview '+(overview?'selected':'')} aria-pressed={overview} disabled={personal} onClick={()=>{setOverview(!overview);setZoom(100);}}><Layers size={15}/>Full sheet</button></div>
        {map.id==='sunny-restricted'&&<div className="atlas-variant"><label htmlFor="atlas-wing">Available wing</label><select id="atlas-wing" value={currentVariant} onChange={e=>{setVariant(e.target.value);setZoom(100);}}>{Object.keys(SUNNY_VARIANTS).map(name=><option key={name}>{name}</option>)}</select></div>}
        {ref.notice&&!personal&&<div className="atlas-reference-warning"><Layers size={15}/><span>{ref.notice} <a href={'https://phasmophobia.fandom.com/wiki/'+map.wiki} target="_blank" rel="noreferrer">Current reference ↗</a></span></div>}
        <div className="atlas-toolbar"><div className="atlas-toolstrip"><button className={tool==='pan'?'active':''} aria-pressed={tool==='pan'} aria-label="Pan map" title="Pan map" onClick={()=>setTool('pan')}><Hand size={17}/></button><span/>{MARKER_TOOLS.map(item=><button key={item.id} className={'atlas-marker-tool kind-'+item.id+(tool==='mark'&&kind===item.id?' active':'')} aria-pressed={tool==='mark'&&kind===item.id} aria-label={'Place '+item.label.toLowerCase()} title={item.label} onClick={()=>chooseTool(item)}><item.icon size={17}/></button>)}</div><div className="atlas-zoom"><button className="icon-button" aria-label="Zoom map out" disabled={boundedZoom<=100} onClick={()=>setZoom(Math.max(100,boundedZoom-25))}><Minus size={17}/></button><output aria-label="Map zoom">{boundedZoom}%</output><button className="icon-button" aria-label="Zoom map in" disabled={boundedZoom>=300} onClick={()=>setZoom(Math.min(300,boundedZoom+25))}><Plus size={17}/></button><button className="icon-button" aria-label="Fit map to view" title="Fit map to view" onClick={()=>{setZoom(100);viewport.current?.scrollTo(0,0);}}><RotateCcw size={15}/></button></div></div>
        <div className="atlas-monitorbar"><div><span>{personal?'PERSONAL BOARD':schematic?'ROOM SCHEMATIC':'SITE MAP'}</span><span>{overview?'FULL REFERENCE':currentFloor}</span></div>{!personal&&!overview&&<div className="atlas-display-switch" role="group" aria-label="Reference display"><button aria-pressed={display!=='colour'} onClick={()=>{setDisplay('monitor');setZoom(100);}}>{plan?'Schematic':'Monitor'}</button><button aria-pressed={display==='colour'} onClick={()=>{setDisplay('colour');setZoom(100);}}>Original colour</button></div>}{!personal&&overview&&<span className="atlas-original-caption">Original colour reference</span>}</div>
        <div ref={viewport} className={'atlas-viewport '+(tool==='pan'?'pan-mode':'mark-mode')+(overview?' is-overview':'')} tabIndex={0} role="group" aria-label={map.name+' '+currentFloor+' floorplan. Use zoom controls, or arrow keys to pan.'} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={finishPan} onPointerCancel={()=>{drag.current=null;}} onKeyDown={e=>{const offsets:Record<string,[number,number]>={ArrowLeft:[-60,0],ArrowRight:[60,0],ArrowUp:[0,-60],ArrowDown:[0,60]};if(e.target===e.currentTarget&&offsets[e.key]){e.preventDefault();e.currentTarget.scrollBy(...offsets[e.key]);}}}>
          <div className="atlas-pan-space" style={{minWidth:boardWidth+56,minHeight:boardWidth/ratio+56}}>
            <div ref={board} className={'atlas-board '+(personal&&!imageUrl?'personal-blank':'')} style={{width:boardWidth,height:boardWidth/ratio}} onClick={e=>{if(tool!=='mark'||dragged.current||!canMark)return;const r=e.currentTarget.getBoundingClientRect();addOnBoard((e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100);}}>
              {schematic?<AtlasFloorPlan plan={plan} frame={frame} width={boardWidth} location={map.name} floor={currentFloor} selected={roomId} labels={roomLabels} onSelect={selectRoom}/>:personal?(imageUrl&&localImage?<img src={imageUrl} alt={map.name+' '+currentFloor+' floor image supplied by you'} draggable={false} onError={()=>setImageFailed(true)}/>:<div className="atlas-personal-empty"><ImagePlus size={32}/><h3>Your own floor image</h3><p>Upload a screenshot, or place notes on this freeform board.</p><span>Not a floorplan</span></div>):<div className="atlas-floor-crop" style={!overview&&map.id==='point-hope'&&currentFloor==='Floor 10'?{clipPath:'polygon(0 0, 90% 0, 90% 32%, 100% 32%, 100% 100%, 0 100%)'}:undefined}><img key={ref.image} src={ref.image} style={overview?undefined:cropStyle(crop)} alt={map.name+' '+(overview?'complete reference sheet':currentFloor+' floorplan')+' by Fantismal'} draggable={false} onError={()=>setImageFailed(true)}/></div>}
              {imageFailed&&!schematic&&<div className="atlas-image-error"><MapIcon size={28}/><h3>This floor image could not load</h3><a className="button" href={ref.source} target="_blank" rel="noreferrer">Open source map<ArrowUpRight size={15}/></a></div>}
              {showMarkers&&!overview&&current.map((m,i)=>{const Icon=MARKER_TOOLS.find(t=>t.id===(m.kind??'note'))!.icon;const pos=schematic?convertPoint([m.x,m.y],canonical,frame):[m.x,m.y];return <button key={m.id} className={'atlas-pin kind-'+(m.kind??'note')+(m.id===activeId?' active':'')} style={{left:pos[0]+'%',top:pos[1]+'%'}} title={m.label} aria-label={'Marker '+(i+1)+': '+m.label} onClick={e=>{e.stopPropagation();setActiveId(m.id);}}><Icon size={17}/><span>{i+1}</span></button>;})}
            </div>
          </div>
        </div>
        {schematic&&<div className="atlas-plan-legend"><span><i className="wall-key"/>Walls</span><span><i className="entry-key"/>Entrance</span><span><i className="stair-key"/>Stairs</span><button aria-pressed={roomLabels} onClick={()=>setRoomLabels(!roomLabels)}><Eye size={13}/>{roomLabels?'Hide room labels':'Show room labels'}</button></div>}
        <div className="atlas-canvas-footer"><span>{overview?'Complete reference sheet · choose a floor to place markers':tool==='pan'?<><Hand size={13}/>{schematic?'Select a room · drag to pan · zoom for detail':'Drag to pan · zoom for room detail'}</>:<><MapPin size={13}/>Click the map to place “{label.trim()||'your marker'}”</>}</span><span><i className={personal?'personal-dot':''}/>{personal?'Personal board':`Reference · ${ref.date}`}</span></div>
        <div className="atlas-source-strip"><span>{personal?(localImage?localImage.name:'Your observations · saved on this device'):<><a href={ref.source} target="_blank" rel="noreferrer">Map by Fantismal <ArrowUpRight size={12}/></a><span>v{ref.version}</span></>}</span><a href={'https://phasmophobia.fandom.com/wiki/'+map.wiki} target="_blank" rel="noreferrer">Location guide<ArrowUpRight size={13}/></a></div>
      </section>
      <aside className="atlas-inspector" aria-label="Investigation markers">
        <div className="atlas-inspector-title"><span className="eyebrow">INVESTIGATION</span><h2>Field notes</h2><p>Record what you confirm on site.</p></div>
        {plan&&!personal&&!overview&&<section className="atlas-room-inspector"><div className="atlas-room-inspector-head"><span>ROOM DIRECTORY</span><span>{plan.rooms.length.toString().padStart(2,'0')}</span></div><label className="atlas-room-select"><span className="sr-only">Select a room</span><select aria-label="Select a room" value={roomId} onChange={e=>selectRoom(e.target.value)}><option value="">Select a room on the plan</option>{plan.rooms.map((room,i)=><option key={room.id} value={room.id}>{String(i+1).padStart(2,'0')} / {roomName(room)}</option>)}</select></label>{activeRoom?<div className="atlas-room-detail"><span>{currentFloor}</span><strong>{roomName(activeRoom)}</strong><button className="button" disabled={!canMark} onClick={()=>{const point=convertPoint([activeRoom.label[0],activeRoom.label[1]],[0,0,100,100],canonical);add(point[0],point[1]);}}><Plus size={14}/>Mark this room</button></div>:<p>Inspect a room, then place an observation.</p>}</section>}
        <div className="atlas-view-switch" aria-label="Map background"><button className={!personal?'selected':''} aria-pressed={!personal} onClick={()=>{setView('reference');setOverview(false);setZoom(100);}}>Reference map</button><button className={personal?'selected':''} aria-pressed={personal} onClick={()=>{setView('personal');setOverview(false);setZoom(100);}}>My board{legacyCount>0&&<span>{legacyCount}</span>}</button></div>
        <div className="atlas-marker-types">{MARKER_TOOLS.map(item=><button key={item.id} className={'kind-'+item.id+(kind===item.id?' selected':'')} aria-pressed={kind===item.id} onClick={()=>chooseTool(item)}><item.icon size={16}/><span>{item.label}</span>{kind===item.id&&<Check size={13}/>}</button>)}</div>
        <label className="atlas-marker-label">Marker label<input value={label} maxLength={60} onChange={e=>setLabel(e.target.value)}/></label>
        <button className="button atlas-add" disabled={!canMark||!label.trim()} onClick={()=>addOnBoard(50,50)}><Plus size={16}/>Add at centre</button>
        <section className="atlas-floor-notes"><div className="atlas-notes-heading"><h3>On this floor <span>{current.length}</span></h3><button className="icon-button" aria-label={showMarkers?'Hide markers':'Show markers'} aria-pressed={showMarkers} onClick={()=>setShowMarkers(!showMarkers)}><Eye size={16}/></button></div>
          {current.length===0?<p className="atlas-no-markers">No observations recorded.<br/>Select a tool and mark the map.</p>:<div className="atlas-marker-list">{current.map((m,i)=><div className={'atlas-note '+(m.id===activeId?'active':'')} key={m.id}><button className="atlas-note-select" onClick={()=>setActiveId(m.id===activeId?'':m.id)}><span className={'atlas-note-number kind-'+(m.kind??'note')}>{i+1}</span><span>{m.label}</span></button><button className="icon-button" aria-label={'Remove '+m.label} onClick={()=>update(markers.filter(x=>x.id!==m.id))}><Trash2 size={14}/></button></div>)}</div>}
          {selectedMarker&&<div className="atlas-marker-editor"><label>Selected marker<input aria-label="Rename selected marker" maxLength={60} value={selectedMarker.label} onChange={e=>{if(e.target.value.trim())update(markers.map(m=>m.id===activeId?{...m,label:e.target.value}:m));}}/></label><div>{(['x','y'] as const).map(axis=><label key={axis}>{axis.toUpperCase()} %<input type="number" aria-label={selectedMarker.label+(axis==='x'?' horizontal position':' vertical position')} min={0} max={100} value={Math.round(selectedMarker[axis])} onChange={e=>update(markers.map(m=>m.id===activeId?{...m,[axis]:clamp(Number(e.target.value))}:m))}/></label>)}</div></div>}
        </section>
        <div className="atlas-field-tip"><Shield size={16}/><div><strong>Verify on site</strong><p>Hiding places and breaker spawns can vary between contracts.</p></div></div>
        <details className="atlas-manage"><summary>Images & backups<ChevronRight size={15}/></summary><div className="atlas-manage-actions"><button className="button" disabled={busy} onClick={()=>upload.current?.click()}><Upload size={15}/>{busy?'Saving image…':'Use my floor image'}</button>{localImage&&<button className="text-link" disabled={busy} onClick={async()=>{const id=generation.current;try{await removeFloorImage(key);if(id===generation.current)setImage(null);notice('Floor image removed. Personal markers retained.');}catch(e){notice((e as Error).message);}}}>Remove my image</button>}<button className="button" onClick={()=>downloadJson('ghost-hub-map-markers.json',{format:'ghost-hub-map-markers-v2',markers})}><Download size={15}/>Export all markers</button><button className="button" onClick={()=>importFile.current?.click()}><Upload size={15}/>Import markers</button><p>Exports include all markers, including your previous boards. Uploaded images stay on this device.</p></div></details>
        <input ref={upload} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files?.[0];if(file)void loadImage(file);e.target.value='';}}/>
        <input ref={importFile} type="file" hidden accept="application/json,.json" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void importMarkers(file);}}/>
        {pending&&<Notice>Import {pending.length} markers? This replaces your current markers and keeps your floor images.<div className="button-row"><button className="button" onClick={()=>{update(pending);setPending(null);notice('Map markers imported.');}}>Replace all markers</button><button className="button" onClick={()=>setPending(null)}>Cancel</button></div></Notice>}
      </aside>
    </div>
    <footer className="atlas-bottom-note"><MapIcon size={15}/><span>{schematic?'Simplified room schematic based on':'Community reference by'} <a href="https://imgur.com/a/iEI0tJo" target="_blank" rel="noreferrer">Fantismal</a>. Use Original colour for room restrictions and item spawns.</span></footer>
  </div>;
}
