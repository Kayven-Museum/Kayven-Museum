import {listComments,pageNumber} from '@/src/server/comments';
import {CommentEntry,CommentForm,CommentPages} from './Comments';
export async function ArticleComments({articleId,title,page,sent}:{articleId:string;title:string;page?:string;sent?:string}){
 const current=pageNumber(page);let result;
 try{result=await listComments(current,false,articleId);}catch(error){console.error(error);return <section id="article-comments" className="article-comments"><h2>本文评论</h2><p>评论暂时无法读取，请稍后刷新。文章仍可正常阅读。</p></section>;}
 return <section id="article-comments" className="article-comments" lang="zh"><header className="article-comments-heading"><div><p className="micro">AFTER READING</p><h2>读完《{title}》之后</h2></div><a href="/comments">前往公共留言区</a></header>{sent==='1'&&<p className="comment-notice" role="status">评论已公开，谢谢你留下的文字。</p>}<div className="comments-layout"><aside><h3>为这篇文章留言</h3><CommentForm articleId={articleId}/></aside><section className="comment-stream" aria-label="本文评论"><h3>本文评论</h3>{result.comments.length?result.comments.map(c=><CommentEntry key={c.id} comment={c}/>):<p className="comment-empty">{current>1?'这一页还没有评论。':'这篇文章还没有评论，留下你的感受吧。'}</p>}<CommentPages page={current} more={result.more} articleId={articleId}/></section></div></section>;
}
