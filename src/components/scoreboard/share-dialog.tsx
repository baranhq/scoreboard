"use client";
import Link from 'next/link';
import {useState} from 'react';
import {Check,Copy,Save} from 'lucide-react';
import {type Board} from '@/lib/boards';
import {encodeGame} from '@/lib/sharing';
import type {Lang,Messages} from '@/lib/i18n';
import {route} from '@/lib/routes';
import {Button,Modal} from '../ui/ui';
export function ShareDialog({board,t,lang,mode,save,close}:{board:Board;t:Messages;lang:Lang;mode:'save'|'share';save:(name:string)=>Promise<Board>;close:()=>void}){
 const [name,setName]=useState(board.name);const [saved,setSaved]=useState<Board>();const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [copied,setCopied]=useState(false);
 let url='';let tooLarge=false;try{url=`${location.origin}${route(lang)}#share=${encodeGame(saved||board)}`;}catch{tooLarge=true;}
 return <Modal title={mode==='save'?(saved?t.savedSuccess:t.saveBoard):t.share} close={()=>{if(!busy)close();}} closeLabel={t.close} closeDisabled={busy}>{mode==='save'&&!saved?<form onSubmit={async e=>{e.preventDefault();setBusy(true);try{const next=await save(name.trim());setSaved(next);setError('');}catch{setError(t.storageError);}finally{setBusy(false);}}}><label className="grid gap-2 text-base">{t.saveName}<input autoFocus required maxLength={200} value={name} onChange={e=>setName(e.target.value)} className="min-h-12 rounded-lg border border-forest/25 bg-surface px-3"/></label><div className="mt-5 flex justify-end"><Button primary disabled={busy||!name.trim()} type="submit"><Save aria-hidden="true" className="h-5 w-5"/>{busy?t.saving:t.saveBoardShort}</Button></div></form>:<><p className="mb-4 flex items-start gap-2 text-base leading-6">{saved&&<Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-forest"/>}{saved?t.savedLocal:t.shareNote}</p>{saved&&<Link className="mb-4 inline-flex min-h-11 items-center font-medium underline underline-offset-4" href={route(lang,'saved')}>{t.saved} →</Link>}{tooLarge?<p role="alert">{t.shareError}</p>:<><label className="grid gap-2 text-base">{t.share}<input aria-label={t.share} readOnly value={url} onFocus={e=>e.target.select()} className="min-h-12 w-full rounded-lg border border-forest/25 bg-paper px-3"/></label><div className="mt-3 flex flex-wrap items-center gap-3"><Button primary onClick={async()=>{try{await navigator.clipboard.writeText(url);setCopied(true);}catch{setError(t.copyManually);}}}><Copy aria-hidden="true" className="h-5 w-5"/>{t.copyLink}</Button><span role="status" className="text-base">{copied?`✓ ${t.linkCopied}`:''}</span></div>{saved&&<p className="mt-4 text-base leading-6 text-forest/90">{t.shareNote}</p>}</>}</>}{error&&<p role="alert" className="mt-4 text-base text-red-800 dark:text-red-200">{error}</p>}</Modal>;
}
