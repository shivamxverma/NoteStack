import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/notes') || pathname.startsWith('/bookmarks') || pathname.startsWith('/dashboard')) {
    console.log(request);
    const token = request.cookies.get('accessToken')?.value;

    console.log('Checking token:', token);

    if (!token) {
      console.log('No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 
      // console.log('Decoded Token:', decoded);
      return NextResponse.next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/notes/:path*', '/bookmarks/:path*', '/dashboard/:path*'],
};