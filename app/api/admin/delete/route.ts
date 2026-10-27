import {getOwner} from '@/src/server/owner';
import {getDatabase} from '@/db';
import {getEditable,SaveConflict} from '@/src/server/content';
import {kinds,listDocs,type Kind} from '@/src/server/documents';
import {placementRecords} from '@/src/server/placement';
import {escapeHTML} from '@/src/server/comments';
export const dynamic='force-dynamic';
// Any concurrent catalogue edit invalidates the dependency check, including a
// newly created child. The final write and snapshot comparison are one statement.
const snapshotSQL=`(SELECT COALESCE(group_concat(v,'|'),'') FROM (SELECT 'm:'||id||':'||revision||':'||deleted AS v FROM manuscripts UNION ALL SELECT 'd:'||id||':'||revision||':'||deleted AS v FROM documents ORDER BY v))`;
export async function POST(request:Request){
 const owner=await getOwner();if(!owner)return new Response('只有馆主可以删除。',{status:403});
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('跨站请求已拒绝。',{status:403});
 if(!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))return new Response('Unsupported format',{status:415});
 const raw=await request.text();if(raw.length>3000)return new Response('请求过长',{status:413});
 const f=new URLSearchParams(raw),kind=f.get('kind')||'',id=f.get('id')||'',revision=Number(f.get('revision'));
 let back='/admin',links:{href:string;title:string}[]=[];
 try{
 if(kind!=='article'&&!kinds.includes(kind as Kind))throw Error('无效的内容类型。');
 back=kind==='article'?'/admin':'/admin/manage/'+kind;
 if(!/^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/.test(id)||id.length>64||!Number.isSafeInteger(revision)||revision<0||f.get('confirmed')!=='yes')throw Error('请勾选确认删除后再提交。');
 const db=getDatabase(),snapshot=await db.prepare('SELECT '+snapshotSQL+' AS value').first<{value:string}>();
 const article=kind==='article'?await getEditable(id):null;
 const doc=kind!=='article'?(await listDocs(kind as Kind,true)).find(r=>r.doc.id===id):null;
 const current=article||doc;if(!current)throw Error('内容已删除或不存在。');
 if(current.revision!==revision)throw new SaveConflict('内容刚刚被修改，请返回编辑页刷新后再确认删除。');
 if(kind==='museum'||kind==='room'){
 const records=await placementRecords();
 const children=records.filter(r=>[r.draft,r.public].some(e=>e&&(kind==='museum'?e.museum===id:e.room===id)));
 links=children.map(r=>({href:'/admin/edit/'+r.id,title:'文章：'+r.draft.titleZh}));
 if(kind==='museum'){
 const [draftRooms,liveRooms]=await Promise.all([listDocs('room',true),listDocs('room')]);
 const rooms=new Map([...draftRooms,...liveRooms].filter(r=>r.doc.museum===id).map(r=>[r.doc.id,r.doc]));
 links.push(...[...rooms.values()].map(r=>({href:'/admin/manage/room?id='+r.id,title:'展馆：'+(r.titleZh||r.title)})));
 }
 if(links.length)throw Error('此馆还有 '+links.length+' 项内容（包括草稿或已发布版本）。请先移走或删除下列内容，再删除此馆。');
 }
 const table=kind==='article'?'manuscripts':'documents',key=kind==='article'?id:kind+':'+id;
 const payload=JSON.stringify(article?article.exhibit:doc!.doc),now=new Date().toISOString();
 const result=revision===0?await db.prepare(`INSERT INTO ${table} (id,draft,published,revision,updated_at,published_at,updated_by,deleted) SELECT ?,?,NULL,1,?,NULL,?,1 WHERE ${snapshotSQL}=? ON CONFLICT(id) DO NOTHING`).bind(key,payload,now,owner.userId,snapshot!.value).run():await db.prepare(`UPDATE ${table} SET deleted=1,revision=revision+1,updated_at=?,updated_by=? WHERE id=? AND revision=? AND deleted=0 AND ${snapshotSQL}=?`).bind(now,owner.userId,key,revision,snapshot!.value).run();
 if(result.meta.changes!==1)throw new SaveConflict('目录刚刚被更新，本次未删除。请刷新后重试。');
 return new Response(null,{status:303,headers:{location:back+'?deleted=1','cache-control':'no-store'}});
 }catch(error){const message=error instanceof Error?error.message:'暂时无法删除，请稍后重试。';return new Response(`<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>暂未删除</title><style>body{max-width:760px;margin:40px auto;padding:20px;font:18px/1.8 system-ui}li{margin:12px 0}a{color:inherit}</style><h1>暂未删除</h1><p>${escapeHTML(message)}</p><ul>${links.map(l=>`<li><a href="${escapeHTML(l.href)}">${escapeHTML(l.title)}</a></li>`).join('')}</ul><a href="${back}">返回编辑室</a></html>`,{status:error instanceof SaveConflict?409:400,headers:{'content-type':'text/html;charset=utf-8','cache-control':'no-store'}});}
}
