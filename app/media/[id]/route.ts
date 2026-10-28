import {getOwner} from '@/src/server/owner';
import {getDatabase} from '@/db';
import {imageBucket} from '@/src/server/images';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^[a-f0-9-]{36}$/.test(id))return new Response('Not found',{status:404});
 try{
  const owner=await getOwner();
  if(!owner){const linked=await getDatabase().prepare(`SELECT 1 FROM manuscripts WHERE deleted=0 AND published IS NOT NULL AND json_extract(published,'$.image')=? AND json_extract(published,'$.status')!='coming-soon' UNION ALL SELECT 1 FROM documents WHERE deleted=0 AND published IS NOT NULL AND json_extract(published,'$.image')=? LIMIT 1`).bind('/media/'+id,'/media/'+id).first();if(!linked)return new Response('Not found',{status:404,headers:{'cache-control':'no-store'}});}
  const asset=await getDatabase().prepare('SELECT mime FROM image_assets WHERE id=?').bind(id).first<{mime:string}>();if(!asset)return new Response('Not found',{status:404});
  const object=await imageBucket().get(id);if(!object)return new Response('Not found',{status:404});
  return new Response(new Uint8Array(object.body).buffer,{headers:{'content-type':asset.mime,'cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'"}});
 }catch(error){console.error('Image unavailable',error);return new Response('Image temporarily unavailable',{status:503,headers:{'cache-control':'no-store'}});}
}
