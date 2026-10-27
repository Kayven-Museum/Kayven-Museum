import {getOwner} from '@/src/server/owner';
import {getAdminCollection} from '@/src/server/content';
import {destinations} from '@/src/server/documents';
import {AdminAccess,AdminUnavailable,EditorForm} from '@/src/components/Admin';
export const dynamic='force-dynamic';
export default async function New({searchParams}:{searchParams:Promise<{destination?:string}>}){if(!await getOwner())return <AdminAccess/>;try{const records=await getAdminCollection(),places=await destinations();const next=Math.max(0,...records.filter(r=>r.exhibit.code.startsWith('N-')).map(r=>Number(r.exhibit.code.split('-')[1])))+1;const code=`N-${String(next).padStart(2,'0')}`;const requested=(await searchParams).destination;const [museum,room]=(places.find(p=>p.value===requested)??places[0]).value.split('/');return <EditorForm isNew record={{exhibit:{id:code.toLowerCase(),code,museum,room:room||null,titleZh:'',titleEn:'',object:'',keywords:[],curatorialNote:'',excerpt:'',fullText:'',status:'coming-soon',order:next,legacySlug:code.toLowerCase()},revision:0,changed:false,published:false,updatedAt:null}}/>;}catch(error){console.error(error);return <AdminUnavailable/>;}}
