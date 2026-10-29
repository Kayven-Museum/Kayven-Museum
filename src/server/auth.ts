import {cookies} from 'next/headers';
const COOKIE='museum_admin_session';
const encoder=new TextEncoder();
function hex(bytes:Uint8Array){return Array.from(bytes).map(x=>x.toString(16).padStart(2,'0')).join('');}
async function signature(value:string){const secret=process.env.ADMIN_SESSION_SECRET;if(!secret||secret.length<32)return null;const key=await crypto.subtle.importKey('raw',encoder.encode(secret),'HMAC',false,['sign']);return hex(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(value))));}
export async function isAdmin(){
 const cookie=(await cookies()).get(COOKIE)?.value;
 if(!cookie)return false;
 const match=/^(\d+)\.([a-f0-9]{64})$/.exec(cookie);if(!match||Number(match[1])<Date.now())return false;
 const expected=await signature(match[1]);if(!expected)return false;
 let difference=0;for(let i=0;i<64;i++)difference|=expected.charCodeAt(i)^match[2].charCodeAt(i);
 return difference===0;
}
export async function makeSession(){
 const expiry=String(Date.now()+7*24*60*60*1000),sig=await signature(expiry);
 if(!sig)throw Error('ADMIN_SESSION_SECRET must be at least 32 characters');
 return expiry+'.'+sig;
}
export const sessionCookie=COOKIE;
export async function checkPassword(password:string){
 const expected=process.env.ADMIN_PASSWORD;
 if(!expected||expected.length<8)return false;
 const a=encoder.encode(password),b=encoder.encode(expected);
 // Constant-time comparison even for different lengths.
 let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a[i]??0)^(b[i]??0);
 return diff===0;
}
