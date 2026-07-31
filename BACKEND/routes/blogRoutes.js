import express from 'express';
import { getBlogPosts } from '../controllers/blogController.js';

const router = express.Router();

router.get('/posts', getBlogPosts);

export default router;
