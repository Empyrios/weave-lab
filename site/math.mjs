import {PRESETS} from './catalog.mjs';
export const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
export const roundDamage=x=>Math.max(1,Math.floor(Math.max(0,x)+0.5));
export function rawDamage({ap,atk,def,constant=50,mode='v0.2',fixed=false,critical=false}){
 for(const [k,v] of Object.entries({ap,atk,def})) if(!Number.isFinite(v)||v<0)throw new RangeError(`${k} must be non-negative and finite`);
 if(!Number.isFinite(constant)||constant<1)throw new RangeError('Invalid defence constant');
 if(!Number.isFinite(ap)||ap<0)return 0;
 if(ap===0)return 0;
 let base;
 if(fixed) base=ap;
 else if(mode==='v0.1.2')base=atk+def===0?0:ap*atk/(atk+def);
 else base=ap*atk/(constant+def);
 return roundDamage(base*(critical?1.5:1));
}
export function resolveDamage(input){
 const {ap,atk,def,shield=0,hp=100,trueDamage=false,immune=false,fixed=false,critical=false,constant=50,mode='v0.2'}=input;
 if(!Number.isFinite(shield)||shield<0||!Number.isFinite(hp)||hp<0)throw new RangeError('Invalid Shield or HP');
 const dealt=rawDamage({ap,atk,def,mode,constant,fixed,critical});
 const bypass=!!trueDamage&&!immune;
 const absorb=bypass?0:Math.min(shield,dealt);
 const toHp=Math.min(hp,Math.max(0,dealt-absorb));
 return {raw:dealt,shieldAbsorbed:absorb,hpDamage:toHp,remainingShield:Math.max(0,shield-absorb),remainingHp:Math.max(0,hp-toHp),bypassesShield:bypass,convertedTrue:!!trueDamage&&!!immune,pctHp:hp?toHp/hp*100:0};
}
export function wilson(success,total,z=1.96){
 if(!Number.isInteger(success)||!Number.isInteger(total)||total<0||success<0||success>total)throw new RangeError('Bad success and total');
 if(total===0)return {lower:0,upper:1,p:0};
 const p=success/total,d=1+z*z/total,c=(p+z*z/(2*total))/d,h=(z/d)*Math.sqrt((p*(1-p)+z*z/(4*total))/total);
 return {p,lower:clamp(c-h,0,1),upper:clamp(c+h,0,1)};
}
export function describeDamage(pct){return pct<8?'Below setup band':pct<=15?'Setup/weak band':pct<=25?'Standard band':pct<=35?'Strong band':pct<=45?'Finisher band':'Above routine guidance'};
export function numeric(v,defaultValue=0,min=-Infinity,max=Infinity){const x=Number(v);return Number.isFinite(x)?clamp(x,min,max):defaultValue}
export function selectPreset(id){return structuredClone(PRESETS[id]||PRESETS['v0.2'])}
