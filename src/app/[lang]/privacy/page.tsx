import {readFileSync} from 'node:fs';
import {notFound} from 'next/navigation';
import {isLang,messages} from '@/lib/i18n';
import {pageMetadata} from '@/lib/page-metadata';
import type {PolicyDocument} from '@/lib/policy-document';
import {Frame} from '@/components/layout/frame';
import {PolicyBody} from '@/components/content/policy-body';
export async function generateMetadata({params}:{params:Promise<{lang:string}>}){const {lang}=await params;if(!isLang(lang))notFound();return pageMetadata(lang,'privacy',`/${lang}/privacy/`);}
export default async function Page({params}:{params:Promise<{lang:string}>}){
 const {lang}=await params;if(!isLang(lang))notFound();const policy=JSON.parse(readFileSync(`public/policies/${lang}.json`,'utf8')) as PolicyDocument;const t=messages[lang];
 return <Frame lang={lang} t={t}><main id="main" className="mx-auto max-w-5xl px-5 py-7"><script id="policy-document" type="application/json" suppressHydrationWarning dangerouslySetInnerHTML={{__html:JSON.stringify(policy).replace(/</g,'\\u003c')}}/><PolicyBody initial={policy} lang={lang} updatedLabel={t.revised} contentsLabel={t.contents} choicesLabel={t.choices}/></main></Frame>;
}
