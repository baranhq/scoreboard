"use client";
import {useEffect,useState,type CSSProperties} from 'react';
import {Pause,Play,RotateCcw,PauseCircle,SkipForward} from 'lucide-react';
import {type GameTimer,remainingTime,timeoutTime,formatTime,pausedTimer,resetTimer,isGamePaused,timerRefreshDelay} from '@/lib/timer';
import type {Messages} from '@/lib/i18n';
import {Button,Modal} from '../ui/ui';
export function TimerDisplay({timer,t,change,full,controlsVisible,textScale}:{timer:GameTimer;t:Messages;change:(timer:GameTimer)=>void;full:boolean;controlsVisible:boolean;textScale:number}){
 const [now,setNow]=useState(()=>Date.now());const [ended,setEnded]=useState(false);const inTimeout=!!timer.timeoutActive;
 const left=inTimeout?timeoutTime(timer,now):remainingTime(timer,now);const started=inTimeout?timer.timeoutStartedAt:timer.startedAt;const showHours=timer.showHours!==false;
 const paused=isGamePaused(timer);const nextPeriod=!inTimeout&&timer.mode!=='stopwatch'&&left===0&&(timer.period||1)<(timer.periodCount||1);
 useEffect(()=>{
  const initial=Date.now();setNow(initial);
  let timeoutId:number|undefined;
  const refresh=()=>{const current=Date.now();setNow(current);const delay=timerRefreshDelay(timer,current);if(delay!==undefined)timeoutId=window.setTimeout(refresh,delay);};
  const delay=timerRefreshDelay(timer,initial);
  if(delay!==undefined)timeoutId=window.setTimeout(refresh,delay);
  const resume=()=>{if(document.visibilityState==='visible'){if(timeoutId!==undefined)window.clearTimeout(timeoutId);refresh();}};
  document.addEventListener('visibilitychange',resume);
  return()=>{if(timeoutId!==undefined)window.clearTimeout(timeoutId);document.removeEventListener('visibilitychange',resume);};
 },[timer.mode,timer.startedAt,timer.remainingMs,timer.timeoutActive,timer.timeoutStartedAt,timer.timeoutRemainingMs,timer.trackPausedTime,timer.pausedAt]);
 useEffect(()=>{if(left!==0||started==null||!inTimeout&&timer.mode==='stopwatch')return;setEnded(true);if(inTimeout)change({...timer,timeoutRemainingMs:0,timeoutStartedAt:null});else change({...timer,remainingMs:0,startedAt:null,pausedAt:Date.now()});},[left,started,inTimeout,timer,change]);
 const toggle=()=>{const current=Date.now();if(inTimeout)change({...timer,timeoutRemainingMs:timeoutTime(timer,current)||timer.timeoutMs||60000,timeoutStartedAt:started==null?current:null});else if(timer.startedAt!==null)change(pausedTimer(timer,current));else change({...timer,remainingMs:timer.mode==='stopwatch'?timer.remainingMs:remainingTime(timer,current)||timer.durationMs,startedAt:current,pausedAt:null});};
 const timeout=()=>{const current=Date.now();if(inTimeout)change({...timer,timeoutActive:false,timeoutStartedAt:null,startedAt:timer.resumeAfterTimeout?current:null,pausedAt:timer.resumeAfterTimeout?null:timer.pausedAt});else change({...pausedTimer(timer,current),timeoutActive:true,timeoutRemainingMs:timer.timeoutMs||60000,timeoutStartedAt:current,resumeAfterTimeout:timer.startedAt!==null});setEnded(false);};
 const advance=()=>{change({...timer,period:(timer.period||1)+1,remainingMs:timer.durationMs,startedAt:null,pausedAt:null});setEnded(false);};
 return <>
  <div style={{"--display-text-scale":textScale/100} as CSSProperties} className={`mb-3 grid grid-cols-1 items-center gap-x-3 gap-y-2 text-center sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] ${full?'min-h-14':''}`}>
   {inTimeout?<div className="min-w-0 text-center sm:text-left"><p className={`font-semibold ${full?'text-[calc(clamp(1.25rem,2.5vh,2rem)*var(--display-text-scale))]':'text-[calc(1rem*var(--display-text-scale))]'}`}>{t.timeout}</p><span role="timer" aria-label={t.timeout} className="font-display text-[calc(1.5rem*var(--display-text-scale))] font-bold tabular-nums">{formatTime(timeoutTime(timer,now),showHours)}</span></div>:timer.trackPausedTime&&paused&&timer.pausedAt!=null?<div className="min-w-0 text-[calc(1rem*var(--display-text-scale))] font-medium text-center sm:text-left">{t.pausedFor} <strong className="ml-2 font-display text-[calc(1.25rem*var(--display-text-scale))] tabular-nums">{formatTime(Math.max(0,now-timer.pausedAt),showHours)}</strong></div>:null}
   <div className="min-w-0 text-center sm:col-start-2">{(timer.periodCount||1)>1&&<p className={`font-medium ${full?'text-[calc(clamp(1.25rem,2.5vh,2rem)*var(--display-text-scale))]':'text-[calc(1rem*var(--display-text-scale))]'}`}>{t.period} {timer.period||1}/{timer.periodCount}</p>}<span role="timer" aria-label={t.timer} className={`font-display font-bold tabular-nums ${full?'text-[calc(clamp(2.75rem,6vh,5rem)*var(--display-text-scale))]':'text-[calc(1.875rem*var(--display-text-scale))]'}`}>{formatTime(remainingTime(timer,now),showHours)}</span></div>
   <div data-fullscreen-control className={`col-start-1 flex flex-wrap justify-end gap-1 transition-opacity duration-150 motion-reduce:transition-none sm:col-start-3 ${full?'translate-y-3':''} ${full&&!controlsVisible?'pointer-events-none opacity-0':'opacity-100'}`}>
     <Button aria-label={started==null?t.startTimer:t.pauseTimer} onClick={toggle}>{started==null?<Play aria-hidden="true" className="h-5 w-5"/>:<Pause aria-hidden="true" className="h-5 w-5"/>}</Button>
     <Button aria-label={t.resetTimer} onClick={()=>{change(resetTimer(timer));setEnded(false);}}><RotateCcw aria-hidden="true" className="h-5 w-5"/></Button>
     {(timer.timeoutMs||0)>0&&<Button aria-label={inTimeout?t.resumeGame:t.timeout} onClick={timeout}><PauseCircle aria-hidden="true" className="h-5 w-5"/></Button>}
     {nextPeriod&&<Button aria-label={t.nextPeriod} onClick={advance}><SkipForward aria-hidden="true" className="h-5 w-5"/></Button>}
    </div>
   </div>
  {ended&&<Modal title={t.timeUp} close={()=>setEnded(false)} closeLabel={t.close}><div className="flex flex-wrap justify-end gap-2">{inTimeout&&<Button primary onClick={timeout}>{t.resumeGame}</Button>}{nextPeriod&&<Button primary onClick={advance}>{t.nextPeriod}</Button>}<Button onClick={()=>setEnded(false)}>{t.close}</Button></div></Modal>}
 </>;
}
