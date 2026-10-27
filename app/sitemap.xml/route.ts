import {getPublishedExhibits} from '@/src/server/content';
import {publicDocs} from '@/src/server/documents';
export const dynamic='force-dynamic';
const origin='https://what-remains-unsaid.prime-oak-8928.chatgpt.site';
const xml=(value:string)=>value.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export async function GET(){
 try{
 const [exhibits,museums,rooms]=await Promise.all([getPublishedExhibits(),publicDocs('museum'),publicDocs('room')]);
 const museumIds=new Set(museums.map(m=>m.id));
 const paths=['/','/index','/museum','/archive','/stages','/comments','/about',...museums.map(m=>'/museum/'+encodeURIComponent(m.id)),...rooms.filter(r=>museumIds.has(r.museum)).map(r=>'/museum/'+encodeURIComponent(r.museum)+'/'+encodeURIComponent(r.id)),...exhibits.filter(e=>e.status!=='coming-soon'&&museumIds.has(e.museum)).map(e=>'/exhibit/'+encodeURIComponent(e.id))];
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[...new Set(paths)].map(path=>'<url><loc>'+xml(origin+path)+'</loc></url>').join('')+'</urlset>',{headers:{'content-type':'application/xml; charset=utf-8','cache-control':'no-store'}});
 }catch(error){console.error('Sitemap unavailable',error);return new Response('Sitemap temporarily unavailable',{status:503,headers:{'cache-control':'no-store'}});}
}
