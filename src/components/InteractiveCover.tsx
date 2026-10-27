'use client';
import {useEffect,useRef,useState,type CSSProperties,type PointerEvent} from 'react';
export type CoverMuseum={id:string;title:string;titleZh:string;numeral:string;theme:string;image:string;imageAlt?:string;imagePosition?:string};
export function InteractiveCover({museums}:{museums:CoverMuseum[]}){
 const [active,setActive]=useState(0),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(false);
 const root=useRef<HTMLElement>(null),deck=useRef<HTMLDivElement>(null),frame=useRef(0);
 const selected=museums[active];
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(query.matches);update();query.addEventListener('change',update);return ()=>query.removeEventListener('change',update);},[]);
 useEffect(()=>()=>cancelAnimationFrame(frame.current),[]);
 useEffect(()=>{const node=root.current;if(!node)return;const clear=()=>{node.style.setProperty('--pointer-x','0px');node.style.setProperty('--pointer-y','0px');};if(paused||reduced)clear();if(!('IntersectionObserver' in window))return;const observer=new IntersectionObserver(([entry])=>{node.dataset.visible=String(entry.isIntersecting);if(!entry.isIntersecting)clear();});observer.observe(node);return ()=>observer.disconnect();},[paused,reduced]);
 function move(event:PointerEvent<HTMLElement>){if(paused||reduced||event.pointerType!=='mouse')return;const box=event.currentTarget.getBoundingClientRect(),x=(event.clientX-box.left)/box.width-.5,y=(event.clientY-box.top)/box.height-.5;cancelAnimationFrame(frame.current);frame.current=requestAnimationFrame(()=>{root.current?.style.setProperty('--pointer-x',`${x*22}px`);root.current?.style.setProperty('--pointer-y',`${y*16}px`);});}
 function reset(){cancelAnimationFrame(frame.current);root.current?.style.setProperty('--pointer-x','0px');root.current?.style.setProperty('--pointer-y','0px');}
 function choose(index:number){setActive(index);if(matchMedia('(max-width: 700px)').matches){const node=deck.current?.children[index] as HTMLElement|undefined;if(node&&deck.current)deck.current.scrollTo({left:node.offsetLeft-deck.current.offsetLeft,behavior:reduced||paused?'instant':'smooth'});}}
 return <section ref={root} className="immersive-cover" data-motion={paused||reduced?'off':'on'} aria-labelledby="immersive-title" onPointerMove={move} onPointerLeave={reset}>
  <header className="immersive-top"><p><strong>KAYVEN</strong><span>A LITERARY MUSEUM</span></p><button className="immersive-motion" type="button" onClick={()=>setPaused(!paused)} disabled={reduced} aria-pressed={paused||reduced}>{reduced?'静态浏览':paused?'开启动效':'暂停动效'}</button></header>
  <div className="immersive-stage">
   <h1 id="immersive-title" className="immersive-title"><span>WHAT</span><em>remains</em><span>UNSAID</span></h1>
   <p className="immersive-chinese" lang="zh">未说出口<br/><span>仍然存在</span></p>
   <div ref={deck} className="immersive-deck" aria-label="选择一个博物馆" onScroll={()=>{if(!deck.current||!matchMedia('(max-width: 700px)').matches)return;const d=deck.current;let closest=0,distance=Infinity;Array.from(d.children).forEach((child,index)=>{const delta=Math.abs((child as HTMLElement).offsetLeft-d.offsetLeft-d.scrollLeft);if(delta<distance){distance=delta;closest=index;}});setActive(closest);}}>
    {museums.map((m,index)=><a className={`immersive-card immersive-card-${index}`} key={m.id} href={'/museum/'+m.id} data-active={index===active} onPointerEnter={e=>{if(e.pointerType==='mouse')setActive(index);}} onFocus={()=>setActive(index)} aria-label={'进入'+(m.titleZh||m.title)} style={{'--depth':[.8,-1,.6][index],'--angle':['-6deg','3deg','-4deg'][index]} as CSSProperties}><span className="immersive-photo"><img src={m.image||'/portfolio/p1-1.png'} alt={m.imageAlt||m.titleZh||m.title} style={{objectPosition:m.imagePosition||'center'}} fetchPriority={index===0?'high':'auto'} draggable={false}/><span className="immersive-photo-shade"/></span><span className="immersive-card-label"><span>{m.numeral}</span><span>{m.titleZh||m.title}</span><span className="immersive-card-open">进入</span></span></a>)}
   </div>
   <span className="immersive-side">LOVE · BODY · DEATH</span>
   <p className="immersive-hint"><span className="desktop-hint">移动鼠标，探索留下的痕迹</span><span className="touch-hint">左右滑动，选择一个馆</span></p>
  </div>
  <div className="immersive-bottom"><div className="immersive-selection"><span className="immersive-counter">{String(museums.length?active+1:0).padStart(2,'0')}<i> / {String(museums.length).padStart(2,'0')}</i></span><div><span className="immersive-theme">{selected?.theme||'THE COLLECTION'}</span><a className="immersive-selected-title" href={selected?'/museum/'+selected.id:'/index'}>{selected?.titleZh||selected?.title||'探索馆藏'}</a></div></div><div className="immersive-switches" aria-label="选择封面中的馆">{museums.map((m,index)=><button type="button" key={m.id} aria-label={'选择'+(m.titleZh||m.title)} aria-pressed={active===index} onClick={()=>choose(index)}><span>{m.numeral}</span><i/></button>)}</div><a href="/index" className="immersive-all"><span>完整馆藏</span><small>VIEW THE COLLECTION</small><b aria-hidden="true">↗</b></a></div>
 </section>;
}
