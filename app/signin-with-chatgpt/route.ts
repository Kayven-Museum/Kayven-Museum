import {isAdmin,deviceIsEnrolled,enrollDevice,deviceCookie,deviceCookieAge} from '@/src/server/auth';
const style='<style>body{background:#f4f2ed;color:#222;font:16px/1.6 system-ui;padding:10vh 20px}main{max-width:420px;margin:auto}input,button{font:inherit;display:block;width:100%;padding:12px;margin:14px 0;box-sizing:border-box}button{background:#222;color:#fff;border:0;cursor:pointer}a{color:inherit}</style>';
function page(body:string){return '<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1><title>馆藏编辑室</title>'+style+'<main><h1>馆藏编辑室</h1>'+body+'<p><a href="/">返回网站</a></p></main></html>';}
const headers={'content-type':'text/html;charset=utf-8','cache-control':'no-store'};
export async function GET(){
 if(await isAdmin())return new Response(null,{status:303,headers:{Location:'/admin','Cache-Control':'no-store'}});
 try{
  const enrolled=await deviceIsEnrolled();
  if(enrolled)return new Response(page('<p>这台浏览器尚未获得编辑室访问权限。只有已经绑定的浏览器可以进入。</p>'),{headers});
  return new Response(page('<p>首次绑定此设备。绑定后，只有这个浏览器可以免密码进入编辑室，旧密码将不能用于绑定其他设备。</p><form method="post"><label>首次绑定密码<input type="password" name="password" required autocomplete="current-password"></label><button>授权此浏览器</button></form><small>不要使用无痕窗口。清除本站 Cookie 会失去访问权限。</small>'),{headers});
 }catch{return new Response(page('<p>数据库暂时无法连接，请稍后再试。为保护内容，当前不会开放访问。</p>'),{status:503,headers});}
}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
 try{
  if(await deviceIsEnrolled())return new Response(page('<p>已经存在授权设备，无法绑定其他浏览器。</p>'),{status:403,headers});
  const data=await request.formData();
  const token=await enrollDevice(String(data.get('password')||''));
  if(!token)return new Response(page('<p>密码无效，或已经有其他设备完成绑定。</p>'),{status:401,headers});
  const h=new Headers({'Location':'/admin','Cache-Control':'no-store'});
  h.append('Set-Cookie',deviceCookie+'='+token+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+deviceCookieAge);
  return new Response(null,{status:303,headers:h});
 }catch{return new Response(page('<p>绑定未完成：数据库连接出错。请重试。</p>'),{status:503,headers});}
}
