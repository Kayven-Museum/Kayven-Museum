import {SiteShell} from '@/src/components/Museum';
import {StageEntry} from '@/src/components/Stages';
import {publicDocs} from '@/src/server/documents';
export const dynamic='force-dynamic';
export const metadata={title:'Stages · What Remains Unsaid',description:'阶段目标与反思 / Goals and reflections by Kayven.'};
export default async function Stages(){
 let stages;
 try{stages=await publicDocs('stage');}catch(error){console.error(error);return <SiteShell><section className="page-intro"><h1>Stages.</h1><p>阶段记录暂时无法读取，请稍后刷新。</p></section></SiteShell>;}
 return <SiteShell><header className="page-intro"><p className="micro">AN ONGOING PRACTICE / GOALS & REFLECTIONS</p><h1>A work<br/><em>in progress.</em></h1><span className="intro-zh" lang="zh">阶段记录</span><p>写下想抵达的地方，也记录走过之后的回望。</p></header><section className="stage-ledger" aria-label="阶段目标与反思">{stages.length?stages.map(s=><StageEntry key={s.id} stage={s}/>):<div className="stage-empty"><span className="micro">THE NEXT PAGE IS STILL OPEN</span><p>新的阶段，正在酝酿。</p><small>阶段目标与反思将在这里陆续展出。</small></div>}</section></SiteShell>;
}
