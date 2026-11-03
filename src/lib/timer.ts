export type GameTimer={enabled:boolean;durationMs:number;remainingMs:number;startedAt:number|null;mode?:'countdown'|'stopwatch';trackPausedTime?:boolean;showHours?:boolean;pausedAt?:number|null;periodCount?:number;period?:number;timeoutMs?:number;timeoutActive?:boolean;timeoutRemainingMs?:number;timeoutStartedAt?:number|null;resumeAfterTimeout?:boolean};
export const MAX_TIMER_DURATION_MS=7*24*60*60*1000;
export function durationFromParts(parts:readonly [string,string,string],max=MAX_TIMER_DURATION_MS):number|undefined {
 if(!parts.every((value,index)=>new RegExp(`^\\d{0,${index===0?3:2}}$`).test(value)))return;
 const [hours,minutes,seconds]=parts.map(value=>Number(value||0));const duration=(hours*3600+minutes*60+seconds)*1000;
 return Number.isSafeInteger(duration)&&duration>=1000&&duration<=max?duration:undefined;
}
export const defaultTimer:GameTimer={enabled:false,durationMs:300000,remainingMs:300000,startedAt:null,mode:'countdown',trackPausedTime:false,showHours:true,pausedAt:null,periodCount:1,period:1,timeoutMs:0};
export function remainingTime(timer:GameTimer,now=Date.now()):number{const elapsed=timer.startedAt===null?0:Math.max(0,now-timer.startedAt);return timer.mode==='stopwatch'?timer.remainingMs+elapsed:Math.max(0,timer.remainingMs-elapsed);}
export function timeoutTime(timer:GameTimer,now=Date.now()):number{return Math.max(0,(timer.timeoutRemainingMs??timer.timeoutMs??0)-(timer.timeoutStartedAt==null?0:Math.max(0,now-timer.timeoutStartedAt)));}
export function pausedTimer(timer:GameTimer,now=Date.now()):GameTimer{return {...timer,remainingMs:remainingTime(timer,now),startedAt:null,pausedAt:timer.startedAt!==null?now:timer.pausedAt??null,timeoutRemainingMs:timeoutTime(timer,now),timeoutStartedAt:null};}
export function resetTimer(timer:GameTimer,enabled=timer.enabled):GameTimer{return {...timer,enabled,remainingMs:timer.mode==='stopwatch'?0:timer.durationMs,startedAt:null,pausedAt:null,period:1,timeoutActive:false,timeoutRemainingMs:timer.timeoutMs||0,timeoutStartedAt:null,resumeAfterTimeout:false};}
export function parseTimer(input:unknown):GameTimer|undefined {
 if(input===undefined)return undefined;if(!input||typeof input!=='object')throw new Error('timer');const t=input as Record<string,unknown>;
 const integer=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=min&&v<=max;
 const timestamp=(v:unknown)=>v===null||integer(v,0,8640000000000000);
 if(typeof t.enabled!=='boolean'||!integer(t.durationMs,1000,MAX_TIMER_DURATION_MS)||!integer(t.remainingMs,0,t.mode==='stopwatch'?31536000000:t.durationMs as number)||!timestamp(t.startedAt))throw new Error('timer');
 const result:GameTimer={enabled:t.enabled,durationMs:t.durationMs as number,remainingMs:t.remainingMs as number,startedAt:t.startedAt as number|null};
 if(t.mode!==undefined){if(!['countdown','stopwatch'].includes(t.mode as string))throw new Error('timer mode');result.mode=t.mode as GameTimer['mode'];}
 for(const key of ['trackPausedTime','showHours','timeoutActive','resumeAfterTimeout'] as const)if(t[key]!==undefined){if(typeof t[key]!=='boolean')throw new Error('timer option');result[key]=t[key] as boolean;}
 for(const [key,min,max] of [['periodCount',1,12],['period',1,12],['timeoutMs',0,MAX_TIMER_DURATION_MS],['timeoutRemainingMs',0,MAX_TIMER_DURATION_MS]] as const)if(t[key]!==undefined){if(!integer(t[key],min,max))throw new Error('timer option');result[key]=t[key] as number;}
 if((result.period||1)>(result.periodCount||1))throw new Error('period');
 if(t.pausedAt!==undefined){if(!timestamp(t.pausedAt))throw new Error('pause');result.pausedAt=t.pausedAt as number|null;}
 if(t.timeoutStartedAt!==undefined){if(!timestamp(t.timeoutStartedAt))throw new Error('timeout');result.timeoutStartedAt=t.timeoutStartedAt as number|null;}
 return result;
}
export function formatTime(ms:number,showHours=true):string{const total=Math.ceil(ms/1000),hours=Math.floor(total/3600),minutes=showHours?Math.floor(total/60)%60:Math.floor(total/60),seconds=total%60;return showHours&&hours?`${hours}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`:`${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;}

export function isGamePaused(timer?:GameTimer):boolean{return !!timer?.enabled&&(!!timer.timeoutActive||timer.startedAt===null&&(timer.pausedAt!=null||(timer.mode==='stopwatch'?timer.remainingMs>0:timer.remainingMs<timer.durationMs)));}
export function timerRefreshDelay(timer:GameTimer,now=Date.now()):number|undefined{
 const down=(ms:number)=>ms<=0?1:ms%1000||1000;
 const up=(ms:number)=>1000-(Math.max(0,ms)%1000)||1000;
 const delays:number[]=[];
 if(timer.timeoutActive&&timer.timeoutStartedAt!=null)delays.push(down(timeoutTime(timer,now)));
 else if(timer.startedAt!==null){const value=remainingTime(timer,now);delays.push(timer.mode==='stopwatch'?up(value):down(value));}
 if(timer.trackPausedTime&&timer.pausedAt!=null)delays.push(up(now-timer.pausedAt));
 return delays.length?Math.max(1,Math.ceil(Math.min(...delays))):undefined;
}
