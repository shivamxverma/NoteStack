'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function BookmarksDashboard() {
  const [bookmarks, setBookmarks] = useState([]);
  const [search, setSearch] = useState('');

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
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      }
    };
    fetchBookmarks();
  }, []);

  useEffect(() => {
    console.log('Bookmarks:', bookmarks);
  }, [bookmarks]);

  const filteredBookmarks = bookmarks
    .filter(bookmark => bookmark._id) // Ensure bookmark has _id
    .filter(bookmark =>
      bookmark.title?.toLowerCase().includes(search.toLowerCase()) ||
      bookmark.url?.toLowerCase().includes(search.toLowerCase())
    );

  const toggleFavorite = async (id) => {
    try {
      const response = await axios.put(
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
    <div>
      <h1 className="text-2xl font-bold mb-4">Bookmarks Dashboard</h1>
      <input
        type="text"
        placeholder="Search bookmarks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBookmarks.length === 0 ? (
          <p>No bookmarks found.</p>
        ) : (
          filteredBookmarks.map(bookmark => (
            <div key={bookmark._id} className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{bookmark.title}</h2>
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                {bookmark.url}
              </a>
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