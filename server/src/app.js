import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin : process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}))

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

import userRoutes from './routes/user.routes.js';
import noteRoutes from './routes/note.routes.js';
import bookmarkRoutes from './routes/bookmark.routes.js';

app.use('/api/v1/notes', noteRoutes);

app.use('/api/v1/users', userRoutes);

app.use('/api/v1/bookmarks', bookmarkRoutes);

export {app};