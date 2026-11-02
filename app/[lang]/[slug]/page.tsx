import {HelpPage} from '@/components/help-page';
import {notFound} from 'next/navigation';
import {isLang,type Lang} from '@/lib/i18n';
import {slugs,type PageKey} from '@/lib/routes';
import {pageMetadata} from '@/lib/page-metadata';
import Privacy from '../privacy/page';
import Licenses from '../licenses/page';
import Saved from '../scoreboards/page';
export const dynamicParams=false;
export function generateStaticParams({params}:{params:{lang:string}}){if(!isLang(params.lang))notFound();const lang=params.lang;return ['saved','privacy','licenses','help'].map(page=>({slug:slugs[lang][page as Exclude<PageKey,'home'>]}));}
function pageKey(lang:Lang,slug:string){return (['saved','privacy','licenses','help'] as const).find(key=>slugs[lang][key]===slug);}
export async function generateMetadata({params}:{params:Promise<{lang:string;slug:string}>}){const {lang,slug}=await params;if(!isLang(lang))notFound();const key=pageKey(lang,slug);if(!key)notFound();return pageMetadata(lang,key);}
export default async function Page({params}:{params:Promise<{lang:string;slug:string}>}){const {lang,slug}=await params;if(!isLang(lang))notFound();const key=pageKey(lang,slug);if(!key)notFound();if(key==='help')return <HelpPage lang={lang}/>;const Page=key==='saved'?Saved:key==='privacy'?Privacy:Licenses;return <Page params={Promise.resolve({lang})}/>;}
