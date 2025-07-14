import { Router } from 'express';
import { createBookmark, deleteBookmark, getAllBookmarks, updateBookmark, searchBookmarks, markFavorite } from '../controllers/bookmark.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);
router.get('/', getAllBookmarks);
router.post('/', createBookmark);
router.put('/:bookmarkId', updateBookmark);
router.delete('/:bookmarkId', deleteBookmark);
router.get('/search', searchBookmarks);
router.post('/:bookmarkId/favorite', markFavorite);

export default router;
