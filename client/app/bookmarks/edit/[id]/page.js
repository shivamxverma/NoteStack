'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
// import axios from 'axios';
import api from '../../../lib/api.js'
import { z } from 'zod';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const bookmarkSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title must be at most 100 characters long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Title can only contain letters, numbers, spaces, hyphens, or underscores')
    .transform(val => val.trim()),
  url: z
    .string()
    .url('Please enter a valid URL')
    .refine(
      url => {
        try {
          const parsedUrl = new URL(url);
          return ['http:', 'https:'].includes(parsedUrl.protocol);
        } catch {
          return false;
        }
      },
      'URL must use http or https protocol'
    )
    .transform(val => val.trim()),
  tags: z
    .string()
    .optional()
    .transform(val => val?.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) || [])
    .refine(
      tags => tags.every(tag => tag.length <= 30 && /^[a-zA-Z0-9\-]+$/.test(tag)),
      'Each tag must be 1-30 characters and contain only letters, numbers, or hyphens'
    ),
});

export default function EditBookmark() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState({ title: '', url: '', tags: '', form: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchBookmark = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      try {
        // const response = await axios.get(`${API_BASE_URL}/api/v1/bookmarks/${id}`, {
        //   withCredentials: true,
        //   headers: {
        //     Authorization: `Bearer ${accessToken}`,
        //   },
        // });

        const response = await api.get(`/bookmarks/${id}`);

        const bookmark = response.data.message;
        setTitle(bookmark.title || '');
        setUrl(bookmark.url || '');
        setTags(bookmark.tags ? bookmark.tags.join(', ') : '');
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching bookmark:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          setErrors({ title: '', url: '', tags: '', form: 'Session expired. Please log in again.' });
          router.push('/login');
        } else {
          setErrors({ title: '', url: '', tags: '', form: 'Failed to load bookmark. It may not exist.' });
          router.push('/bookmarks');
        }
      }
    };

    if (id) fetchBookmark();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrors({ title: '', url: '', tags: '', form: '' });

    try {
      const validatedData = bookmarkSchema.parse({ title, url, tags });

      const updatedBookmark = {
        title: validatedData.title,
        url: validatedData.url,
        tags: validatedData.tags,
      };

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        setIsSubmitting(false);
        return;
      }

      // await axios.put(
      //   `${API_BASE_URL}/api/v1/bookmarks/${id}`,
      //   updatedBookmark,
      //   {
      //     withCredentials: true,
      //     headers: { Authorization: `Bearer ${accessToken}` },
      //   }
      // );
      await api.put(`/bookmarks/${id}`,updatedBookmark);

      router.push('/bookmarks');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = { title: '', url: '', tags: '', form: '' };
        error.errors.forEach(err => {
          const field = err.path[0];
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error('Error updating bookmark:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          setErrors({ title: '', url: '', tags: '', form: 'Session expired. Please log in again.' });
          router.push('/login');
        } else {
          setErrors({
            title: '',
            url: '',
            tags: '',
            form: error.response?.data?.message || 'Failed to update bookmark. Please try again.',
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Prevent rendering during redirect
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Bookmark</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>
        <div className="mb-4">
          <input
            type="url"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.url ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.tags ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
        </div>
        {errors.form && <p className="text-red-500 text-sm mb-4">{errors.form}</p>}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className={`w-full p-2 text-white rounded ${
            isSubmitting || isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isSubmitting ? 'Updating...' : 'Update Bookmark'}
        </button>
      </form>
    </div>
  );
}