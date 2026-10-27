import {ExhibitPicture} from '@/src/components/ExhibitPicture';
import {notFound} from 'next/navigation';
import {SiteShell,RoomHeader,ExhibitList,LiteraryText} from '@/src/components/Museum';
import {publicDocs} from '@/src/server/documents';
import {getPublishedExhibits} from '@/src/server/content';
import type {Room} from '@/src/data/museums';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{slug:string;room:string}>}){const {slug,room}=await params;const [ms,rs,es]=await Promise.all([publicDocs('museum'),publicDocs('room'),getPublishedExhibits()]);const m=ms.find(m=>m.id===slug),r=rs.find(r=>r.id===room&&r.museum===slug);if(!m||!r)notFound();return <SiteShell tone={slug}><nav className="breadcrumbs micro"><a href={`/museum/${slug}`}>{m.title}</a><span>/ ROOM {r.number}</span></nav><header className="page-intro"><p className="micro">{m.theme} / ROOM {r.number}</p><h1>{r.title}</h1><p>{r.note}</p></header><ExhibitPicture picture={r} label={'ROOM '+r.number} room/><div className="museum-collection"><RoomHeader room={r as unknown as Room}/>{r.preface&&<details className="original-writing"><summary><span className="micro">PREFACE</span><span lang="zh">总序｜{r.titleZh}</span><span>＋</span></summary><article className="prose" lang="zh"><LiteraryText text={r.preface}/></article></details>}<ExhibitList items={es.filter(e=>e.museum===slug&&e.room===room)}/><a className="back-link" href={`/museum/${slug}`}>← {m.title}</a></div></SiteShell>}
