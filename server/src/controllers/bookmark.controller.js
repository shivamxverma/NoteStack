import asyncHandler from "../utils/asyncHandler.js";
import Bookmark from "../models/bookmark.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllBookmarks = asyncHandler(async (req, res) => {
    const bookmarks = await Bookmark.find({ user: req.user._id }).populate("user", "username fullName email");
    return res.status(200).json(
        new ApiResponse(200, bookmarks, "Bookmarks fetched successfully")
    );
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
    
    return res.status(200).json(
        new ApiResponse(200, bookmark, "Bookmark Created successfully")
    );
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

    return res.status(200).json(
        new ApiResponse(200, bookmark, "Bookmark updated successfully")
    );
});

const deleteBookmark = asyncHandler(async (req, res) => {
    const { bookmarkId } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({ _id: bookmarkId, user: req.user._id });

    if (!bookmark) {
        throw new ApiError(404, "Bookmark not found or you do not have permission to delete it");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Bookmark deleted successfully")
    );
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

    return res.status(200).json(
        new ApiResponse(200, bookmarks, "Bookmarks searched successfully")
    );
})

const markFavorite = asyncHandler(async (req, res) => {
    const { bookmarkId } = req.params;

    const bookmark = await Bookmark.findOne({ _id: bookmarkId, user: req.user._id });
    if (!bookmark) {
        throw new ApiError(404, "Bookmark not found or you do not have permission to access it");
    }

    if (req.user.favoritesBookmarks.includes(bookmarkId)) {
        return new ApiResponse(400, "Bookmark is already in favorites").send(res);
    }

    req.user.favoritesBookmarks.push(bookmarkId);
    await req.user.save();

    return res.status(200).json(
        new ApiResponse(200, "Bookmark added to favorites successfully", { bookmarkId })
    );
})

export { getAllBookmarks, createBookmark, updateBookmark, deleteBookmark, searchBookmarks, markFavorite };
