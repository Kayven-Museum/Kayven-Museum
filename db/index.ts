import {createClient,type InValue} from '@libsql/client';

let client: ReturnType<typeof createClient> | undefined;
function database(){
  if(!client){
    const url=process.env.TURSO_DATABASE_URL;
    const authToken=process.env.TURSO_AUTH_TOKEN;
    if(!url||!authToken)throw new Error('Database not configured: set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.');
    client=createClient({url,authToken});
  }
  return client;
}
class Statement {
  constructor(private sql:string,private args:unknown[]=[]){}
  bind(...args:unknown[]){return new Statement(this.sql,args);}
  private async execute(){
    return database().execute({sql:this.sql,args:this.args as InValue[]});
  }
  async all<T=Record<string,unknown>>(){
    const result=await this.execute();
    return {results:result.rows.map(row=>({...row}) as T)};
  }
  async first<T=Record<string,unknown>>(){
    const result=await this.all<T>();
    return result.results[0]??null;
  }
  async run(){
    const result=await this.execute();
    return {meta:{changes:result.rowsAffected}};
  }
}
export function getDatabase(){
  return {prepare(sql:string){return new Statement(sql);}};
}
