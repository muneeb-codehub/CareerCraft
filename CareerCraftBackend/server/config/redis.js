// config/redis.js
import { createClient } from 'redis';

let redisClient = null;
let isRedisConnected = false;

/**
 * Initialize Redis client
 */
export const initRedis = async () => {
    try {
        // Create Redis client
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.log('❌ Redis: Too many reconnection attempts, giving up');
                        return new Error('Redis reconnection failed');
                    }
                    return retries * 100; // Exponential backoff
                }
            }
        });

        // Error handler
        redisClient.on('error', (err) => {
            console.error('❌ Redis Error:', err.message);
            isRedisConnected = false;
        });

        // Ready handler
        redisClient.on('ready', () => {
            console.log('✅ Redis: Connected and ready');
            isRedisConnected = true;
        });

        // Connect handler
        redisClient.on('connect', () => {
            console.log('🔄 Redis: Connecting...');
        });

        // Reconnecting handler
        redisClient.on('reconnecting', () => {
            console.log('🔄 Redis: Reconnecting...');
        });

        // Connect to Redis
        await redisClient.connect();

        console.log('✅ Redis initialized successfully');
        return redisClient;

    } catch (error) {
        console.warn('⚠️  Redis not available:', error.message);
        console.warn('⚠️  Application will continue without caching');
        isRedisConnected = false;
        return null;
    }
};

/**
 * Get cache value
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached value or null
 */
export const getCache = async (key) => {
    if (!isRedisConnected || !redisClient) {
        return null;
    }

    try {
        const data = await redisClient.get(key);
        if (data) {
            console.log(`✅ Cache HIT: ${key}`);
            return JSON.parse(data);
        }
        console.log(`❌ Cache MISS: ${key}`);
        return null;
    } catch (error) {
        console.error('Redis get error:', error.message);
        return null;
    }
};

/**
 * Set cache value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 * @returns {Promise<boolean>} Success status
 */
export const setCache = async (key, value, ttl = 3600) => {
    if (!isRedisConnected || !redisClient) {
        return false;
    }

    try {
        await redisClient.setEx(key, ttl, JSON.stringify(value));
        console.log(`✅ Cache SET: ${key} (TTL: ${ttl}s)`);
        return true;
    } catch (error) {
        console.error('Redis set error:', error.message);
        return false;
    }
};

/**
 * Delete cache key
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
export const deleteCache = async (key) => {
    if (!isRedisConnected || !redisClient) {
        return false;
    }

    try {
        await redisClient.del(key);
        console.log(`✅ Cache DELETE: ${key}`);
        return true;
    } catch (error) {
        console.error('Redis delete error:', error.message);
        return false;
    }
};

/**
 * Delete cache keys by pattern
 * @param {string} pattern - Pattern to match (e.g., 'resume:*')
 * @returns {Promise<number>} Number of keys deleted
 */
export const deleteCachePattern = async (pattern) => {
    if (!isRedisConnected || !redisClient) {
        return 0;
    }

    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`✅ Cache DELETE PATTERN: ${pattern} (${keys.length} keys)`);
            return keys.length;
        }
        return 0;
    } catch (error) {
        console.error('Redis delete pattern error:', error.message);
        return 0;
    }
};

/**
 * Check if Redis is connected
 * @returns {boolean} Connection status
 */
export const isRedisReady = () => {
    return isRedisConnected && redisClient !== null;
};

/**
 * Close Redis connection
 */
export const closeRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        console.log('Redis connection closed');
    }
};

/**
 * Generate cache key for AI responses
 */
export const generateCacheKey = (type, params) => {
    const paramsStr = JSON.stringify(params);
    const hash = Buffer.from(paramsStr).toString('base64').substring(0, 32);
    return `ai:${type}:${hash}`;
};

export default {
    initRedis,
    getCache,
    setCache,
    deleteCache,
    deleteCachePattern,
    isRedisReady,
    closeRedis,
    generateCacheKey
};
