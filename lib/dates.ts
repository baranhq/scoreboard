export function europeanDateTime(value:number):string {
 const date=new Date(value);const two=(n:number)=>String(n).padStart(2,'0');
 return `${two(date.getDate())}.${two(date.getMonth()+1)}.${date.getFullYear()}, ${two(date.getHours())}:${two(date.getMinutes())}`;
}
