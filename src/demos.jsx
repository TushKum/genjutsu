import React,{useState,useEffect,useRef} from 'react';
import{motion,AnimatePresence}from'framer-motion';
import{useStore,chapters}from'./store.js';
import catalogUrl from'./catalog.json?url';
import{featured,cities,cityName,titleName,ranking,confidence,fans,products,split,passSplit,tiers,tierFor,inr,langs,qrBits}from'./data.js';
const ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+'m ago':Math.round(m/60)+'h ago'};
const fade={initial:{opacity:0,y:8},animate:{opacity:1,y:0},exit:{opacity:0}};
export function HomeCity(){const home=useStore(s=>s.home),setHome=useStore(s=>s.setHome);return <label className="home-city">You’re a fan in <select value={home} onChange={e=>setHome(e.target.value)}>{cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
function Chips({value,options,onChange,label}){return <div className="chips" role="group" aria-label={label}>{options.map(([v,l])=><button key={v} aria-pressed={value===v} className={value===v?'on':''} onClick={()=>onChange(v)}>{l}</button>)}</div>}
// Appears once the visitor has done the thing a page asks, pointing to the next step of the loop.
function NextStep({show,to,children}){const open=useStore(s=>s.open);return <AnimatePresence>{show&&<motion.div className="next-step" {...fade}><span>✓ {children}</span><button onClick={()=>open(to)}>Next: {chapters[to].nav} →</button></motion.div>}</AnimatePresence>}

// The 350-title catalog is fetched only when Discover opens; a failed load can be retried.
let catalogP;const loadCatalog=()=>catalogP||(catalogP=fetch(catalogUrl).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).catch(e=>{catalogP=null;throw e}));
function TitlePicker({value,onPick}){const[q,setQ]=useState(''),[all,setAll]=useState(null),[err,setErr]=useState(false),[open,setOpen]=useState(false);const input=useRef();
const load=()=>{setErr(false);loadCatalog().then(setAll,()=>setErr(true))};useEffect(load,[]);
const ql=q.trim().toLowerCase(),hits=all&&ql?all.filter(t=>t.n.toLowerCase().includes(ql)||t.s.toLowerCase().includes(ql)).slice(0,6):[];
const pick=(t,fromList)=>{onPick(t);setQ('');setOpen(false);if(fromList)input.current?.focus()};
// Escape clears the search first; only an empty field lets Escape close the page.
const key=e=>{if(e.key==='Escape'&&(q||open)){e.preventDefault();e.stopPropagation();setQ('');setOpen(false)}};
return <div className="picker"><div className="chips" role="group" aria-label="Title">{featured.map(t=><button key={t.id} aria-pressed={value.id===t.id} className={value.id===t.id?'on':''} onClick={()=>pick(t)}>{t.k}</button>)}{!featured.some(f=>f.id===value.id)&&<span className="chip-current" title={value.n}>{value.n}</span>}</div>
<div className="search" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false)}}>{err?<p className="dim">Catalog unavailable. <button className="link" onClick={load}>Try again</button></p>:
<input ref={input} type="search" value={q} onChange={e=>{setQ(e.target.value);setOpen(true)}} onFocus={()=>setOpen(true)} onKeyDown={key} placeholder={all?`Search all ${all.length} titles or a studio`:'Loading catalog…'} aria-label="Search anime titles or studios" aria-expanded={open&&hits.length>0}/>}
{open&&hits.length>0&&<ul className="hits">{hits.map(t=><li key={t.id}><button onMouseDown={e=>e.preventDefault()} onClick={()=>pick(t,true)}><b>{t.n}</b><small>{t.s} · ★ {t.r} · {fans(t.m)} members</small></button></li>)}</ul>}{open&&ql&&all&&!hits.length&&<p className="dim">No match in the catalog.</p>}</div></div>}

