import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/notes') || pathname.startsWith('/api/bookmarks') || pathname.startsWith('/api/dashboard')) {
    const token = request.cookies.get('accessToken')?.value; 

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