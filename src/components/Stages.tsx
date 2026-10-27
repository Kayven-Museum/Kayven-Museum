import type {Doc} from '@/src/server/documents';
import {LiteraryText} from './Museum';

export function StageEntry({stage:s}:{stage:Doc}){
 return <article className="stage-entry" id={s.id} lang="zh">
  <div className="stage-meta micro"><span>{s.phase||'STAGE'}</span>{s.date&&<time dateTime={s.date}>{s.date}</time>}<a href={'/stages#'+s.id} aria-label={'链接到'+s.title}>↗</a></div>
  <div className="stage-writing"><h2>{s.title}</h2>{s.goal&&<section><h3><span>01 / GOAL</span>阶段目标</h3><div className="prose"><LiteraryText text={s.goal}/></div></section>}{s.reflection&&<section><h3><span>02 / REFLECTION</span>阶段反思</h3><div className="prose"><LiteraryText text={s.reflection}/></div></section>}</div>
 </article>;
}
