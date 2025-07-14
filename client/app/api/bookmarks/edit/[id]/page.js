'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function EditBookmark({ params }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          alert('Please log in to edit bookmarks.');
          router.push('/login');
          return;
        }

        const response = await axios.get(`http://localhost:8000/api/v1/bookmarks/${id}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const bookmark = response.data;
        console.log('API response:', bookmark); 
        setTitle(bookmark.title || '');
        setUrl(bookmark.url || '');
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching bookmark:', error);
        alert('Failed to load bookmark. It may not exist.');
        router.push('/bookmarks');
      }
    };

    if (id) fetchBookmarks();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Please log in to edit bookmarks.');
        router.push('/login');
        return;
      }

      const response = await axios.put(
        `http://localhost:8000/api/v1/bookmarks/${id}`,
        { title, url },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status !== 200) {
        throw new Error('Failed to update bookmark');
      }
      router.push('/bookmarks');
    } catch (error) {
      console.error('Error updating bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Bookmark</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="url"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          更新书签
        </button>
      </form>
    </div>
  );
}