import React,{useState,useEffect,useRef} from 'react';
import{motion,AnimatePresence}from'framer-motion';
import{useStore,chapters}from'./store.js';
import{titles,cities,cityName,titleName,ranking,confidence,products,split,passSplit,tiers,tierFor,inr,langs,qrBits}from'./data.js';
const ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+'m ago':Math.round(m/60)+'h ago'};
const fade={initial:{opacity:0,y:8},animate:{opacity:1,y:0},exit:{opacity:0}};
export function HomeCity(){const home=useStore(s=>s.home),setHome=useStore(s=>s.setHome);return <label className="home-city">You’re a fan in <select value={home} onChange={e=>setHome(e.target.value)}>{cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
function Chips({value,options,onChange,label}){return <div className="chips" role="group" aria-label={label}>{options.map(([v,l])=><button key={v} aria-pressed={value===v} className={value===v?'on':''} onClick={()=>onChange(v)}>{l}</button>)}</div>}
// Appears once the visitor has done the thing a page asks, pointing to the next step of the loop.
function NextStep({show,to,children}){const open=useStore(s=>s.open);return <AnimatePresence>{show&&<motion.div className="next-step" {...fade}><span>✓ {children}</span><button onClick={()=>open(to)}>Next: {chapters[to].nav} →</button></motion.div>}</AnimatePresence>}

export function Radar(){const signals=useStore(s=>s.signals),request=useStore(s=>s.request),home=useStore(s=>s.home);const[title,setTitle]=useState('crow'),[sent,setSent]=useState(0),[pulse,setPulse]=useState(null);const rows=ranking(signals,title),best=rows[0],mine=rows.findIndex(r=>r.id===home)+1;
function send(){request(title,home,25);setSent(n=>n+25);setPulse(home);setTimeout(()=>setPulse(null),900)}
return <div className="demo-block">
<div className="panel"><div className="toolbar"><Chips label="Title" value={title} onChange={setTitle} options={titles.map(t=>[t.id,t.name])}/></div>
<div className="radar"><ol className="rank">{rows.map((r,i)=><motion.li layout transition={{type:'spring',damping:28,stiffness:280}} key={r.id} className={(pulse===r.id?'pulse ':'')+(r.id===home?'mine':'')}><span className="pos">{i+1}</span><span className="city">{r.name}<small>{r.lang}</small></span><span className="bar"><motion.i animate={{width:r.score+'%'}} transition={{type:'spring',damping:24}}/></span><span className="score">{r.score}</span></motion.li>)}</ol>
<aside className="pick"><small>Launch first in</small><h4>{best.name}</h4><p>{titleName(title)} scores {best.score}/100 here, with {confidence(best.s).toLowerCase()} confidence from {best.s.requests} fan requests.</p>
<div className="sim"><HomeCity/><p>{cityName(home)} is #{mine} for {titleName(title)}.</p><button className="primary" onClick={send}>Send 25 fan requests</button></div></aside></div>
<p className="note">Score = 45% search interest + 35% community size + 20% fan requests.</p></div>
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
<NextStep show={open} to={2}>{inr(share.creator)} went to the studio and you earned 20 loyalty points.</NextStep></div>}

function QR({serial,scanning}){const cells=qrBits(serial);return <div className={'qr '+(scanning?'scanning':'')}><svg viewBox="-2 -2 25 25" aria-label={'Passport tag '+serial} role="img"><rect x="-2" y="-2" width="25" height="25" fill="#f2ece6"/>{cells.map(([x,y])=><rect key={x+'-'+y} x={x} y={y} width="1.02" height="1.02" fill="#151217"/>)}</svg><i/></div>}
const samples=[['OT-001','Genuine tee'],['OT-013','Cloned tag'],['OT-777','Fake item']];
export function Passport(){const home=useStore(s=>s.home),registered=useStore(s=>s.registered),register=useStore(s=>s.register),record=useStore(s=>s.record);const[serial,setSerial]=useState('OT-001'),[current,setCurrent]=useState('OT-001'),[scanning,setScanning]=useState(false),[done,setDone]=useState('');const timer=useRef();useEffect(()=>()=>clearTimeout(timer.current),[]);
function scan(s){setCurrent(s);setScanning(true);setDone('');setSerial(null);clearTimeout(timer.current);timer.current=setTimeout(()=>{setScanning(false);setSerial(s)},650)}
const p=serial&&products[serial],sp=p&&split(p.price);
return <div className="demo-block"><div className="panel"><div className="scanner"><div><QR serial={current} scanning={scanning}/><span className="step-label">Scan a tag</span><div className="chips stack">{samples.map(([s,l])=><button key={s} className={current===s?'on':''} onClick={()=>scan(s)}>{l}<small>{s}</small></button>)}</div></div>
<div className="passport" aria-live="polite"><AnimatePresence mode="wait">{scanning?<motion.p key="s" className="dim" {...fade}>Checking the registry…</motion.p>:
!serial?<motion.p key="i" className="dim big" {...fade}>← Pick a tag to scan it.</motion.p>:
p&&!p.clone?<motion.div key={serial} {...fade}><small className="ok">✓ Verified official</small><h4>{titleName(p.title)} {p.item.toLowerCase()}</h4><p className="dim">{serial} · made by a vetted partner in {p.maker.split('· ')[1]}</p>
<div className="price"><b>{inr(p.price)}</b><span>{inr(sp.creator)} goes to the creator</span></div>
<div className="split"><i style={{flex:55}}>55%</i><i style={{flex:30}}>30%</i><i style={{flex:15}}>15%</i></div><div className="split-legend"><span>Making & delivery {inr(sp.ops)}</span><span>Creator {inr(sp.creator)}</span><span>Platform {inr(sp.platform)}</span></div>
<div className="row">{registered.includes(serial)?<p className="ok">✓ Registered to you. Bonus digital art unlocked.</p>:<button className="primary" onClick={()=>register(serial,home)}>Register this item (+150 points)</button>}<button onClick={()=>{record({kind:'sale',label:titleName(p.title)+' tee · sandbox sale',city:home,gross:p.price,creator:sp.creator});setDone('Sale added: '+inr(sp.creator)+' to the creator.')}}>Simulate another sale</button></div>{done&&<p className="dim">{done}</p>}</motion.div>:
<motion.div key={serial} {...fade}><small className="bad">✕ {p?'Cloned tag':'Not official'}</small><h4>{p?'Real tag, copied.':'No such product.'}</h4><p className="dim">{p?`${serial} was scanned in ${p.clone.a} and ${p.clone.b} only ${p.clone.mins} minutes apart, which isn’t possible for one item. Registration is blocked and the studio is alerted.`:'This serial isn’t in the registry, so the item is almost certainly a bootleg.'}</p>
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
{top?(voted?<p className="ok">✓ Vote counted. It added 50 requests to the Demand Radar for {cityName(home)}, so the loop is closed.</p>:<div className="row vote"><span>Vote on the next release in {cityName(home)}:</span>{titles.map(t=><button key={t.id} onClick={()=>vote(t.id,home)}>{t.name}</button>)}</div>):
<div className="row"><span className="dim">Earn points by unlocking a chapter (+20) or registering an item (+150).</span><button onClick={()=>open(1)}>Unlock a chapter</button><button onClick={()=>open(2)}>Scan an item</button></div>}</div>
<NextStep show={voted} to={4}>Your vote is now a signal on the Demand Radar.</NextStep></div>}

export function Pilot(){
const road=[['Months 0–3','Prove it',['Sign one mid-tier anime licence','Find one Indian manufacturer','Sell a limited ₹699 tee run in Delhi NCR']],['Months 4–9','Go regional',['Hindi, Tamil & Telugu manga at ₹10–₹50','Pop-ups at Comic Con India and campus fests','Radar picks the next city and title']],['Months 10–18','Scale',['3–5 studios on the royalty dashboard','Co-branded collections with Indian retailers','Loyalty tiers and a fan-translator pool']]];
return <div className="demo-block"><div className="ask"><div><small>What we need</small><h4>Three introductions</h4></div><ol><li><b>A Japanese IP partner</b>One studio or licensing agency open to testing India.</li><li><b>A manufacturing partner</b>An apparel maker that can run small licensed batches.</li><li><b>A distribution channel</b>One Indian platform or retailer to co-launch the first release.</li></ol></div>
<div className="road">{road.map(([k,h,l],i)=><div key={k} className={'phase p'+i}><small>{k}</small><h4>{h}</h4><ul>{l.map(x=><li key={x}>{x}</li>)}</ul></div>)}</div>
<div className="targets"><h5>Pilot targets</h5><div className="kpis four"><div><b>1,000</b><span>items sold in the first release</span></div><div><b className="red">30%</b><span>of buyers register their item</span></div><div><b>25%</b><span>buy again within 90 days</span></div><div><b className="green">₹2L+</b><span>royalties to the studio (1,000 × ₹209.70)</span></div></div></div></div>}
