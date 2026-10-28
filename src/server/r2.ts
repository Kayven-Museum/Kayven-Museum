import {S3Client,PutObjectCommand,GetObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
const required=(name:string)=>{const v=process.env[name];if(!v)throw Error('Missing server setting: '+name);return v;};
function client(){return new S3Client({region:'auto',endpoint:`https://${required('CF_ACCOUNT_ID')}.r2.cloudflarestorage.com`,credentials:{accessKeyId:required('R2_ACCESS_KEY_ID'),secretAccessKey:required('R2_SECRET_ACCESS_KEY')}});}
export function imageBucket(){
 const bucket=required('R2_BUCKET_NAME');
 return {
 async put(key:string,data:ArrayBuffer,options?:{httpMetadata?:{contentType?:string}}){
   await client().send(new PutObjectCommand({Bucket:bucket,Key:key,Body:new Uint8Array(data),ContentType:options?.httpMetadata?.contentType}));
 },
 async get(key:string){
   try{
    const item=await client().send(new GetObjectCommand({Bucket:bucket,Key:key}));
    if(!item.Body)return null;
    const bytes=await item.Body.transformToByteArray();
    return {body:bytes};
   }catch(error){if((error as {name?:string}).name==='NoSuchKey')return null;throw error;}
 },
 async delete(key:string){await client().send(new DeleteObjectCommand({Bucket:bucket,Key:key}));}
 };
}
