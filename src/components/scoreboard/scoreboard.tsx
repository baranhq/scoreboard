"use client";
import {route} from "@/lib/routes";
import { Save, Pin, Share2 } from "lucide-react";
import { BoardIcon } from "./board-icon";
import { foreground, validColor } from "@/lib/colors";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { messages, repo, type Lang } from "@/lib/i18n";
import { download, newBoard, validScore, displayBoard, type Board, type Team } from "@/lib/boards";
import { defaults } from "@/lib/appearance";
import { useFullscreenControls } from "./use-fullscreen-controls";
import {decodeGame} from "@/lib/sharing";
import {defaultTimer,isGamePaused,type GameTimer} from "@/lib/timer";
import {ShareDialog} from "./share-dialog";
import {TimerDisplay} from "./game-timer";
import { Customization } from "./customization";
import { defaultColor } from "@/lib/colors";
import { loadBoards, loadOrCreateBoard, writeBoards } from "@/store/database";
import { Frame } from "../layout/frame";
import { Button, Modal } from "../ui/ui";
import { TeamPanel } from "./team-panel";
import { track } from "@/lib/analytics";
type Action = {title: string; value?: string; numeric?: boolean; run: (value: string) => void};
export function Scoreboard({lang}: {lang: Lang}) {
 const t=messages[lang];
 const [boards,setBoards]=useState<Board[]>([]); const current=useRef(boards);
 const [id,setId]=useState<string>(); const [ready,setReady]=useState(false);
 const [error,setError]=useState(""); const [notice,setNotice]=useState(""); const [pending,setPending]=useState(0);
 const [dialogMode,setDialogMode]=useState<'save'|'share'>();
 const [full,setFull]=useState(false); const [action,setAction]=useState<Action>(); const [value,setValue]=useState("");
 const display=useRef<HTMLDivElement>(null);
 const storedBoard=boards.find(b=>b.id===id);
 const board=storedBoard?displayBoard(storedBoard,t):undefined;
 const appearance={...defaults,...board?.appearance};
 const controls=useFullscreenControls(full,appearance.autoHideControls);
 const replace=useCallback((items:Board[])=>{current.current=items;setBoards(items);},[]);
 const persist=useCallback((items:Board[],removeId?:string)=>{
  setPending(n=>n+1); void writeBoards(items,removeId).then(()=>setError("")).catch(()=>setError(t.storageError)).finally(()=>setPending(n=>n-1));
 },[t.storageError]);
 useEffect(()=>{
  let alive=true;
  const openGame=async()=>{
   const fragment=location.hash;
   if(fragment.startsWith('#share=')||fragment.startsWith('#board='))history.replaceState(null,'',location.pathname+location.search);
   try{
    let items=await loadBoards();if(!alive)return;let requested:string|null=null;
    if(fragment.startsWith('#share=')){
     const incoming=decodeGame(fragment.slice(7));
     const existing=items.find(b=>b.id===incoming.sourceId||b.shareKey===incoming.key);
     if(existing)requested=existing.id;
     else{const copy={...incoming.board,shareKey:incoming.key};await writeBoards([copy]);items=[...items,copy];requested=copy.id;}
    }else{
     if(!items.length)items=await loadOrCreateBoard(()=>newBoard(t.board,t.team));
     requested=fragment.startsWith('#board=')?decodeURIComponent(fragment.slice(7)):null;
     try{requested??=localStorage.getItem('scoreboard-active');}catch{}
    }
    if(alive){replace(items);setId(items.some(b=>b.id===requested)?requested!:items[0]?.id);setReady(true);}
   }catch{if(alive){setReady(true);setError(fragment.startsWith('#share=')?t.shareInvalid:t.storageError);}}
   finally{window.dispatchEvent(new Event('scoreboard-ready'));}
  };
  void openGame();window.addEventListener('hashchange',openGame);
  return()=>{alive=false;window.removeEventListener('hashchange',openGame);};
 },[replace,t.board,t.team,t.storageError,t.shareInvalid]);
 useEffect(()=>{if(id){try{localStorage.setItem('scoreboard-active',id);}catch{}}},[id]);
 const update=useCallback((change:(b:Board)=>Board)=>{
  const all=current.current;const old=all.find(b=>b.id===id);if(!old)return;
  const next={...change(old),updatedAt:Date.now()};replace(all.map(b=>b.id===id?next:b));persist([next]);
 },[id,persist,replace]);
 const teamEdit=(teamId:string,change:Partial<Team>)=>{if(change.score!==undefined&&isGamePaused(current.current.find(b=>b.id===id)?.timer)){setNotice(t.matchPaused);return;}update(b=>({...b,teams:b.teams.map(team=>team.id===teamId?{...team,...change}:team)}));};
 const score=useCallback((teamId:string,amount:number)=>{if(isGamePaused(current.current.find(b=>b.id===id)?.timer)){setNotice(t.matchPaused);return;}update(b=>({...b,teams:b.teams.map(team=>team.id===teamId && Math.abs(team.score+amount)<=999999999?{...team,score:team.score+amount}:team)}));},[update,id,t.matchPaused]);
 const toggleFull=useCallback(async()=>{
  if(full){if(document.fullscreenElement)await document.exitFullscreen().catch(()=>{});setFull(false);}
  else{setFull(true);track("enter_fullscreen");await display.current?.requestFullscreen?.().catch(()=>{});}
 },[full]);
 useEffect(()=>{
  const change=()=>{if(!document.fullscreenElement)setFull(false);};
  const key=(e:KeyboardEvent)=>{
   if(e.target instanceof HTMLElement && (e.target.closest("input,textarea,select,dialog")||e.target.isContentEditable)||e.ctrlKey||e.metaKey||e.altKey)return;
   if(e.key==="Escape")setFull(false);
   if(action||dialogMode||!board)return;
   if(e.key.toLowerCase()==="f"){e.preventDefault();void toggleFull();}
   const team=board.teams[Number(e.key)-1];if((e.key==="1"||e.key==="2")&&team)score(team.id,appearance.increment);
  };
  document.addEventListener("fullscreenchange",change);window.addEventListener("keydown",key);
  return()=>{document.removeEventListener("fullscreenchange",change);window.removeEventListener("keydown",key);};
 },[toggleFull,action,dialogMode,board,score,appearance.increment]);
 const saveNamed=async(name:string):Promise<Board>=>{const latest=current.current.find(b=>b.id===id);if(!latest)throw new Error('missing');const next={...latest,name,automaticName:false,updatedAt:Date.now()};replace(current.current.map(b=>b.id===id?next:b));try{await writeBoards([next]);setError('');return next;}catch{setError(t.storageError);throw new Error('save');}};
 const changeTimer=useCallback((timer:GameTimer)=>update(b=>({...b,timer})),[update]);
 const ask=(title:string,run:Action["run"],initial?:string)=>{setValue(initial??"");setAction({title,run,value:initial});};
 const addBoard=()=>{const b=newBoard(t.board,t.team);replace([...current.current,b]);setId(b.id);persist([b]);track("create_scoreboard");};
 return <div onPointerMove={controls.reveal} onPointerDown={controls.reveal} onKeyDownCapture={controls.reveal} onFocusCapture={controls.reveal} ref={display} className={full?`fixed inset-0 z-40 overflow-auto bg-paper ${!controls.visible?"cursor-none [&_*]:cursor-none":""}`:""}><Frame lang={lang} fullscreen={full}><main id="main" className={full?"relative mx-auto flex h-dvh max-w-[160rem] flex-col p-3 sm:p-4":"mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-5"}>

 {notice&&<div role="status" className="fixed bottom-5 right-5 z-50 max-w-[calc(100vw-2.5rem)] flex items-center justify-between gap-3 rounded-lg bg-forest/5 px-4 py-2 text-base motion-safe:animate-[appear_160ms_ease-out]"><p>{notice}</p><Button aria-label={t.close} onClick={()=>setNotice("")}>×</Button></div>}
 {error&&<div role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/40 p-4 text-base text-red-900 dark:text-red-200">{error} <Button onClick={()=>persist(boards)}>{t.retry}</Button><Button onClick={()=>download(boards)}>{t.export}</Button></div>}
 {!ready?<p className="py-20 text-center">{t.loading}</p>:board?<section aria-label={t.board} className="flex min-h-0 flex-1 flex-col">
 {full?<div className={`absolute right-3 top-3 z-30 flex items-center gap-1 rounded-xl border border-forest/25 bg-paper p-1 text-ink shadow-sm transition-opacity duration-150 motion-reduce:transition-none ${controls.visible?'opacity-100':'pointer-events-none opacity-0'}`}><Button aria-label={t.keepVisible} aria-pressed={!appearance.autoHideControls} onClick={()=>update(b=>({...b,appearance:{...b.appearance,autoHideControls:!appearance.autoHideControls}}))}><Pin aria-hidden="true" className="h-5 w-5"/></Button><Button onClick={()=>void toggleFull()} aria-label={t.exit}><svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true"><path d="M8 3v5H3m13-5v5h5M8 21v-5H3m13 5v-5h5"/></svg><span className="hidden sm:inline">{t.exitShort}</span></Button></div>:<> <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h1 className={`min-w-0 break-words font-display font-bold tracking-tight ${full?'text-xl sm:text-2xl':'text-2xl sm:text-3xl'}`}><span className="inline-flex items-center gap-2"><span style={{'--accent':validColor(board.accent)?board.accent:'#285b35','--accent-text':foreground(validColor(board.accent)?board.accent:'#285b35')} as CSSProperties} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-text)]"><BoardIcon id={board.icon}/></span>{board.name}</span></h1><div className="flex shrink-0 items-center gap-2">{pending>0&&<span role="status" className="hidden text-base text-forest sm:inline">{t.saving}</span>}{full&&<><Button aria-label={t.keepVisible} aria-pressed={!appearance.autoHideControls} onClick={()=>update(b=>({...b,appearance:{...b.appearance,autoHideControls:!appearance.autoHideControls}}))}><Pin aria-hidden="true" className="h-5 w-5"/></Button><Button aria-label={t.fullscreenControls} aria-pressed={appearance.fullscreenControls} onClick={()=>update(b=>({...b,appearance:{...b.appearance,fullscreenControls:!appearance.fullscreenControls}}))}><svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{!appearance.fullscreenControls&&<path d="m3 3 18 18"/>}</svg></Button></>}<>{!full&&<><Button onClick={()=>setDialogMode('share')}><Share2 aria-hidden="true" className="h-5 w-5"/><span className="hidden sm:inline">{t.share}</span><span className="sr-only sm:hidden">{t.share}</span></Button><Button primary onClick={()=>setDialogMode('save')}><Save aria-hidden="true" className="h-5 w-5"/>{t.saveBoardShort}</Button></>}</><Button aria-label={full?t.exit:t.fullscreen} onClick={()=>void toggleFull()}><span className="hidden sm:inline">{full?t.exit:t.fullscreen}</span><svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">{full?<path d="M8 3v5H3m13-5v5h5M8 21v-5H3m13 5v-5h5"/>:<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>}</svg></Button></div></div></>}

 {board.timer?.enabled&&<TimerDisplay timer={board.timer} t={t} change={changeTimer} full={full} controlsVisible={controls.visible}/>}
 <div style={{'--board-background':board.background||'transparent'} as CSSProperties} className={`min-h-0 flex-1 gap-3 bg-[var(--board-background)] ${board.background?"rounded-xl p-2":""} ${full?`grid auto-rows-fr ${board.teams.length<=2?'grid-cols-2':board.teams.length===3?'grid-cols-3':board.teams.length===4?'grid-cols-2':board.teams.length<=9?'grid-cols-2 lg:grid-cols-3':'grid-cols-2 overflow-auto auto-rows-[minmax(14rem,1fr)] lg:grid-cols-4'}`:appearance.layout==='horizontal'?'grid grid-flow-col auto-cols-[minmax(18rem,1fr)] overflow-x-auto':appearance.layout==='grid'?'grid grid-cols-2 md:grid-cols-3':'flex flex-wrap'}`}>{board.teams.map((team,index)=><TeamPanel className={!full&&appearance.layout==='auto'?(board.teams.length<=2?"flex-[1_1_calc(50%-0.375rem)]":"min-w-[min(100%,10rem)] flex-[1_1_calc(33.333%-0.5rem)]"):undefined} key={team.id} team={team} color={board.color} textColor={board.textColor} paused={isGamePaused(board.timer)} appearance={appearance} controlsVisible={controls.visible} index={index} count={board.teams.length} full={full} t={t} edit={change=>teamEdit(team.id,change)} rename={()=>ask(t.teamName,name=>teamEdit(team.id,{name}),team.name)} change={amount=>score(team.id,amount*appearance.increment)} move={offset=>update(b=>{const teams=[...b.teams];[teams[index+offset],teams[index]]=[teams[index],teams[index+offset]];return{...b,teams};})} remove={()=>ask(t.deleteConfirm,()=>update(b=>({...b,teams:b.teams.filter(x=>x.id!==team.id)})))} manual={()=>{if(isGamePaused(board.timer)){setNotice(t.matchPaused);return;}setValue(String(team.score));setAction({title:`${team.name}: ${t.score}`,value:String(team.score),numeric:true,run:value=>teamEdit(team.id,{score:Number(value)})});}}/>)}</div>

 </section>:<section className="rounded-xl bg-forest/5 px-5 py-12 text-center"><h2 className="font-display text-xl font-semibold">{t.empty}</h2><Button onClick={addBoard} className="mt-5">{t.create}</Button></section>}
 {!full&&<>{board&&<><div className="mt-3 flex justify-end"><Button onClick={()=>{const reset=()=>update(b=>({...b,teams:b.teams.map(team=>({...team,score:0}))}));ask(t.resetConfirm,reset);}}>↺ {t.reset}</Button></div><Customization board={board} t={t} change={update} renameBoard={name=>update(b=>({...b,name,automaticName:false}))} remove={teamId=>ask(t.deleteConfirm,()=>update(b=>({...b,teams:b.teams.filter(team=>team.id!==teamId)})))}/></>}

</>}
 </main>{action&&<Modal title={action.title} close={()=>setAction(undefined)} closeLabel={t.close}><form onSubmit={e=>{e.preventDefault();if(action.numeric&&!validScore(Number(value))){setNotice(t.scoreRange);return;}action.run(value.trim());setAction(undefined);}}>{action.value!==undefined&&<label className="block text-base">{t.name}<input autoFocus required inputMode={action.numeric?"numeric":"text"} pattern={action.numeric?"-?[0-9]+":undefined} maxLength={action.numeric?10:200} value={value} onChange={e=>setValue(e.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-forest/30 bg-surface px-3"/></label>}<div className="mt-6 flex justify-end gap-3"><Button type="button" onClick={()=>setAction(undefined)}>{t.cancel}</Button><Button primary type="submit" disabled={action.value!==undefined&&(!value.trim()||!!action.numeric&&!validScore(Number(value)))}>{t.confirm}</Button></div></form></Modal>}

 {dialogMode&&board&&<ShareDialog board={storedBoard!} t={t} lang={lang} mode={dialogMode} save={saveNamed} close={()=>setDialogMode(undefined)}/>}
 </Frame></div>;
}
