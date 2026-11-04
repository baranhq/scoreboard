"use client";
import {useState} from 'react';
import {ChevronDown} from 'lucide-react';
import type {Lang} from '@/lib/i18n';
import {homeFaq} from '@/lib/home-faq';

export function HomeFaq({lang}:{lang:Lang}){
 const content=homeFaq[lang];
 const [openIndex,setOpenIndex]=useState<number|null>(null);
 return <section aria-labelledby="home-faq-title" className="mx-auto mb-10 mt-10 max-w-4xl px-4 sm:px-6">
  <header className="mb-4 max-w-3xl">
   <h2 id="home-faq-title" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{content.title}</h2>
   <p className="mt-2 font-sans text-base leading-7 text-forest/90">{content.intro}</p>
  </header>
  <div className="divide-y divide-forest/15 border-y border-forest/15">
   {content.items.map((item,index)=>{
    const expanded=openIndex===index;
    const triggerId=`home-faq-${lang}-${index}-trigger`;
    const answerId=`home-faq-${lang}-${index}-answer`;
    return <div key={item.question}>
     <h3>
      <button id={triggerId} type="button" aria-expanded={expanded} aria-controls={answerId} onClick={()=>setOpenIndex(current=>current===index?null:index)} className="flex min-h-12 w-full items-center justify-between gap-4 py-3 text-left font-sans text-base font-semibold text-forest transition-colors duration-150 hover:text-forest/80 dark:text-[#8bd69a] dark:hover:text-white motion-reduce:transition-none">
       <span>{item.question}</span><ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform duration-150 ${expanded?'rotate-180':''} motion-reduce:transition-none`}/>
      </button>
     </h3>
     <div id={answerId} role="region" aria-labelledby={triggerId} aria-hidden={!expanded} className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${expanded?'grid-rows-[1fr] opacity-100':'grid-rows-[0fr] opacity-0'} motion-reduce:transition-none`}>
      <div className="min-h-0 overflow-hidden"><p className="pb-4 font-sans text-base leading-7 text-forest/90">{item.answer}</p></div>
     </div>
    </div>;
   })}
  </div>
 </section>;
}
