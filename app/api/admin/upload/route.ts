import {getOwner} from '@/src/server/owner';
import {imageBucket} from '@/src/server/images';
import {getDatabase} from '@/db';
export const dynamic='force-dynamic';
const answer=(body:object,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store'}});
export async function POST(request:Request){
 if(!await getOwner())return answer({error:'只有馆主可以上传。'},403);
 if(request.headers.get('origin')!==new URL(request.url).origin)return answer({error:'跨站请求已拒绝。'},403);
 if(!request.headers.get('content-type')?.startsWith('multipart/form-data'))return answer({error:'请上传图片文件。'},415);
 if(Number(request.headers.get('content-length')??0)>9*1024*1024)return answer({error:'图片不能超过 8 MB。'},413);
 try{
  const form=await request.formData(),file=form.get('file');
  if(!file||typeof file==='string'||file.size===0||file.size>8*1024*1024)return answer({error:'请选择小于 8 MB 的 JPG、PNG 或 WebP 图片。'},400);
  const data=await file.arrayBuffer(),bytes=new Uint8Array(data),ascii=(a:number,b:number)=>String.fromCharCode(...bytes.slice(a,b));
  const mime=bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':bytes[0]===137&&ascii(1,4)==='PNG'&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10?'image/png':ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP'?'image/webp':null;
  if(!mime)return answer({error:'仅支持 JPG、PNG、WebP，请先转换图片格式。'},415);
  const owner=await getOwner(),id=crypto.randomUUID();
  await imageBucket().put(id,data,{httpMetadata:{contentType:mime}});
  try{await getDatabase().prepare('INSERT INTO image_assets (id,mime,size,created_at,created_by) VALUES (?,?,?,?,?)').bind(id,mime,file.size,new Date().toISOString(),owner!.userId).run();}catch(error){await imageBucket().delete(id);throw error;}
  return answer({url:'/media/'+id});
 }catch(error){console.error('Image upload failed',error);return answer({error:'上传未完成，你的文字仍保留在编辑页。请稍后重试。'},503);}
}
