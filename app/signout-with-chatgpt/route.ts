import {sessionCookie} from '@/src/server/auth';
export function GET(){
 return new Response(null,{status:303,headers:{Location:'/', 'Set-Cookie':`${sessionCookie}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`,'Cache-Control':'no-store'}});
}
