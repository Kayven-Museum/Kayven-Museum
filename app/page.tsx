import {InteractiveCover} from '@/src/components/InteractiveCover';
import {SiteShell,MuseumIndex} from '@/src/components/Museum';
import {publicDocs} from '@/src/server/documents';
export const metadata={alternates:{canonical:'/'}};
export const dynamic='force-dynamic';
export default async function Home(){const museums=await publicDocs('museum');return <SiteShell><InteractiveCover museums={museums.slice(0,3).map(m=>({id:m.id,title:m.title,titleZh:m.titleZh,numeral:m.numeral,theme:m.theme,image:m.image||'',imageAlt:m.imageAlt,imagePosition:m.imagePosition}))}/><section className="home-museums"><div className="section-heading"><span className="micro">THE COLLECTION / 馆藏</span><p>Some things remain<br/>because they cannot be said.</p></div><MuseumIndex/></section></SiteShell>;}
