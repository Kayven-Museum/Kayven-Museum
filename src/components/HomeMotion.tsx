'use client';
import {useEffect,useState} from 'react';

export function HomeMotion(){
 const [paused,setPaused]=useState(false);
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>setReduced(preference.matches);
  update();preference.addEventListener('change',update);
  return ()=>preference.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  const cover=document.querySelector<HTMLElement>('.home-art');
  const museums=document.querySelector<HTMLElement>('.home-museums');
  if(!cover||!museums)return;
  const rows=[...museums.querySelectorAll<HTMLElement>('.section-heading,.museum-line')];
  const reset=()=>{delete cover.dataset.motion;delete cover.dataset.lit;delete cover.dataset.visible;rows.forEach(r=>r.classList.remove('reveal-waiting','reveal-ready','reveal-shown'));};
  if(paused||reduced||window.matchMedia('(prefers-reduced-motion: reduce)').matches){reset();return;}
  cover.dataset.motion='on';cover.dataset.visible='true';
  const photos=[...cover.querySelectorAll<HTMLElement>('.cover-photo')];
  let frame=0;
  const move=(event:PointerEvent)=>{
   if(event.pointerType==='touch')return;
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{cover.dataset.lit='true';for(const photo of photos){const box=photo.getBoundingClientRect();photo.style.setProperty('--light-x',`${event.clientX-box.left}px`);photo.style.setProperty('--light-y',`${event.clientY-box.top}px`);}});
  };
  const leave=()=>{delete cover.dataset.lit;};
  cover.addEventListener('pointermove',move,{passive:true});cover.addEventListener('pointerleave',leave);
  let reveal:IntersectionObserver|undefined,visibility:IntersectionObserver|undefined;
  if('IntersectionObserver' in window){
   visibility=new IntersectionObserver(entries=>{cover.dataset.visible=entries[0].isIntersecting?'true':'false';});visibility.observe(cover);
   reveal=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('reveal-shown');reveal?.unobserve(entry.target);}}},{threshold:.12});
   rows.forEach(row=>{if(row.getBoundingClientRect().top>window.innerHeight){row.classList.add('reveal-ready','reveal-waiting');reveal!.observe(row);}});
  }
  const showFocused=(event:FocusEvent)=>{(event.target as HTMLElement).closest('.reveal-waiting')?.classList.add('reveal-shown');};
  museums.addEventListener('focusin',showFocused);
  return ()=>{cancelAnimationFrame(frame);cover.removeEventListener('pointermove',move);cover.removeEventListener('pointerleave',leave);museums.removeEventListener('focusin',showFocused);visibility?.disconnect();reveal?.disconnect();reset();};
 },[paused,reduced]);
 return <button className="motion-control" type="button" aria-pressed={paused||reduced} onClick={()=>setPaused(p=>!p)} disabled={reduced} lang="zh">{reduced?'静态浏览':paused?'开启动效':'暂停动效'}</button>;
}
