import {DeleteControl} from './DeleteControl';
import {ImageEditor} from './ImageEditor';
import {destinations} from '@/src/server/documents';
import type { ReactNode } from 'react';
import type { Editable } from '@/src/server/content';
import { chatGPTSignInPath } from '@/app/chatgpt-auth';

export function AdminShell({children}:{children:ReactNode}) {
  return <div className="admin-shell" lang="zh"><header className="admin-nav"><a href="/admin">W/R/U <span>馆藏编辑室</span></a><nav><a href="/" target="_blank" rel="noopener">查看网站 ↗</a><a href="/signout-with-chatgpt?return_to=%2Fadmin" target="_top">退出登录</a></nav></header><nav className="admin-tabs" aria-label="编辑室分类"><a href="/admin">作品</a><a href="/admin/comments">读者留言</a><a href="/admin/manage/stage">Stages 阶段记录</a><a href="/admin/manage/archive">Archive 档案</a><a href="/admin/manage/museum">Museums 博物馆</a><a href="/admin/manage/room">展馆 / Rooms</a></nav><main>{children}</main><footer>WHAT REMAINS UNSAID / 私人编辑室</footer></div>;
}
export function AdminAccess(){return <AdminShell><section className="admin-welcome"><p className="micro">PRIVATE WORKROOM</p><h1>馆藏编辑室</h1><p>使用馆主密码登录。只有馆主可以编辑；其他访客只能阅读公开作品。</p><a className="admin-button primary" href={chatGPTSignInPath('/admin')} target="_top">馆主登录</a><a className="admin-back" href="/">返回博物馆 →</a></section></AdminShell>}
export function AdminUnavailable(){return <AdminShell><section className="admin-welcome"><h1>编辑室暂时无法读取</h1><p>请稍后刷新。已经保存的内容不会因此更改。</p><a className="admin-button" href="/admin">重新载入</a></section></AdminShell>}
export async function EditorForm({record,isNew=false,notice}:{record:Editable;isNew?:boolean;notice?:string}) {
 const e=record.exhibit; const places=await destinations();
 return <AdminShell><a className="admin-back" href="/admin">← 全部作品</a><div className="admin-title"><div><p className="micro">{isNew?'NEW EXHIBIT':`${e.code} / MANUSCRIPT`}</p><h1>{isNew?'添加一篇作品':e.titleZh}</h1></div><span className="admin-state">{record.changed?'有未发布草稿':record.published?'已公开':'未发布'}</span></div>
 {notice&&<p className="admin-notice" role="status">{notice}</p>}
 <form className="editor-form" action="/api/admin/save" method="post">
 <input type="hidden" name="revision" value={record.revision}/><input type="hidden" name="isNew" value={isNew?'1':'0'}/>
 <section className="editor-metadata"><h2>01 / 展品信息</h2><div className="editor-grid">
 <label>展品编号<input name="code" defaultValue={e.code} readOnly={!isNew} required pattern="[A-Za-z]{1,8}-[0-9]{2,4}" maxLength={13}/><small>例如 L-06 或 NEW-01。已有编号不能更改；所属展馆在下方选择。</small></label>
 <label>展出状态<select name="status" defaultValue={e.status==='coming-soon'?'coming-soon':'published'}><option value="published">正文已就绪</option><option value="coming-soon">即将展出</option></select><small>即将展出：公开目录保留标题，但不能打开正文。点击“发布到网站”后状态才会生效。</small></label>
 <label className="wide">所属 Museum / 展馆<select name="destination" defaultValue={e.museum+'/'+(e.room??'')} required>{places.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}</select><small>先在博物馆与展馆编辑室发布新空间，再把作品放进去。</small></label><label>中文标题<input name="titleZh" defaultValue={e.titleZh} maxLength={100} required/></label>
 <label>英文标签<input name="titleEn" defaultValue={e.titleEn} maxLength={160} required/></label>
 <label className="wide">关键词<input name="keywords" defaultValue={e.keywords.join(' / ')} maxLength={500}/><small>用 / 分隔，例如：等待 / 回应 / 可能性。</small></label>
 </div></section>
 <ImageEditor value={e}/><section className="editor-writing"><div><h2>02 / 馆长手记</h2><p>这里放展柜记录、策展说明或文章前一页的文字。它会独立显示在正文旁边。</p></div><label><span className="sr-only">馆长手记</span><textarea name="curatorialNote" defaultValue={e.curatorialNote} rows={10} maxLength={20000}/></label></section>
 <section className="editor-writing"><div><h2>03 / 文章正文</h2><p>只放完整文章。空一行分段；以“## ”开头的一行可作为章节或版本标题。</p></div><label><span className="sr-only">文章正文</span><textarea className="body-editor" name="fullText" defaultValue={e.fullText} rows={25} maxLength={100000}/></label></section>
 <div className="editor-actions"><div><button type="submit" name="intent" value="save">保存草稿</button><button type="submit" name="intent" value="preview">保存并预览</button></div><button className="primary" type="submit" name="intent" value="publish">发布到网站</button></div>
 <p className="editor-footnote">发布会更新公开页面，无需重新部署网站。请在离开此页之前保存。</p>
 </form>{!isNew&&<DeleteControl kind="article" id={e.id} revision={record.revision} title={e.titleZh}/>}</AdminShell>;
}
