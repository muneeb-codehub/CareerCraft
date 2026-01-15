// middlewares/cache.js
import { getCache, setCache, generateCacheKey } from '../config/redis.js';

/**
 * Cache middleware for AI responses
 * Usage: router.get('/endpoint', cacheMiddleware('resume-analysis'), controller)
 */
export const cacheMiddleware = (cacheType, ttl = 3600) => {
    return async (req, res, next) => {
        // Generate cache key from request
        const cacheKey = generateCacheKey(cacheType, {
            userId: req.user?._id,
            body: req.body,
            params: req.params,
            query: req.query
        });

        try {
            // Try to get from cache
            const cachedData = await getCache(cacheKey);
            
            if (cachedData) {
                console.log(`📦 Serving from cache: ${cacheType}`);
                return res.json({
                    ...cachedData,
                    cached: true,
                    cacheKey: cacheKey
                });
            }

            // Store original res.json
            const originalJson = res.json.bind(res);

            // Override res.json to cache the response
            res.json = function(data) {
                // Only cache successful responses
                if (data.success !== false) {
                    setCache(cacheKey, data, ttl).catch(err => {
                        console.error('Cache save error:', err);
                    });
                }
                return originalJson(data);
            };

            next();

        } catch (error) {
            console.error('Cache middleware error:', error);
            // Continue without caching on error
            next();
        }
    };
};

/**
 * Clear cache for specific user
 */
export const clearUserCache = async (userId, pattern = '*') => {
    const { deleteCachePattern } = await import('../config/redis.js');
    const fullPattern = `ai:*:*${userId}*${pattern}*`;
    return await deleteCachePattern(fullPattern);
};

/**
 * Cache wrapper for async functions
 * @param {string} cacheKey - Cache key
 * @param {Function} fn - Function to execute if cache miss
 * @param {number} ttl - Time to live in seconds
 */
export const cacheWrapper = async (cacheKey, fn, ttl = 3600) => {
    // Try to get from cache
    const cached = await getCache(cacheKey);
    if (cached) {
        console.log(`📦 Cache HIT: ${cacheKey}`);
        return cached;
    }

    // Execute function
    console.log(`🔄 Cache MISS: Executing function for ${cacheKey}`);
    const result = await fn();

    // Save to cache
    await setCache(cacheKey, result, ttl);

    return result;
};

export default { cacheMiddleware, clearUserCache, cacheWrapper };
