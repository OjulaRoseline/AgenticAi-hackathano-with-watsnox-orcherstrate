const mongoose = require('mongoose');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const connectDatabase = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/onboarding_db';
    
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('✅ Database connected successfully');
    logger.info(`📊 Connected to: ${mongoose.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('Database connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Database disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Database connection closed due to application termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to connect to database:', error);
    process.exit(1);
  }
};

module.exports = connectDatabase;
