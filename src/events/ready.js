import { Events, ActivityType } from 'discord.js';
import logger from '../utils/logger.js';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client) {
    logger.info(`Logged in as ${client.user.tag}!`);
    
    client.user.setActivity('D&D campaigns', { 
        type: ActivityType.Playing 
    });
    
    logger.info(`Bot is ready and serving ${client.guilds.cache.size} guild(s)`);
}