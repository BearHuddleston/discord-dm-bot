import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with bot latency');

export async function execute(interaction) {
    const sent = await interaction.reply({ 
        content: 'Pinging...', 
        fetchReply: true 
    });
    
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);
    
    await interaction.editReply(
        `🏓 Pong!\nLatency: ${latency}ms\nAPI Latency: ${apiLatency}ms`
    );
}