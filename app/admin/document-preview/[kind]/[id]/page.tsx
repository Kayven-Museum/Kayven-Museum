import {StageEntry} from '@/src/components/Stages';
import {ExhibitPicture} from '@/src/components/ExhibitPicture';
import {notFound} from 'next/navigation';
import {getOwner} from '@/src/server/owner';
import {kinds,listDocs,type Kind} from '@/src/server/documents';
import {AdminAccess,AdminUnavailable} from '@/src/components/Admin';
import {SiteShell,MuseumHeader,RoomHeader,LiteraryText} from '@/src/components/Museum';
import type {Museum,Room} from '@/src/data/museums';
export const dynamic='force-dynamic';
export default async function Preview({params}:{params:Promise<{kind:string;id:string}>}){if(!await getOwner())return <AdminAccess/>;const {kind,id}=await params;if(!kinds.includes(kind as Kind))notFound();let r;try{r=(await listDocs(kind as Kind,true)).find(r=>r.doc.id===id);}catch{return <AdminUnavailable/>;}if(!r)notFound();const d=r.doc;return <><div className="draft-preview-banner">私人草稿预览 · 尚未发布 <a href={`/admin/manage/${kind}?id=${id}`}>返回编辑 →</a></div><SiteShell>{kind==='stage'?<section className="stage-ledger"><StageEntry stage={d}/></section>:kind==='museum'?<MuseumHeader museum={d as unknown as Museum}/>:kind==='room'?<div className="museum-collection"><RoomHeader room={d as unknown as Room}/><ExhibitPicture picture={d} label={'ROOM '+d.number} room/><article className="prose"><LiteraryText text={d.preface??''}/></article></div>:<section className="archive-ledger"><article className="archive-entry"><div className="archive-meta micro">{d.date} {d.phase}<br/>{d.source}</div><div><h2>{d.title}</h2><LiteraryText text={d.reflection}/></div><span className="micro">{d.label}</span></article></section>}</SiteShell></>;}
