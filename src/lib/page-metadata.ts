import {help} from './help';
import {brand, indexable, siteOrigin} from './site';
import type {Metadata} from 'next';
import {type Lang,messages} from './i18n';
import {localizedAlternates,route,type PageKey} from './routes';
import {seoContent} from './seo-content';
export function pageMetadata(lang:Lang,page:Exclude<PageKey,'home'>,currentPath?:string):Metadata {
 const heading=page==='help'?help[lang].title:messages[lang][page];
 const title=`${heading} | ${brand}`;
 const description=page==='privacy'?messages[lang].privacyIntro:page==='licenses'?seoContent[lang].pageDescriptions.licenses:page==='help'?seoContent[lang].pageDescriptions.help:seoContent[lang].description;
 const url=siteOrigin+route(lang,page);
 const canonicalPath=currentPath===undefined||currentPath===route(lang,page);
 const publicIndexable=indexable&&page!=='saved'&&canonicalPath;
 return {
  title,
  description,
  alternates:{canonical:url,languages:localizedAlternates(siteOrigin,page)},
  openGraph:{type:'website',siteName:brand,title,description,locale:seoContent[lang].openGraphLocale,url,images:[{url:`${siteOrigin}/social.png`,width:1200,height:630,alt:seoContent[lang].imageAlt}]},
  twitter:{card:'summary_large_image',title,description,images:[{url:`${siteOrigin}/social.png`,alt:seoContent[lang].imageAlt}]},
  robots:{index:publicIndexable,follow:indexable&&page!=='saved'},
 };
}
