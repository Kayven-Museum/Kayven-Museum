import { getDatabase } from '@/db';
import { exhibits as originals, type Exhibit } from '@/src/data/exhibits';

export type Manuscript = {
  deleted?:number; id: string; draft: string; published: string | null; revision: number;
  updated_at: string; published_at: string | null; updated_by: string;
};
export type Editable = { exhibit: Exhibit; revision: number; changed: boolean; published: boolean; updatedAt: string | null; };

export async function getPublishedExhibits(): Promise<Exhibit[]> {
  try {
    const rows = await getDatabase().prepare('SELECT id, published, deleted FROM manuscripts WHERE published IS NOT NULL OR deleted=1').all<{id:string;published:string;deleted:number}>();
    const merged = new Map(originals.map(e => [e.id, e]));
    for (const row of rows.results) {if(row.deleted)merged.delete(row.id);else merged.set(row.id, JSON.parse(row.published));}
    // Forthcoming entries expose catalogue labels only, never manuscript content.
    return [...merged.values()].map(e => e.status === 'coming-soon' ? {...e,fullText:'',curatorialNote:'',excerpt:'',image:undefined,imageAlt:undefined} : e).sort((a,b) => 'LERD'.indexOf(a.code[0]) - 'LERD'.indexOf(b.code[0]) || Number(a.code.split('-')[1]) - Number(b.code.split('-')[1]));
  } catch (error) {
    console.error('Published collection unavailable', error);
    // Do not silently replace published edits with the bundled original versions.
    throw new Error('馆藏暂时无法读取，请稍后刷新。');
  }
}
export async function getEditable(id: string): Promise<Editable | null> {
  const row = await getDatabase().prepare('SELECT * FROM manuscripts WHERE id = ?').bind(id).first<Manuscript>();
  const original = originals.find(e => e.id === id);
  if(row?.deleted)return null;
  if (row) return {exhibit:JSON.parse(row.draft),revision:row.revision,changed:row.draft !== (row.published ?? JSON.stringify(original)),published:row.published !== null || !!original,updatedAt:row.updated_at};
  return original ? {exhibit:original,revision:0,changed:false,published:true,updatedAt:null} : null;
}
export async function getAdminCollection(): Promise<Editable[]> {
  const rows = await getDatabase().prepare('SELECT * FROM manuscripts').all<Manuscript>();
  const map = new Map<string, Editable>(originals.map(exhibit=>[exhibit.id,{exhibit,revision:0,changed:false,published:true,updatedAt:null}]));
  for(const row of rows.results) {
    if(row.deleted){map.delete(row.id);continue;}
    const original = originals.find(e=>e.id===row.id);
    map.set(row.id,{exhibit:JSON.parse(row.draft),revision:row.revision,changed:row.draft !== (row.published ?? JSON.stringify(original)),published:row.published!==null || !!original,updatedAt:row.updated_at});
  }
  return [...map.values()].sort((a,b)=>'LERD'.indexOf(a.exhibit.code[0])-'LERD'.indexOf(b.exhibit.code[0]) || Number(a.exhibit.code.split('-')[1])-Number(b.exhibit.code.split('-')[1]));
}

export class SaveConflict extends Error {}
export async function saveManuscript(exhibit: Exhibit, expectedRevision: number, publish: boolean, userId: string) {
  const db = getDatabase();
  const text = JSON.stringify(exhibit);
  const now = new Date().toISOString();
  let result;
  if (expectedRevision === 0) {
    result = await db.prepare('INSERT INTO manuscripts (id,draft,published,revision,updated_at,published_at,updated_by) VALUES (?,?,?,1,?,?,?) ON CONFLICT(id) DO NOTHING')
      .bind(exhibit.id,text,publish?text:null,now,publish?now:null,userId).run();
  } else {
    result = await db.prepare('UPDATE manuscripts SET draft = ?, published = CASE WHEN ? = 1 THEN ? ELSE published END, revision = revision + 1, updated_at = ?, published_at = CASE WHEN ? = 1 THEN ? ELSE published_at END, updated_by = ? WHERE id = ? AND revision = ? AND deleted=0')
      .bind(text,publish?1:0,text,now,publish?1:0,now,userId,exhibit.id,expectedRevision).run();
  }
  if (result.meta.changes !== 1) throw new SaveConflict('这篇文章已在另一个窗口更新。你的输入保留在下方，请打开最新版本核对后再保存。');
}