export function Radar(){const requests=useStore(s=>s.requests),request=useStore(s=>s.request),home=useStore(s=>s.home);const[t,setT]=useState(featured[0]),[sent,setSent]=useState(0),[pulse,setPulse]=useState(null);const rows=ranking(t,requests),best=rows[0],mine=rows.findIndex(r=>r.id===home)+1;
function send(){request(t.id,home,25);setSent(n=>n+25);setPulse(home);setTimeout(()=>setPulse(null),900)}
return <div className="demo-block">
<div className="panel"><TitlePicker value={t} onPick={setT}/><p className="facts"><b>{t.n}</b> · {t.s} · {t.g} · ★ {t.r} · {fans(t.m)} MyAnimeList members (2023 snapshot)</p>
<div className="radar"><ol className="rank">{rows.map((r,i)=><motion.li layout transition={{type:'spring',damping:28,stiffness:280}} key={r.id} className={(pulse===r.id?'pulse ':'')+(r.id===home?'mine':'')}><span className="pos">{i+1}</span><span className="city">{r.name}<small>{r.lang}</small></span><span className="bar"><motion.i animate={{width:r.score+'%'}} transition={{type:'spring',damping:24}}/></span><span className="score">{r.score}</span></motion.li>)}</ol>
<aside className="pick"><small>Launch first in</small><h4>{best.name}</h4><p aria-live="polite">{t.k||t.n} scores {best.score}/100 here, with {confidence(best.s).toLowerCase()} confidence from {best.s.requests} fan requests.</p>
<div className="sim"><HomeCity/><p>{cityName(home)} is #{mine} for {t.k||t.n}.</p><button className="primary" onClick={send}>Send 25 fan requests</button></div></aside></div>
<p className="note">Title facts: MyAnimeList scores and members from a 2023 Kaggle snapshot. City signals are simulated until partner data is connected. Score = 45% search interest + 35% community size + 20% fan requests.</p></div>
<NextStep show={sent>0} to={1}>{sent} requests sent from {cityName(home)}. The ranking updated live.</NextStep></div>}

const steps={creating:'Creating your order…',awaiting:'Approve the payment in your UPI app',settling:'Confirming payment…',done:'Paid. Chapter unlocked.',failed:'Payment declined. Nothing was charged.'};
export function MangaUnlock(){const home=useStore(s=>s.home),unlocked=useStore(s=>s.unlocked),unlock=useStore(s=>s.unlock);const homeLang=cities.find(c=>c.id===home)?.lang;const[lang,setLang]=useState(langs[homeLang]?homeLang:'Hindi'),[status,setStatus]=useState('idle');const timer=useRef();useEffect(()=>()=>clearTimeout(timer.current),[]);
const key='Moon Reader Ch.01',price=20,share=passSplit(price),open=!!unlocked[key],L=langs[lang];
function start(){setStatus('creating');timer.current=setTimeout(()=>setStatus('awaiting'),500)}
function approve(){setStatus('settling');timer.current=setTimeout(()=>{unlock(key,home,price,share.creator);setStatus('done')},900)}
return <div className="demo-block"><div className="panel">
<div className="reader"><div className={'pages '+(open?'open':'')}><div className="cover"><small>MOON READER</small><b>{L.chapter}</b></div>
<div className="frames"><div className="frame f1"><i className="moon"/><i className="crow"/></div><div className="frame f2"><i className="eye"/><span className="sfx">{L.sfx}</span></div><div className="frame f3"><p className="bubble" lang={{Hindi:'hi',Tamil:'ta',Telugu:'te',English:'en'}[lang]}>{L.line}</p></div></div>
{!open&&<div className="lock">Preview · unlock to read</div>}</div>
<div className="checkout"><span className="step-label">1. Choose a language</span><Chips label="Reading language" value={lang} onChange={setLang} options={Object.entries(langs).map(([k,v])=>[k,v.label])}/>
<span className="step-label">2. Unlock the chapter</span><div className="price"><b>{inr(price)}</b><span>{inr(share.creator)} to the studio</span></div>
{open&&status!=='done'?<p className="ok">✓ Already unlocked</p>:
status==='idle'||status==='failed'?<><button className="primary" onClick={start}>Pay ₹20 with UPI</button>{status==='failed'&&<p className="bad">{steps.failed}</p>}</>:
<div className="upi" aria-live="polite"><AnimatePresence mode="wait"><motion.p key={status} {...fade} className={status==='done'?'ok':''}>{steps[status]}</motion.p></AnimatePresence>
{status==='awaiting'&&<div className="row"><button className="primary" onClick={approve}>Approve</button><button onClick={()=>setStatus('failed')}>Decline</button></div>}</div>}
<p className="note">Sandbox payment. No real money moves.</p></div></div></div>
{open&&<DubFund lang={lang}/>}<NextStep show={open} to={2}>{inr(share.creator)} went to the studio and you earned 20 loyalty points.</NextStep></div>}

