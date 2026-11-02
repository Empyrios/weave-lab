// Developer research data transcribed from the canonical Weave Archive and Balance Constants.
// Numerical values are provisional playtest candidates, not an approved final balance.
export const ASPECTS = Object.freeze(['Aqua','Ignis','Terra','Sky','Wild','Aether']);
export const ASPECT_COLOURS = Object.freeze({Aqua:'#62cde7',Ignis:'#fb856d',Terra:'#e2bf7e',Sky:'#8cbbff',Wild:'#7fdc9c',Aether:'#bea2fd'});
const art=(name,cost,power,damage='none',effect='',extra={})=>({name,cost,power,damage,effect,...extra});
export const LINES=[
 {id:'fjordfin',aspect:'Aqua',role:'Loom control / protection',icon:'◈',source:'3e43aaec5da181a8afe9f101ef18ddb2',forms:[
 {name:'Fjordfin',hp:120,atk:75,phy:95,spe:135,essence:7,trait:'Fjord Runes',arts:[art('Tidal Ram',3,28,'physical','Damage, then shift one Loom row'),art('Runic Current',5,22,'special','Delayed Fjord Rune detonation'),art('Fjordwall',7,0,'none','30 self Shield; 14 allied Shields and Taunt',{kind:'shield',shield:30})]},
 {name:'Jormunfin',hp:155,atk:95,phy:115,spe:175,essence:7,trait:'Worldsea Runes',arts:[art('World-Tide',3,34,'special','Damage, then shift a Loom line'),art('Binding Runes',5,20,'special','Reactive rune when target casts'),art('Horizon Breaker',7,30,'special','All-enemy hit; self Shield, Taunt',{kind:'aoe',shield:36})]}
 ]},
 {id:'craglet',aspect:'Terra',role:'Tank / counterattack',icon:'⬡',source:'3e53aaec5da1819299e3f3241716766f',forms:[
 {name:'Craglet',hp:130,atk:70,phy:160,spe:100,essence:10,trait:'Bedrock',arts:[art('Stoneclub',4,32,'physical','True Damage; conditional retaliation +18 AP',{trueDamage:true}),art('Brace',5,0,'none','15% HP Shield and defence buff',{kind:'shield',shield:20}),art('Stand Behind Me',7,0,'none','10% HP Shield and Taunt',{kind:'shield',shield:13})]},
 {name:'Cragkyl',hp:165,atk:90,phy:200,spe:120,essence:10,trait:'Fortress',arts:[art('Cragbreaker',4,38,'physical','True Damage; retaliation +20 AP',{trueDamage:true}),art('Citadel Stance',6,0,'none','20% HP Shield, Defence Up and Taunt',{kind:'shield',shield:33}),art('Mountainfall',10,90,'physical','True Damage; +18 AP per Fortress stack',{trueDamage:true})]}
 ]},
 {id:'kilnix',aspect:'Ignis',role:'Burn / Heat economy',icon:'✹',source:'3f13aaec5da18179866cd751ec42f73e',forms:[
 {name:'Kilnix',hp:90,atk:105,phy:85,spe:65,essence:10,trait:'Kilnheart',arts:[art('Kindle',3,24,'special','Burn 6 for two Turns; +2 Heat'),art('Stoke',3,0,'none','Strengthen Burn; +3 Heat',{kind:'setup'}),art('Smelt',6,30,'special','Consumes Heat, bonus AP from Heat and Burn')]},
 {name:'Crucivar',hp:120,atk:135,phy:110,spe:70,essence:10,trait:'Forgeheart',arts:[art('Ignite',3,32,'special','Burn 8 for two Turns; +2 Heat'),art('Temper',3,0,'none','Strengthen Burn; Special Defence Down',{kind:'setup'}),art('Rupture',7,40,'special','Consumes Heat; can release remaining Burn')]}
 ]},
 {id:'budwyrm',aspect:'Wild',role:'Multi-hit sustain / growth',icon:'✿',source:'3f13aaec5da181f5b7fff7189f212d7a',forms:[
 {name:'Budwyrm',hp:85,atk:110,phy:70,spe:60,essence:8,trait:'Thornsprout',arts:[art('Hungry Bud',4,10,'physical','Two bites +1 per Bud Head; 40% actual HP leech',{hits:2}),art('Latch and Tear',6,30,'physical','+12 AP per Bud Head; one combined hit'),art('Bloodbud',3,0,'none','Sacrifice 10% HP to gain three Bud Heads',{kind:'setup'})]},
 {name:'Bloomdra',hp:110,atk:140,phy:85,spe:65,essence:8,trait:'Thornsprout+',arts:[art('Ravenous Bloom',4,10,'physical','Five bites +1 per Bud Head; 50% actual HP leech',{hits:5}),art('Rend Asunder',6,65,'physical','+12 AP per Bud Head; one combined hit'),art('Forced Growth',3,0,'none','Sacrifice 10% HP to gain two Bud Heads',{kind:'setup'})]}
 ]},
 {id:'ruklet',aspect:'Sky',role:'Focused executioner',icon:'✦',source:'3f23aaec5da18167921af3448a9130e5',forms:[
 {name:'Ruklet',hp:90,atk:115,phy:80,spe:60,essence:8,trait:'Killing Instinct',arts:[art('Sundering Talon',3,38,'physical','Efficient normal damage'),art('Severance',4,34,'physical','Remove up to 18 Shield then hit',{shieldRemove:18}),art('Deathbound Dive',7,60,'physical','+24 AP if target at ≤50% HP',{lowHpBonus:24})]},
 {name:'Rukhara',hp:120,atk:145,phy:100,spe:70,essence:8,trait:'Executioner',arts:[art('Sovereign’s Scythe',3,46,'physical','Efficient normal damage'),art('Royal Severance',4,42,'physical','Remove up to 28 Shield then hit',{shieldRemove:28}),art('Final Judgement',7,74,'physical','+32 AP if target at ≤50% HP',{lowHpBonus:32})]}
 ]},
 {id:'mothrit',aspect:'Aether',role:'Frailty / curses / Essence',icon:'✧',source:'3f33aaec5da181868d00feea44f40fb0',forms:[
 {name:'Mothrit',hp:80,atk:80,phy:45,spe:95,essence:10,trait:'Lingering Dust',arts:[art('Wither',3,18,'special','Frailty reduces outgoing damage 20%'),art('Siphon',4,14,'special','Hunger may transfer two Essence'),art('Unravel',4,20,'special','Ruin amplifies next allied Art by 25%')]},
 {name:'Maledith',hp:105,atk:100,phy:55,spe:115,essence:10,trait:'Lingering Malice',arts:[art('Enfeeble',3,26,'special','Frailty reduces outgoing damage 30%'),art('Ravenous Hex',4,22,'special','Hunger may transfer three Essence'),art('Malediction',5,30,'special','Ruin amplifies next allied Art by 35%')]}
 ]}
];
export const FORMS=LINES.flatMap(line=>line.forms.map((f,index)=>({...f,id:`${line.id}-${index}`,lineId:line.id,aspect:line.aspect,role:line.role,source:`https://app.notion.com/p/${line.source}`,rewoven:index===1})));
export const getLine=id=>LINES.find(x=>x.id===id);
export const getForm=(lineId,rewoven=false)=>{const line=getLine(lineId);if(!line)throw new Error(`Unknown line: ${lineId}`);return line.forms[rewoven?1:0]};
export const PRESETS={
 'v0.1.2':{id:'v0.1.2',label:'Released v0.1.2',damage:'legacy',split:false,defenceSmoothing:null,threadCost:6,threadCap:6,startingMarkers:3,markerCap:4,markerChance:0.125,markerFloor:0,refillEnabled:true,movesPerTurn:2,loomSize:7,decisionSeconds:30,description:'Released frozen engine baseline. Single Defence; legacy formula. New kit stats are NOT interchangeable with this mode.'},
 'v0.2':{id:'v0.2',label:'Approved v0.2 trial',damage:'split',split:true,defenceSmoothing:50,threadCost:4,threadCap:6,startingMarkers:8,markerCap:14,markerChance:0.35,markerFloor:6,refillEnabled:true,movesPerTurn:2,loomSize:7,decisionSeconds:30,description:'Current approved experimental design. Split Defence, faster Threads. This Lab is not the v0.2 game implementation.'}
};
export const DEFAULT_DRAFT=[['fjordfin','craglet','kilnix'],['budwyrm','ruklet','mothrit']];
export const SOURCES={combat:'https://app.notion.com/p/3e43aaec5da18139857fd8a92a25e7df',loom:'https://app.notion.com/p/3e43aaec5da18170923df4159d3a2f04',balance:'https://app.notion.com/p/3e43aaec5da1819f90f8d75ebdf1f095',design:'https://app.notion.com/p/3e43aaec5da1812cbda9edb2d946bcc4',repo:'https://github.com/Empyrios/weave'};
