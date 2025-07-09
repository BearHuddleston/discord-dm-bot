import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
import logger from '../utils/logger.js';

config();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DATABASE_PATH || './data/dmbot.db',
    logging: (msg) => logger.debug(msg)
});

export async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully');
        
        await sequelize.sync({ alter: true });
        logger.info('Database models synchronized');
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        throw error;
    }
}

export { sequelize };