import {NextRequest} from 'next/server';
import {createClient} from '@libsql/client';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
type Item={name:string;create:string;rows:Record<string,unknown>[];indexes:string[]};
const allowed=new Set(['manuscripts','documents','comments','image_assets']);
export async function POST(req:NextRequest){
 if(process.env.VERCEL_ENV!=='preview'||!process.env.MUSEUM_MIGRATION_KEY||req.headers.get('x-migration-key')!==process.env.MUSEUM_MIGRATION_KEY)
  return Response.json({error:'Forbidden'},{status:403});
 const url=process.env.TURSO_DATABASE_URL,authToken=process.env.TURSO_AUTH_TOKEN;
 if(!url||!authToken)return Response.json({error:'Database unavailable'},{status:503});
 const data=await req.json() as {tables:Item[]};
 if(!Array.isArray(data.tables)||data.tables.length!==4||data.tables.some(t=>!allowed.has(t.name)))
  return Response.json({error:'Invalid backup tables'},{status:400});
 const db=createClient({url,authToken});
 try{
  for(const t of data.tables){
   const q=await db.execute({sql:"SELECT name FROM sqlite_master WHERE name=? AND type='table'",args:[t.name]});
   if(q.rows.length){const n=await db.execute('SELECT COUNT(*) AS n FROM "'+t.name+'"');if(Number(n.rows[0].n)>0)return Response.json({error:'Target already contains data',table:t.name},{status:409});}
  }
  const verified:Record<string,number>={};
  for(const t of data.tables){
   await db.execute(t.create.replace(/^CREATE TABLE /,'CREATE TABLE IF NOT EXISTS '));
   const cols=Object.keys(t.rows[0]||{});
   if(cols.some(c=>!/^[a-z_]+$/.test(c)))throw Error('Invalid field name');
   if(t.rows.length){
    const statement='INSERT INTO "'+t.name+'" ('+cols.map(c=>'"'+c+'"').join(',')+') VALUES ('+cols.map(()=>'?').join(',')+')';
    for(const row of t.rows)await db.execute({sql:statement,args:cols.map(c=>row[c] as string|number|null)});
   }
   for(const idx of t.indexes)if(/^CREATE INDEX /i.test(idx))await db.execute(idx.replace(/^CREATE INDEX /i,'CREATE INDEX IF NOT EXISTS '));
   const n=await db.execute('SELECT COUNT(*) AS n FROM "'+t.name+'"');
   verified[t.name]=Number(n.rows[0].n);
   if(verified[t.name]!==t.rows.length)throw Error('Count mismatch '+t.name);
  }
  return Response.json({ok:true,verified});
 }catch(err){console.error('Migration error',err);return Response.json({error:'Migration failed. Check logs.'},{status:500});}
 finally{db.close();}
}
