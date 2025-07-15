import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/notes') || pathname.startsWith('/api/bookmarks') || pathname.startsWith('/api/dashboard')) {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODc1ZGZlOTg4YjdjMzQ5MTljNzE4NWYiLCJ1c2VybmFtZSI6InNoaXZhbXRoZWdyZWF0IiwiZW1haWwiOiJhZG1pbkBhZG1pbi5jb20iLCJmdWxsTmFtZSI6IlNoaXZhbSBLdW1hciIsImlhdCI6MTc1MjU1NzIwNSwiZXhwIjoxNzUyNjQzNjA1fQ.qfJntlVc6Dx2BB7me3qrLRPqLIcc1FEK392SbpfI6P0";
    console.log(request.cookies);

    console.log('Access Token:', token);

    if (!token) {
      console.log('No accessToken found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      return NextResponse.next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/notes/:path*', '/api/bookmarks/:path*', '/api/dashboard/:path*'],
};