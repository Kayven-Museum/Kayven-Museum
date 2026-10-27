import {getDatabase} from '@/db';
export type Comment={article_id:string;id:string;name:string;body:string;created_at:string;hidden:number;reply:string;replied_at:string|null;revision:number};
export function pageNumber(value?:string){return Math.min(10000,Math.max(1,Number.parseInt(value||'1',10)||1));}
export async function listComments(page=1,admin=false,articleId=''){
 const query=admin?'':'WHERE hidden=0 AND article_id=?';
 const values=admin?[(page-1)*20]:[articleId,(page-1)*20];
 const rows=await getDatabase().prepare(`SELECT article_id,id,name,body,created_at,hidden,reply,replied_at,revision FROM comments ${query} ORDER BY created_at DESC,id DESC LIMIT 21 OFFSET ?`).bind(...values).all<Comment>();
 return {comments:rows.results.slice(0,20),more:rows.results.length>20};
}
export async function visitorHash(request:Request){
 const raw=(request.headers.get('cf-connecting-ip')||'unknown')+':'+new Date().toISOString().slice(0,10);
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw));
 return Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('');
}
export const escapeHTML=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function formError(message:string,f:URLSearchParams,action:string,status=400){
 const hidden=new Set(['id','revision','intent','articleId']);
 return new Response(`<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>留言未保存</title><style>body{max-width:700px;margin:40px auto;padding:20px;font:18px/1.8 system-ui}label,textarea{display:block;width:100%;box-sizing:border-box}textarea{font:16px/1.8 serif;margin:10px 0 24px;padding:12px}button{font:inherit;padding:10px 20px}</style><h1>暂未保存</h1><p>${escapeHTML(message)}</p><p>你填写的文字保留在下面。</p><form action="${action}" method="post">${[...f].filter(([k])=>['id','revision','intent','articleId','name','body','reply'].includes(k)).map(([k,v])=>hidden.has(k)?`<input type="hidden" name="${k}" value="${escapeHTML(v)}">`:`<label>${({name:'昵称',body:'留言',reply:'回复'} as Record<string,string>)[k]}<textarea name="${k}" rows="${k==='name'?2:8}">${escapeHTML(v)}</textarea></label>`).join('')}<button>重试保存</button></form><p><a href="${action.includes('/admin/')?'/admin/comments':'/comments'}">返回留言区</a></p></html>`,{status,headers:{'content-type':'text/html;charset=utf-8','cache-control':'no-store'}});
}
