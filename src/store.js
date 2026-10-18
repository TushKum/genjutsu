import{create}from'zustand';
import{seedSignals,seedLedger,titleName}from'./data.js';
const demo=()=>({signals:seedSignals(),ledger:seedLedger(),points:0,home:'maa',unlocked:{},registered:[],voted:false});
let uid=0;
// Each chapter is its own page (/discover … /pilot). The path is the source of truth; older #01–#05 links still resolve.
export const slugs=['discover','localize','monetize','retain','pilot'];
export const pathFor=i=>i===null?'/':'/'+slugs[i];
const fromLocation=()=>{const h=location.hash.match(/^#0?([1-5])$/);if(h)return +h[1]-1;const i=slugs.indexOf(location.pathname.replace(/^\/+|\/+$/g,''));return i<0?null:i};
const linked=fromLocation();
if(location.hash&&linked!==null)history.replaceState(null,'',pathFor(linked));
const go=i=>{if(location.pathname!==pathFor(i))history.pushState(null,'',pathFor(i))};
export const useStore=create(set=>({active:linked,ready:false,setReady:()=>set({ready:true}),visited:linked===null?[]:[linked],open:i=>{go(i);set(s=>({active:i,visited:[...new Set([...s.visited,i])]}))},close:()=>{go(null);set({active:null})},sync:()=>{const i=fromLocation();set(s=>({active:i,visited:i===null?s.visited:[...new Set([...s.visited,i])]}))},
...demo(),
setHome:home=>set({home}),
record:e=>set(s=>({ledger:[{id:'e'+uid++,t:Date.now(),gross:0,creator:0,...e},...s.ledger]})),
request:(title,city,n=1)=>set(s=>{const c=s.signals[title][city];return{signals:{...s.signals,[title]:{...s.signals[title],[city]:{...c,requests:c.requests+n}}}}}),
unlock:(key,city,gross,creator)=>set(s=>({unlocked:{...s.unlocked,[key]:true},points:s.points+20,ledger:[{id:'e'+uid++,t:Date.now(),kind:'unlock',label:'Manga unlock · '+key,city,gross,creator},...s.ledger]})),
register:(serial,city)=>set(s=>s.registered.includes(serial)?{}:{registered:[...s.registered,serial],points:s.points+150,ledger:[{id:'e'+uid++,t:Date.now(),kind:'register',label:'Passport registered · '+serial,city,gross:0,creator:0},...s.ledger]}),
vote:(title,city)=>set(s=>{const c=s.signals[title][city];return{voted:true,signals:{...s.signals,[title]:{...s.signals[title],[city]:{...c,requests:c.requests+50}}},ledger:[{id:'e'+uid++,t:Date.now(),kind:'vote',label:'Inner-circle vote · '+titleName(title),city,gross:0,creator:0},...s.ledger]}}),
resetDemo:()=>set(demo())}));
export const chapters=[
{name:'Audience discovery',nav:'Discover',title:'Find where fans\nwill actually pay.',body:'India has an estimated 40M+ anime and manga fans, but demand is different in every city. The Demand Radar ranks cities for each title, so a studio knows where to launch first.',try:'Press “Send 25 fan requests” and watch your city climb. Switch titles to compare.',items:[['What it reads','Public search trends, community size and fan requests made in the app.'],['What it shows','A ranked list of cities for each title, with a confidence level.'],['What happens next','The top city gets a small preorder test before anything is produced.']]},
{name:'Localization & distribution',nav:'Localize',title:'Official manga.\nYour language. ₹20.',body:'Pirated scans win because they are free, fast and in the fan’s own language. OTSUKAI matches that with studio-reviewed translations and instant UPI payments.',try:null,items:[['Languages','Hindi, Tamil and Telugu, translated by fans and reviewed by the studio.'],['Price','₹10–₹30 per unlock. 80% goes to the studio, 20% to the platform.'],['Reach','Web app first, then Comic Con India pop-ups, campus fests and retail partners.']]},
{name:'Monetization & merch',nav:'Monetize',title:'Affordable merch\nthat pays the creator.',body:'Imported merch costs ₹3K–₹15K, so an estimated 92% of fans’ merch is bootleg and pays creators nothing. Licensed merch made in India sells for ₹399–₹999, and every item has a scannable passport.',try:'Register the genuine tee (+150 points), then try the cloned and fake tags to see how they are caught.',items:[['Made in India','Vetted local manufacturers produce small batches only after preorders prove demand.'],['Hard to fake','Every item has a QR passport. Suspicious scan patterns flag cloned tags.'],['Fair split','On a ₹699 tee, ₹209.70 (30%) goes to the Japanese rights holder.']]},
{name:'Community retention',nav:'Retain',title:'Turn fans into\na community.',body:'Every unlock and scan earns loyalty points. Top fans vote on the next release, and studios see every rupee in one royalty ledger.',try:'Find your actions in the ledger, then vote on what launches next.',items:[['Loyalty','Points from unlocks and registered items unlock early access and event perks.'],['Events','Comic Con India pop-ups and campus fests double as preorder booths.'],['The loop','Fan votes feed straight back into the Demand Radar for the next release.']]},
{name:'Pilot & the ask',nav:'Pilot',title:'From demo to the\nfirst paying royalty.',body:'Every official purchase in India should pay a creator in Japan. Three introductions unlock an 18-month pilot.',try:null,items:[]}];
