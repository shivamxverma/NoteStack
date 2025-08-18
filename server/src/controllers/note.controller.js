import asyncHandler from "../utils/asyncHandler.js";
import Note from "../models/notes.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { redis } from "../config/redis.config.js";
import { performance } from "perf_hooks";

const getAllNotes = asyncHandler(async (req, res) => {
    let notes = await redis.get("notes");
    if(notes){
        return res.status(200).json(
            new ApiResponse(200,JSON.parse(notes),"Notes fetch successfully")
        );
    }
    notes = await Note.find({ user: req.user._id }).populate("user", "username fullName email");
    if (!notes || notes.length === 0) {
        throw new ApiError(404, "No notes found for this user");
    }
    await redis.set("notes", JSON.stringify(notes), "EX", 60);
    return res.status(200).json(
        new ApiResponse(200,notes, "Notes fetched successfully")
    );
});

const getNoteById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const note = await Note.findOne({ _id: id, user: req.user._id }).populate("user", "username fullName email");

    if (!note) {
        throw new ApiError(404, "Note not found or you do not have permission to access it");
    }

    return res.status(200).json(
        new ApiResponse(200, note, "Note fetched successfully")
    );
});

const createNote = asyncHandler(async (req, res) => {
    const { title, content ,tags } = req.body;
    
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

    if(!note){
        throw new ApiError(500, "Failed to create note");
    }

    // Invalidate notes cache after creating a new note
    await redis.del("notes");

    return res.status(200).json(
        new ApiResponse(200,note, "Note created successfully")
    );
});


const updateNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { title, content, tags } = req.body;

    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    const note = await Note.findOneAndUpdate(
        { _id: noteId, user: req.user._id },
        { title, content, tags },
        { new: true, runValidators: true }
    );
        
    redis.del("notes");

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

    redis.del("notes"); // Clear the notes cache after deletion

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

    if (note.favorite) {
        note.favorite = false;
        await note.save();
        return res.status(200).json(
            new ApiResponse(200, note, "Note removed from favorites")
        );
    }

    note.favorite = true;
    await note.save();

    return res.status(200).json(
        new ApiResponse(200, noteId, "Note marked as favorite successfully")
    );
})


export { getAllNotes, createNote ,updateNote ,deleteNote ,searchNote ,markFavorite ,getNoteById };
