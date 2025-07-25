'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import api from '../lib/api';

const querySchema = z.object({
  search: z
    .string()
    .nullable()
    .optional()
    .transform(val => val?.trim() || ''),
  tags: z
    .string()
    .nullable()
    .optional()
    .transform(val => val?.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) || []),
  favorite: z
    .string()
    .nullable()
    .optional()
    .transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
});

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function BookmarksDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState('');
  const [favorite, setFavorite] = useState(undefined);
  const [errors, setErrors] = useState({ form: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const validated = querySchema.parse({
        search: searchParams.get('search'),
        tags: searchParams.get('tags'),
        favorite: searchParams.get('favorite'),
      });
      setSearch(validated.search);
      setTags(validated.tags.join(','));
      setFavorite(validated.favorite);
      setErrors({ form: '' });
    } catch (error) {
      console.error('Invalid query parameters:', error);
      setErrors({ form: 'Invalid query parameters in URL. Using default filters.' });
      setSearch('');
      setTags('');
      setFavorite(undefined);
    }
  }, [searchParams, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchBookmarks = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          router.push('/login');
          return;
        }

        const response = await api.get('/bookmarks');

        setBookmarks(Array.isArray(response.data.message) ? response.data.message : []);
        setErrors({ form: '' });
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        setErrors({ form: 'Failed to fetch bookmarks. Please try again.' });
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          router.push('/login');
        }
      }
    };

    fetchBookmarks();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const currentParams = new URLSearchParams();
    if (search) currentParams.set('search', search);
    if (tags) currentParams.set('tags', tags);
    if (favorite !== undefined) currentParams.set('favorite', favorite.toString());
    router.replace(`?${currentParams.toString()}`, { scroll: false });
  }, [search, tags, favorite, router, isAuthenticated]);

  const toggleFavorite = async (id) => {
    if (!isAuthenticated) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      await api.post(`/bookmarks/${id}/favorite`);
      const updatedBookmarks = bookmarks.map(bookmark =>
        bookmark._id === id ? { ...bookmark, favorite: !bookmark.favorite } : bookmark
      );
      setBookmarks(updatedBookmarks);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/login');
      } else {
        alert('Failed to toggle favorite. Please try again.');
      }
    }
  };

  const deleteBookmark = async (id) => {
    if (!isAuthenticated) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      await api.delete(`/bookmarks/${id}`);
      setBookmarks(bookmarks.filter(bookmark => bookmark._id !== id));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/login');
      } else {
        alert('Failed to delete bookmark. Please try again.');
      }
    }
  };

  const filteredBookmarks = bookmarks
    .filter(bookmark => bookmark._id)
    .filter(bookmark => {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      return (
        (search
          ? bookmark.title?.toLowerCase().includes(search.toLowerCase()) ||
            bookmark.url?.toLowerCase().includes(search.toLowerCase())
          : true) &&
        (tagArray.length > 0
          ? bookmark.tags?.some(bookmarkTag => tagArray.includes(bookmarkTag))
          : true) &&
        (favorite !== undefined ? bookmark.favorite === favorite : true)
      );
    });

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; 
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bookmarks Dashboard</h1>
      <div className="mb-4 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Search bookmarks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <select
          value={favorite === undefined ? '' : favorite.toString()}
          onChange={(e) => setFavorite(e.target.value === '' ? undefined : e.target.value === 'true')}
          className="w-full p-2 border rounded"
        >
          <option value="">All Bookmarks</option>
          <option value="true">Favorites Only</option>
          <option value="false">Non-Favorites Only</option>
        </select>
      </div>
      {errors.form && <p className="text-red-500 text-sm mb-4">{errors.form}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBookmarks.length === 0 ? (
          <p>No bookmarks found.</p>
        ) : (
          filteredBookmarks.map(bookmark => (
            <div key={bookmark._id} className="bg-white p-8 rounded shadow flex flex-col h-full">
              <div className="flex-1">
                <h2 className="text-xl font-semibold break-words">{bookmark.title}</h2>
                {isValidUrl(bookmark.url) ? (
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all block w-full"
                    style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
                  >
                    {bookmark.url}
                  </a>
                ) : (
                  <p className="text-red-500 break-all">Invalid URL: {bookmark.url}</p>
                )}
                <div>
                  {Array.isArray(bookmark.tags) && bookmark.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-sm text-gray-500 w-full block">Tags: </span>
                      {bookmark.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mb-1"
                          style={{ wordBreak: 'keep-all', whiteSpace: 'nowrap' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button onClick={() => toggleFavorite(bookmark._id)} className="text-yellow-500">
                  {bookmark.favorite ? '★' : '☆'}
                </button>
                <Link href={`/bookmarks/edit/${bookmark._id}`} className="text-blue-500">
                  Edit
                </Link>
                <button onClick={() => deleteBookmark(bookmark._id)} className="text-red-500 cursor-pointer">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}