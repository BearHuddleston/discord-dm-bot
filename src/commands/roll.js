import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { DiceRoller } from '../utils/dice.js';
import logger from '../utils/logger.js';

export const data = new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll dice using standard notation')
    .addStringOption(option =>
        option
            .setName('dice')
            .setDescription('Dice notation (e.g., 2d6+3, 1d20)')
            .setRequired(true))
    .addStringOption(option =>
        option
            .setName('reason')
            .setDescription('What are you rolling for?')
            .setRequired(false))
    .addStringOption(option =>
        option
            .setName('type')
            .setDescription('Roll type')
            .setRequired(false)
            .addChoices(
                { name: 'Normal', value: 'normal' },
                { name: 'Advantage', value: 'advantage' },
                { name: 'Disadvantage', value: 'disadvantage' }
            ));

export async function execute(interaction) {
    const diceNotation = interaction.options.getString('dice');
    const reason = interaction.options.getString('reason');
    const rollType = interaction.options.getString('type') || 'normal';
    
    try {
        let result;
        
        if (rollType === 'normal') {
            const notations = DiceRoller.parseComplexRoll(diceNotation);
            
            if (notations.length === 0) {
                result = DiceRoller.rollDice(diceNotation);
            } else if (notations.length === 1) {
                result = DiceRoller.rollDice(notations[0]);
            } else {
                result = DiceRoller.rollMultiple(notations);
            }
        } else {
            result = DiceRoller.rollWithAdvantage(diceNotation, rollType);
        }
        
        const embed = createRollEmbed(interaction.user, result, reason);
        
        const components = [];
        if (result.notation && result.notation.includes('d20')) {
            components.push(createQuickRollButtons());
        }
        
        await interaction.reply({ 
            embeds: [embed], 
            components 
        });
        
    } catch (error) {
        logger.error('Roll error:', error);
        await interaction.reply({
            content: `❌ ${error.message}`,
            ephemeral: true
        });
    }
}

function createRollEmbed(user, result, reason) {
    const embed = {
        author: {
            name: user.username,
            iconURL: user.displayAvatarURL()
        },
        color: getDiceColor(result),
        timestamp: new Date().toISOString()
    };
    
    if (reason) {
        embed.title = `Rolling for: ${reason}`;
    }
    
    if (result.results) {
        embed.description = '**Multiple Rolls**\n';
        for (const roll of result.results) {
            embed.description += `${DiceRoller.formatRoll(roll)}\n\n`;
        }
        embed.fields = [{
            name: 'Grand Total',
            value: `**${result.grandTotal}**`,
            inline: true
        }];
    } else {
        embed.description = DiceRoller.formatRoll(result);
        
        if (result.notation && result.notation.includes('d20') && result.rolls.length === 1) {
            if (result.rolls[0] === 20) {
                embed.fields = [{
                    name: '⚡ CRITICAL SUCCESS! ⚡',
                    value: 'Natural 20!'
                }];
            } else if (result.rolls[0] === 1) {
                embed.fields = [{
                    name: '💀 CRITICAL FAILURE! 💀',
                    value: 'Natural 1!'
                }];
            }
        }
    }
    
    return embed;
}

function getDiceColor(result) {
    if (result.notation && result.notation.includes('d20') && result.rolls.length === 1) {
        if (result.rolls[0] === 20) return 0x00FF00;
        if (result.rolls[0] === 1) return 0xFF0000;
    }
    return 0x3498DB;
}

function createQuickRollButtons() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('roll_attack')
                .setLabel('Attack')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚔️'),
            new ButtonBuilder()
                .setCustomId('roll_save')
                .setLabel('Saving Throw')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🛡️'),
            new ButtonBuilder()
                .setCustomId('roll_check')
                .setLabel('Ability Check')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🎯'),
            new ButtonBuilder()
                .setCustomId('roll_initiative')
                .setLabel('Initiative')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('⚡')
        );
}