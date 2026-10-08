import {BookOpen,ChevronDown,Ghost,Map,NotebookPen,Pause,Play,RotateCcw,Timer} from 'lucide-react';
import {useChapterState} from './chapterState';
import {Link,useHub} from './context';
import {useTimer} from './TimerState';
import './field-desk.css';

const shortcuts = [
  {to:'evidence',label:'Evidence',icon:BookOpen},
  {to:'detective',label:'Detective',icon:Ghost},
  {to:'maps',label:'Maps',icon:Map},
  {to:'tools',label:'Tools',icon:Timer},
  {to:'journal',label:'Notes',icon:NotebookPen},
];
const clock = (seconds:number) => `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;

export function InvestigationNavigation({section}:{section:string}) {
  const {timer,left} = useTimer();
  const activeTimer = Boolean(timer.endsAt) || timer.finished || timer.remaining < timer.duration;
  return <nav className="investigation-shortcuts" aria-label="Investigation shortcuts">
    <span className="shortcut-caption">YOUR CASE</span>
    {shortcuts.map(({to,label,icon:Icon}) => <Link key={to} to={to} aria-current={section===to?'page':undefined}>
      <Icon size={18}/><span>{label}</span>
      {to==='tools' && activeTimer && <small aria-label={`Timer ${timer.finished?'complete':timer.endsAt?'running':'paused'}: ${clock(left)}`}>{clock(left)}</small>}
    </Link>)}
  </nav>;
}

/** A compact view over the existing timer and case; no separate notes or clock. */
export function FieldDesk() {
  const {session,setSession} = useHub();
  const {timer,setTimer,left,start} = useTimer();
  const [open,setOpen] = useChapterState('FieldDesk-open',false);
  const running = Boolean(timer.endsAt);
  const status = running?'Running':timer.finished?'Complete':timer.remaining<timer.duration?'Paused':'Ready';
  const setDuration = (seconds:number) => setTimer({duration:seconds,remaining:seconds,endsAt:null,finished:false,label:'Investigation timer'});
  return <section className={'field-desk '+(open?'is-open':'')} aria-label="Match tools">
    <div className="field-desk-summary">
      <button className="field-desk-toggle" aria-expanded={open} aria-controls="field-desk-panel" onClick={()=>setOpen(!open)}>
        <span className="field-desk-icon"><Timer size={20}/></span>
        <span><strong>Timer & quick notes</strong><small>Keep your case in view</small></span>
        <ChevronDown size={17}/>
      </button>
      <div className="field-clock">
        <div><span className="field-clock-value" role="timer" aria-label={`${left} seconds remaining`}>{clock(left)}</span><small>{status}</small></div>
        <button className="button primary" aria-label={running?'Pause investigation timer':'Start investigation timer'} onClick={running?()=>setTimer({...timer,remaining:left,endsAt:null}):()=>start()}>
          {running?<Pause size={17}/>:<Play size={17}/>}<span>{running?'Pause':'Start'}</span>
        </button>
      </div>
    </div>
    {open && <div id="field-desk-panel" className="field-desk-panel">
      <div className="field-timer-options">
        <h2>Investigation timer</h2>
        <p>{timer.label??'Investigation timer'} · continues across pages.</p>
        <div className="field-presets" aria-label="Timer duration">
          {[60,90,180].map(seconds=><button key={seconds} className="chip" disabled={running} aria-pressed={timer.duration===seconds} onClick={()=>setDuration(seconds)}>{seconds} sec</button>)}
          <button className="icon-button" aria-label="Reset investigation timer" onClick={()=>setDuration(timer.duration)}><RotateCcw size={18}/></button>
        </div>
        <p className="small muted">{running?'Pause to change the duration.':'Choose a duration, then start when you need it.'}</p>
        <Link to="tools" className="text-link">Custom timer & footstep rhythm</Link>
      </div>
      <div className="field-quick-notes">
        <label htmlFor="field-quick-notes">Quick case notes</label>
        <textarea id="field-quick-notes" rows={3} maxLength={12000} value={session.notes} placeholder="Room, escape route, something to test…" onChange={e=>setSession({...session,notes:e.target.value})}/>
        <div><span className="small muted">Shared with your field journal.</span><Link to="journal" className="text-link">Open journal</Link></div>
      </div>
    </div>}
  </section>;
}
