export class DiceRoller {
    static rollDice(notation) {
        const diceRegex = /^(\d*)d(\d+)([+-]\d+)?$/i;
        const match = notation.match(diceRegex);
        
        if (!match) {
            throw new Error('Invalid dice notation. Use format: XdY+Z (e.g., 2d6+3)');
        }
        
        const count = parseInt(match[1] || '1');
        const sides = parseInt(match[2]);
        const modifier = parseInt(match[3] || '0');
        
        if (count < 1 || count > 100) {
            throw new Error('Number of dice must be between 1 and 100');
        }
        
        if (sides < 2 || sides > 1000) {
            throw new Error('Dice sides must be between 2 and 1000');
        }
        
        const rolls = [];
        let total = 0;
        
        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            rolls.push(roll);
            total += roll;
        }
        
        total += modifier;
        
        return {
            notation,
            count,
            sides,
            modifier,
            rolls,
            total,
            natural: total - modifier
        };
    }
    
    static rollWithAdvantage(notation, type = 'advantage') {
        const roll1 = this.rollDice(notation);
        const roll2 = this.rollDice(notation);
        
        const chosen = type === 'advantage' 
            ? (roll1.total >= roll2.total ? roll1 : roll2)
            : (roll1.total <= roll2.total ? roll1 : roll2);
        
        return {
            ...chosen,
            type,
            otherRoll: chosen === roll1 ? roll2 : roll1
        };
    }
    
    static rollMultiple(notations) {
        const results = [];
        let grandTotal = 0;
        
        for (const notation of notations) {
            const result = this.rollDice(notation);
            results.push(result);
            grandTotal += result.total;
        }
        
        return {
            results,
            grandTotal
        };
    }
    
    static formatRoll(result) {
        let output = `🎲 **${result.notation}**\n`;
        output += `Rolls: [${result.rolls.join(', ')}]`;
        
        if (result.modifier !== 0) {
            const sign = result.modifier > 0 ? '+' : '';
            output += ` ${sign}${result.modifier}`;
        }
        
        output += `\n**Total: ${result.total}**`;
        
        if (result.type) {
            output += ` (${result.type})`;
            if (result.otherRoll) {
                output += `\n*Other roll: ${result.otherRoll.total}*`;
            }
        }
        
        return output;
    }
    
    static parseComplexRoll(input) {
        const parts = input.split(/\s+/);
        const validNotations = [];
        
        for (const part of parts) {
            if (/^\d*d\d+([+-]\d+)?$/i.test(part)) {
                validNotations.push(part);
            }
        }
        
        return validNotations;
    }
}