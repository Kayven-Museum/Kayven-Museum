import {cookies} from 'next/headers';
import {getDatabase} from '@/db';
const COOKIE='museum_trusted_device';
const encoder=new TextEncoder();
const MONTH=365*24*60*60;
async function hash(v:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(v)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
async function table(){const db=getDatabase();await db.prepare('CREATE TABLE IF NOT EXISTS museum_trusted_devices (token_hash TEXT PRIMARY KEY, created_at TEXT NOT NULL, last_used_at TEXT)').run();return db;}
export async function isAdmin(){
  const token=(await cookies()).get(COOKIE)?.value;
  if(!token||!/^[a-f0-9]{64}$/.test(token))return false;
  try{const db=await table();const device=await db.prepare('SELECT token_hash FROM museum_trusted_devices WHERE token_hash = ?').bind(await hash(token)).first();return !!device;}catch{return false;}
}
export async function deviceIsEnrolled(){
  const db=await table();
  const record=await db.prepare('SELECT COUNT(*) as count FROM museum_trusted_devices').first<{count:number}>();
  return Number(record?.count??0)>0;
}
export async function enrollDevice(password:string){
  const expected=process.env.DEVICE_ENROLL_TOKEN;
  if(!expected||expected.length<32)return null;
  const a=encoder.encode(password),b=encoder.encode(expected);
  let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a[i]??0)^(b[i]??0);
  if(diff!==0)return null;
  const db=await table();
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,'0')).join('');
  const tokenHash=await hash(token);
  // Enrollment can only happen while no device has already been registered.
  const result=await db.prepare("INSERT INTO museum_trusted_devices (token_hash, created_at) SELECT ?, datetime('now') WHERE NOT EXISTS (SELECT 1 FROM museum_trusted_devices)").bind(tokenHash).run();
  return result.meta.changes===1?token:null;
}
export const deviceCookie=COOKIE;
export const deviceCookieAge=MONTH;
