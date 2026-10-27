import {SiteShell} from '@/src/components/Museum';
import {CommentEntry,CommentForm,CommentPages} from '@/src/components/Comments';
import {listComments,pageNumber} from '@/src/server/comments';
export const dynamic='force-dynamic';
export const metadata={title:'Comments · What Remains Unsaid',description:'读者留言与 Kayven 的回复。'};
export default async function Comments({searchParams}:{searchParams:Promise<{page?:string;sent?:string}>}){
 const q=await searchParams,page=pageNumber(q.page);let result;
 try{result=await listComments(page);}catch(error){console.error(error);return <SiteShell><section className="comments-page"><h1>读者留言</h1><p>留言暂时无法读取，请稍后刷新。</p></section></SiteShell>;}
 return <SiteShell><section className="comments-page"><header className="comments-heading"><p className="micro">THE VISITORS’ BOOK</p><h1>Leave a little<br/><em>of yourself.</em></h1><p>读者留言 <span>／</span> 在离开之前，留下几句话。</p></header>{q.sent==='1'&&<p className="comment-notice" role="status">留言已公开，谢谢你留下的文字。</p>}<div className="comments-layout"><aside><h2>写一则留言</h2><CommentForm/></aside><section className="comment-stream" aria-label="公开留言"><h2>留在这里的声音</h2>{result.comments.length?result.comments.map(c=><CommentEntry key={c.id} comment={c}/>):<p className="comment-empty">{page>1?'这一页还没有留言。':'这里还很安静。你可以留下第一则留言。'}</p>}<CommentPages page={page} more={result.more}/></section></div></section></SiteShell>;
}
