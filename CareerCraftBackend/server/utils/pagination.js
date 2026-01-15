// utils/pagination.js

/**
 * Pagination helper utility
 * @param {Object} query - Mongoose query object
 * @param {Object} req - Express request object
 * @returns {Object} Paginated results with metadata
 */
export const paginate = async (query, req, options = {}) => {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || options.defaultLimit || 10;
    const sort = req.query.sort || options.defaultSort || '-createdAt';

    // Validate pagination parameters
    if (page < 1) {
        throw new Error('Page number must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
        throw new Error('Limit must be between 1 and 100');
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [results, total] = await Promise.all([
        query
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        query.model.countDocuments(query.getFilter())
    ]);

    // Calculate metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        success: true,
        data: results,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null
        }
    };
};

/**
 * Simple pagination response builder
 * @param {Array} data - Data array
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items
 * @returns {Object} Paginated response
 */
export const buildPaginationResponse = (data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null
        }
    };
};

/**
 * Extract pagination params from request
 * @param {Object} req - Express request
 * @param {Object} defaults - Default values
 * @returns {Object} Pagination parameters
 */
export const getPaginationParams = (req, defaults = {}) => {
    const page = Math.max(1, parseInt(req.query.page) || defaults.page || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || defaults.limit || 10));
    const sort = req.query.sort || defaults.sort || '-createdAt';
    const skip = (page - 1) * limit;

    return { page, limit, sort, skip };
};
