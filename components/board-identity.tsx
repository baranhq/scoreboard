"use client";
import type {CSSProperties} from "react";
import type {Board} from "@/lib/boards";
import {iconIds} from "@/lib/board-icons";
import {foreground,validColor} from "@/lib/colors";
import type {Messages} from "@/lib/i18n";
import {ColorChoice} from "./color-choice";
import {BoardIcon} from "./board-icon";
export function BoardIdentity({board,t,change,showName=true}:{board:Board;t:Messages;change:(board:Board)=>void;showName?:boolean}){
 const accent=validColor(board.accent)?board.accent:'#285b35';
 return <div className="grid gap-4 sm:grid-cols-2">{showName&&<label className="grid gap-2 sm:col-span-2">{t.boardName}<input value={board.name} maxLength={200} onChange={e=>change({...board,name:e.target.value,automaticName:false})} onBlur={e=>{if(!e.target.value.trim())change({...board,name:t.board});}} className="min-h-11 w-full rounded-md border border-forest/25 bg-paper px-3 text-base"/></label>}<fieldset><legend className="mb-2 font-medium">{t.icon}</legend><div className="grid grid-cols-6 gap-1">{iconIds.map(id=><button key={id} aria-label={t.iconNames[id]} aria-pressed={(board.icon||'scoreboard')===id} title={t.iconNames[id]} onClick={()=>change({...board,icon:id})} className={`flex min-h-11 min-w-11 items-center justify-center rounded-md border transition-colors duration-150 motion-reduce:transition-none ${(board.icon||'scoreboard')===id?'border-action bg-action text-on-action':'border-transparent hover:bg-forest/5'}`}><BoardIcon id={id}/></button>)}</div></fieldset><fieldset><legend className="mb-2 font-medium">{t.accent}</legend><div className="flex flex-wrap gap-2">{['#285b35','#75613a','#355b68','#63516f'].map(color=><button key={color} aria-label={`${t.accent}: ${color}`} aria-pressed={accent===color} onClick={()=>change({...board,accent:color})} style={{'--swatch':color,'--swatch-text':foreground(color)} as CSSProperties} className="flex h-11 w-11 items-center justify-center rounded-md border border-forest/25 bg-[var(--swatch)] text-[var(--swatch-text)]">{accent===color?'✓':<span className="sr-only">{color}</span>}</button>)}</div><div className="mt-3"><ColorChoice label={t.customColor} value={accent} change={accent=>change({...board,accent})} t={t} presets={false}/></div></fieldset></div>;
}
