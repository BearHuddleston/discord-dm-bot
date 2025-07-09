import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import logger from './utils/logger.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];

async function loadCommands() {
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = await fs.readdir(commandsPath);
    
    for (const file of commandFiles) {
        if (!file.endsWith('.js')) continue;
        
        const filePath = join(commandsPath, file);
        const command = await import(filePath);
        
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            logger.info(`Loaded command: ${command.data.name}`);
        }
    }
}

async function deployCommands() {
    try {
        await loadCommands();
        
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);
        
        logger.info(`Started refreshing ${commands.length} application (/) commands.`);
        
        const data = await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID, 
                process.env.GUILD_ID
            ),
            { body: commands },
        );
        
        logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        logger.error('Error deploying commands:', error);
    }
}

deployCommands();