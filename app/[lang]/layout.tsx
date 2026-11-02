import { notFound } from "next/navigation";
import { isLang, languages, messages, origin } from "@/lib/i18n";
import { indexable, brand } from "@/lib/site";
import type { Metadata } from "next";
export const dynamicParams = false;
export function generateStaticParams() {return languages.map(lang => ({lang}));}
export async function generateMetadata({params}: {params: Promise<{lang: string}>}): Promise<Metadata> {
 const {lang} = await params; if (!isLang(lang)) notFound(); const t = messages[lang];
 return {robots: {index: indexable, follow: indexable}, metadataBase: new URL(origin), title: `${t.board} | ${brand}`, description: t.intro, alternates:{canonical:`/${lang}/`, languages:{bg:"/bg/",tr:"/tr/",en:"/en/","x-default":"/bg/"}}, openGraph:{type:"website",title:`${t.board} | ${brand}`,description:t.intro,locale:lang === "bg" ? "bg_BG" : lang === "tr" ? "tr_TR" : "en_GB",url:`/${lang}/`,images:["/social.png"]},twitter:{card:"summary_large_image",title:`${t.board} | ${brand}`,description:t.intro,images:["/social.png"]},icons:{icon:"/icon.png"}};
}
export default async function Layout({children, params}: {children: React.ReactNode; params: Promise<{lang: string}>}) {const {lang} = await params; if (!isLang(lang)) notFound(); return <html lang={lang==='en'?'en-GB':lang} suppressHydrationWarning><head><script src="/theme.js" /></head><body>{children}</body></html>;}
