import {checkPassword,makeSession,sessionCookie} from '@/src/server/auth';
const page=`<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>馆藏编辑室登录</title><style>body{background:#f4f2ed;color:#222;font:16px/1.6 system-ui;padding:10vh 20px}main{max-width:420px;margin:auto}input,button{font:inherit;display:block;width:100%;padding:12px;margin:14px 0;box-sizing:border-box}button{background:#222;color:#fff;border:0;cursor:pointer}</style><main><h1>馆藏编辑室</h1><p>请输入馆主密码。</p><form method="post"><label>密码<input type="password" name="password" required autocomplete="current-password"></label><button>登录</button></form><a href="/">返回网站</a></main></html>`;
export async function GET(){return new Response(page,{headers:{'content-type':'text/html;charset=utf-8','cache-control':'no-store'}});}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
 const f=await request.formData();
 if(!await checkPassword(String(f.get('password')||'')))return new Response('密码错误。请返回重试。',{status:401});
 const h=new Headers({'Location':'/admin','Cache-Control':'no-store'});
 h.append('Set-Cookie',`${sessionCookie}=${await makeSession()}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=604800`);
 return new Response(null,{status:303,headers:h});
}
