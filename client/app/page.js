import Link from 'next/link';

export default function Home() {

  return (
    <div className="text-center py-10">
      <h1 className="text-3xl font-bold mb-4">Welcome to Notes & Bookmarks</h1>
      <p className="mb-4">Manage your notes and bookmarks efficiently.</p>
      <div className="space-x-4">
        <Link href="/api/notes" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">View Notes</Link>
        <Link href="/api/bookmarks" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">View Bookmarks</Link>
      </div>
    </div>
  );
}