export type HSV={h:number;s:number;v:number};
export function hexToHsv(hex:string):HSV{
 const [r,g,b]=hex.slice(1).match(/../g)!.map(n=>parseInt(n,16)/255);const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
 let h=d===0?135:max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h=d===0?h:(h*60+360)%360;
 return {h,s:max===0?0:d/max,v:max};
}
export function hsvToHex({h,s,v}:HSV):string{
 const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;const sector=((h%360)+360)%360;
 const rgb=sector<60?[c,x,0]:sector<120?[x,c,0]:sector<180?[0,c,x]:sector<240?[0,x,c]:sector<300?[x,0,c]:[c,0,x];
 return '#'+rgb.map(n=>Math.round((n+m)*255).toString(16).padStart(2,'0')).join('');
}
