import { notFound } from "next/navigation";
import { isLang, messages, origin } from "@/lib/i18n";
import { Scoreboard } from "@/components/scoreboard/scoreboard";
import { brand } from "@/lib/site";
import { softwareSchema } from "@/lib/seo-content";
import { HomeIntro } from "@/components/content/home-intro";
import { HomeFaq } from "@/components/content/home-faq";

export default async function Page({params}: {params: Promise<{lang: string}>}) {
 const {lang}=await params;
 if(!isLang(lang))notFound();
 const schema=softwareSchema(lang,origin,brand);
 return <>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
  <Scoreboard lang={lang} t={messages[lang]} below={<HomeFaq lang={lang}/>}><HomeIntro lang={lang}/></Scoreboard>
 </>;
}
