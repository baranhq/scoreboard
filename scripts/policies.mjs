import{mkdirSync,writeFileSync}from'node:fs';
import{privacy}from'../lib/privacy.ts';import{messages}from'../lib/i18n.ts';import{operator}from'../lib/operator.ts';
mkdirSync('public/policies',{recursive:true});
for(const lang of ['bg','tr','en']){
 const data=privacy[lang],t=messages[lang];let content=data.intro+'\n\n';
 for(const section of data.sections){content+='## '+section.title+'\n\n'+section.paragraphs.join('\n\n')+'\n\n';if(section.title.includes('Cloudflare'))content+=`[${t.cloudPolicy}](https://www.cloudflare.com/privacypolicy/)\n\n`;if(['Your rights','Вашите права','Haklarınız'].includes(section.title))content+='[КЗЛД / CPDP](https://cpdp.bg/en/)\n\n';}
 content+=`## ${t.controllerContact}\n\n${operator.name}\n\n[${operator.email}](mailto:${operator.email})`;
 writeFileSync(`public/policies/${lang}.json`,JSON.stringify({title:t.privacy,content,revision:0,updatedAt:'2026-11-02'},null,2)+'\n');
}
