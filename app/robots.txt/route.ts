export function GET(){return new Response(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /signin-with-chatgpt
Disallow: /signout-with-chatgpt

Sitemap: https://what-remains-unsaid.prime-oak-8928.chatgpt.site/sitemap.xml
`,{headers:{'content-type':'text/plain; charset=utf-8','cache-control':'public, max-age=3600'}});}
