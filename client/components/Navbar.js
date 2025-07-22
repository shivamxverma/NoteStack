'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(Boolean(token));
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">NoteStack</Link>

        {isAuthenticated && (
          <div className="space-x-4 flex items-center">
            <button onClick={handleLogout} className="hover:underline">Logout</button>
            <Link href="/api/notes" className="hover:underline">Notes</Link>
            <Link href="/api/bookmarks" className="hover:underline">Bookmarks</Link>
            <Link href="/api/notes/create" className="hover:underline">Create Note</Link>
            <Link href="/api/bookmarks/create" className="hover:underline">Create Bookmark</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
