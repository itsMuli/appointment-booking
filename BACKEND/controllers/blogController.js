import { fetchInstagramPosts } from '../helpers/instagram.js';

export const getBlogPosts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 24, 50);
    const result = await fetchInstagramPosts({ limit });

    res.status(200).json({
      success: true,
      posts: result.posts,
      fallback: Boolean(result.fallback),
      cached: Boolean(result.cached),
      reason: result.reason,
    });
  } catch (error) {
    console.error('[blog] getBlogPosts error:', error);
    res.status(200).json({
      success: true,
      posts: [],
      fallback: true,
      reason: error.message,
    });
  }
};
