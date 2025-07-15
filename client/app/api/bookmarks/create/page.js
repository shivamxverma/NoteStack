'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
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

export default function CreateNote() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState({ title: '', content: '', tags: '', form: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrors({ title: '', content: '', tags: '', form: '' });

    try {
      const validatedData = noteSchema.parse({ title, content, tags });

      const newNote = {
        title: validatedData.title,
        content: validatedData.content,
        tags: validatedData.tags,
      };

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post(
        'https://notestack-o6b5.onrender.com/api/v1/notes',
        newNote,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log('Note created:', response.data);
      router.push('/notes'); // Adjust to your actual notes dashboard route
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = { title: '', content: '', tags: '', form: '' };
        error.errors.forEach(err => {
          const field = err.path[0];
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error('Error creating note:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          setErrors({ title: '', content: '', tags: '', form: 'Session expired. Please log in again.' });
          router.push('/login');
        } else {
          setErrors({
            title: '',
            content: '',
            tags: '',
            form: error.response?.data?.message || 'Failed to create note. Please try again.',
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  // Prevent rendering if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Note</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full p-2 border rounded ${errors.title ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full p-2 border rounded ${errors.content ? 'border-red-500' : ''}`}
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
            className={`w-full p-2 border rounded ${errors.tags ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
        </div>
        {errors.form && <p className="text-red-500 text-sm mb-4">{errors.form}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isLoading || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Note'}
        </button>
      </form>
    </div>
  );
}