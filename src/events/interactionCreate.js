import { Events } from 'discord.js';
import logger from '../utils/logger.js';

export const name = Events.InteractionCreate;

export async function execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    
    const command = interaction.client.commands.get(interaction.commandName);
    
    if (!command) {
        logger.error(`No command matching ${interaction.commandName} was found`);
        return;
    }
    
    try {
        await command.execute(interaction);
    } catch (error) {
        logger.error(`Error executing command ${interaction.commandName}:`, error);
        
        const errorMessage = 'There was an error while executing this command!';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ 
                content: errorMessage, 
                ephemeral: true 
            });
        } else {
            await interaction.reply({ 
                content: errorMessage, 
                ephemeral: true 
            });
        }
    }
}