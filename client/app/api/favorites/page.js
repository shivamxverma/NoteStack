'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [filterTag, setFilterTag] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/notes/favorites');
        setFavorites(response.data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };
    fetchFavorites();
  }, []);

  const handleUnfavorite = (id, type) => {
    const key = type === 'note' ? 'notes' : 'bookmarks';
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, favorite: false } : item
    );
    localStorage.setItem(key, JSON.stringify(updatedItems));
    setFavorites(favorites.filter(item => item.id !== id));
  };

  const filteredFavorites = filterTag
    ? favorites.filter(item => item.tags && item.tags.includes(filterTag))
    : favorites;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Favorites</h1>
      <input
        type="text"
        placeholder="Filter by tag"
        value={filterTag}
        onChange={(e) => setFilterTag(e.target.value.trim())}
        className="w-full p-2 mb-4 border rounded"
      />
      {filteredFavorites.length === 0 ? (
        <p className="text-gray-500">No favorite items found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredFavorites.map(item => (
            <li key={item.id} className="border p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    {item.type === 'note' ? (
                      <Link href={`/notes/${item.id}`} className="text-blue-500 hover:underline">
                        {item.title}
                      </Link>
                    ) : (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {item.title}
                      </a>
                    )}
                  </h2>
                  <p className="text-gray-600">
                    {item.type === 'note' ? item.content.substring(0, 100) + '...' : item.url}
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <p className="text-sm text-gray-500">Tags: {item.tags.join(', ')}</p>
                  )}
                </div>
                <button
                  onClick={() => handleUnfavorite(item.id, item.type)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Unfavorite
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => router.push('/')}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Back to Home
      </button>
    </div>
  );
}