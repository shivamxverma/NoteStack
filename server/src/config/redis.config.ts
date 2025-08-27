import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();
export const redis = new Redis("redis://localhost:6379");