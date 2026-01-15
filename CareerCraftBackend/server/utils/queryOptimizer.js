// utils/queryOptimizer.js
// Database query optimization utilities

/**
 * Optimize MongoDB queries with proper indexing hints
 */
export const optimizeQuery = (query, options = {}) => {
    const {
        lean = true,          // Return plain JS objects instead of Mongoose documents
        limit = 100,          // Default limit to prevent large queries
        select = null,        // Fields to select
        sort = { createdAt: -1 }  // Default sort
    } = options;
    
    let optimizedQuery = query;
    
    if (lean) {
        optimizedQuery = optimizedQuery.lean();
    }
    
    if (limit) {
        optimizedQuery = optimizedQuery.limit(limit);
    }
    
    if (select) {
        optimizedQuery = optimizedQuery.select(select);
    }
    
    if (sort) {
        optimizedQuery = optimizedQuery.sort(sort);
    }
    
    return optimizedQuery;
};

/**
 * Batch update optimization
 */
export const batchUpdate = async (Model, updates) => {
    const bulkOps = updates.map(({ filter, update }) => ({
        updateOne: {
            filter,
            update,
            upsert: false
        }
    }));
    
    if (bulkOps.length === 0) return { modifiedCount: 0 };
    
    return await Model.bulkWrite(bulkOps);
};

/**
 * Efficient pagination with cursor-based approach
 */
export const cursorPaginate = async (Model, { cursor, limit = 20, sort = { _id: -1 }, filter = {} }) => {
    const query = cursor 
        ? { ...filter, _id: { $lt: cursor } }
        : filter;
    
    const items = await Model.find(query)
        .sort(sort)
        .limit(limit + 1)
        .lean();
    
    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? results[results.length - 1]._id : null;
    
    return {
        items: results,
        nextCursor,
        hasMore
    };
};
