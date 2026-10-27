import {notFound,redirect} from 'next/navigation';
import {SiteShell,MuseumHeader,RoomHeader,ExhibitList} from '@/src/components/Museum';
import {publicDocs} from '@/src/server/documents';
import {getPublishedExhibits} from '@/src/server/content';
import type {Museum,Room} from '@/src/data/museums';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(slug==='second')redirect('/museum/evidence');const [ms,rs,es]=await Promise.all([publicDocs('museum'),publicDocs('room'),getPublishedExhibits()]);const m=ms.find(m=>m.id===slug);if(!m)notFound();const rooms=rs.filter(r=>r.museum===slug),direct=es.filter(e=>e.museum===slug&&!e.room);return <SiteShell tone={slug}><MuseumHeader museum={m as unknown as Museum}/><div className="museum-collection">{direct.length>0&&<ExhibitList items={direct}/ >}{rooms.map(r=><section key={r.id}><RoomHeader room={r as unknown as Room}/><ExhibitList items={es.filter(e=>e.museum===slug&&e.room===r.id)}/></section>)}{!rooms.length&&!direct.length&&<p>馆藏正在整理中。</p>}</div></SiteShell>}
