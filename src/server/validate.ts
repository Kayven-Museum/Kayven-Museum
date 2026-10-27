import {validateImageFields} from './images';
import {destinations} from './documents';
import type { Exhibit } from '@/src/data/exhibits';
export const collections = [
  {id:'traces',label:'痕迹展馆 · LOVE',prefix:'L',museum:'traces',room:null,offset:0},
  {id:'evidence',label:'证据展馆 · BODY',prefix:'E',museum:'evidence',room:null,offset:10000},
  {id:'relics',label:'遗物展馆 · RELICS',prefix:'R',museum:'remains',room:'relics',offset:20000},
  {id:'body-afterward',label:'遗物展馆 · 身体之后',prefix:'D',museum:'remains',room:'body-afterward',offset:30000},
] as const;
export async function validateExhibit(form: FormData, previous?: Exhibit): Promise<Exhibit> {
  function value(name:string,max:number,required=false) {
    const raw=form.get(name);
    if(typeof raw!=='string')throw new Error(`缺少字段：${name}`);
    const v=raw.replace(/\r\n/g,'\n').trim();
    if(v.length>max || (required&&!v))throw new Error(`请检查 ${name}：${required?'不能为空，且':''}最多 ${max} 个字符。`);
    return v;
  }
  const code=value('code',13,true).toUpperCase();
  if(!/^[A-Z]{1,8}-\d{2,4}$/.test(code))throw new Error('编号格式应为 L-06、E-05、R-06 或 D-12。');
  const destination=value('destination',140,true); if(!(await destinations()).some(p=>p.value===destination))throw new Error('请选择已发布的 Museum 或展馆。'); const [museum,room]=destination.split('/');
  if(previous && code!==previous.code)throw new Error('已有展品的编号不能更改，以保留原来的链接。');
  const id=code.toLowerCase();
  const fullText=value('fullText',100000);
  const status=value('status',20);
  if(!['published','coming-soon'].includes(status))throw new Error('请选择展出状态。');
  if(status==='published'&&!fullText)throw new Error('选择“正文已就绪”时，请填写正文；尚未完成可选“即将展出”。');
  const titleEn=value('titleEn',160,true);
  return {...previous,...await validateImageFields(k=>form.get(k),previous),id,code,museum,room:room||null,titleZh:value('titleZh',100,true),titleEn,object:titleEn,keywords:value('keywords',500).split('/').map(k=>k.trim()).filter(Boolean),curatorialNote:value('curatorialNote',20000),excerpt:previous?.excerpt??'',fullText,status:status as Exhibit['status'],order:previous?.order??Number(code.split('-')[1]),legacySlug:previous?.legacySlug??id};
}
