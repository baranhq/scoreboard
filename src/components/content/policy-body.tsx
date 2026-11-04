"use client";
import {useState} from 'react';
import {type PolicyDocument,validPolicyDocument,policyBlocks,policyInline,policyDate} from '@/lib/policy-document';
import {PrivacyButton} from './privacy-button';

type Topic = {id:number;title:string};

function TopicLinks({topics}:{topics:Topic[]}){
 return <ul className="mt-3 space-y-1">
  {topics.map(topic=><li key={topic.id}><a href={`#policy-section-${topic.id}`} className="block rounded-md px-2 py-1.5 text-sm leading-5 text-ink/80 transition-colors hover:bg-forest/10 hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-reduce:transition-none">{topic.title}</a></li>)}
 </ul>;
}

export function PolicyBody({initial,lang,updatedLabel,contentsLabel,choicesLabel}:{initial:PolicyDocument;lang:string;updatedLabel:string;contentsLabel:string;choicesLabel:string}){
 const [policy]=useState(()=>{
  if(typeof document==='undefined')return initial;
  try{const value=JSON.parse(document.getElementById('policy-document')?.textContent||'null');return validPolicyDocument(value)?value:initial;}catch{return initial;}
 });
 const blocks=policyBlocks(policy.content);
 const topics=blocks.flatMap((block,index)=>block.heading?[{id:index,title:block.text}]:[]);
 return <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
  <details className="rounded-xl border border-forest/20 bg-surface/50 px-4 py-3 lg:hidden">
   <summary className="cursor-pointer font-semibold text-forest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest">{contentsLabel}</summary>
   <nav aria-label={contentsLabel} className="mt-2"><TopicLinks topics={topics}/></nav>
  </details>
  <aside className="hidden lg:block">
   <nav aria-label={contentsLabel} className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto">
    <p className="px-2 text-sm font-semibold text-forest">{contentsLabel}</p>
    <TopicLinks topics={topics}/>
   </nav>
  </aside>
  <article id="policy-content" className="max-w-3xl text-ink transition-colors duration-150 motion-reduce:transition-none">
   <p className="mb-2 text-base font-medium text-forest"><time dateTime={policy.updatedAt}>{updatedLabel} {policyDate(policy.updatedAt,lang)}</time></p>
   <h1 className="font-display text-3xl font-bold tracking-tight">{policy.title}</h1>
   {blocks.map((block,index)=>block.heading?<h2 id={`policy-section-${index}`} key={index} className="mt-7 scroll-mt-24 border-t border-forest/20 pt-5 font-display text-2xl font-bold">{block.text}</h2>:<p key={index} className="mt-3 whitespace-pre-line text-lg leading-8">{policyInline(block.text).map((part,i)=>part.href?<a key={i} href={part.href} target={part.href.startsWith('https:')?'_blank':undefined} rel={part.href.startsWith('https:')?'noopener noreferrer':undefined} className="underline underline-offset-4">{part.text}</a>:part.strong?<strong key={i}>{part.text}</strong>:part.text)}</p>)}
   <PrivacyButton label={choicesLabel}/>
  </article>
 </div>;
}
