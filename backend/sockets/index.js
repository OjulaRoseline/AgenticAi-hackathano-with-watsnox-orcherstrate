const logger = require('../utils/logger');
const { subscribeToAlerts } = require('../config/redis');

/**
 * Initialize Socket.IO handlers
 */
function initializeSocket(io) {
    logger.info('🔌 Initializing Socket.IO...');

    // Connection handler
    io.on('connection', (socket) => {
        logger.info(`✅ Client connected: ${socket.id}`);

        // Join nurse-specific room
        socket.on('join', (data) => {
            const { nurseId } = data;
            socket.join(`nurse:${nurseId}`);
            logger.info(`👤 Nurse ${nurseId} joined their room`);
        });

        // Disconnect handler
        socket.on('disconnect', () => {
            logger.info(`❌ Client disconnected: ${socket.id}`);
        });
    });

    // Subscribe to Redis pub/sub for alerts
    subscribeToAlerts((alert) => {
        logger.info('📢 Broadcasting alert to all clients');
        io.emit('alert', alert);
    });

    logger.info('✅ Socket.IO initialized');
}

module.exports = initializeSocket;
