import { notFound } from "next/navigation";
import { isLang, origin } from "@/lib/i18n";
import { Scoreboard } from "@/components/scoreboard";
import { brand } from "@/lib/site";
import { softwareSchema } from "@/lib/seo-content";
export default async function Page({params}: {params: Promise<{lang: string}>}) {const {lang} = await params; if (!isLang(lang)) notFound(); const schema=softwareSchema(lang,origin,brand); return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><Scoreboard lang={lang}/></>;}
