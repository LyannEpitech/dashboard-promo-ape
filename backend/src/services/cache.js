// Cache simple pour les données GitHub
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCacheKey(endpoint, params) {
  return `${endpoint}:${JSON.stringify(params)}`;
}

export function getFromCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export function clearCache() {
  cache.clear();
}

export function clearCacheForOrg(org) {
  for (const key of cache.keys()) {
    if (key.includes(org)) {
      cache.delete(key);
    }
  }
}