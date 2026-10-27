import {getPublishedExhibits} from '@/src/server/content';
import {getDatabase} from '@/db';
import {visitorHash,formError} from '@/src/server/comments';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin!==new URL(request.url).origin&&origin!=='https://kayven-museum.kayven.workers.dev')return new Response('跨站请求已拒绝。',{status:403});
 if(!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))return new Response('Unsupported format',{status:415});
 const raw=await request.text();if(raw.length>40000)return new Response('留言过长。',{status:413});const f=new URLSearchParams(raw);
 try{
 const articleId=f.get('articleId')||'';
 if(articleId&&!(await getPublishedExhibits()).some(e=>e.id===articleId&&e.status!=='coming-soon'))return formError('此文章暂未开放评论。',f,'/api/comments',404);
 const id=f.get('id')||'',name=(f.get('name')||'').trim(),body=(f.get('body')||'').trim();
 if(!/^[0-9a-f-]{36}$/i.test(id))return formError('请返回留言区重新打开表单。',f,'/api/comments');
 if(f.get('website'))return formError('无法提交此留言。',f,'/api/comments');
 if(!name||name.length>40||!body||body.length>3000)return formError('昵称请填写 1–40 字，留言请填写 1–3000 字。',f,'/api/comments');
 const db=getDatabase(),hash=await visitorHash(request),now=new Date().toISOString();
 const existing=await db.prepare('SELECT article_id FROM comments WHERE id=?').bind(id).first<{article_id:string}>();
 if(existing&&existing.article_id!==articleId)return formError('请重新打开文章的评论表单。',f,'/api/comments',409);
 if(!existing){const result=await db.prepare("INSERT INTO comments (id,name,body,created_at,visitor_hash,article_id) SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM comments WHERE visitor_hash=? AND created_at>?) ON CONFLICT(id) DO NOTHING").bind(id,name,body,now,hash,articleId,hash,new Date(Date.now()-30000).toISOString()).run();
 if(!result.meta.changes)return formError('留言提交较频繁，请等 30 秒再试。',f,'/api/comments',429);}
 return new Response(null,{status:303,headers:{location:(articleId?'/exhibit/'+encodeURIComponent(articleId):'/comments')+'?sent=1#comment-'+id,'cache-control':'no-store'}});
 }catch(error){console.error(error);return formError('暂时无法保存，请稍后重试。',f,'/api/comments',503);}
}
