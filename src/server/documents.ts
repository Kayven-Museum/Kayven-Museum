import {getDatabase} from '@/db';
import {museums,rooms} from '@/src/data/museums';
import {archive} from '@/src/data/archive';
import {articles} from '@/src/data/articles';
import {SaveConflict,type Manuscript} from './content';
export type Kind='museum'|'room'|'archive'|'stage';
export type Doc=Record<string,string> & {id:string;kind:Kind;title:string;order:string;image?:string;imageAlt?:string;imageCaption?:string;imagePosition?:string};
export type DocState={doc:Doc;revision:number;published:boolean;changed:boolean};
export const kinds:Kind[]=['museum','room','archive','stage'];
const originals:Doc[]=[...museums.map((m,i)=>({...m,kind:'museum' as const,order:String(i+1)})),...rooms.map((r,i)=>({...r,preface:r.id==='body-afterward'?articles['body-afterward-preface'].fullText:'',kind:'room' as const,order:String(i+1)})),...archive.map((a,i)=>({...a,date:a.date??'',kind:'archive' as const,order:String(i+1)})),{id:'before-language',kind:'archive',order:'9',title:'在尚未形成语言之前',reflection:articles['before-language'].fullText,date:'',phase:'OPENING TEXT',label:'OPENING TEXT',source:'Portfolio p. 10'}];
export async function listDocs(kind:Kind,draft=false):Promise<DocState[]>{
 let rows:{results:Manuscript[]}={results:[]};
 try{rows=await getDatabase().prepare('SELECT * FROM documents WHERE id LIKE ?').bind(kind+':%').all<Manuscript>();}
 catch(error){console.warn('Using bundled museum documents because database is unavailable:',error instanceof Error?error.message:'database unavailable');}
 const map=new Map(originals.filter(d=>d.kind===kind).map(doc=>[doc.id,{doc,revision:0,published:true,changed:false}]));
 for(const row of rows.results){const doc:Doc=JSON.parse(row.draft);if(row.deleted){map.delete(doc.id);continue;}const original=originals.find(d=>d.kind===kind&&d.id===doc.id);if(!draft&&!row.published)continue;map.set(doc.id,{doc:draft?doc:JSON.parse(row.published!),revision:row.revision,published:!!row.published||!!original,changed:row.draft!==(row.published??JSON.stringify(original))});}
 return [...map.values()].sort((a,b)=>Number(a.doc.order)-Number(b.doc.order)||a.doc.id.localeCompare(b.doc.id));
}
export async function publicDocs(kind:Kind){return (await listDocs(kind)).map(r=>r.doc);}
export async function saveDoc(doc:Doc,revision:number,publish:boolean,userId:string){
 const text=JSON.stringify(doc),now=new Date().toISOString(),id=doc.kind+':'+doc.id,db=getDatabase();
 const result=revision===0?await db.prepare('INSERT INTO documents (id,draft,published,revision,updated_at,published_at,updated_by) VALUES (?,?,?,1,?,?,?) ON CONFLICT(id) DO NOTHING').bind(id,text,publish?text:null,now,publish?now:null,userId).run():await db.prepare('UPDATE documents SET draft=?,published=CASE WHEN ?=1 THEN ? ELSE published END,revision=revision+1,updated_at=?,published_at=CASE WHEN ?=1 THEN ? ELSE published_at END,updated_by=? WHERE id=? AND revision=? AND deleted=0').bind(text,publish?1:0,text,now,publish?1:0,now,userId,id,revision).run();
 if(result.meta.changes!==1)throw new SaveConflict('此内容已在另一个窗口更新，请打开最新版本核对。');
}
export async function destinations(){const [ms,rs]=await Promise.all([publicDocs('museum'),publicDocs('room')]);return ms.flatMap(m=>[{value:m.id+'/',label:m.titleZh+' · 主展区'},...rs.filter(r=>r.museum===m.id).map(r=>({value:m.id+'/'+r.id,label:m.titleZh+' / '+r.titleZh}))]);}
