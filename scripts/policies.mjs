import{mkdirSync,writeFileSync}from'node:fs';
import nextEnv from'@next/env';
const{loadEnvConfig}=nextEnv;
loadEnvConfig(process.cwd(),process.env.npm_lifecycle_event==='predev');
const{privacy}=await import('../lib/privacy.ts');const{messages}=await import('../lib/i18n.ts');const{operator}=await import('../lib/operator.ts');
mkdirSync('public/policies',{recursive:true});
for(const lang of ['bg','tr','en']){
 const data=privacy[lang],t=messages[lang];let content=data.intro+'\n\n';
 for(const section of data.sections){content+='## '+section.title+'\n\n'+section.paragraphs.join('\n\n')+'\n\n';if(section.title.includes('Cloudflare'))content+=`[${t.cloudPolicy}](https://www.cloudflare.com/privacypolicy/)\n\n`;if(['Your rights','Вашите права','Haklarınız'].includes(section.title))content+='[КЗЛД / CPDP](https://cpdp.bg/en/)\n\n';}
 content+=`## ${t.controllerContact}\n\n${operator.name}\n\n[${operator.email}](mailto:${operator.email})`;
 writeFileSync(`public/policies/${lang}.json`,JSON.stringify({title:t.privacy,content,revision:0,updatedAt:'2026-11-03'},null,2)+'\n');
}
