// Compatibility adapter: keep existing application image calls unchanged.
// Actual storage is Vercel Blob rather than Cloudflare R2.
import {put,head,del} from '@vercel/blob';
const pathFor=(id:string)=>'museum-images/'+id;
export function imageBucket(){
 return {
  async put(id:string,data:ArrayBuffer,options?:{httpMetadata?:{contentType?:string}}){
   await put(pathFor(id),new Uint8Array(data),{
    access:'public',addRandomSuffix:false,
    contentType:options?.httpMetadata?.contentType||'application/octet-stream',
   });
  },
  async get(id:string){
   try{
    const item=await head(pathFor(id));
    const response=await fetch(item.url,{cache:'no-store'});
    if(!response.ok)throw new Error('Image fetch failed: '+response.status);
    return {body:new Uint8Array(await response.arrayBuffer())};
   }catch(error){
    if((error as {name?:string}).name==='BlobNotFoundError')return null;
    throw error;
   }
  },
  async delete(id:string){await del(pathFor(id));}
 };
}
