export function GET(){return new Response(null,{status:303,headers:{Location:'/admin','Cache-Control':'no-store'}});}
export function POST(){return new Response(null,{status:303,headers:{Location:'/admin','Cache-Control':'no-store'}});}
