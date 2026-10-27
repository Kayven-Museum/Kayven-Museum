import {env} from 'cloudflare:workers';
import {getDatabase} from '@/db';
export type ImageInfo={image?:string;imageAlt?:string;imageCaption?:string;imagePosition?:string};
export function imageBucket(){if(!env.IMAGES)throw Error('图片存储暂时无法使用，请稍后重试。');return env.IMAGES;}
export async function validateImageFields(get:(key:string)=>unknown,previous:ImageInfo={}):Promise<Required<ImageInfo>>{
 const read=(name:keyof ImageInfo,max:number)=>{const input=get(name);const v=typeof input==='string'?input.trim():previous[name]??'';if(v.length>max)throw Error('图片说明过长，请缩短后重试。');return v;};
 const image=read('image',1000),imageAlt=read('imageAlt',300),imageCaption=read('imageCaption',1000),imagePosition=read('imagePosition',20)||'center';
 if(!['center','top','bottom','left','right'].includes(imagePosition))throw Error('请选择有效的裁切位置。');
 if(image.startsWith('/media/')){const id=image.slice(7);if(!/^[a-f0-9-]{36}$/.test(id)||!await getDatabase().prepare('SELECT id FROM image_assets WHERE id=?').bind(id).first())throw Error('图片不存在，请重新上传。');}
 else if(image&&!/^\/portfolio\/[A-Za-z0-9_.-]+$/.test(image)){
  let url;try{url=new URL(image);}catch{throw Error('图片地址无效，请上传一张图片。');}
  if(url.protocol!=='https:'||url.username||url.password)throw Error('图片地址必须为 HTTPS。');
 }
 return {image,imageAlt,imageCaption,imagePosition};
}
