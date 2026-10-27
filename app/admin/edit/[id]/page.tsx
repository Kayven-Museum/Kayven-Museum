import {notFound} from 'next/navigation';
import {getOwner} from '@/src/server/owner';
import {getEditable} from '@/src/server/content';
import {AdminAccess,AdminUnavailable,EditorForm} from '@/src/components/Admin';
export const dynamic='force-dynamic';
export const metadata={title:'编辑作品 | What Remains Unsaid',robots:{index:false,follow:false}};
export default async function Edit({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string}>}) {
 if(!await getOwner())return <AdminAccess/>;
 const {id}=await params;let record;
 try{record=await getEditable(id);}catch(error){console.error(error);return <AdminUnavailable/>;}
 if(!record)notFound();
 const saved=(await searchParams).saved;
 const notice=saved==='published'?'已发布。访客现在可以看到最新内容。':saved==='draft'?'草稿已保存，公开页面尚未改变。':undefined;
 return <EditorForm record={record} notice={notice}/>;
}
