"use client";
import {useState} from 'react';
import {type PolicyDocument,validPolicyDocument,policyBlocks,policyInline,policyDate} from '@/lib/policy-document';
export function PolicyBody({initial,lang,updatedLabel}:{initial:PolicyDocument;lang:string;updatedLabel:string}){
 const [policy]=useState(()=>{
  if(typeof document==='undefined')return initial;
  try{const value=JSON.parse(document.getElementById('policy-document')?.textContent||'null');return validPolicyDocument(value)?value:initial;}catch{return initial;}
 });
 return <article id="policy-content"><p className="mb-2 text-base font-medium text-forest"><time dateTime={policy.updatedAt}>{updatedLabel} {policyDate(policy.updatedAt,lang)}</time></p><h1 className="font-display text-3xl font-bold tracking-tight">{policy.title}</h1>{policyBlocks(policy.content).map((block,index)=>block.heading?<h2 key={index} className="mt-7 border-t border-forest/20 pt-5 font-display text-2xl font-bold">{block.text}</h2>:<p key={index} className="mt-3 whitespace-pre-line text-lg leading-8">{policyInline(block.text).map((part,i)=>part.href?<a key={i} href={part.href} target={part.href.startsWith('https:')?'_blank':undefined} rel={part.href.startsWith('https:')?'noopener noreferrer':undefined} className="underline underline-offset-4">{part.text}</a>:part.text)}</p>)}</article>;
}
