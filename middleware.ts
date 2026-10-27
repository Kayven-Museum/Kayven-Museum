import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store');
  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
    response.headers.set('X-Robots-Tag','noindex, nofollow');
    response.headers.set('X-Frame-Options','DENY');
    response.headers.set('Content-Security-Policy',"frame-ancestors 'none'");
  }
  return response;
}
export const config = { matcher: ['/admin/:path*','/api/admin/:path*','/media/:path*','/comments','/api/comments','/stages','/index','/archive','/museum/:path*','/exhibit/:path*','/'] };
