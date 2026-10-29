import {getOwner} from '@/src/server/owner';
import {getEditable,saveManuscript,SaveConflict} from '@/src/server/content';
import {validateExhibit} from '@/src/server/validate';
export const dynamic='force-dynamic';
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
function recovery(message:string,form:FormData,status:number,latestRevision?:number){
 const labels:Record<string,string>={image:'图片地址',imageAlt:'图片描述',imageCaption:'图注',imagePosition:'裁切位置',code:'展品编号',destination:'所属馆（museum/room）',titleZh:'中文标题',titleEn:'英文标签',keywords:'关键词',status:'展出状态（published / coming-soon）',curatorialNote:'馆长手记',fullText:'文章正文'};
 const fields=Object.entries(labels).map(([key,label])=>`<label>${label}<textarea name="${key}" rows="${key==='fullText'?20:key==='curatorialNote'?8:2}">${escape(String(form.get(key)??''))}</textarea></label>`).join('');
 return new Response(`<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>保存未完成</title><style>body{max-width:850px;margin:40px auto;padding:20px;background:#ededeb;color:#111;font:18px/1.7 system-ui}label{display:block;margin:24px 0}textarea{display:block;box-sizing:border-box;width:100%;font:17px/1.8 serif;padding:12px}button,a{display:inline-block;padding:12px;margin:8px 12px 8px 0;color:inherit}h1{font-size:30px}</style><h1>保存未完成</h1><p role="alert">${escape(message)}</p><p>你的输入保留在下方，可以复制或修正后重试。</p><a href="/admin" target="_blank" rel="noopener">在新窗口打开编辑室</a><form method="post" action="/api/admin/save"><input type="hidden" name="revision" value="${escape(String(form.get('revision')??''))}"><input type="hidden" name="isNew" value="${escape(String(form.get('isNew')??''))}">${fields}<button name="intent" value="save">重试保存草稿</button><button name="intent" value="preview">保存并预览</button></form></html>`,{status,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex'}});
}
export async function POST(request:Request){
 const owner=await getOwner();
 if(!owner)return new Response('只有馆主可以保存内容。',{status:403,headers:{'cache-control':'no-store'}});
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('跨站保存请求已拒绝。',{status:403});
 const type=request.headers.get('content-type')??'';
 if(!type.startsWith('application/x-www-form-urlencoded'))return new Response('Unsupported form format',{status:415});
 if(Number(request.headers.get('content-length')??0)>2000000)return new Response('内容过长，请分段保存。',{status:413});
 const body=await request.text();if(body.length>2000000)return new Response('内容过长。',{status:413});
 const form=new FormData();new URLSearchParams(body).forEach((value,key)=>form.set(key,value));
 try{
  const intent=form.get('intent');if(!['save','preview','publish'].includes(String(intent)))throw new Error('请选择保存、预览或发布。');
  const code=String(form.get('code')??'').toUpperCase();
  if(!/^[A-Z]{1,8}-\d{2,4}$/.test(code))throw new Error('请填写有效的展品编号。');
  const id=code.toLowerCase();const current=await getEditable(id);
  const isNew=form.get('isNew')==='1';
  if(isNew&&current)throw new SaveConflict('这个编号已经存在。请更换一个尚未使用的编号。');
  if(!isNew&&!current)throw new Error('展品不存在，请从“添加作品”开始。');
  const revision=Number(form.get('revision'));
  if(form.has('confirmOverwrite')&&form.get('confirmOverwrite')!=='yes')throw new Error('请先确认覆盖。');
  if(!Number.isSafeInteger(revision)||revision<0)throw new Error('版本号无效，请重新打开编辑页。');
  if(current&&current.revision!==revision)throw new SaveConflict('这篇文章已有更新版本。你的输入仍保留在下方；请先比较内容，再决定是否覆盖最新草稿。');
  const exhibit=await validateExhibit(form,current?.exhibit);
  await saveManuscript(exhibit,revision,intent==='publish',owner.userId);
  const target=intent==='preview'?`/admin/preview/${id}`:`/admin/edit/${id}?saved=${intent==='publish'?'published':'draft'}`;
  return new Response(null,{status:303,headers:{location:target,'cache-control':'no-store'}});
 }catch(error){
  console.error('Manuscript save failed',error instanceof Error?error.message:'Unknown error');
  let latestRevision: number|undefined;
  if(error instanceof SaveConflict&&form.get('isNew')!=='1'){
    try {const code=String(form.get('code')??'').toUpperCase();const latest=await getEditable(code.toLowerCase());if(latest)latestRevision=latest.revision;}catch{}
  }
  return recovery(error instanceof Error?error.message:'暂时无法保存，请重试。',form,error instanceof SaveConflict?409:400,latestRevision);
 }
}