// Micro-patronage: fans co-fund an official dub. The payment gateway holds pledges back from the studio and refunds them if the goal is missed.
const DUB_GOAL=500000,DUB_BASE=384500;
function DubFund({lang}){const dubLang=lang==='English'?'Hindi':lang,mine=useStore(s=>s.pledges[dubLang]),pledge=useStore(s=>s.pledge),home=useStore(s=>s.home);const total=DUB_BASE+(mine||0),pct=Math.min(100,total/DUB_GOAL*100);
return <motion.div className="panel dub" {...fade}><div className="dub-head"><b>Next: fund the {dubLang} anime dub</b><span>{inr(total)} of {inr(DUB_GOAL)}</span></div><div className="bar"><motion.i initial={{width:0}} animate={{width:pct+'%'}}/></div>
<div className="row"><span className="dim">Pledges are held by the payment gateway and refunded to your UPI account if the goal isn’t reached in 45 days.</span>{mine?<span className="ok">✓ {inr(mine)} pledged</span>:<button onClick={()=>pledge(79,dubLang,home)}>Pledge ₹79</button>}</div></motion.div>}

function QR({serial,scanning}){const cells=qrBits(serial);return <div className={'qr '+(scanning?'scanning':'')}><svg viewBox="-2 -2 25 25" aria-label={'Passport tag '+serial} role="img"><rect x="-2" y="-2" width="25" height="25" fill="#f2ece6"/>{cells.map(([x,y])=><rect key={x+'-'+y} x={x} y={y} width="1.02" height="1.02" fill="#151217"/>)}</svg><i/></div>}
// Each tag prints its serial plus a signature: HMAC-SHA256(serial) under the studio's key, shortened to 16 hex characters.
// The demo key lives in the browser so the check can run here; in production only the verification server holds it.
const DEMO_KEY='otsukai-demo-signing-key';let keyP;
const hmacKey=()=>keyP||(keyP=crypto.subtle.importKey('raw',new TextEncoder().encode(DEMO_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign']));
const signSerial=async serial=>[...new Uint8Array(await crypto.subtle.sign('HMAC',await hmacKey(),new TextEncoder().encode(serial)))].slice(0,8).map(b=>b.toString(16).padStart(2,'0')).join('');
async function checkTag(t){if(!globalThis.crypto?.subtle)return null;const expected=await signSerial(t.serial),printed=t.forged||expected;return{printed,expected,valid:printed===expected}}
const samples=[{serial:'OT-001',label:'Genuine tee'},{serial:'OT-013',label:'Cloned tag'},{serial:'OT-777',label:'Fake item',forged:'9f3a7c21e04b5d88'}];
function Sig({sig}){if(sig===undefined)return null;if(sig===null)return <p className="sig">Signature check needs a secure (HTTPS) page.</p>;return sig.valid?<p className="sig ok">✓ Signature valid · HMAC-SHA256 · {sig.printed}</p>:<p className="sig bad">✕ Signature mismatch · tag says {sig.printed}, registry expects {sig.expected}</p>}
export function Passport(){const home=useStore(s=>s.home),registered=useStore(s=>s.registered),register=useStore(s=>s.register),record=useStore(s=>s.record);const[serial,setSerial]=useState('OT-001'),[current,setCurrent]=useState('OT-001'),[sig,setSig]=useState(undefined),[scanning,setScanning]=useState(false),[done,setDone]=useState('');const timer=useRef(),req=useRef(0);
useEffect(()=>{checkTag(samples[0]).then(r=>{if(req.current===0)setSig(r)});return()=>clearTimeout(timer.current)},[]);
function scan(t){const n=++req.current;setCurrent(t.serial);setScanning(true);setDone('');setSerial(null);setSig(undefined);clearTimeout(timer.current);Promise.all([checkTag(t),new Promise(r=>{timer.current=setTimeout(r,650)})]).then(([r])=>{if(n!==req.current)return;setSig(r);setScanning(false);setSerial(t.serial)})}
const p=serial&&products[serial],sp=p&&split(p.price);
return <div className="demo-block"><div className="panel"><div className="scanner"><div><QR serial={current} scanning={scanning}/><span className="step-label">Scan a tag</span><div className="chips stack">{samples.map(t=><button key={t.serial} className={current===t.serial?'on':''} onClick={()=>scan(t)}>{t.label}<small>{t.serial}</small></button>)}</div></div>
<div className="passport" aria-live="polite"><AnimatePresence mode="wait">{scanning?<motion.p key="s" className="dim" {...fade}>Checking the signature and the registry…</motion.p>:
!serial?<motion.p key="i" className="dim big" {...fade}>Pick a tag to scan it.</motion.p>:
p&&!p.clone?<motion.div key={serial} {...fade}><small className="ok">✓ Verified official</small><h4>{titleName(p.title)} {p.item.toLowerCase()}</h4><p className="dim">{serial} · made by a vetted partner in {p.maker.split('· ')[1]}</p><Sig sig={sig}/>
<div className="price"><b>{inr(p.price)}</b><span>{inr(sp.creator)} goes to the creator</span></div>
<div className="split"><i style={{flex:55}}>55%</i><i style={{flex:30}}>30%</i><i style={{flex:15}}>15%</i></div><div className="split-legend"><span>Making & delivery {inr(sp.ops)}</span><span>Creator {inr(sp.creator)}</span><span>Platform {inr(sp.platform)}</span></div>
<div className="row">{registered.includes(serial)?<p className="ok">✓ Registered to you. Bonus digital art unlocked.</p>:<button className="primary" onClick={()=>register(serial,home)}>Register this item (+150 points)</button>}<button onClick={()=>{record({kind:'sale',label:titleName(p.title)+' tee · sandbox sale',city:home,gross:p.price,creator:sp.creator});setDone('Sale added: '+inr(sp.creator)+' to the creator.')}}>Simulate another sale</button></div>{done&&<p className="dim">{done}</p>}</motion.div>:
<motion.div key={serial} {...fade}><small className="bad">✕ {p?'Cloned tag':'Fake tag'}</small><h4>{p?'Real tag, copied.':'Forged signature.'}</h4><Sig sig={sig}/><p className="dim">{p?`The signature is genuine, but ${serial} was scanned in ${p.clone.a} and ${p.clone.b} only ${p.clone.mins} minutes apart, which isn’t possible for one item. Registration is blocked and the studio is alerted.`:'Without the studio’s key a counterfeiter can’t produce a matching signature, and this serial isn’t in the registry either.'}</p>
{done?<p className="ok">✓ {done}</p>:<button className="primary" onClick={()=>{record({kind:'report',label:(p?'Clone flag · ':'Counterfeit report · ')+serial,city:home});setDone('Reported. Studios see fake hotspots by city.')}}>Report this seller</button>}</motion.div>}</AnimatePresence></div></div></div>
<NextStep show={registered.length>0} to={3}>Your registered item earned 150 loyalty points.</NextStep></div>}

export function Dashboard(){const ledger=useStore(s=>s.ledger),points=useStore(s=>s.points),voted=useStore(s=>s.voted),vote=useStore(s=>s.vote),home=useStore(s=>s.home),open=useStore(s=>s.open);const[,tick]=useState(0);useEffect(()=>{const i=setInterval(()=>tick(x=>x+1),30000);return()=>clearInterval(i)},[]);
const royalties=ledger.reduce((a,e)=>a+e.creator,0),count=k=>ledger.filter(e=>e.kind===k).length,sales=count('sale'),regs=count('register');
const byCity=cities.map(c=>{const es=ledger.filter(e=>e.city===c.id);return{...c,royalty:es.reduce((a,e)=>a+e.creator,0),reports:es.filter(e=>e.kind==='report').length}}).filter(c=>c.royalty||c.reports).sort((a,b)=>b.royalty-a.royalty),max=Math.max(1,...byCity.map(c=>c.royalty));
const tier=tierFor(points),next=tiers.find(t=>t.min>points),top=points>=tiers[2].min;
return <div className="demo-block"><div className="panel"><h5>For the studio: royalty ledger</h5>
<div className="hero-stat"><motion.b key={royalties} initial={{color:'#ffffff'}} animate={{color:'#6fc3a8'}}>{inr(royalties)}</motion.b><span>royalties earned · {sales} items sold · {count('unlock')} manga unlocks · {sales?Math.round(regs/sales*100):0}% of items registered</span></div>
<div className="dash"><div><h6>By city</h6><ul className="cities">{byCity.map(c=><li key={c.id}><span>{c.name}</span><span className="bar"><motion.i animate={{width:c.royalty/max*100+'%'}}/></span><span>{inr(c.royalty)}{c.reports?<em> · {c.reports} fake</em>:null}</span></li>)}</ul></div>
<div><h6>Latest activity</h6><ul className="ledger"><AnimatePresence initial={false}>{ledger.slice(0,3).map(e=><motion.li key={e.id} layout initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}}><span className={'dot '+e.kind}/><span>{e.label}<small>{cityName(e.city)} · {ago(e.t)}</small></span><span>{e.creator?'+'+inr(e.creator):''}</span></motion.li>)}</AnimatePresence></ul></div></div></div>
<div className="panel"><h5>For the fan: loyalty</h5><div className="loyalty"><div><small>Your tier</small><h4>{tier.name}</h4><p className="dim">{points} points{next?` · ${next.min-points} more for ${next.name}`:''}</p><div className="progress"><motion.i animate={{width:Math.min(100,points/tiers[2].min*100)+'%'}}/></div></div>
<ul className="perks">{tiers.map(t=><li key={t.name} className={points>=t.min?'on':''}><b>{points>=t.min?'✓':'○'} {t.name}</b>{t.perk}</li>)}</ul></div>
{top?(voted?<p className="ok">✓ Vote counted. It added 50 requests to the Demand Radar for {cityName(home)}, so the loop is closed.</p>:<div className="row vote"><span>Vote on the next title for {cityName(home)}:</span>{featured.map(t=><button key={t.id} onClick={()=>vote(t,home)}>{t.k}</button>)}</div>):
<div className="row"><span className="dim">Earn points by unlocking a chapter (+20), pledging to a dub (+10) or registering an item (+150).</span><button onClick={()=>open(1)}>Unlock a chapter</button><button onClick={()=>open(2)}>Scan an item</button></div>}</div>
<NextStep show={voted} to={4}>Your vote is now a signal on the Demand Radar.</NextStep></div>}

// Studio revenue for one title in one region, using the deck's splits: 80% of digital unlocks and 30% of each tee go to the rights holder.
const lakh=n=>n>=1e7?'₹'+(n/1e7).toFixed(2)+' crore':'₹'+(n/1e5).toFixed(1)+' lakh';
const JPY_PER_INR=1.7;
function Slider({label,value,min,max,step,fmt,onChange}){return <label className="slider"><span>{label}<b>{fmt(value)}</b></span><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(+e.target.value)}/></label>}
function Simulator(){const[fansN,setFans]=useState(100000),[conv,setConv]=useState(4),[spend,setSpend]=useState(60),[tees,setTees]=useState(1000),[price,setPrice]=useState(699);
const payers=Math.round(fansN*conv/100),digital=payers*spend*12*.8,merch=tees*4*price*.3,total=digital+merch;
return <div className="panel"><h5>Studio revenue per title and region</h5><div className="sim-grid"><div className="sliders">
<Slider label="Fans reached" value={fansN} min={25000} max={1000000} step={25000} fmt={v=>v.toLocaleString('en-IN')} onChange={setFans}/>
<Slider label="Who pay" value={conv} min={1} max={10} step={.5} fmt={v=>v+'%'} onChange={setConv}/>
<Slider label="Spend per payer, monthly" value={spend} min={20} max={250} step={10} fmt={v=>'₹'+v} onChange={setSpend}/>
<Slider label="Tees per release (4 a year)" value={tees} min={200} max={2000} step={100} fmt={v=>v.toLocaleString('en-IN')} onChange={setTees}/>
<Slider label="Tee price" value={price} min={399} max={999} step={50} fmt={v=>'₹'+v} onChange={setPrice}/></div>
<div className="sim-out"><small>To the studio, per year</small><b>{lakh(total)}</b><span>≈ ¥{(total*JPY_PER_INR/1e6).toFixed(1)} million (assuming ¥{JPY_PER_INR} per ₹)</span>
<ul><li><span>Manga & dub unlocks (80%)</span><span>{lakh(digital)}</span></li><li><span>Licensed tees (30%)</span><span>{lakh(merch)}</span></li></ul>
<p className="dim">{payers.toLocaleString('en-IN')} paying fans. One title in one region won’t carry the business; scale comes from more titles, cities and repeat releases.</p></div></div></div>}

