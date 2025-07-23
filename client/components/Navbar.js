'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(Boolean(token));
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
      router.push('/login');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">NoteStack</Link>

        {isAuthenticated && (
          <div className="space-x-4 flex items-center">
            <button onClick={handleLogout} className="hover:underline">Logout</button>
            <Link href="/notes" className="hover:underline">Notes</Link>
            <Link href="/bookmarks" className="hover:underline">Bookmarks</Link>
            <Link href="/notes/create" className="hover:underline">Create Note</Link>
            <Link href="/bookmarks/create" className="hover:underline">Create Bookmark</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
