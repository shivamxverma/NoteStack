import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/notes') || pathname.startsWith('/api/bookmarks') || pathname.startsWith('/api/dashboard')) {
    const authHeader = request.headers.get('Authorization');
    let token = null;

    console.log('Authorization Header:', authHeader);

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    console.log('Access Token:', token);

    if (!token) {
      console.log('No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 
      console.log('Decoded Token:', decoded);
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