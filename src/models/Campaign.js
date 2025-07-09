import { DataTypes } from 'sequelize';
import { sequelize } from '../services/database.js';

export const Campaign = sequelize.define('Campaign', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    setting: {
        type: DataTypes.STRING,
        defaultValue: 'Homebrew'
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dmId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
});