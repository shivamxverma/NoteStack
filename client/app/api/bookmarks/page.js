'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { z } from 'zod';

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

  useEffect(() => {
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
  }, [searchParams]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/bookmarks', {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        console.log('API Response:', response.data.message);
        setBookmarks(Array.isArray(response.data.message) ? response.data.message : []);
        setErrors({ form: '' });
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        setErrors({ form: 'Failed to fetch bookmarks. Please try again.' });
      }
    };
    fetchBookmarks();
  }, []);

  // Log bookmarks when they change
  useEffect(() => {
    console.log('Bookmarks:', bookmarks);
  }, [bookmarks]);


  useEffect(() => {
    const currentParams = new URLSearchParams();
    if (search) currentParams.set('search', search);
    if (tags) currentParams.set('tags', tags);
    if (favorite !== undefined) currentParams.set('favorite', favorite.toString());
    router.replace(`?${currentParams.toString()}`, { scroll: false });
  }, [search, tags, favorite, router]);

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

  const toggleFavorite = async (id) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/bookmarks/${id}/favorite`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      const updatedBookmarks = bookmarks.map(bookmark =>
        bookmark._id === id ? { ...bookmark, favorite: !bookmark.favorite } : bookmark
      );
      setBookmarks(updatedBookmarks);
      console.log('Bookmark favorite toggled:', response.data);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to toggle favorite. Please try again.');
    }
  };

  const deleteBookmark = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/bookmarks/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setBookmarks(bookmarks.filter(bookmark => bookmark._id !== id));
      console.log('Bookmark deleted:', id);
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      alert('Failed to delete bookmark. Please try again.');
    }
  };

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
        <select cag
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
            <div key={bookmark._id} className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{bookmark.title}</h2>
              {isValidUrl(bookmark.url) ? (
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {bookmark.url}
                </a>
              ) : (
                <p className="text-red-500">Invalid URL: {bookmark.url}</p>
              )}
              {bookmark.tags?.length > 0 && (
                <p className="text-gray-500 text-sm mt-1">
                  Tags: {bookmark.tags.join(', ')}
                </p>
              )}
              <div className="flex justify-between mt-2">
                <button onClick={() => toggleFavorite(bookmark._id)} className="text-yellow-500">
                  {bookmark.favorite ? '★' : '☆'}
                </button>
                <Link href={`/api/bookmarks/edit/${bookmark._id}`} className="text-blue-500">
                  Edit
                </Link>
                <button onClick={() => deleteBookmark(bookmark._id)} className="text-red-500">
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