'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function NotesDashboard() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if(!accessToken){
        router.push('/login');
        return;
      }
      try {
        const response = await axios.get('https://notestack-o6b5.onrender.com/api/v1/notes', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log(response.data.message)
        setNotes(Array.isArray(response.data.message) ? response.data.message : []);
      } catch (err) {
        setError(err.message || 'Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredNotes = notes.filter(
    (note) =>
      note.title?.toLowerCase().includes(search.toLowerCase()) ||
      note.content?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFavorite = async (id) => {
    try {
      await axios.post(
        `https://notestack-o6b5.onrender.com/api/v1/notes/${id}/favorite`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === id ? { ...note, favorite: !note.favorite } : note
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`https://notestack-o6b5.onrender.com/api/v1/notes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notes Dashboard</h1>
      <input
        type="text"
        placeholder="Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <div key={note._id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{note.title || 'Untitled'}</h2>
            <p className="text-gray-600">
              {note.content ? note.content.substring(0, 100) + '...' : 'No content'}
            </p>
            <div className="flex justify-between mt-2">
              <button
                onClick={() => toggleFavorite(note._id)}
                className="text-yellow-500"
                aria-label={note.favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {note.favorite ? '★' : '☆'}
              </button>
              <Link href={`/api/notes/edit/${note._id}`} className="text-blue-500">
                Edit
              </Link>
              <button
                onClick={() => deleteNote(note._id)}
                className="text-red-500"
                aria-label="Delete note"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}