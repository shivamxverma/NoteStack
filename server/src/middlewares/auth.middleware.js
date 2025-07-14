import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        let token;
        console.log(req.cookie);
        // Try to extract token from cookies (if present)
        if (req.cookie && req.cookie.accessToken) {
            token = req.cookie.accessToken;
        } else if (req.headers.cookie) {
            // Manually parse cookies from header if req.cookies is not populated
            const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
            }, {});
            token = cookies.accessToken;
        }
        // Fallback to Authorization header
        if (!token) {
            const authHeader = req.header("Authorization");
            if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.replace("Bearer ", "");
            }
        }

        console.log("Cookies:", req.cookies); 
        console.log("Authorization Header:", req.header("Authorization")); 
        console.log("Token:", token); 

        if (!token) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;

        next();
    } catch (error) {
        // console.error("Error in verifyJWT:", error);

        const statusCode = error instanceof ApiError ? error.statusCode : 500;
        const message = error instanceof ApiError ? error.message : "Internal Server Error";

        return res.status(statusCode).json({
            status: "error",
            message: message
        });
    }
});