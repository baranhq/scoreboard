"use client";
import {useState} from 'react';
import {ChevronDown} from 'lucide-react';

export type Dependency={name:string;version:string;license:string;source:string;noticePath:string};
export type LicenceLabels={upstream:string;loadingNotices:string;noticesError:string;downloadNotices:string};

export function LicenceDisclosure({dependency,labels}:{dependency:Dependency;labels:LicenceLabels}){
 const [notices,setNotices]=useState<{name:string;text:string}[]>();
 const [error,setError]=useState(false);
 const [busy,setBusy]=useState(false);
 const loadNotices=async()=>{
  if(notices||busy)return;
  setBusy(true);
  try{
   const response=await fetch(dependency.noticePath,{cache:'force-cache'});
   if(!response.ok)throw new Error();
   const data=await response.json();
   if(!Array.isArray(data.notices))throw new Error();
   setNotices(data.notices);
   setError(false);
  }catch{setError(true);}
  finally{setBusy(false);}
 };
 return <details name="scoreboard-menu" className="group border-b border-forest/20" onToggle={event=>{if(event.currentTarget.open){window.dispatchEvent(new CustomEvent('scoreboard-menu-open',{detail:event.currentTarget}));void loadNotices();}}}>
  <summary className="flex min-h-16 cursor-pointer select-none list-none flex-wrap items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors duration-150 hover:bg-forest/5 motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
   <span className="min-w-0 break-words font-semibold">{dependency.name} <span className="font-normal text-forest/90">{dependency.version}</span></span>
   <span className="flex items-center gap-3 text-base"><span>{dependency.license}</span><ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"/></span>
  </summary>
  <div className="px-3 pb-5 motion-safe:animate-[appear_150ms_ease-out]">
   <a href={dependency.source.startsWith('https://')?dependency.source:`https://www.npmjs.com/package/${dependency.name}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">{labels.upstream}</a>
   {busy&&<p role="status">{labels.loadingNotices}</p>}
   {error&&<p role="alert">{labels.noticesError} <a href="/THIRD-PARTY-NOTICES.txt" className="underline">{labels.downloadNotices}</a></p>}
   {notices?.map((notice,index)=><div key={index} className="mt-3"><p className="mb-2 text-base font-semibold">{notice.name}</p><pre className="max-h-[30rem] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-forest/5 p-4 text-base leading-7">{notice.text}</pre></div>)}
  </div>
 </details>;
}
