// Vercel adapter for an existing Cloudflare D1 database via Cloudflare's HTTPS API.
// Credentials are server-only environment variables.
type QueryResult<T> = {results:T[];success:boolean;meta?:{changes?:number}};
const required=(name:string)=>{const v=process.env[name];if(!v)throw Error('Missing server setting: '+name);return v;};
class Statement {
  constructor(private sql:string,private args:unknown[]=[]){}
  bind(...args:unknown[]){return new Statement(this.sql,args);}
  private async execute<T>():Promise<QueryResult<T>>{
    const account=required('CF_ACCOUNT_ID'),database=required('CF_D1_DATABASE_ID'),token=required('CF_API_TOKEN');
    const response=await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/d1/database/${encodeURIComponent(database)}/query`,{
      method:'POST',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},
      body:JSON.stringify({sql:this.sql,params:this.args}),cache:'no-store'
    });
    const payload=await response.json() as {success:boolean;errors?:Array<{message:string}>;result?:QueryResult<T>[]};
    if(!response.ok||!payload.success||!payload.result?.[0]?.success)
      throw Error('D1 request failed: '+(payload.errors?.map(e=>e.message).join('; ')||response.status));
    return payload.result[0];
  }
  async all<T=Record<string,unknown>>(){const r=await this.execute<T>();return {results:r.results};}
  async first<T=Record<string,unknown>>(){const r=await this.execute<T>();return r.results[0]??null;}
  async run(){const r=await this.execute();return {meta:{changes:r.meta?.changes??0}};}
}
export function getDatabase(){return {prepare(sql:string){return new Statement(sql);}};}
