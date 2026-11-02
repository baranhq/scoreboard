import {brand} from './site';
import type {Metadata} from 'next';
import {type Lang,messages,origin} from './i18n';
import {route,type PageKey} from './routes';
export function pageMetadata(lang:Lang,page:Exclude<PageKey,'home'>):Metadata {
 const key=page==='saved'?'saved':page;
 return {title:`${messages[lang][key]} | ${brand}`,description:page==='privacy'?messages[lang].privacyIntro:page==='licenses'?messages[lang].licenseIntro:messages[lang].saved,alternates:{canonical:origin+route(lang,page),languages:{bg:route('bg',page),tr:route('tr',page),en:route('en',page),'x-default':route('bg',page)}},openGraph:{title:`${messages[lang][key]} | ${brand}`,url:route(lang,page)},...(page==='saved'?{robots:{index:false,follow:false}}:{})};
}
