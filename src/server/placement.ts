import {getDatabase} from '@/db';
import {exhibits as originals,type Exhibit} from '@/src/data/exhibits';
import {SaveConflict,type Manuscript} from './content';
import {publicDocs} from './documents';
export type PlacementRecord={id:string;draft:Exhibit;public:Exhibit|null;revision:number};
export async function placementRecords():Promise<PlacementRecord[]>{
 const rows=await getDatabase().prepare('SELECT * FROM manuscripts').all<Manuscript>();
 const map=new Map<string,PlacementRecord>(originals.map(e=>[e.id,{id:e.id,draft:e,public:e,revision:0}]));
 for(const row of rows.results){if(row.deleted){map.delete(row.id);continue;}map.set(row.id,{id:row.id,draft:JSON.parse(row.draft),public:row.published?JSON.parse(row.published):originals.find(e=>e.id===row.id)??null,revision:row.revision});}
 return [...map.values()].sort((a,b)=>a.draft.code.localeCompare(b.draft.code,undefined,{numeric:true}));
}
export async function placementTarget(kind:string,id:string){
 if(kind!=='museum'&&kind!=='room')throw new Error('请选择 Museum 或展馆。');
 const doc=(await publicDocs(kind)).find(d=>d.id===id);
 if(!doc)throw new Error('请先发布这个 Museum 或展馆，再选择作品。');
 return {kind,id,museum:kind==='museum'?id:doc.museum,room:kind==='room'?id:null,title:doc.titleZh||doc.title};
}
export type Target=Awaited<ReturnType<typeof placementTarget>>;
export function belongs(e:Exhibit,t:Target){return e.museum===t.museum&&(t.kind==='museum'||e.room===t.room);}
export async function updatePlacement(t:Target,selected:Set<string>,expected:Record<string,number>,removeTo:string,userId:string){
 const records=await placementRecords();
 if(records.length!==Object.keys(expected).length||records.some(r=>expected[r.id]!==r.revision))throw new SaveConflict('作品已在另一个窗口更新。请重新打开馆内作品列表后再选择；本次没有更改任何作品。');
 if([...selected].some(id=>!records.some(r=>r.id===id)))throw new Error('选择中包含不存在的作品。');
 const [removeMuseum,removeRoom]=removeTo.split('/');
 const changes=records.flatMap(r=>{
  const active=r.public??r.draft,inside=belongs(active,t),checked=selected.has(r.id);
  if(inside===checked)return [];
  const destination=checked?{museum:t.museum,room:t.room}:{museum:removeMuseum,room:removeRoom||null};
  return [{id:r.id,draft:JSON.stringify({...r.draft,...destination}),published:r.public?JSON.stringify({...r.public,...destination}):null}];
 });
 if(!changes.length)return 0;
 const now=new Date().toISOString();
 // One guarded SQL statement makes the entire selection atomic. A concurrent
 // manuscript update cancels every move, without publishing unrelated drafts.
 const result=await getDatabase().prepare(`
 WITH incoming AS (SELECT value FROM json_each(?)), expected AS (SELECT key AS id,value AS revision FROM json_each(?))
 INSERT INTO manuscripts (id,draft,published,revision,updated_at,published_at,updated_by)
 SELECT json_extract(value,'$.id'),json_extract(value,'$.draft'),json_extract(value,'$.published'),1,?,CASE WHEN json_extract(value,'$.published') IS NOT NULL THEN ? ELSE NULL END,?
 FROM incoming WHERE NOT EXISTS (
 SELECT 1 FROM expected LEFT JOIN manuscripts ON manuscripts.id=expected.id
 WHERE COALESCE(manuscripts.revision,0) != expected.revision OR manuscripts.deleted=1)
 ON CONFLICT(id) DO UPDATE SET draft=excluded.draft,published=excluded.published,
 revision=manuscripts.revision+1,updated_at=excluded.updated_at,published_at=excluded.published_at,updated_by=excluded.updated_by
 `).bind(JSON.stringify(changes),JSON.stringify(expected),now,now,userId).run();
 if(result.meta.changes!==changes.length)throw new SaveConflict('作品刚刚被更新，本次没有更改任何作品。请刷新后重试。');
 return changes.length;
}
