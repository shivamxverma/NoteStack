'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api'
import { z } from 'zod';

const bookmarkSchema = z.object({
  title: z
    .string()
    .min(3, 'Title is required')
    .max(100, 'Title must be at most 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Only letters, numbers, spaces, hyphens, or underscores')
    .transform(v => v.trim()),
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
    .transform(v => v?.split(',').map(t => t.trim()).filter(t => t.length > 0) || [])
    .refine(
      t => t.every(tag => tag.length <= 30 && /^[a-zA-Z0-9\-]+$/.test(tag)),
      'Each tag must be 1-30 chars, letters, numbers, or hyphens',
    ),
  favorite: z.boolean().optional(),
});

export default function CreateBookmark() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [errors, setErrors] = useState({ title: '', url: '', tags: '', form: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || isSubmitting) return;

    setIsSubmitting(true);
    setErrors({ title: '', url: '', tags: '', form: '' });

    try {
      const payload = bookmarkSchema.parse({ title, url, tags, favorite });
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        setIsSubmitting(false);
        return;
      }

      await api.post(`/bookmarks/`,payload);
      setTimeout(()=>{
        router.push('/bookmarks');
      }, 1000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrs = { title: '', url: '', tags: '', form: '' };
        err.errors.forEach(e => {
          const field = e.path[0];
          newErrs[field] = e.message;
        });
        setErrors(newErrs);
      } else if (err?.response?.status === 401) {
        localStorage.removeItem('accessToken');
        setErrors({ title: '', url: '', tags: '', form: 'Session expired. Please log in again.' });
        router.push('/login');
      } else {
        setErrors({
          title: '',
          url: '',
          tags: '',
          form: err?.response?.data?.message || 'Failed to create bookmark. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Bookmark</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={`w-full p-2 border rounded ${errors.title ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <input
            type="url"
            placeholder="URL"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className={`w-full p-2 border rounded ${errors.url ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={e => setTags(e.target.value)}
            className={`w-full p-2 border rounded ${errors.tags ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
        </div>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={favorite}
            onChange={e => setFavorite(e.target.checked)}
            disabled={isSubmitting}
          />
          <span>Mark as favorite</span>
        </label>

        {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Saving…' : 'Save Bookmark'}
        </button>
      </form>
    </div>
  );
}
