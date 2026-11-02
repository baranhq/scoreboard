export const defaultColor = "#e9efe6";
export const validColor = (value: unknown): value is string => typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
export function foreground(hex: string): string {
 const rgb = hex.slice(1).match(/../g)!.map(v => {const c=parseInt(v,16)/255; return c<=0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4;});
 const luminance = rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;
 return (luminance+0.05)/0.05 >= 1.05/(luminance+0.05) ? "#000000" : "#ffffff";
}

function luminance(hex:string):number {const c=hex.slice(1).match(/../g)!.map(h=>{const n=parseInt(h,16)/255;return n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4;});return c[0]*0.2126+c[1]*0.7152+c[2]*0.0722;}
export function contrast(a:string,b:string):number {const x=luminance(a),y=luminance(b);return(Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
export function readableText(background:string,requested?:string):string {return requested&&validColor(requested)&&contrast(background,requested)>=4.5?requested:foreground(background);}
export const teamPalette = [
 {background:'#e3eef5',text:'#24516d',dark:'#203441',darkText:'#d2e5f1',accent:'#2c607f'},
 {background:'#f7e8da',text:'#814719',dark:'#3d2d21',darkText:'#f4d6b7',accent:'#8c4a1f'},
 {background:'#deeee9',text:'#215c50',dark:'#203831',darkText:'#c9e7dc',accent:'#286457'},
 {background:'#f3e2e1',text:'#843d39',dark:'#3e2829',darkText:'#f0ccca',accent:'#8a423c'},
 {background:'#f5efd5',text:'#67551c',dark:'#38331f',darkText:'#efe3ab',accent:'#6d5a1d'}
];
function toHsl(hex:string):[number,number,number] {
 const [r,g,b]=hex.slice(1).match(/../g)!.map(v=>parseInt(v,16)/255);const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;
 if(d===0)return[135,0,l];const s=d/(1-Math.abs(2*l-1));let h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360;return[h,s,l];
}
function fromHsl(h:number,s:number,l:number):string {
 const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
 const rgb=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
 return '#'+rgb.map(n=>Math.round((n+m)*255).toString(16).padStart(2,'0')).join('');
}
export function buttonColors(background:string){
 const [rawHue,rawSaturation]=toHsl(background);const hue=rawSaturation<0.08?135:rawHue;const saturation=Math.max(0.35,Math.min(0.68,rawSaturation));
 const lightBackground=foreground(background)==='#000000';let lightness=lightBackground?0.30:0.82;
 let primary=fromHsl(hue,saturation,lightness);
 for(let n=0;n<40&&contrast(primary,background)<3;n++){lightness+=lightBackground?-0.005:0.005;primary=fromHsl(hue,saturation,Math.max(0.02,Math.min(0.98,lightness)));}
 if(contrast(primary,background)<3)primary=foreground(background);
 const text=foreground(primary);const candidate=fromHsl(hue,saturation,Math.max(0,Math.min(1,lightness+(lightBackground?-0.035:0.035))));
 const hover=contrast(candidate,background)>=3&&contrast(candidate,text)>=4.5?candidate:primary;
 return {primary,text,hover,border:primary,secondaryText:foreground(background)};
}
