// utils/performanceMonitor.js
// Performance monitoring utility for tracking API response times

const performanceLog = new Map();

export const startTimer = (requestId) => {
    performanceLog.set(requestId, {
        startTime: Date.now(),
        memoryStart: process.memoryUsage().heapUsed
    });
};

export const endTimer = (requestId, routeName) => {
    const metrics = performanceLog.get(requestId);
    if (!metrics) return;
    
    const endTime = Date.now();
    const memoryEnd = process.memoryUsage().heapUsed;
    const duration = endTime - metrics.startTime;
    const memoryDelta = (memoryEnd - metrics.memoryStart) / 1024 / 1024; // MB
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
        console.warn(`⚠️  Slow request detected: ${routeName} took ${duration}ms`);
    }
    
    // Clean up
    performanceLog.delete(requestId);
    
    return {
        duration,
        memoryDelta: memoryDelta.toFixed(2)
    };
};

// Middleware to track all requests
export const performanceMiddleware = (req, res, next) => {
    const requestId = `${req.method}-${req.path}-${Date.now()}`;
    req.requestId = requestId;
    startTimer(requestId);
    
    // Override res.json to capture response time
    const originalJson = res.json;
    res.json = function(data) {
        const metrics = endTimer(requestId, `${req.method} ${req.path}`);
        if (process.env.NODE_ENV === 'development' && metrics) {
            console.log(`📊 ${req.method} ${req.path} - ${metrics.duration}ms`);
        }
        return originalJson.call(this, data);
    };
    
    next();
};
