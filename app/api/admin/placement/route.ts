import {getOwner} from '@/src/server/owner';
import {placementTarget,placementRecords,belongs,updatePlacement} from '@/src/server/placement';
import {destinations} from '@/src/server/documents';
import {SaveConflict} from '@/src/server/content';
export const dynamic='force-dynamic';
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export async function POST(request:Request){
 const owner=await getOwner();if(!owner)return new Response('只有馆主可以调整作品。',{status:403});
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('跨站请求已拒绝。',{status:403});
 if(!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))return new Response('Unsupported format',{status:415});
 const raw=await request.text();if(raw.length>200000)return new Response('选择过多，请重新打开编辑室。',{status:413});
 const f=new URLSearchParams(raw);
 try{
  const target=await placementTarget(f.get('kind')??'',f.get('id')??'');
  const selected=new Set(f.getAll('selected')),removeTo=f.get('removeTo')??'';
  const versions=JSON.parse(f.get('versions')??'null');
  if(!versions||typeof versions!=='object'||Array.isArray(versions)||Object.values(versions).some(v=>!Number.isSafeInteger(v)||(v as number)<0))throw Error('版本信息不完整，请刷新后重试。');
  const records=await placementRecords();
  const removing=records.some(r=>belongs(r.public??r.draft,target)&&!selected.has(r.id));
  if(removing){const choices=await destinations();if(!choices.some(p=>p.value===removeTo)||(target.kind==='museum'?removeTo.startsWith(target.museum+'/'):removeTo!==target.museum+'/'))throw Error('请选择取消勾选的文章要移往哪里。');}
  await updatePlacement(target,selected,versions,removeTo,owner.userId);
  return new Response(null,{status:303,headers:{location:`/admin/placement?kind=${target.kind}&id=${target.id}&saved=1`,'cache-control':'no-store'}});
 }catch(error){const message=error instanceof Error?error.message:'暂时无法保存，请稍后重试。';const kind=f.get('kind')==='room'?'room':'museum',id=encodeURIComponent(f.get('id')??'');return new Response(`<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>归属未保存</title><style>body{max-width:700px;margin:60px auto;padding:24px;font:18px/1.8 system-ui}a{color:inherit;text-underline-offset:4px}</style><h1>归属未保存</h1><p>${escape(message)}</p><p>本次勾选的作品：${f.getAll('selected').map(escape).join('、')||'无'}</p><p>请保留这份选择，再打开最新列表核对。</p><a href="/admin/placement?kind=${kind}&amp;id=${id}" target="_blank" rel="noopener">在新窗口打开最新列表 →</a></html>`,{status:error instanceof SaveConflict?409:400,headers:{'content-type':'text/html;charset=utf-8','cache-control':'no-store'}});}
}
