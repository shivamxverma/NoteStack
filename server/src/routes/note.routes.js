import {Router} from 'express';
import { createNote, deleteNote, getAllNotes, updateNote ,getNoteById, searchNote,markFavorite } from '../controllers/note.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Public Routes
router.route("/").get(verifyJWT, getAllNotes);
router.route("/:id").get(verifyJWT, getNoteById);

// Secured Routes
router.route("/").post(verifyJWT, createNote);
router.route("/:noteId").put(verifyJWT, updateNote).delete(verifyJWT, deleteNote);
router.route("/search").get(verifyJWT, searchNote);

router.route("/:noteId/favorite").post(verifyJWT, markFavorite);

export default router;