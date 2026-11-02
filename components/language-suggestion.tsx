"use client";
import {translatedPath} from "@/lib/routes";
import {useEffect,useState} from "react";
import {type Lang,isLang,messages} from "@/lib/i18n";
import {Button} from "./ui";
const copy={bg:{question:'Устройството ви е на български. Да отворим ли българската версия?',accept:'Към българската версия'},tr:{question:'Cihazınızın dili Türkçe. Türkçe sürüme geçmek ister misiniz?',accept:'Türkçe’ye geç'},en:{question:'Your device uses English. Would you like the English version?',accept:'Switch to English'}};
export function LanguageSuggestion({lang}:{lang:Lang}){
 const [suggested,setSuggested]=useState<Lang>();
 useEffect(()=>{const target=navigator.languages.map(value=>value.toLowerCase().split('-')[0]).find(isLang);if(!target||target===lang)return;try{if(localStorage.getItem('scoreboard-language')===lang||localStorage.getItem('scoreboard-language-suggestion')===`${lang}:${target}`)return;}catch{}setSuggested(target);},[lang]);
 if(!suggested)return null;
 const dismiss=()=>{try{localStorage.setItem('scoreboard-language-suggestion',`${lang}:${suggested}`);}catch{}setSuggested(undefined);};
 return <aside aria-label={messages[lang].language} className="border-b border-forest/15 bg-forest/5"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3"><p lang={suggested} className="flex-1 text-base">{copy[suggested].question}</p><div className="flex gap-2"><Button primary lang={suggested} onClick={()=>{try{localStorage.setItem('scoreboard-language',suggested);}catch{}location.assign(translatedPath(location.pathname,suggested)+location.hash);}}>{copy[suggested].accept}</Button><Button aria-label={messages[lang].close} onClick={dismiss}>×</Button></div></div></aside>;
}
