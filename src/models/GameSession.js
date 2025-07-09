import { DataTypes } from 'sequelize';
import { sequelize } from '../services/database.js';

export const GameSession = sequelize.define('GameSession', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    campaignId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Campaigns',
            key: 'id'
        }
    },
    channelId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
});