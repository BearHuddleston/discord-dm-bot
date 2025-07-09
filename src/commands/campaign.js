import { SlashCommandBuilder } from 'discord.js';
import { Campaign } from '../models/Campaign.js';
import logger from '../utils/logger.js';

export const data = new SlashCommandBuilder()
    .setName('campaign')
    .setDescription('Manage D&D campaigns')
    .addSubcommand(subcommand =>
        subcommand
            .setName('create')
            .setDescription('Create a new campaign')
            .addStringOption(option =>
                option
                    .setName('name')
                    .setDescription('Campaign name')
                    .setRequired(true))
            .addStringOption(option =>
                option
                    .setName('setting')
                    .setDescription('Campaign setting (e.g., Forgotten Realms, Homebrew)')
                    .setRequired(false)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('info')
            .setDescription('Get information about the current campaign'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('end')
            .setDescription('End the current campaign'));

export async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    try {
        switch (subcommand) {
            case 'create':
                await createCampaign(interaction);
                break;
            case 'info':
                await getCampaignInfo(interaction);
                break;
            case 'end':
                await endCampaign(interaction);
                break;
        }
    } catch (error) {
        logger.error('Error in campaign command:', error);
        await interaction.reply({ 
            content: 'An error occurred while processing your campaign command.', 
            ephemeral: true 
        });
    }
}

async function createCampaign(interaction) {
    const name = interaction.options.getString('name');
    const setting = interaction.options.getString('setting') || 'Homebrew';
    const guildId = interaction.guild.id;
    const dmId = interaction.user.id;
    
    const existingCampaign = await Campaign.findOne({
        where: { guildId, active: true }
    });
    
    if (existingCampaign) {
        await interaction.reply({
            content: 'There is already an active campaign in this server. End it first before creating a new one.',
            ephemeral: true
        });
        return;
    }
    
    const campaign = await Campaign.create({
        name,
        setting,
        guildId,
        dmId,
        active: true
    });
    
    await interaction.reply({
        content: `✨ Campaign "${name}" has been created!\nSetting: ${setting}\nDM: <@${dmId}>`,
        allowedMentions: { users: [] }
    });
}

async function getCampaignInfo(interaction) {
    const campaign = await Campaign.findOne({
        where: { 
            guildId: interaction.guild.id, 
            active: true 
        }
    });
    
    if (!campaign) {
        await interaction.reply({
            content: 'No active campaign found in this server.',
            ephemeral: true
        });
        return;
    }
    
    const embed = {
        title: campaign.name,
        fields: [
            { name: 'Setting', value: campaign.setting, inline: true },
            { name: 'DM', value: `<@${campaign.dmId}>`, inline: true },
            { name: 'Created', value: campaign.createdAt.toLocaleDateString(), inline: true }
        ],
        color: 0x9B59B6
    };
    
    await interaction.reply({ embeds: [embed] });
}

async function endCampaign(interaction) {
    const campaign = await Campaign.findOne({
        where: { 
            guildId: interaction.guild.id, 
            active: true 
        }
    });
    
    if (!campaign) {
        await interaction.reply({
            content: 'No active campaign found in this server.',
            ephemeral: true
        });
        return;
    }
    
    if (campaign.dmId !== interaction.user.id) {
        await interaction.reply({
            content: 'Only the DM can end the campaign.',
            ephemeral: true
        });
        return;
    }
    
    campaign.active = false;
    await campaign.save();
    
    await interaction.reply({
        content: `Campaign "${campaign.name}" has been ended. Thank you for the adventure!`
    });
}