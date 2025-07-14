import asyncHandler from "../utils/asyncHandler";
import Bookmark from "../models/bookmark.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllBookmarks = asyncHandler(async (req, res) => {
    const bookmarks = await Bookmark.find({ user: req.user._id }).populate("user", "username fullName email");
    return new ApiResponse(200, "Bookmarks fetched successfully", bookmarks).send(res);
});

const createBookmark = asyncHandler(async (req, res) => {
    const { title, url, tags } = req.body;

    if (!title && !url) {
        throw new ApiError(400, "Title and URL are required");
    }

    if (!Array.isArray(tags)) {
        throw new ApiError(400, "Tags must be an array");
    }

    const isValidTags = tags.every(tag => typeof tag === 'string' && tag.length <= 50);
    if (!isValidTags) {
        throw new ApiError(400, "Each tag must be a string with a maximum length of 50 characters");
    }

    const bookmark = await Bookmark.create({
        title,
        url,
        tags: Array.isArray(tags) ? tags : [],
        user: req.user._id,
    });
    
    return new ApiResponse(201, "Bookmark created successfully", bookmark).send(res);
});

const updateBookmark = asyncHandler(async (req, res) => {
    const { bookmarkId } = req.params;
    const { title, url, tags } = req.body;

    if (!title || !url) {
        throw new ApiError(400, "Title and URL are required");
    }

    const bookmark = await Bookmark.findOneAndUpdate(
        { _id: bookmarkId, user: req.user._id },
        { title, url, tags },
        { new: true, runValidators: true }
    );

    if (!bookmark) {
        throw new ApiError(404, "Bookmark not found or you do not have permission to update it");
    }

    return new ApiResponse(200, "Bookmark updated successfully", bookmark).send(res);
});

const deleteBookmark = asyncHandler(async (req, res) => {
    const { bookmarkId } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({ _id: bookmarkId, user: req.user._id });

    if (!bookmark) {
        throw new ApiError(404, "Bookmark not found or you do not have permission to delete it");
    }

    return new ApiResponse(200, "Bookmark deleted successfully").send(res);
})

const searchBookmarks = asyncHandler(async (req, res) => {
    const { query } = req.query;
    
    if (!query) {
        throw new ApiError(400, "Search query is required");
    }
    
    const bookmarks = await Bookmark.find({
        user: req.user._id,
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { url: { $regex: query, $options: 'i' } },
            { tags: { $in: [query] } }
        ]
    }).populate("user", "username fullName email");

    return new ApiResponse(200, "Bookmarks searched successfully", bookmarks).send(res);
})

const markFavorite = asyncHandler(async (req, res) => {
    const { bookmarkId } = req.params;

    const bookmark = await Bookmark.findOne({ _id: bookmarkId, user: req.user._id });
    if (!bookmark) {
        throw new ApiError(404, "Bookmark not found or you do not have permission to access it");
    }

    if (req.user.favorites.includes(bookmarkId)) {
        return new ApiResponse(400, "Bookmark is already in favorites").send(res);
    }

    req.user.favoritesBookmarks.push(bookmarkId);
    await req.user.save();

    return new ApiResponse(200, "Note added to favorites successfully", { noteId }).send(res);
})

export { getAllBookmarks, createBookmark, updateBookmark, deleteBookmark, searchBookmarks, markFavorite };
