import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import type { Request,Response,NextFunction } from 'express';

import type { Document } from 'mongoose';

declare global {
    namespace Express {
        interface Request {
            user?: Document<any>;
        }
    }
}

export const verifyJWT = asyncHandler(async (req : Request, res : Response, next : NextFunction) => {
    try {

        const token = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : req.cookies?.accessToken;

        if (!token) {
            throw new ApiError(401, 'Unauthorized Request: No token provided');
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
        const payload = typeof decodedToken === 'string' ? null : decodedToken as jwt.JwtPayload;
        const userId = payload?._id;
        const user = await User.findById(userId).select('-password -refreshToken');

        if (!user) {
            throw new ApiError(401, 'Invalid Access Token');
        }

        req.user = user;
        next();
    } catch (error : any) {
        const statusCode = error instanceof ApiError ? error.statusCode : 500;
        const message = error instanceof ApiError ? error.message : 'Internal Server Error';
        console.error('JWT Verification Error:', error.message);
        return res.status(statusCode).json({
            status: 'error',
            message
        });
    }
});