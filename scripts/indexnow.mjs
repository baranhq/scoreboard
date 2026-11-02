import nextEnv from '@next/env';
const {loadEnvConfig}=nextEnv;
loadEnvConfig(process.cwd(), false);

const key=process.env.INDEXNOW_KEY||'';
let origin;
try{
 const siteUrl=new URL(process.env.NEXT_PUBLIC_SITE_URL||'');
 if(siteUrl.protocol!=='https:'||siteUrl.pathname!=='/'||siteUrl.search||siteUrl.hash||siteUrl.username||siteUrl.password)throw new Error();
 origin=siteUrl.origin;
}catch{
 throw new Error('Set NEXT_PUBLIC_SITE_URL to a public HTTPS origin before submitting URLs.');
}
if(process.env.NEXT_PUBLIC_INDEXABLE!=='true')throw new Error('IndexNow is only available when NEXT_PUBLIC_INDEXABLE=true.');
if(!/^[A-Za-z0-9-]{8,128}$/.test(key))throw new Error('Set INDEXNOW_KEY to a unique 8–128 character verification key before submitting URLs.');

const{languages}=await import('../src/lib/i18n.ts');
const{route}=await import('../src/lib/routes.ts');
const urls=['home','privacy','licenses','help'].flatMap(page=>languages.map(lang=>origin+route(lang,page)));
const response=await fetch('https://api.indexnow.org/indexnow',{
 method:'POST',
 headers:{'Content-Type':'application/json; charset=utf-8'},
 body:JSON.stringify({host:new URL(origin).host,key,keyLocation:`${origin}/${key}.txt`,urlList:urls}),
 signal:AbortSignal.timeout(15000),
});
if(response.status!==200&&response.status!==202)throw new Error(`IndexNow rejected the submission (HTTP ${response.status}). Check that the key file is deployed and the origin is correct.`);
console.log(`Submitted ${urls.length} public canonical URLs to IndexNow (HTTP ${response.status}).`);
