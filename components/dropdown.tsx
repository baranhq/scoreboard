"use client";
import {useEffect,useRef,type ReactNode,type ButtonHTMLAttributes} from "react";
export function Dropdown({label,ariaLabel,children}:{label:ReactNode;ariaLabel:string;children:ReactNode}){
 const ref=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{
  const outside=(e:PointerEvent)=>{if(e.target instanceof Node&&!ref.current?.contains(e.target)&&ref.current)ref.current.open=false;};
  const other=(e:Event)=>{if((e as CustomEvent).detail!==ref.current&&ref.current)ref.current.open=false;};
  document.addEventListener('pointerdown',outside);window.addEventListener('scoreboard-menu-open',other);
  return()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('scoreboard-menu-open',other);};
 },[]);
 return <details ref={ref} name="scoreboard-menu" className="relative" onToggle={e=>{if(e.currentTarget.open)window.dispatchEvent(new CustomEvent('scoreboard-menu-open',{detail:e.currentTarget}));}} onKeyDown={e=>{if(e.key==='Escape'&&ref.current){ref.current.open=false;ref.current.querySelector('summary')?.focus();}}}><summary aria-label={ariaLabel} className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center gap-2 rounded-lg px-3 text-base font-medium transition-colors duration-150 hover:bg-forest/10 motion-reduce:transition-none">{label}</summary><div onClick={e=>{if((e.target as HTMLElement).closest('button,a')&&ref.current)ref.current.open=false;}} className="absolute right-0 top-full z-30 mt-1 w-[min(19rem,calc(100vw-2rem))] rounded-xl border border-forest/20 bg-paper p-1.5 text-ink shadow-sm motion-safe:animate-[appear_150ms_ease-out]">{children}</div></details>;
}
export function MenuItem({danger=false,className='',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{danger?:boolean}){return <button {...props} className={`flex min-h-11 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 py-2 text-left text-base transition-colors duration-150 disabled:opacity-50 motion-reduce:transition-none ${danger?'text-[#a32d28] hover:bg-red-500/10 dark:text-[#ffb7b2]':'text-ink hover:bg-forest/8'} ${className}`}/>;}
