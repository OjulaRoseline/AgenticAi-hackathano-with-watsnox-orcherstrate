const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize(
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mediflow',
    {
        dialect: 'postgres',
        logging: (msg) => logger.debug(msg),
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

// Test connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('✅ Database connection established successfully');
        return true;
    } catch (error) {
        logger.error('❌ Unable to connect to the database:', error);
        return false;
    }
};

module.exports = { sequelize, testConnection };
