import React, { useState, useEffect } from 'react';

function BookmarkForm({ initialData, onSubmit, onCancel }) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [url, setUrl] = useState(initialData?.url || '');
    const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');

    const handleSubmitLocal = (e) => {
        e.preventDefault();
        const bookmarkData = {
            title,
            url,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        };
        onSubmit(bookmarkData);
        setTitle('');
        setUrl('');
        setTags('');
    };

    return (
        <div className="mb-6 p-4 border rounded">
            <h2 className="text-xl font-semibold mb-2">{initialData ? 'Edit Bookmark' : 'Create Bookmark'}</h2>
            <div className="space-y-2">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
                <input
                    type="url"
                    placeholder="URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
                <input
                    type="text"
                    placeholder="Tags (comma-separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full p-2 border rounded"
                />
                <div className="flex space-x-2">
                    <button
                        onClick={handleSubmitLocal}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        {initialData ? 'Update' : 'Create'}
                    </button>
                    {initialData && (
                        <button
                            onClick={onCancel}
                            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BookmarkForm;