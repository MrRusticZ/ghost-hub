import {type Frame,type PlanFloor,roomName} from './atlasPlans';

type Props={plan:PlanFloor;frame:Frame;width:number;location:string;floor:string;selected:string;labels:boolean;onSelect:(id:string)=>void};
export function AtlasFloorPlan({plan,frame,width,location,floor,selected,labels,onSelect}:Props){
  const scale=width/frame[2],textSize=Math.max(11.5,11/scale),smallTextSize=Math.max(9,8.5/scale),lineHeight=Math.max(12,12/scale),codeSize=Math.max(8,8/scale);
  return <svg className="atlas-vector-plan" viewBox={frame.join(' ')} role="group" aria-label={location+' '+floor+' room schematic'}>
    <defs>
      <pattern id="atlas-stair-treads" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 0H7" stroke="#8ca49c" strokeWidth=".8"/></pattern>
      <pattern id="atlas-stair-treads-horizontal" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 0V7" stroke="#8ca49c" strokeWidth=".8"/></pattern>
    </defs>
    <g className="atlas-plan-rooms">{plan.rooms.map(room=><g key={room.id} className={'atlas-plan-room'+(selected===room.id?' selected':'')} data-room-id={room.id} role="button" tabIndex={0} aria-label={'Select '+roomName(room)} aria-pressed={selected===room.id} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onSelect(room.id);}}}>
      <title>{roomName(room)}</title>
      <polygon points={room.points.map(p=>p.join(',')).join(' ')} className="atlas-room-fill"/>
    </g>)}</g>
    <g className="atlas-plan-openings" aria-hidden="true">{plan.openings.map(([x,y,w,h],i)=><rect key={i} x={x} y={y} width={w} height={h}/>)}</g>
    <g className="atlas-plan-stairs" role="img" aria-label="Staircases">{plan.stairs.map(([x,y,w,h],i)=><g key={i}><rect x={x} y={y} width={w} height={h} className="atlas-stair-base"/><rect x={x} y={y} width={w} height={h} fill={`url(#atlas-stair-treads${w>h?'-horizontal':''})`}/></g>)}</g>
    <g className="atlas-plan-entries" role="img" aria-label="Entrance">{plan.entries.map(([x,y,w,h],i)=><g key={i}><rect x={x} y={y} width={w} height={h}/><text x={x+w/2} y={y+17}>ENTRY</text></g>)}</g>
    <g className="atlas-plan-partitions" aria-hidden="true">{plan.partitions.map(([x,y,w,h],i)=><line key={i} x1={x} y1={y} x2={x+w} y2={y+h}/>)}</g>
    {labels&&<g aria-hidden="true">{plan.rooms.map((room,index)=><g key={room.id} className={'atlas-plan-label'+(room.compact?' compact':'')} transform={`translate(${room.label[0]} ${room.label[1]})`}>
      <text className="atlas-room-code" style={{fontSize:codeSize}} y={room.compact&&scale<.85?3/scale:-room.lines.length*lineHeight/2-5}>{String(index+1).padStart(2,'0')}</text>
      {(!room.compact||scale>=.85)&&<text className="atlas-room-name" style={{fontSize:room.compact?smallTextSize:textSize}}>{room.lines.map((line,n)=><tspan key={n} x="0" y={n*lineHeight-(room.lines.length-1)*lineHeight/2+5}>{line}</tspan>)}</text>}
    </g>)}</g>}
  </svg>;
}