// Market figures checked against published sources (search results, 18 Oct 2026). Deck-only estimates are labelled as ours.
const SOURCES=[
['41%','of Indians surveyed online watched anime in 2025, third in the world','GEM Partners, Anime Global White Paper 2026','https://www.gem-standard.com/p/en/185'],
['US$1.1B → 2.9B','India anime market, 2024 to 2033 (about 11.5% a year)','IMARC Group','https://www.imarcgroup.com/india-anime-market'],
['24 billion','UPI payments in September 2026','Business Standard, NPCI data','https://www.business-standard.com/finance/news/upi-transactions-september-2026-mdr-october-15-npci-126100100510_1.html'],
['86%','of UPI merchant payments in FY2025-26 were under ₹500','Ministry of Finance (PIB), Aug 2026','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2302657&reg=48&lang=2'],
['2nd','worldwide for visits to piracy sites, 8.1% of global traffic in 2024','MUSO, via Piracy Monitor','https://piracymonitor.org/muso-says-2024-piracy-was-down-marginally-from-2023-except-for-publishing/'],
['89%','of urban consumers have bought a counterfeit at least once','ASPA–CRISIL 2026, via The Week','https://www.theweek.in/news/biz-tech/2026/03/16/35-pc-indians-encountered-fake-products-in-1-year-online-platforms-account-for-53-pc-purchases-report.amp.html'],
['Few genuine goods','found on sale at Mumbai Comic Con and city malls','CODA site visit, April 2024','https://coda-cj.jp/en/news/489/']];
const FIT=[['Crunchyroll India','Paid streaming subscriptions','Adds ₹10–₹30 one-off unlocks, merch and dubs fans can fund'],['Muse India (YouTube)','Free with ads, about 3M subscribers (Social Blade)','Turns free viewers into paying fans through verified merch and pledges'],['Netflix India','₹149–₹649 a month, mainstream catalogue','Targets the titles and cities the Radar finds underserved']];
function Context(){return <details className="how sources"><summary>Market context and sources</summary>
<ul className="src-list">{SOURCES.map(([n,t,src,url])=><li key={n}><b>{n}</b> {t}. <a href={url} target="_blank" rel="noopener noreferrer">{src}</a></li>)}</ul>
<h6>Where OTSUKAI fits</h6><div className="fit">{FIT.map(([who,model,us])=><div key={who}><b>{who}</b><span>{model}</span><span>OTSUKAI: {us}</span></div>)}</div>
<h6>Feasibility</h6><ul className="src-list"><li><b>Royalties</b> Indian licensees can pay foreign rights holders through their bank without prior government approval (since 2010), subject to FEMA rules and withholding tax. <a href="https://website.rbi.org.in/en/web/rbi/-/notifications/current-account-transactions-liberalisation-5677" target="_blank" rel="noopener noreferrer">Reserve Bank of India</a></li><li><b>Counterfeits</b> Making or selling unlicensed copies infringes copyright under Section 51 of the Copyright Act, 1957. <a href="https://copyright.gov.in/Copyright_Act_1957/chapter_xi.html" target="_blank" rel="noopener noreferrer">Copyright Office, India</a></li><li><b>Dub pledges</b> Collected through an RBI-authorised gateway and held back from the studio until the goal is met, for example with a settlement hold. <a href="https://razorpay.com/docs/api/payments/route/modify-settlement-hold" target="_blank" rel="noopener noreferrer">Razorpay Route docs</a></li></ul>
<p className="note">Our own assumptions, not sourced: 40M+ engaged fans (third-party estimates of the total audience exceed 100M), ₹3K–₹15K import prices, and the 30% creator share.</p></details>}

