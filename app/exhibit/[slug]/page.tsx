import {ArticleComments} from '@/src/components/ArticleComments';
import {ExhibitPicture} from '@/src/components/ExhibitPicture';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { SiteShell, ExhibitLabel, ReadingLayout } from '@/src/components/Museum';
import { getPublishedExhibits } from '@/src/server/content';
export const dynamic = 'force-dynamic';
import {publicDocs} from '@/src/server/documents';
type Props = {
    searchParams:Promise<{commentPage?:string;sent?:string}>;
    params: Promise<{
        slug: string;
    }>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> { const slug = (await params).slug; const e = (await getPublishedExhibits()).find(e => e.status !== 'coming-soon' && (e.id === slug || e.legacySlug === slug)); return { title: e ? `${e.code} ${e.titleZh} — ${e.titleEn} | What Remains Unsaid` : 'Exhibit not found', description: e ? (e.curatorialNote||e.excerpt||`${e.titleZh}，Kayven 的文学作品。`).slice(0,180) : undefined, alternates:e?{canonical:'/exhibit/'+e.id}:undefined }; }
export default async function ExhibitPage({ params,searchParams }: Props) { const { slug } = await params; const q=await searchParams; const exhibits = (await getPublishedExhibits()).filter(e => e.status !== 'coming-soon'); const e = exhibits.find(e => e.id === slug || e.legacySlug === slug); if (!e)
    notFound(); if (slug !== e.id)
    redirect(`/exhibit/${e.id}`); const n = exhibits.findIndex(x => x.id === e.id); const previous = exhibits[n - 1], next = exhibits[n + 1]; const museums=await publicDocs('museum'),rooms=await publicDocs('room'); const m = museums.find(x => x.id === e.museum)!; const r = rooms.find(x => x.id === e.room); return <SiteShell tone={`object-${e.museum}`}><nav className="breadcrumbs micro" aria-label="Breadcrumb"><a href="/index">INDEX</a><span>/</span><a href={`/museum/${m.id}`}>{m.title}</a>{r && <><span>/</span><a href={`/museum/${m.id}/${r.id}`}>{r.title}</a></>}</nav><header className="object-opening"><ExhibitLabel exhibit={e}/><div className="object-title"><h1 lang="zh">{e.titleZh}</h1><p>{e.titleEn}</p><span className="micro">{e.keywords.join(' / ')}</span></div></header><ExhibitPicture picture={e} label={e.code+' / '+e.titleEn}/><ReadingLayout exhibit={e}/><ArticleComments articleId={e.id} title={e.titleZh} page={q.commentPage} sent={q.sent}/><nav className="object-pagination" aria-label="Exhibit sequence">{previous ? <a href={`/exhibit/${previous.id}`}><span className="micro">← PREVIOUS EXHIBIT / {previous.code}</span><b lang="zh">{previous.titleZh}</b></a> : <a href="/index"><span className="micro">← COLLECTION INDEX</span><b>The collection begins here.</b></a>}{next ? <a href={`/exhibit/${next.id}`}><span className="micro">NEXT EXHIBIT / {next.code} →</span><b lang="zh">{next.titleZh}</b></a> : <a href="/index"><span className="micro">RETURN TO THE INDEX →</span><b>The collection continues.</b></a>}</nav></SiteShell>; }
