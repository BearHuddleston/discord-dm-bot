import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import logger from './utils/logger.js';
import { initializeDatabase } from './services/database.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel, Partials.Message]
});

client.commands = new Collection();
client.cooldowns = new Collection();

async function loadCommands() {
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = await fs.readdir(commandsPath);
    
    for (const file of commandFiles) {
        if (!file.endsWith('.js')) continue;
        
        const filePath = join(commandsPath, file);
        const command = await import(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            logger.info(`Loaded command: ${command.data.name}`);
        } else {
            logger.warn(`Command at ${filePath} is missing required "data" or "execute" property`);
        }
    }
}

async function loadEvents() {
    const eventsPath = join(__dirname, 'events');
    const eventFiles = await fs.readdir(eventsPath);
    
    for (const file of eventFiles) {
        if (!file.endsWith('.js')) continue;
        
        const filePath = join(eventsPath, file);
        const event = await import(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        
        logger.info(`Loaded event: ${event.name}`);
    }
}

async function init() {
    try {
        await initializeDatabase();
        await loadCommands();
        await loadEvents();
        
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        logger.error('Failed to initialize bot:', error);
        process.exit(1);
    }
}

init();