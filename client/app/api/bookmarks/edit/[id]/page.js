'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://notestack-o6b5.onrender.com';

export default function EditBookmark() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchBookmark = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          alert('Please log in to edit bookmarks.');
          router.push('/login');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/v1/bookmarks/${id}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const bookmark = response.data;
        setTitle(bookmark.title || '');
        setUrl(bookmark.url || '');
        setTags(bookmark.tags ? bookmark.tags.join(', ') : ''); // Assuming tags is an array
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching bookmark:', error);
        alert('Failed to load bookmark. It may not exist.');
        router.push('/bookmarks');
      }
    };

    if (id) fetchBookmark();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Please log in to edit bookmarks.');
        router.push('/login');
        setIsSubmitting(false);
        return;
      }

      // Basic URL validation
      try {
        new URL(url);
      } catch {
        alert('Please enter a valid URL.');
        setIsSubmitting(false);
        return;
      }

      // Convert tags to array
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      await axios.put(
        `${API_BASE_URL}/api/v1/bookmarks/${id}`,
        { title, url, tags: tagsArray },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      router.push('/bookmarks');
    } catch (error) {
      console.error('Error updating bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Edit Bookmark</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="url"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full p-2 text-white rounded ${
            isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isSubmitting ? 'Updating...' : 'Update Bookmark'}
        </button>
      </form>
    </div>
  );
}