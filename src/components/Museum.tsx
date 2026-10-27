import type { ReactNode } from 'react';
import { SiteNav } from './SiteNav';
import type { Museum,Room } from '../data/museums';
import {publicDocs} from '@/src/server/documents';
import type { Exhibit } from '../data/exhibits';
import { getPublishedExhibits } from '@/src/server/content';
export function Footer() { return <footer><a href="/">WHAT REMAINS UNSAID</a><span>LOVE / BODY / DEATH</span><a href="/admin">编辑室</a><a href="/index">RETURN TO THE INDEX ↑</a></footer>; }
export function SiteShell({ children, tone = '' }: {
    children: ReactNode;
    tone?: string;
}) { return <div className={`site-shell ${tone}`}><a className="skip-link" href="#main">Skip to content</a><SiteNav /><main id="main">{children}</main><Footer /></div>; }
export function ExhibitList({ items }: {items: Exhibit[]}) {
    return <ol className="exhibit-list">{items.map(e => {
        const forthcoming = e.status === 'coming-soon';
        const label = <><span className="micro">{e.code}</span><strong lang="zh">{e.titleZh}</strong><span className="object-name">{e.titleEn}</span><span className="exhibit-keywords">{e.keywords.join(' / ')}</span><span className={`row-end ${forthcoming ? 'forthcoming' : ''}`}>{forthcoming ? <span className="closed-seal"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg><span lang="zh">尚未开放</span><small>COMING SOON</small></span> : '↗'}</span></>;
        return <li key={e.id}>{forthcoming
            ? <div className="exhibit-row exhibit-unavailable" aria-disabled="true">{label}</div>
            : <a href={`/exhibit/${e.id}`} className="exhibit-row">{label}</a>}</li>;
    })}</ol>;
}
function MuseumName({title}:{title:string}){return title.startsWith('THE MUSEUM OF ')?<>THE MUSEUM<br/>OF <em>{title.slice(14)}</em></>:<>{title}</>;}
export async function MuseumIndex() { const exhibits = await getPublishedExhibits(); const museums=await publicDocs('museum'); return <div className="museum-index">{museums.map(m => <a key={m.id} href={`/museum/${m.id}`} className={`museum-line ${m.id}`}><span className="roman">{m.numeral}</span><div><span className="micro">{m.theme} / {String(exhibits.filter(e => e.museum === m.id).length).padStart(2, '0')} EXHIBITS</span><h2><MuseumName title={m.title}/></h2></div><span className="museum-zh" lang="zh">{m.titleZh}</span><p>{m.note}</p><span className="entry-arrow">↗</span></a>)}</div>; }
export function MuseumHeader({ museum }: {
    museum: Museum;
}) { return <header className={`museum-header ${museum.id}`}><div className="museum-photo">{museum.image&&<img src={museum.image} alt={museum.imageAlt||museum.titleZh} style={{objectPosition:museum.imagePosition||'center'}}/>}</div><span className="micro">MUSEUM {museum.numeral} / {museum.theme}</span><h1><MuseumName title={museum.title}/></h1><span className="large-zh" lang="zh">{museum.titleZh}</span><p>{museum.note}</p><div className="header-bottom micro">{museum.instability}<span>MATERIAL NOT FULLY VISIBLE</span></div>{museum.imageCaption&&<p className="museum-image-caption">{museum.imageCaption}</p>}</header>; }
export function RoomHeader({ room }: {
    room: Room;
}) { return <header className="room-header"><span className="micro">ROOM {room.number}</span><div><h2><a href={`/museum/${room.museum}/${room.id}`}>{room.title} ↗</a></h2><p>{room.note}</p></div><span lang="zh">{room.titleZh}</span></header>; }
export function CuratorialNote({ children }: {
    children: ReactNode;
}) { return <aside className="curatorial-note"><span className="micro">CURATORIAL NOTE</span><div lang={typeof children === "string" && /[\u3400-\u9fff]/.test(children) ? "zh" : "en"}>{typeof children === "string" ? children.split(/\n\s*\n/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>) : children}</div></aside>; }
export function ExhibitLabel({ exhibit: e }: {
    exhibit: Exhibit;
}) { return <dl className="exhibit-label micro"><div><dt>EXHIBIT</dt><dd>{e.code}</dd></div><div><dt>OBJECT</dt><dd>{e.object}</dd></div><div><dt>STATUS</dt><dd>{e.status === 'coming-soon' ? 'COMING SOON' : e.fullText.trim() ? 'ON VIEW' : 'INCOMPLETE'}</dd></div><div><dt>ACQUIRED</dt><dd>UNKNOWN</dd></div></dl>; }
export function LiteraryText({ text }: { text: string }) {
    return <>{text.split(/\n\s*\n/).filter(Boolean).map((p, i) => p.startsWith('## ') ? <h2 className="prose-heading" key={i}>{p.slice(3)}</h2> : <p key={i}>{p}</p>)}</>;
}
export function ReadingLayout({ exhibit: e }: { exhibit: Exhibit }) {
    return <section className="reading-layout">
        <CuratorialNote>{e.curatorialNote}</CuratorialNote>
        <article className="prose" lang="zh">
            <p className="micro reading-label" lang="en">{e.code} / LITERARY TEXT{e.sourcePage && <span className="source-label">PORTFOLIO / P. {e.sourcePage}</span>}</p>
            {!e.fullText.trim() && e.excerpt && <blockquote>{e.excerpt}</blockquote>}
            {e.fullText.trim() ? <LiteraryText text={e.fullText}/> : <div className="text-placeholder" lang="en"><span aria-hidden="true">[　　]</span><p>{e.status === 'coming-soon' ? 'This exhibit is forthcoming.' : 'Full literary text will be added here.'}</p><small>{e.status === 'coming-soon' ? 'A place is held in the collection.' : 'The object is here. The rest is still unsaid.'}</small></div>}
        </article>
    </section>;
}
