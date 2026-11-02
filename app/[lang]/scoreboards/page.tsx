import {brand} from "@/lib/site";
import {route} from "@/lib/routes";
import {notFound} from "next/navigation";
import {isLang,messages,origin} from "@/lib/i18n";
import {SavedBoards} from "@/components/saved-boards";
import type {Metadata} from "next";
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata>{const {lang}=await params;if(!isLang(lang))notFound();return {title:`${messages[lang].saved} | ${brand}`,robots:{index:false,follow:false},alternates:{canonical:`${origin}${route(lang,'saved')}`,languages:{bg:route('bg','saved'),tr:route('tr','saved'),en:route('en','saved'),'x-default':route('bg','saved')}},openGraph:{title:`${messages[lang].saved} | ${brand}`,url:`/${lang}/scoreboards/`}};}
export default async function Page({params}:{params:Promise<{lang:string}>}){const {lang}=await params;if(!isLang(lang))notFound();return <SavedBoards lang={lang}/>;}
