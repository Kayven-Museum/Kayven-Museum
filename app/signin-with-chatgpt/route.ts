import {isAdmin,deviceIsEnrolled,enrollDevice,deviceCookie,deviceCookieAge} from '@/src/server/auth';
const style='<style>body{background:#f4f2ed;color:#222;font:16px/1.6 system-ui;padding:10vh 20px}main{max-width:420px;margin:auto}a{color:inherit}</style>';
function page(body:string){return '<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1><title>馆藏编辑室</title>'+style+'<main><h1>馆藏编辑室</h1>'+body+'<p><a href="/">返回网站</a></p></main></html>';}
const headers={'content-type':'text/html;charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer'};
export async function GET(request:Request){
 if(await isAdmin())return new Response(null,{status:303,headers:{Location:'/admin','Cache-Control':'no-store'}});
 try{
  if(await deviceIsEnrolled())return new Response(page('<p>此浏览器尚未被授权。编辑室仅限已绑定的浏览器访问。</p>'),{headers});
  const token=new URL(request.url).searchParams.get('activate');
  if(!token)return new Response(page('<p>编辑室采用设备授权，不需要登录密码。请在你要授权的浏览器中打开馆主专用的一次性授权链接。</p>'),{headers});
  const deviceToken=await enrollDevice(token);
  if(!deviceToken)return new Response(page('<p>授权链接无效或已经使用。编辑室未开放给其他访客。</p>'),{status:403,headers});
  const h=new Headers({'Location':'/admin','Cache-Control':'no-store','Referrer-Policy':'no-referrer'});
  h.append('Set-Cookie',deviceCookie+'='+deviceToken+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+deviceCookieAge);
  return new Response(null,{status:303,headers:h});
 }catch{return new Response(page('<p>数据库暂时无法连接，请稍后再试。编辑室没有开放访问。</p>'),{status:503,headers});}
}
export function POST(){return new Response('Password sign-in is disabled.',{status:405,headers:{'cache-control':'no-store'}});}
