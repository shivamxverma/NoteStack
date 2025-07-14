import asyncHandler from "../utils/asyncHandler";
import Note from "../models/note.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find({ user: req.user._id }).populate("user", "username fullName email");
    return new ApiResponse(200, "Notes fetched successfully", notes).send(res);
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

    return new ApiResponse(201, "Note created successfully", note).send(res);
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

    if (!note) {
        throw new ApiError(404, "Note not found or you do not have permission to update it");
    }

    return new ApiResponse(200, "Note updated successfully", note).send(res);
})


const deleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    const note = await Note.findOneAndDelete({ _id: noteId, user: req.user._id });
    if (!note) {
        throw new ApiError(404, "Note not found or you do not have permission to delete it");
    }

    return new ApiResponse(200, "Note deleted successfully").send(res);
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

    return new ApiResponse(200, "Notes retrieved successfully", notes).send(res);
});



export { getAllNotes, createNote ,updateNote ,deleteNote ,searchNote };
