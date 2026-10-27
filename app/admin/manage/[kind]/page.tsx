import {notFound} from 'next/navigation';
import {getOwner} from '@/src/server/owner';
import {kinds,listDocs,publicDocs,type Kind,type Doc} from '@/src/server/documents';
import {AdminAccess,AdminShell,AdminUnavailable} from '@/src/components/Admin';
import {DocForm,names} from '@/src/components/DocumentEditor';
export const dynamic='force-dynamic';
export default async function Manage({params,searchParams}:{params:Promise<{kind:string}>;searchParams:Promise<{id?:string;new?:string;museum?:string;saved?:string;deleted?:string}>}){
 if(!await getOwner())return <AdminAccess/>;
 const {kind:k}=await params;if(!kinds.includes(k as Kind))notFound();const kind=k as Kind,q=await searchParams;
 try{const [rows,museums]=await Promise.all([listDocs(kind,true),publicDocs('museum')]);
 if(q.new==='1'||q.id){const state=q.id?rows.find(r=>r.doc.id===q.id):{doc:{id:'',kind,title:'',order:String(rows.length+1),museum:q.museum??museums[0]?.id??'',image:'/portfolio/p2-0.png'} as Doc,revision:0,published:false,changed:false};if(!state)notFound();return <DocForm state={state} isNew={q.new==='1'} museums={museums} notice={q.saved==='published'?'已发布到网站。':q.saved==='draft'?'草稿已保存。':undefined}/>;}
 return <AdminShell>{q.deleted==='1'&&<p className="admin-notice" role="status">内容已删除。</p>}<div className="admin-title"><div><h1>{names[kind]}编辑室</h1><p>{kind==='museum'?'先新增 Museum，发布后即可在其下创建展馆。':kind==='room'?'每个 Museum 可以容纳多个展馆，作品可以选择所属展馆。':kind==='stage'?'记录每个阶段的 Goal 与 Reflection；可只填写其中一项，排序数字越小越靠前。':'编辑过程记录、创作反思和开篇文章，也可以添加新档案。'}</p></div><a className="admin-button primary" href={`/admin/manage/${kind}?new=1`}>新增 ＋</a></div><section className="admin-list">{rows.map(r=><div className="admin-document-row" key={r.doc.id}><a href={`/admin/manage/${kind}?id=${r.doc.id}`}><span className="micro">{r.doc.id}</span><div><strong>{r.doc.titleZh||r.doc.title}</strong><small>{kind==='room'?museums.find(m=>m.id===r.doc.museum)?.titleZh:''}</small></div><span>{!r.published?'未发布':r.changed?'有未发布草稿':'已公开'}</span><b>编辑 →</b></a>{(kind==='museum'||kind==='room')&&r.published&&<a className="admin-back" href={`/admin/placement?kind=${kind}&id=${r.doc.id}`}>管理馆内作品 →</a>}{kind==='museum'&&r.published&&<a className="admin-back" href={`/admin/manage/room?new=1&museum=${r.doc.id}`}>在这里新增展馆 ＋</a>}</div>)}</section></AdminShell>;
 }catch(error){console.error(error);return <AdminUnavailable/>;}
}
