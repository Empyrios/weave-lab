export const seed32=value=>Number.isFinite(Number(value))?Number(value)>>>0:1;
export function makeRng(seed=1){let state=seed32(seed);return{
 next(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296},
 pick(n){if(!Number.isInteger(n)||n<1)throw new RangeError('pick requires positive integer');return Math.floor(this.next()*n)},
 get state(){return state},
 shuffle(values){const arr=[...values];for(let i=arr.length-1;i>0;i--){const j=this.pick(i+1);[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
}}
