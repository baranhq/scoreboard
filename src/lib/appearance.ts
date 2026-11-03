export type Appearance = {
 scoreSize: 'small'|'medium'|'large'|'xlarge'; teamSize: 'small'|'medium'|'large'|'xlarge'; layout: 'auto'|'horizontal'|'grid';
 density: 'compact'|'spacious'; textScaleEnabled: boolean; textScale: number; showPausedNotice: boolean; fullscreenControls: boolean; increment: number; autoHideControls: boolean;
};
export const defaults: Appearance = {scoreSize:'medium',teamSize:'medium',layout:'auto',density:'compact',textScaleEnabled:false,textScale:100,showPausedNotice:true,fullscreenControls:true,increment:1,autoHideControls:true};
export function parseAppearance(input: unknown): Partial<Appearance> | undefined {
 if(input === undefined)return undefined;
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('appearance');
 const a=input as Record<string,unknown>;const result:Record<string,unknown>={};
 for(const [key,values] of Object.entries({scoreSize:['small','medium','large','xlarge'],teamSize:['small','medium','large','xlarge'],layout:['auto','horizontal','grid'],density:['compact','spacious']})){
  if(a[key]!==undefined){if(!values.includes(a[key] as string))throw new Error('appearance');result[key]=a[key];}
 }
 if(a.textScale!==undefined){if(typeof a.textScale!=='number'||!Number.isInteger(a.textScale)||a.textScale<80||a.textScale>160||a.textScale%5!==0)throw new Error('textScale');result.textScale=a.textScale;}
 for(const key of ['textScaleEnabled','showPausedNotice','fullscreenControls','autoHideControls'])if(a[key]!==undefined){if(typeof a[key]!=='boolean')throw new Error('appearance');result[key]=a[key];}
 if(a.increment!==undefined){if(typeof a.increment!=='number'||!Number.isInteger(a.increment)||a.increment<1||a.increment>1000)throw new Error('increment');result.increment=a.increment;}
 return result as Partial<Appearance>;
}
