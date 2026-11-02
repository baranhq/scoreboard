"use client";
import {translatedPath} from "@/lib/routes";
import {useEffect,useState} from "react";
import {type Lang,isLang,messages} from "@/lib/i18n";
import {Button,Modal} from "./ui";
const copy={bg:{question:'Устройството ви е на български. Да отворим ли българската версия?',accept:'Към българската версия'},tr:{question:'Cihazınızın dili Türkçe. Türkçe sürüme geçmek ister misiniz?',accept:'Türkçe’ye geç'},en:{question:'Your device uses English. Would you like the English version?',accept:'Switch to English'}};
export function LanguageSuggestion({lang,onComplete}:{lang:Lang;onComplete:()=>void}){
 const [suggested,setSuggested]=useState<Lang>();
 useEffect(()=>{
  const target=navigator.languages.map(value=>value.toLowerCase().split('-')[0]).find(isLang);
  if(!target||target===lang){onComplete();return;}
  try{if(localStorage.getItem('scoreboard-language')===lang||localStorage.getItem('scoreboard-language-suggestion')===`${lang}:${target}`){onComplete();return;}}catch{}
  setSuggested(target);
 },[lang,onComplete]);
 if(!suggested)return null;
 const dismiss=()=>{try{localStorage.setItem('scoreboard-language-suggestion',`${lang}:${suggested}`);}catch{}setSuggested(undefined);onComplete();};
 return <Modal title={messages[lang].language} close={dismiss} closeLabel={messages[lang].close}><p lang={suggested} className="mb-6 text-lg leading-7">{copy[suggested].question}</p><div className="flex justify-end"><Button primary lang={suggested} onClick={()=>{try{localStorage.setItem('scoreboard-language',suggested);}catch{}location.assign(translatedPath(location.pathname,suggested)+location.hash);}}>{copy[suggested].accept}</Button></div></Modal>;
}
