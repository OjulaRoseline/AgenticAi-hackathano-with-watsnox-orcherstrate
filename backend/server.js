require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import configurations and services
const { sequelize } = require('./config/database');
const { redisClient, redisPubSub } = require('./config/redis');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const nurseRoutes = require('./routes/nurses');
const vitalRoutes = require('./routes/vitals');
const medicationRoutes = require('./routes/medications');
const noteRoutes = require('./routes/notes');
const meetingRoutes = require('./routes/meetings');
const alertRoutes = require('./routes/alerts');
const agentRoutes = require('./routes/agents');

// Import socket handlers
const initializeSocket = require('./sockets/index');

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO for real-time communication
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Apply rate limiting to all routes
app.use(rateLimiter);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Check database connection
        await sequelize.authenticate();
        
        // Check Redis connection
        await redisClient.ping();
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                redis: 'connected',
                server: 'running'
            }
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/nurses', nurseRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/agents', agentRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize Socket.IO handlers
initializeSocket(io);

// Make io accessible to routes
app.set('io', io);

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    
    httpServer.close(async () => {
        logger.info('HTTP server closed');
        
        try {
            // Close database connection
            await sequelize.close();
            logger.info('Database connection closed');
            
            // Close Redis connections
            await redisClient.quit();
            await redisPubSub.quit();
            logger.info('Redis connections closed');
            
            logger.info('Graceful shutdown completed');
            process.exit(0);
        } catch (error) {
            logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        logger.info('Database connection established successfully');
        
        // Sync database models (only in development)
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: false });
            logger.info('Database models synchronized');
        }
        
        // Test Redis connection
        await redisClient.ping();
        logger.info('Redis connection established successfully');
        
        // Start HTTP server
        httpServer.listen(PORT, () => {
            logger.info(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║           🏥 MediFlow AI Backend Server              ║
║                                                       ║
║  Status: Running                                     ║
║  Port: ${PORT}                                        ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
║  Database: Connected                                 ║
║  Redis: Connected                                    ║
║  WebSocket: Enabled                                  ║
║                                                       ║
║  API: http://localhost:${PORT}/api                     ║
║  Health: http://localhost:${PORT}/health               ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
            `);
        });
        
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = { app, io };
