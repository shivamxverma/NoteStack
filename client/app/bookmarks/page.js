import { Suspense } from 'react';
import BookmarksDashboard from './BookmarksDashboard';

export default function BookmarksPage() {
  return (
    <Suspense fallback={<div>Loading bookmarks...</div>}>
      <BookmarksDashboard />
    </Suspense>
  );
}
