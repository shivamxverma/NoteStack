import asyncHandler from "../utils/asyncHandler.js";
import Note from "../models/notes.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find({ user: req.user._id }).populate("user", "username fullName email");
    return res.status(200).json(
        new ApiResponse(200,notes, "Notes fetched successfully")
    );
});

const createNote = asyncHandler(async (req, res) => {
    const { title, content ,tags } = req.body;

    console.log(req.body);

    if(!Array.isArray(tags)) {
        throw new ApiError(400, "Tags must be an array");
    }

    const isValidTags = tags.every(tag => typeof tag === 'string' && tag.length <= 50);
    if (!isValidTags) {
        throw new ApiError(400, "Each tag must be a string with a maximum length of 50 characters");
    }

    const Tags = Array.isArray(tags) ? tags : [];

    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    const note = await Note.create({
        title,
        content,
        tags: Tags,
        user: req.user,
    });

    return res.status(200).json(
        new ApiResponse(200,note, "Note created successfully")
    );
});


const updateNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    // console.log("Note ID", noteId);
    // console.log(req.body);
    const { title, content, tags } = req.body;

    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    const note = await Note.findOneAndUpdate(
        { _id: noteId, user: req.user._id },
        { title, content, tags },
        { new: true, runValidators: true }
    );

    console.log("Updated Note", note);

    console.log("User ID", req.user._id);

    if (!note) {
        throw new ApiError(404, "Note not found or you do not have permission to update it");
    }

    return res.status(200).json(
        new ApiResponse(200, {},"Note updated successfully")
    );
})


const deleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    const note = await Note.findOneAndDelete({ _id: noteId, user: req.user._id });
    if (!note) {
        throw new ApiError(404, "Note not found or you do not have permission to delete it");
    }

    return res.status(200).json(
        new ApiResponse(200,{}, "Note deleted successfully")
    );
})

const searchNote = asyncHandler(async (req, res) => {
    const { q, tags } = req.query; 
    const userId = req.user._id; 

    let searchQuery = { user: userId }; 

    if (q) {
        searchQuery.$or = [
            { title: { $regex: q, $options: 'i' } }, 
            { content: { $regex: q, $options: 'i' } },
        ];
    }

    if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        searchQuery.tags = { $in: tagArray };
    }

    const notes = await Note.find(searchQuery);

    return res.status(200).json(
        new ApiResponse(200, notes, "Notes retrieved successfully")
    );
});

const markFavorite = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    const note = await Note.findOne({ _id: noteId, user: req.user._id });
    if (!note) {
        throw new ApiError(404, "Note not found or you do not have permission to access it");
    }

    if (req.user.favorites.includes(noteId)) {
        return res.status(400).json(
            new ApiResponse(400, {}, "Note is already in favorites")
        );
    }

    req.user.favoritesNotes.push(noteId);
    await req.user.save();

    return res.status(200).json(
        new ApiResponse(200, noteId, "Note marked as favorite successfully")
    );
})


export { getAllNotes, createNote ,updateNote ,deleteNote ,searchNote ,markFavorite };
