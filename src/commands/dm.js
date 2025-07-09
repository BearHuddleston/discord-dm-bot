import { SlashCommandBuilder } from 'discord.js';
import { aiService } from '../services/ai.js';
import { Campaign } from '../models/Campaign.js';
import { GameSession } from '../models/GameSession.js';
import logger from '../utils/logger.js';

export const data = new SlashCommandBuilder()
    .setName('dm')
    .setDescription('AI Dungeon Master commands')
    .addSubcommand(subcommand =>
        subcommand
            .setName('describe')
            .setDescription('Describe a scene or location')
            .addStringOption(option =>
                option
                    .setName('location')
                    .setDescription('The location to describe')
                    .setRequired(true))
            .addStringOption(option =>
                option
                    .setName('atmosphere')
                    .setDescription('The atmosphere or mood')
                    .setRequired(false)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('npc')
            .setDescription('Generate an NPC')
            .addStringOption(option =>
                option
                    .setName('description')
                    .setDescription('Basic description of the NPC')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('narrate')
            .setDescription('Narrate a player action')
            .addStringOption(option =>
                option
                    .setName('action')
                    .setDescription('What the player is attempting')
                    .setRequired(true)));

export async function execute(interaction) {
    await interaction.deferReply();
    
    const campaign = await Campaign.findOne({
        where: { 
            guildId: interaction.guild.id, 
            active: true 
        }
    });
    
    if (!campaign) {
        await interaction.editReply({
            content: 'No active campaign found. Create one with `/campaign create` first.'
        });
        return;
    }
    
    const subcommand = interaction.options.getSubcommand();
    
    try {
        let response;
        
        switch (subcommand) {
            case 'describe':
                response = await handleDescribe(interaction);
                break;
            case 'npc':
                response = await handleNPC(interaction);
                break;
            case 'narrate':
                response = await handleNarrate(interaction, campaign);
                break;
        }
        
        await interaction.editReply(response);
        
        await GameSession.create({
            campaignId: campaign.id,
            channelId: interaction.channel.id,
            userId: interaction.user.id,
            action: subcommand,
            content: response,
            metadata: {
                command: interaction.options.data[0]
            }
        });
        
    } catch (error) {
        logger.error('Error in DM command:', error);
        await interaction.editReply({
            content: 'The mystical energies falter... (An error occurred)'
        });
    }
}

async function handleDescribe(interaction) {
    const location = interaction.options.getString('location');
    const atmosphere = interaction.options.getString('atmosphere') || 'mysterious';
    
    const description = await aiService.describeScene(location, atmosphere);
    
    return {
        embeds: [{
            title: `📍 ${location}`,
            description: description,
            color: 0x2ECC71,
            footer: {
                text: atmosphere.charAt(0).toUpperCase() + atmosphere.slice(1) + ' atmosphere'
            }
        }]
    };
}

async function handleNPC(interaction) {
    const description = interaction.options.getString('description');
    
    const npc = await aiService.generateNPC(description);
    
    return {
        embeds: [{
            title: '🎭 New NPC',
            description: npc,
            color: 0xE74C3C
        }]
    };
}

async function handleNarrate(interaction, campaign) {
    const action = interaction.options.getString('action');
    
    const recentSessions = await GameSession.findAll({
        where: { 
            campaignId: campaign.id,
            channelId: interaction.channel.id
        },
        order: [['createdAt', 'DESC']],
        limit: 5
    });
    
    const context = recentSessions.map(s => s.content).join('\n');
    
    const narration = await aiService.respondToPlayer(action, context);
    
    return {
        embeds: [{
            author: {
                name: interaction.member.displayName,
                iconURL: interaction.user.displayAvatarURL()
            },
            fields: [
                {
                    name: 'Action',
                    value: action
                },
                {
                    name: 'Result',
                    value: narration
                }
            ],
            color: 0x3498DB
        }]
    };
}