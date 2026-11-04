"use client";
import {useState} from 'react';
import {type PolicyDocument,validPolicyDocument,policyBlocks,policyInline,policyDate} from '@/lib/policy-document';
import {PrivacyButton} from './privacy-button';
import {TopicNavigation} from './topic-navigation';

export function PolicyBody({initial,lang,updatedLabel,contentsLabel,choicesLabel}:{initial:PolicyDocument;lang:string;updatedLabel:string;contentsLabel:string;choicesLabel:string}){
 const [policy]=useState(()=>{
  if(typeof document==='undefined')return initial;
  try{const value=JSON.parse(document.getElementById('policy-document')?.textContent||'null');return validPolicyDocument(value)?value:initial;}catch{return initial;}
 });
 const blocks=policyBlocks(policy.content);
 const topics=blocks.flatMap((block,index)=>block.heading?[{href:`#policy-section-${index}`,title:block.text}]:[]);
 return <div className="grid items-start gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
  <TopicNavigation label={contentsLabel} topics={topics}/>
  <article id="policy-content" className="min-w-0 max-w-3xl text-ink transition-colors duration-150 motion-reduce:transition-none">
   <p className="mb-2 text-base font-medium text-forest"><time dateTime={policy.updatedAt}>{updatedLabel} {policyDate(policy.updatedAt,lang)}</time></p>
   <h1 className="font-display text-3xl font-bold tracking-tight">{policy.title}</h1>
   {blocks.map((block,index)=>block.heading?<h2 id={`policy-section-${index}`} key={index} className="mt-7 scroll-mt-24 border-t border-forest/20 pt-5 font-display text-2xl font-bold">{block.text}</h2>:<p key={index} className="mt-3 whitespace-pre-line text-lg leading-8">{policyInline(block.text).map((part,i)=>part.href?<a key={i} href={part.href} target={part.href.startsWith('https:')?'_blank':undefined} rel={part.href.startsWith('https:')?'noopener noreferrer':undefined} className="underline underline-offset-4">{part.text}</a>:part.strong?<strong key={i}>{part.text}</strong>:part.text)}</p>)}
   <PrivacyButton label={choicesLabel}/>
  </article>
 </div>;
}
