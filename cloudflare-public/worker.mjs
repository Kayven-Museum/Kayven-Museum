const SOURCE = 'https://what-remains-unsaid.prime-oak-8928.chatgpt.site';
const privatePath = path => /^\/(admin|api|signin-with-chatgpt|signout-with-chatgpt)(\/|$)/.test(path);
const publicPath = path => path === '/' || /^\/(index|museum|exhibit|archive|stages|comments|about|_next|portfolio|media)(\/|$)/.test(path) || /^\/(favicon\.svg|og\.png|robots\.txt|sitemap\.xml)$/.test(path);
export default {
 async fetch(request) {
  const url = new URL(request.url);
  let path;
  try { path = decodeURIComponent(url.pathname); } catch { return new Response('Invalid path', {status:400}); }
  const target = new URL(SOURCE);
  target.pathname = url.pathname;
  target.search = url.search;
  // Editing and identity stay on their original, trusted origin. No cookies,
  // authorization headers or platform identity assertions are proxied.
  if(privatePath(path)) return Response.redirect(target.href, 303);
  if(!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
  if(!publicPath(path)) return new Response('Not found',{status:404});
  const headers = new Headers();
  for(const key of ['accept','accept-language','range','if-range']) {
   const value = request.headers.get(key); if(value) headers.set(key,value);
  }
  headers.set('User-Agent','Kayven-Museum-Public-Website/1.0');
  let upstream;
  try { upstream = await fetch(target.href,{method:request.method,headers,redirect:'manual'}); }
  catch { return new Response('The museum is temporarily unavailable. Please refresh in a moment.',{status:502,headers:{'content-type':'text/plain;charset=utf-8','cache-control':'no-store'}}); }
  const response = new Response(upstream.body,upstream);
  response.headers.delete('set-cookie');
  response.headers.delete('server');
  response.headers.delete('x-powered-by');
  response.headers.set('cache-control','no-store');
  const location = response.headers.get('location');
  if(location){
   const destination = new URL(location,target);
   if(destination.origin===SOURCE&&!privatePath(destination.pathname)) response.headers.set('location',url.origin+destination.pathname+destination.search+destination.hash);
  }
  if(request.method==='HEAD'||!response.headers.get('content-type')?.includes('text/html')) return response;
  // Rewrite absolute public URLs only; native relative links remain on this host.
  return new HTMLRewriter().on('form[action="/api/comments"]',{element(element){element.setAttribute('action',SOURCE+'/api/comments');}}).on('[href], [src], meta[content]',{
   element(element){
    for(const attr of ['href','src','content']){
     const value=element.getAttribute(attr);
     if(!value?.startsWith(SOURCE))continue;
     try{const link=new URL(value);if(link.origin===SOURCE&&!privatePath(link.pathname))element.setAttribute(attr,url.origin+link.pathname+link.search+link.hash);}catch{}
    }
   }
  }).transform(response);
 }
};
