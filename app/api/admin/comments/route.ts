import {getOwner} from '@/src/server/owner';
import {getDatabase} from '@/db';
import {formError,pageNumber} from '@/src/server/comments';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 if(!await getOwner())return new Response('只有馆主可以回复或管理留言。',{status:403});
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('跨站请求已拒绝。',{status:403});
 if(!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))return new Response('Unsupported format',{status:415});
 const raw=await request.text();if(raw.length>65000)return new Response('内容过长',{status:413});const f=new URLSearchParams(raw);
 try{const id=f.get('id')||'',revision=Number(f.get('revision')),intent=f.get('intent'),reply=(f.get('reply')||'').trim();
 if(!Number.isSafeInteger(revision)||revision<1||!['reply','hide','show'].includes(intent||'')||reply.length>5000)return formError('请检查回复长度及操作。',f,'/api/admin/comments');
 const db=getDatabase();const result=intent==='reply'?await db.prepare('UPDATE comments SET reply=?,replied_at=?,revision=revision+1 WHERE id=? AND revision=?').bind(reply,reply?new Date().toISOString():null,id,revision).run():await db.prepare('UPDATE comments SET hidden=?,revision=revision+1 WHERE id=? AND revision=?').bind(intent==='hide'?1:0,id,revision).run();
 if(result.meta.changes!==1)return formError('此留言已更新，请复制回复并返回编辑室刷新后再试。',f,'/api/admin/comments',409);
 return new Response(null,{status:303,headers:{location:'/admin/comments?saved=1&page='+pageNumber(f.get('page')||undefined),'cache-control':'no-store'}});
 }catch(error){console.error(error);return formError('暂时无法保存，请稍后重试。',f,'/api/admin/comments',503);}
}
