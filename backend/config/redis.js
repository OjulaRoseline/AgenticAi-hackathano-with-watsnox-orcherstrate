const Redis = require('ioredis');
const logger = require('../utils/logger');

// Main Redis client for caching and general operations
const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: 0,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3
});

// Separate Redis client for pub/sub (required by Redis)
const redisPubSub = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: 0
});

// Event handlers
redisClient.on('connect', () => {
    logger.info('✅ Redis client connected');
});

redisClient.on('error', (err) => {
    logger.error('❌ Redis client error:', err);
});

redisPubSub.on('connect', () => {
    logger.info('✅ Redis pub/sub client connected');
});

redisPubSub.on('error', (err) => {
    logger.error('❌ Redis pub/sub error:', err);
});

// =====================================================
// CACHE HELPERS
// =====================================================

const cachePatient = async (patientId, data, ttl = 300) => {
    try {
        const key = `patient:${patientId}`;
        await redisClient.setex(key, ttl, JSON.stringify(data));
        logger.debug(`📦 Cached patient ${patientId}`);
        return true;
    } catch (error) {
        logger.error('Error caching patient:', error);
        return false;
    }
};

const getCachedPatient = async (patientId) => {
    try {
        const key = `patient:${patientId}`;
        const data = await redisClient.get(key);
        if (data) {
            logger.debug(`✅ Cache HIT: patient ${patientId}`);
            return JSON.parse(data);
        }
        logger.debug(`❌ Cache MISS: patient ${patientId}`);
        return null;
    } catch (error) {
        logger.error('Error getting cached patient:', error);
        return null;
    }
};

const cacheVitals = async (patientId, vitals, ttl = 60) => {
    try {
        const key = `vitals:${patientId}:latest`;
        await redisClient.setex(key, ttl, JSON.stringify(vitals));
        return true;
    } catch (error) {
        logger.error('Error caching vitals:', error);
        return false;
    }
};

const getCachedVitals = async (patientId) => {
    try {
        const key = `vitals:${patientId}:latest`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        logger.error('Error getting cached vitals:', error);
        return null;
    }
};

const cacheSearchResults = async (searchKey, results, ttl = 120) => {
    try {
        const key = `search:${searchKey}`;
        await redisClient.setex(key, ttl, JSON.stringify(results));
        return true;
    } catch (error) {
        logger.error('Error caching search results:', error);
        return false;
    }
};

const getCachedSearchResults = async (searchKey) => {
    try {
        const key = `search:${searchKey}`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        logger.error('Error getting cached search results:', error);
        return null;
    }
};

const invalidatePatientCache = async (patientId) => {
    try {
        const keys = [
            `patient:${patientId}`,
            `vitals:${patientId}:latest`
        ];
        await redisClient.del(...keys);
        logger.debug(`🗑️ Invalidated cache for patient ${patientId}`);
        return true;
    } catch (error) {
        logger.error('Error invalidating patient cache:', error);
        return false;
    }
};

const storeSession = async (sessionId, sessionData, ttl = 86400) => {
    try {
        const key = `session:${sessionId}`;
        await redisClient.setex(key, ttl, JSON.stringify(sessionData));
        return true;
    } catch (error) {
        logger.error('Error storing session:', error);
        return false;
    }
};

const getSession = async (sessionId) => {
    try {
        const key = `session:${sessionId}`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        logger.error('Error getting session:', error);
        return null;
    }
};

const deleteSession = async (sessionId) => {
    try {
        const key = `session:${sessionId}`;
        await redisClient.del(key);
        return true;
    } catch (error) {
        logger.error('Error deleting session:', error);
        return false;
    }
};

// =====================================================
// PUB/SUB HELPERS
// =====================================================

const publishAlert = async (alert) => {
    try {
        const channel = 'alerts';
        await redisPubSub.publish(channel, JSON.stringify(alert));
        logger.info(`📢 Published alert to channel: ${channel}`);
        return true;
    } catch (error) {
        logger.error('Error publishing alert:', error);
        return false;
    }
};

const publishNotification = async (nurseId, notification) => {
    try {
        const channel = `nurse:${nurseId}:notifications`;
        await redisPubSub.publish(channel, JSON.stringify(notification));
        return true;
    } catch (error) {
        logger.error('Error publishing notification:', error);
        return false;
    }
};

const subscribeToAlerts = (callback) => {
    const subscriber = redisPubSub.duplicate();
    subscriber.subscribe('alerts', (err) => {
        if (err) {
            logger.error('Error subscribing to alerts:', err);
            return;
        }
        logger.info('📡 Subscribed to alerts channel');
    });
    
    subscriber.on('message', (channel, message) => {
        try {
            const alert = JSON.parse(message);
            callback(alert);
        } catch (error) {
            logger.error('Error parsing alert message:', error);
        }
    });
    
    return subscriber;
};

const incrementCounter = async (key) => {
    try {
        await redisClient.incr(`counter:${key}`);
        return true;
    } catch (error) {
        logger.error('Error incrementing counter:', error);
        return false;
    }
};

const getCounter = async (key) => {
    try {
        const value = await redisClient.get(`counter:${key}`);
        return parseInt(value) || 0;
    } catch (error) {
        logger.error('Error getting counter:', error);
        return 0;
    }
};

module.exports = {
    redisClient,
    redisPubSub,
    // Cache operations
    cachePatient,
    getCachedPatient,
    cacheVitals,
    getCachedVitals,
    cacheSearchResults,
    getCachedSearchResults,
    invalidatePatientCache,
    // Session management
    storeSession,
    getSession,
    deleteSession,
    // Pub/Sub
    publishAlert,
    publishNotification,
    subscribeToAlerts,
    // Metrics
    incrementCounter,
    getCounter
};
