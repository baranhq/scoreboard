import type {Metadata} from 'next';
import {brand,siteOrigin} from '@/lib/site';
export const metadata:Metadata={metadataBase:new URL(siteOrigin),title:`Изберете език | ${brand}`,robots:{index:false,follow:true},alternates:{canonical:`${siteOrigin}/bg/`}};
export default function Page() {return <html lang="bg"><head><script src="/language-entry.js"/></head><body><a href="/bg/">Продължи към Scoreboard</a></body></html>;}
