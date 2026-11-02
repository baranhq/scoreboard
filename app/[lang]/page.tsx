import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n";
import { Scoreboard } from "@/components/scoreboard";
export default async function Page({params}: {params: Promise<{lang: string}>}) {const {lang} = await params; if (!isLang(lang)) notFound(); return <Scoreboard lang={lang}/>;}
