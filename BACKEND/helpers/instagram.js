/**
 * Instagram Graph API — media for the Blog gallery.
 *
 * Requires a Business/Creator IG account linked to a Facebook Page,
 * plus a long-lived Page or User token with instagram_basic /
 * pages_show_list (or equivalent) permissions.
 *
 * Env:
 *   INSTAGRAM_ACCESS_TOKEN
 *   INSTAGRAM_BUSINESS_ACCOUNT_ID
 */

const GRAPH_VERSION = 'v21.0';
const CACHE_TTL_MS = 20 * 60 * 1000;

let cache = { at: 0, posts: null };

const CATEGORY_KEYWORDS = [
  { category: 'Manicure', words: ['manicure', 'mani', 'gel'] },
  { category: 'Pedicure', words: ['pedicure', 'pedi'] },
  { category: 'Extensions', words: ['extension', 'extensions', 'acrylic', 'full set'] },
  { category: 'Nail Art', words: ['nail art', 'art', 'design', 'glam'] },
];

export function isInstagramConfigured() {
  return Boolean(
    process.env.INSTAGRAM_ACCESS_TOKEN &&
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
  );
}

function deriveCategory(caption = '') {
  const lower = caption.toLowerCase();
  for (const { category, words } of CATEGORY_KEYWORDS) {
    if (words.some((w) => lower.includes(w))) return category;
  }
  return 'Feed';
}

function titleFromCaption(caption = '') {
  const line = caption.split('\n').map((s) => s.trim()).find(Boolean);
  if (!line) return 'Salon work';
  return line.length > 60 ? `${line.slice(0, 57)}…` : line;
}

function normalizeMedia(item) {
  const caption = item.caption || '';
  const image =
    item.media_type === 'VIDEO'
      ? item.thumbnail_url || item.media_url
      : item.media_url;

  if (!image) return null;

  return {
    id: item.id,
    title: titleFromCaption(caption),
    image,
    note: caption.slice(0, 160) || 'From our Instagram.',
    permalink: item.permalink,
    category: deriveCategory(caption),
    timestamp: item.timestamp,
    mediaType: item.media_type,
  };
}

export async function fetchInstagramPosts({ limit = 24 } = {}) {
  if (!isInstagramConfigured()) {
    return { posts: [], fallback: true, reason: 'not_configured' };
  }

  if (cache.posts && Date.now() - cache.at < CACHE_TTL_MS) {
    return { posts: cache.posts.slice(0, limit), fallback: false, cached: true };
  }

  const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const fields = [
    'id',
    'caption',
    'media_url',
    'permalink',
    'timestamp',
    'media_type',
    'thumbnail_url',
  ].join(',');

  const url =
    `https://graph.facebook.com/${GRAPH_VERSION}/${igId}/media` +
    `?fields=${fields}&limit=${Math.min(limit, 50)}&access_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      console.error('[instagram] fetch failed:', data);
      return {
        posts: [],
        fallback: true,
        reason: data?.error?.message || `HTTP ${res.status}`,
      };
    }

    const posts = (data.data || [])
      .map(normalizeMedia)
      .filter(Boolean);

    cache = { at: Date.now(), posts };
    return { posts: posts.slice(0, limit), fallback: false, cached: false };
  } catch (err) {
    console.error('[instagram] error:', err.message);
    return { posts: [], fallback: true, reason: err.message };
  }
}
