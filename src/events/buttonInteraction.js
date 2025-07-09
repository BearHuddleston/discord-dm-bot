import { Events } from 'discord.js';
import { DiceRoller } from '../utils/dice.js';
import logger from '../utils/logger.js';

export const name = Events.InteractionCreate;

export async function execute(interaction) {
    if (!interaction.isButton()) return;
    
    if (interaction.customId.startsWith('roll_')) {
        await handleQuickRoll(interaction);
    }
}

async function handleQuickRoll(interaction) {
    const rollType = interaction.customId.replace('roll_', '');
    let notation = '1d20';
    let reason = '';
    
    switch (rollType) {
        case 'attack':
            reason = 'Attack Roll';
            break;
        case 'save':
            reason = 'Saving Throw';
            break;
        case 'check':
            reason = 'Ability Check';
            break;
        case 'initiative':
            reason = 'Initiative';
            break;
    }
    
    try {
        const result = DiceRoller.rollDice(notation);
        
        const embed = {
            author: {
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            },
            title: `Quick Roll: ${reason}`,
            description: DiceRoller.formatRoll(result),
            color: getDiceColor(result),
            timestamp: new Date().toISOString()
        };
        
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
        
        await interaction.reply({ embeds: [embed] });
        
    } catch (error) {
        logger.error('Quick roll error:', error);
        await interaction.reply({
            content: 'Failed to roll dice!',
            ephemeral: true
        });
    }
}

function getDiceColor(result) {
    if (result.rolls[0] === 20) return 0x00FF00;
    if (result.rolls[0] === 1) return 0xFF0000;
    return 0x3498DB;
}