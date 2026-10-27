import {getAdminCollection} from '@/src/server/content';
import {getOwner} from '@/src/server/owner';
import {listComments,pageNumber} from '@/src/server/comments';
import {AdminShell,AdminAccess,AdminUnavailable} from '@/src/components/Admin';
import {CommentEntry,CommentPages} from '@/src/components/Comments';
export const dynamic='force-dynamic';
export default async function ManageComments({searchParams}:{searchParams:Promise<{page?:string;saved?:string}>}){
 if(!await getOwner())return <AdminAccess/>;const q=await searchParams,page=pageNumber(q.page);let result;let articles;
 try{[result,articles]=await Promise.all([listComments(page,true),getAdminCollection()]);}catch(error){console.error(error);return <AdminUnavailable/>;}
 return <AdminShell><div className="admin-title"><div><h1>读者留言</h1><p>留言提交后立即公开。你可以回复、修改回复，或隐藏与恢复留言。</p></div><a className="admin-button" href="/comments">查看公开留言</a></div>{q.saved&&<p className="admin-notice" role="status">已保存。</p>}<section className="admin-comments">{!result.comments.length&&<p>目前没有读者留言。</p>}{result.comments.map(c=><div className="admin-comment" key={c.id}><p className="comment-source">{c.article_id?<a href={'/exhibit/'+encodeURIComponent(c.article_id)+'#article-comments'}>文章：{articles.find(a=>a.exhibit.id===c.article_id)?.exhibit.titleZh||c.article_id}</a>:<a href="/comments">公共留言区</a>}</p><span className="admin-state">{c.hidden?'已隐藏（仅你可见）':'公开'}</span><CommentEntry comment={c}/><form method="post" action="/api/admin/comments"><input type="hidden" name="id" value={c.id}/><input type="hidden" name="revision" value={c.revision}/><input type="hidden" name="page" value={page}/><label>你的回复<textarea name="reply" defaultValue={c.reply} maxLength={5000} rows={4}/></label><small>保存后显示在这则留言下方；清空后保存可撤回回复。隐藏留言时，回复也一并隐藏。</small><div className="comment-admin-actions"><button name="intent" value="reply">{c.reply?'更新回复':'发布回复'}</button><button name="intent" value={c.hidden?'show':'hide'}>{c.hidden?'恢复公开':'隐藏留言'}</button></div></form></div>)}<CommentPages page={page} more={result.more} admin/></section></AdminShell>;
}