export function Pilot(){
const road=[['Months 0–3','Prove it',['Sign one mid-tier anime licence','Find one Indian manufacturer','Sell a limited ₹699 tee run in Delhi NCR']],['Months 4–9','Go regional',['Hindi, Tamil & Telugu manga at ₹10–₹50','Pop-ups at Comic Con India and campus fests','Radar picks the next city and title']],['Months 10–18','Scale',['3–5 studios on the royalty dashboard','Co-branded collections with Indian retailers','Loyalty tiers and a fan-translator pool']]];
return <div className="demo-block"><div className="ask"><div><small>What we need</small><h4>Three introductions</h4></div><ol><li><b>A Japanese IP partner</b>One studio or licensing agency open to testing India.</li><li><b>A manufacturing partner</b>An apparel maker that can run small licensed batches.</li><li><b>A distribution channel</b>One Indian platform or retailer to co-launch the first release.</li></ol></div>
<Simulator/>
<div className="road">{road.map(([k,h,l],i)=><div key={k} className={'phase p'+i}><small>{k}</small><h4>{h}</h4><ul>{l.map(x=><li key={x}>{x}</li>)}</ul></div>)}</div>
<div className="targets"><h5>Pilot targets</h5><div className="kpis four"><div><b>1,000</b><span>items sold in the first release</span></div><div><b className="red">30%</b><span>of buyers register their item</span></div><div><b>25%</b><span>buy again within 90 days</span></div><div><b className="green">₹2L+</b><span>royalties to the studio (1,000 × ₹209.70)</span></div></div></div><Context/></div>}
