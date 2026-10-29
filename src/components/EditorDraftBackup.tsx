'use client';
import {useEffect,useRef,useState} from 'react';
const PREFIX='museum-editor-backup:';
type Backup={revision:string;fields:Record<string,string>;savedAt:number};
export function EditorDraftBackup({id,revision,saved}:{id:string;revision:number;saved:boolean}){
 const [backup,setBackup]=useState<Backup|null>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{
  const form=document.querySelector<HTMLFormElement>('form.editor-form');
  if(!form)return;
  const key=PREFIX+id;
  try{
   if(saved)localStorage.removeItem(key);
   else{
    const old=localStorage.getItem(key);
    if(old){const parsed=JSON.parse(old) as Backup;if(parsed?.fields&&typeof parsed.savedAt==='number')setBackup(parsed);}
   }
  }catch{}
  const capture=()=>{
   const fields:Record<string,string>={};
   new FormData(form).forEach((value,name)=>{if(typeof value==='string'&&name!=='revision'&&name!=='intent')fields[name]=value;});
   try{localStorage.setItem(key,JSON.stringify({revision:String(revision),fields,savedAt:Date.now()} satisfies Backup));}catch{}
  };
  const onInput=()=>{if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(capture,450);};
  form.addEventListener('input',onInput);
  form.addEventListener('change',onInput);
  form.addEventListener('submit',capture);
  return()=>{form.removeEventListener('input',onInput);form.removeEventListener('change',onInput);form.removeEventListener('submit',capture);if(timer.current)clearTimeout(timer.current);};
 },[id,revision,saved]);
 const restore=()=>{
  const form=document.querySelector<HTMLFormElement>('form.editor-form');
  if(!form||!backup)return;
  for(const [name,value] of Object.entries(backup.fields)){
   const field=Array.from(form.elements).find(el=>el.getAttribute('name')===name);
   if(field instanceof HTMLInputElement||field instanceof HTMLTextAreaElement||field instanceof HTMLSelectElement){field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));}
  }
  setBackup(null);
 };
 return backup?<div className="admin-notice" role="status"><strong>发现浏览器本地的未保存备份</strong>（{new Date(backup.savedAt).toLocaleString('zh-CN')}）。请先核对再保存。 <button type="button" onClick={restore}>恢复备份到编辑框</button> <button type="button" onClick={()=>{try{localStorage.removeItem(PREFIX+id);}catch{}setBackup(null);}}>忽略备份</button></div>:null;
}
