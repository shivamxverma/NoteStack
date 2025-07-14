import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'NoteStack',
  description: 'A simple app for managing notes and bookmarks',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">NoteStack</Link>
            <div className="space-x-4">
              <Link href="/api/notes" className="hover:underline">Notes</Link>
              <Link href="/api/bookmarks" className="hover:underline">Bookmarks</Link>
              <Link href="/api/notes/create" className="hover:underline">Create Note</Link>
              <Link href="/api/bookmarks/create" className="hover:underline">Create Bookmark</Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}