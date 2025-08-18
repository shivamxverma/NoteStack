import asyncHandler from "../utils/asyncHandler.js";
import Bookmark from "../models/bookmark.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { redis } from "../config/redis.config.js";
import { performance } from "perf_hooks";

const getAllBookmarks = asyncHandler(async (req, res) => {
    let bookmarks = await redis.get("bookmarks");
    if(bookmarks){
        return res.status(200).json(
            new ApiResponse(200, JSON.parse(bookmarks), "Bookmarks fetched successfully")
        );
    }

    bookmarks = await Bookmark.find({ user: req.user._id }).populate("user", "username fullName email");

    await redis.set("bookmarks", JSON.stringify(bookmarks), "EX", 60);

    return res.status(200).json(
        new ApiResponse(200, bookmarks, "Bookmarks fetched successfully")
    );
});

const getBookmarkById = asyncHandler(async (req, res) => {
    const { bookmarkId } = req.params;
    const bookmark = await Bookmark.findOne({ _id: bookmarkId, user: req.user._id }).populate("user", "username fullName email");

    if (!bookmark) {
        throw new ApiError(404, "Bookmark not found or you do not have permission to access it");
    }

    return res.status(200).json(
        new ApiResponse(200, bookmark, "Bookmark fetched successfully")
    );
});

const createBookmark = asyncHandler(async (req, res) => {
    const { title, url, tags ,favorite} = req.body;

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
        favorite: favorite || false
    });

    await redis.del("bookmarks"); 
    
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

    await redis.del("bookmarks");

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

    await redis.del("bookmarks");

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

    if (bookmark.favorite) {
        bookmark.favorite = false;
        await bookmark.save();
        return res.status(200).json(
            new ApiResponse(200, {}, "Bookmark removed from favorites")
        );
    }

    bookmark.favorite = true;
    await bookmark.save();

    return res.status(200).json(
        new ApiResponse(200,{bookmarkId}, "Bookmark added to favorites successfully")
    );
})

export { getAllBookmarks, createBookmark, updateBookmark, deleteBookmark, getBookmarkById, searchBookmarks, markFavorite };
