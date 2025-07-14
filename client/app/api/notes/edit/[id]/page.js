'use client';
import { useState, useEffect ,use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

export default async function EditNote({params}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { slug } = await params

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/v1/notes/${id}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        
        const note = response.data.data; // Adjust based on your API response structure
        if (note) {
          setTitle(note.title || '');
          setContent(note.content || '');
          setTags(note.tags ? note.tags.join(', ') : '');
        }
      } catch (error) {
        console.error('Error fetching note:', error);
        setError('Failed to load note');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNote();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required');
      return;
    }

    const updatedNote = {
      title: title.trim(),
      content: content.trim(),
      tags: tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0),
    };

    try {
      setLoading(true);
      await axios.put(`http://localhost:8000/api/v1/notes/${id}`, updatedNote, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      // Update localStorage only if necessary (consider removing if API is source of truth)
      const notes = JSON.parse(localStorage.getItem('notes') || '[]');
      const updatedNotes = notes.map(note =>
        note.id === id ? { ...note, ...updatedNote } : note
      );
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
      
      router.push('/notes');
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Edit Note</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Updating...' : 'Update Note'}
        </button>
      </form>
    </div>
  );
}