export type PolicyDocument={title:string;content:string;revision:number;updatedAt:string};
export function validPolicyDocument(value:unknown):value is PolicyDocument{
 if(!value||typeof value!=='object')return false;const p=value as Record<string,unknown>;
 return typeof p.title==='string'&&p.title.length<=200&&typeof p.content==='string'&&p.content.length<=100000&&Number.isSafeInteger(p.revision)&&typeof p.updatedAt==='string';
}
export function policyBlocks(content:string):{heading:boolean;text:string}[]{return content.replace(/\r\n/g,'\n').split(/\n\s*\n/).filter(Boolean).map(block=>({heading:block.startsWith('## '),text:block.startsWith('## ')?block.slice(3).trim():block.trim()}));}
export function policyInline(text:string):{text:string;href?:string;strong?:boolean}[]{
 const result:{text:string;href?:string;strong?:boolean}[]=[];const regex=/\[([^\]\n]+)\]\((https:\/\/[^\s)]+|mailto:[^\s)]+)\)|\*\*([^*\n]+)\*\*/g;let end=0;
 for(const match of text.matchAll(regex)){result.push({text:text.slice(end,match.index)});if(match[1]&&match[2])result.push({text:match[1],href:match[2]});else result.push({text:match[3],strong:true});end=match.index!+match[0].length;}
 result.push({text:text.slice(end)});return result;
}

export function policyDate(value:string,_lang?:string):string {
 const match=/^(\d{4})-(\d{2})-(\d{2})/.exec(value);
 return match?`${match[3]}.${match[2]}.${match[1]}`:value;
}
