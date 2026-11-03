"use client";
import {useLayoutEffect,useState} from "react";
import type {Messages} from "@/lib/i18n";
function useTheme(){
 const [theme,setTheme]=useState('system'); const [dark,setDark]=useState(false);
 useLayoutEffect(()=>{const sync=()=>{const root=document.documentElement;let saved='system';try{const value=localStorage.getItem('scoreboard-theme');if(value==='light'||value==='dark'||value==='system')saved=value;}catch{}const shouldDark=saved==='dark'||saved==='system'&&matchMedia('(prefers-color-scheme: dark)').matches;if(root.dataset.theme!==saved)root.dataset.theme=saved;if(root.classList.contains('dark')!==shouldDark)root.classList.toggle('dark',shouldDark);setTheme(saved);setDark(shouldDark);};sync();const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class','data-theme']});return()=>observer.disconnect();},[]);
 const change=(next:string)=>window.dispatchEvent(new CustomEvent('scoreboard-theme',{detail:next}));
 return {theme,dark,change};
}
export function ThemeSelect({t}:{t:Messages}) {const {theme,change}=useTheme();return <label className="flex min-h-11 items-center justify-between gap-4 text-base">{t.theme}<select aria-label={t.theme} value={theme} onChange={e=>change(e.target.value)} className="min-h-11 max-w-36 rounded-lg border border-forest/20 bg-paper px-3"><option value="light">{t.light}</option><option value="dark">{t.dark}</option><option value="system">{t.system}</option></select></label>;}
export function ThemeToggle({t}:{t:Messages}) {
 const {dark,change}=useTheme();
 return <button onClick={()=>change(dark?'light':'dark')} aria-label={`${t.theme}: ${dark?t.light:t.dark}`} title={`${t.theme}: ${dark?t.light:t.dark}`} className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-forest/5 active:bg-forest/10 motion-reduce:transition-none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-5 w-5"><g className={`origin-center transition-opacity duration-200 ease-out motion-reduce:transition-none ${dark?'opacity-0':'opacity-100'}`}><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></g><path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5a8.5 8.5 0 1 0 10.6 10.6Z" className={`origin-center transition-opacity duration-200 ease-out motion-reduce:transition-none ${dark?'opacity-100':'opacity-0'}`}/></svg></button>;
}
