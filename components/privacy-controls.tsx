"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { type Lang, messages } from "@/lib/i18n";
import {pageForPath} from "@/lib/routes";
import { events } from "@/lib/analytics";
import { Button, Modal } from "./ui";
type Choices = {usage: boolean; cloud: boolean};
type State = Choices & {saved: boolean; capabilities: Choices; cloudToken: string | null};
const off: Choices = {usage:false, cloud:false};
const initial: State = {...off, saved:false, capabilities:off, cloudToken:null};
export function PrivacyControls({lang, fullscreen}: {lang: Lang; fullscreen?: boolean}) {
 const t = messages[lang]; const [linkReady,setLinkReady]=useState(false);
 useEffect(()=>{const ready=()=>setLinkReady(true);if(!/^#(?:share|board)=/.test(location.hash))ready();window.addEventListener('scoreboard-ready',ready);return()=>window.removeEventListener('scoreboard-ready',ready);},[]); const [state, setState] = useState<State>(initial); const [draft, setDraft] = useState<Choices>(off);
 const [open, setOpen] = useState(false); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
 const stateRef = useRef(state); stateRef.current = state; const channel = useRef<BroadcastChannel | null>(null);
 const read = useCallback(async () => {
  try {const response = await fetch("/api/index.php?action=state", {cache:"no-store", credentials:"same-origin"}); if (!response.ok) throw new Error(); const s: State = await response.json(); if (!s.capabilities || typeof s.usage !== "boolean" || typeof s.cloud !== "boolean") throw new Error(); setState(s); setDraft({usage:s.usage,cloud:s.cloud}); setError(""); return s;}
  catch {setState(initial); setError(t.unavailable); return null;}
 }, [t.unavailable]);
 useEffect(() => {
  let alive = true; void read().then(s => {if (alive && s && !s.saved && (s.capabilities.usage || s.capabilities.cloud)) setOpen(true);});
  const show = () => {setOpen(true); void read();}; window.addEventListener("privacy-open",show);
  if (typeof BroadcastChannel !== "undefined") {channel.current = new BroadcastChannel("scoreboard-privacy"); channel.current.onmessage = () => {setState(initial); void read();};}
  const refresh = () => {if (document.visibilityState === "visible") void read();}; document.addEventListener("visibilitychange",refresh);
  return () => {alive=false; window.removeEventListener("privacy-open",show); document.removeEventListener("visibilitychange",refresh); channel.current?.close();};
 }, [read]);
 useEffect(() => {
  if (!linkReady || !state.cloud || !state.cloudToken || !/^[a-f0-9]{32}$/.test(state.cloudToken)) return;
  const script = document.createElement("script"); script.src = "https://static.cloudflareinsights.com/beacon.min.js"; script.defer = true;
  script.dataset.cfBeacon = JSON.stringify({token:state.cloudToken,spa:false}); document.head.appendChild(script);
  return () => script.remove();
 }, [state.cloud,state.cloudToken,linkReady]);
 useEffect(() => {
  if (!linkReady || !state.usage || !['home','privacy','licenses'].includes(pageForPath(location.pathname)||'')) return;
  let lastActivity = Date.now(); let lastTick = Date.now(); let activeSinceTick = false;
  const send = (data: {type: "view" | "click" | "active"; label?: string}) => {
   if (!stateRef.current.usage) return;
   void fetch("/api/index.php?action=event", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...data,path:location.pathname}), credentials:"same-origin", cache:"no-store"}).then(r => {if (!r.ok) setState(s => ({...s,usage:false}));}).catch(() => {});
  };
  send({type:"view"});
  const activity = () => {lastActivity=Date.now(); activeSinceTick=true;};
  const click = (event: Event) => {const label = (event as CustomEvent).detail; if (events.includes(label)) send({type:"click",label});};
  window.addEventListener("scoreboard-event",click); window.addEventListener("keydown",activity); window.addEventListener("pointerdown",activity); window.addEventListener("scroll",activity,{passive:true});
  const timer = setInterval(() => {const now=Date.now(); if (document.visibilityState === "visible" && document.hasFocus() && now-lastActivity < 30*60*1000 && now-lastTick < 30000 && activeSinceTick) send({type:"active"}); activeSinceTick = now-lastActivity < 30*60*1000; lastTick=now;},15000);
  return () => {clearInterval(timer); window.removeEventListener("scoreboard-event",click); window.removeEventListener("keydown",activity); window.removeEventListener("pointerdown",activity); window.removeEventListener("scroll",activity);};
 }, [state.usage,linkReady]);
 const save = async (choices: Choices) => {
  const oldCloud = state.cloud; setState(s => ({...s,usage:false,cloud:false})); setBusy(true);
  try {const r = await fetch("/api/index.php?action=consent", {method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify(choices),cache:"no-store"}); if (!r.ok) throw new Error(); const s: State = await r.json(); setState(s); setDraft({usage:s.usage,cloud:s.cloud}); setOpen(false); setError(""); channel.current?.postMessage("changed"); if (oldCloud && !s.cloud) location.reload();}
  catch {setError(t.unavailable);} finally {setBusy(false);}
 };
 if (!open || fullscreen) return null;
 return <Modal title={t.choices} close={() => setOpen(false)} closeLabel={t.close}><p className="mb-5 text-base leading-6">{t.consentNote}</p><div className="divide-y divide-forest/20 border-y border-forest/20">{([['usage',t.usage,t.usageText],['cloud',t.cloud,t.cloudText]] as const).map(([key,label,text]) => <div key={key} className="py-5"><label className="flex items-start gap-3"><input type="checkbox" checked={draft[key]} disabled={busy || !state.capabilities[key]} onChange={e => setDraft(d => ({...d,[key]:e.target.checked}))} className="mt-1 h-5 w-5 shrink-0 accent-forest"/><span><span className="block font-semibold">{label}</span><span className="mt-2 block text-base leading-6 text-forest/90">{text}</span>{!state.capabilities[key] && <span className="mt-2 block text-base">{t.unavailableChoice}</span>}</span></label>{key === 'cloud' && <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="ml-8 mt-2 inline-block text-base underline underline-offset-4">{t.cloudPolicy}</a>}</div>)}</div>{error && <p role="alert" className="mt-4 text-base text-red-900 dark:text-red-200">{error}</p>}<div className="mt-6 grid gap-2 sm:grid-cols-3"><Button disabled={busy} onClick={() => void save({usage:state.capabilities.usage,cloud:state.capabilities.cloud})}>{t.allow}</Button><Button disabled={busy} onClick={() => void save(off)}>{t.reject}</Button><Button primary disabled={busy} onClick={() => void save(draft)}>{t.save}</Button></div></Modal>;
}
