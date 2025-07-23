'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../lib/api';
import { z } from 'zod';

const noteSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title must be at most 100 characters long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Title can only contain letters, numbers, spaces, hyphens, or underscores')
    .transform(val => val.trim()),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters long')
    .max(1000, 'Content must be at most 1000 characters long')
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

export default function EditNote() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState({ title: '', content: '', tags: '', form: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchNote = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      if (!id) {
        setErrors({ title: '', content: '', tags: '', form: 'Invalid note ID' });
        router.push('/notes');
        return;
      }

      try {
        const response = await api.get(`/notes/${id}`);

        const note = response.data.message;
        if (note) {
          setTitle(note.title);
          setContent(note.content);
          setTags(note.tags.join(','));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error fetching note:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          setErrors({ title: '', content: '', tags: '', form: 'Session expired. Please log in again.' });
          router.push('/login');
        } else {
          setErrors({ title: '', content: '', tags: '', form: 'Failed to load note. It may not exist.' });
          router.push('/notes');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        setIsSubmitting(false);
        return;
      }
      const response = await api.put(`/notes/${id}`,{title,content,tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)});
      router.push('/notes');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = { title: '', content: '', tags: '', form: '' };
        error.errors.forEach(err => {
          const field = err.path[0];
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error('Error updating note:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          setErrors({ title: '', content: '', tags: '', form: 'Session expired. Please log in again.' });
          router.push('/login');
        } else {
          setErrors({
            title: '',
            content: '',
            tags: '',
            form: error.response?.data?.message || 'Failed to update note. Please try again.',
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
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Note</h1>
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
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.content ? 'border-red-500' : ''}`}
            rows={5}
            disabled={isSubmitting}
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
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
          {isSubmitting ? 'Updating...' : 'Update Note'}
        </button>
      </form>
    </div>
  );
}