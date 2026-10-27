import {ExhibitPicture} from '@/src/components/ExhibitPicture';
import {notFound} from 'next/navigation';
import {getOwner} from '@/src/server/owner';
import {getEditable} from '@/src/server/content';
import {AdminAccess,AdminUnavailable} from '@/src/components/Admin';
import {ExhibitLabel,ReadingLayout} from '@/src/components/Museum';
export const dynamic='force-dynamic';
export const metadata={title:'草稿预览 | What Remains Unsaid',robots:{index:false,follow:false}};
export default async function Preview({params}:{params:Promise<{id:string}>}) {
 if(!await getOwner())return <AdminAccess/>;
 const {id}=await params;let record;
 try{record=await getEditable(id);}catch(error){console.error(error);return <AdminUnavailable/>;}
 if(!record)notFound();const e=record.exhibit;
 return <main className={`object-${e.museum}`}><div className="preview-banner" lang="zh"><strong>草稿预览 · 仅馆主可见</strong><a href={`/admin/edit/${e.id}`}>← 返回编辑并发布</a></div><header className="object-opening"><ExhibitLabel exhibit={e}/><div className="object-title"><h1 lang="zh">{e.titleZh}</h1><p>{e.titleEn}</p><span className="micro">{e.keywords.join(' / ')}</span></div></header><ExhibitPicture picture={e} label={e.code+' / '+e.titleEn}/><ReadingLayout exhibit={e}/></main>;
}
