import {readFileSync} from 'node:fs';
import {notFound} from 'next/navigation';
import {isLang,messages,repo} from '@/lib/i18n';
import {brand} from '@/lib/site';
import {pageMetadata} from '@/lib/page-metadata';
import {Frame} from '@/components/frame';
import {LicenceDisclosure,type Dependency} from '@/components/licence-disclosure';
export async function generateMetadata({params}:{params:Promise<{lang:string}>}){const {lang}=await params;if(!isLang(lang))notFound();return pageMetadata(lang,'licenses',`/${lang}/licenses/`);}
export default async function Page({params}:{params:Promise<{lang:string}>}){
 const {lang}=await params;if(!isLang(lang))notFound();const t=messages[lang];
 const rows=JSON.parse(readFileSync('public/dependencies.json','utf8')) as Dependency[];
 return <Frame lang={lang}><main id="main" className="mx-auto max-w-5xl px-5 py-7"><h1 className="font-display text-3xl font-bold">{t.licenses}</h1><p className="mt-4 max-w-3xl text-lg leading-8">{t.licenseIntro}</p><div className="mt-3 flex flex-wrap gap-x-5"><a href="/LICENSE.txt" className="inline-flex min-h-11 items-center underline underline-offset-4">MIT License</a><a href="/THIRD-PARTY-NOTICES.txt" className="inline-flex min-h-11 items-center underline underline-offset-4">{t.downloadNotices}</a><a href={`${repo}/blob/HEAD/LICENSES.md`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">LICENSES.md</a></div><details className="mt-5 border-y border-forest/20"><summary className="min-h-16 cursor-pointer px-3 py-4 font-display text-xl font-bold">{brand} · MIT License</summary><pre className="whitespace-pre-wrap break-words px-3 pb-5 text-base leading-7">{readFileSync('LICENSE','utf8')}</pre></details><h2 className="mt-7 mb-3 font-display text-2xl font-bold">{t.dependencies}</h2>{rows.map(row=><LicenceDisclosure key={`${row.name}-${row.version}`} dependency={row} lang={lang}/>)}</main></Frame>;
}
