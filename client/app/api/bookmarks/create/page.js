'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { z } from 'zod';

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

export default function CreateBookmark() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState({ title: '', url: '', tags: '', form: '' });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ title: '', url: '', tags: '', form: '' });

    try {
      // Validate form data with Zod
      const validatedData = bookmarkSchema.parse({ title, url, tags });

      const newBookmark = {
        title: validatedData.title,
        url: validatedData.url,
        tags: validatedData.tags,
      };

      const response = await axios.post('http://localhost:8000/api/v1/bookmarks', newBookmark, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      console.log('Bookmark created:', response.data);
      router.push('/api/bookmarks');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = { title: '', url: '', tags: '', form: '' };
        error.errors.forEach(err => {
          const field = err.path[0];
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error('Error creating bookmark:', error);
        setErrors(prev => ({ ...prev, form: 'Failed to create bookmark. Please try again.' }));
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Bookmark</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full p-2 border rounded ${errors.title ? 'border-red-500' : ''}`}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>
        <div className="mb-4">
          <input
            type="url"
            placeholder="URL (http:// or https://)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={`w-full p-2 border rounded ${errors.url ? 'border-red-500' : ''}`}
          />
          {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className={`w-full p-2 border rounded ${errors.tags ? 'border-red-500' : ''}`}
          />
          {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
        </div>
        {errors.form && <p className="text-red-500 text-sm mb-4">{errors.form}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Save Bookmark
        </button>
      </form>
    </div>
  );
}