import {notFound} from "next/navigation";
import {isLang,messages} from "@/lib/i18n";
import {SavedBoards} from "@/components/scoreboard/saved-boards";
import {pageMetadata} from "@/lib/page-metadata";
export async function generateMetadata({params}:{params:Promise<{lang:string}>}){const {lang}=await params;if(!isLang(lang))notFound();return pageMetadata(lang,'saved',`/${lang}/scoreboards/`);}
export default async function Page({params}:{params:Promise<{lang:string}>}){const {lang}=await params;if(!isLang(lang))notFound();return <SavedBoards lang={lang} t={messages[lang]}/>;}
