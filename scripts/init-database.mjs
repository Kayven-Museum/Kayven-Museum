import {createClient} from '@libsql/client';
import {readFile,readdir} from 'node:fs/promises';
const url=process.env.TURSO_DATABASE_URL,authToken=process.env.TURSO_AUTH_TOKEN;
if(!url||!authToken)throw new Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before initialization');
const db=createClient({url,authToken});
const migrations=(await readdir('drizzle')).filter(n=>/^\d{4}_.*\.sql$/.test(n)).sort();
if(!migrations.length)throw new Error('No schema migrations found');
const found=await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('manuscripts','documents','comments','image_assets')");
if(found.rows.length===4){console.log('Museum schema already initialized; no changes made');process.exit(0);}
if(found.rows.length!==0)throw new Error('Partial schema found; refusing to change existing tables');
for(const name of migrations){
 const sql=await readFile('drizzle/'+name,'utf8');
 const statements=sql.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean);
 for(const statement of statements)await db.execute(statement);
 console.log('Applied',name);
}
console.log('Museum database schema initialized successfully');
