import { getOwner } from '@/src/server/owner';
import { getAdminCollection, type Editable } from '@/src/server/content';
import {listDocs} from '@/src/server/documents';
import { AdminShell, AdminAccess, AdminUnavailable } from '@/src/components/Admin';
export const dynamic='force-dynamic';
export const metadata={title:'馆藏编辑室 | What Remains Unsaid',robots:{index:false,follow:false}};
function Works({records}:{records:Editable[]}){return <div className="admin-list">{records.map(r=><a key={r.exhibit.id} href={`/admin/edit/${r.exhibit.id}`}><span className="micro">{r.exhibit.code}</span><div><strong>{r.exhibit.titleZh}</strong><small>{r.exhibit.titleEn}</small></div><span>{!r.published?'未发布':r.changed?'有未发布草稿':r.exhibit.status==='coming-soon'?'即将展出':'已公开'}</span><b>编辑 →</b></a>)}</div>;}
export default async function Admin({searchParams}:{searchParams:Promise<{deleted?:string}>}){
 const q=await searchParams;
 if(!await getOwner())return <AdminAccess/>;
 let records,museums,rooms;try{[records,museums,rooms]=await Promise.all([getAdminCollection(),listDocs('museum',true),listDocs('room',true)]);}catch(error){console.error('Admin catalogue unavailable',error);return <AdminUnavailable/>;}
 const assigned=new Set<string>();
 const groups=museums.map(({doc:m})=>{
  const sections=[{id:'main',title:'主展区',records:records.filter(r=>r.exhibit.museum===m.id&&!r.exhibit.room)},...rooms.filter(r=>r.doc.museum===m.id).map(({doc:r})=>({id:r.id,title:`ROOM ${r.number} · ${r.titleZh||r.title}`,records:records.filter(e=>e.exhibit.museum===m.id&&e.exhibit.room===r.id)}))];
  sections.forEach(s=>s.records.forEach(r=>assigned.add(r.exhibit.id)));
  return {museum:m,sections,count:sections.reduce((n,s)=>n+s.records.length,0)};
 });
 const unassigned=records.filter(r=>!assigned.has(r.exhibit.id));
 return <AdminShell>{q.deleted==='1'&&<p className="admin-notice" role="status">文章已删除。</p>}<div className="admin-title"><div><p className="micro">PRIVATE WORKROOM / {records.length} WORKS</p><h1>馆藏编辑室</h1><p>按博物馆、展馆的排列顺序查找文章。馆内保留文章编号顺序。</p></div><a className="admin-button primary" href="/admin/new">添加作品 ＋</a></div><div className="admin-explainer"><strong>正文与馆长手记分开保存</strong><span>“保存草稿”仅自己可见；“发布到网站”后访客才会看到修改。</span></div><div aria-label="按馆排列的作品">{groups.map(({museum:m,sections,count})=><section className="admin-museum-group" key={m.id} data-museum={m.id}><header><h2>{m.numeral} · {m.titleZh||m.title}</h2><span>{count} 篇文章</span></header>{count===0?<p className="admin-group-empty">这个博物馆还没有文章。</p>:sections.filter(s=>s.records.length>0).map(s=><section className="admin-room-group" data-room={s.id} key={s.id}><h3>{s.title}<span>{s.records.length} 篇</span></h3><Works records={s.records}/></section>)}</section>)}{unassigned.length>0&&<section className="admin-museum-group"><header><h2>待整理归属</h2><span>{unassigned.length} 篇文章</span></header><p>这些文章的所属馆已不存在，请打开文章重新选择所属馆。</p><Works records={unassigned}/></section>}</div></AdminShell>;
}
