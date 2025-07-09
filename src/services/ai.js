import OpenAI from 'openai';
import { config } from 'dotenv';
import logger from '../utils/logger.js';

config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are an expert Dungeons & Dragons 5th Edition Dungeon Master. Your role is to:
- Create immersive narratives and descriptions
- Play NPCs with distinct personalities
- Maintain consistency in the game world
- Facilitate engaging combat encounters
- Respond to player actions creatively
- Track story elements and continuity
- Use appropriate D&D terminology and mechanics

Keep responses concise but atmospheric. Never break character as the DM.`;

export class AIService {
    constructor() {
        this.model = process.env.AI_MODEL || 'gpt-4-turbo-preview';
        this.maxTokens = 500;
        this.temperature = 0.8;
    }
    
    async generateNarrative(prompt, context = null) {
        try {
            const messages = [
                { role: 'system', content: SYSTEM_PROMPT }
            ];
            
            if (context) {
                messages.push({ 
                    role: 'system', 
                    content: `Campaign Context: ${JSON.stringify(context)}` 
                });
            }
            
            messages.push({ role: 'user', content: prompt });
            
            const response = await openai.chat.completions.create({
                model: this.model,
                messages,
                max_tokens: this.maxTokens,
                temperature: this.temperature
            });
            
            return response.choices[0].message.content;
        } catch (error) {
            logger.error('AI generation error:', error);
            throw new Error('Failed to generate narrative');
        }
    }
    
    async generateNPC(description) {
        const prompt = `Create an NPC with the following description: ${description}
        
Provide:
- Name
- Race and Class (if applicable)
- Personality traits (2-3)
- A unique mannerism or quirk
- Their current goal or motivation
- A secret they're hiding`;
        
        return this.generateNarrative(prompt);
    }
    
    async describeScene(location, atmosphere) {
        const prompt = `Describe the following location for D&D players:
Location: ${location}
Atmosphere: ${atmosphere}

Make it vivid and immersive, focusing on sensory details. Keep it to 2-3 paragraphs.`;
        
        return this.generateNarrative(prompt);
    }
    
    async narrateCombat(action, context) {
        const prompt = `Narrate this combat action dramatically:
Action: ${action}
Context: ${context}

Make it exciting and cinematic, but brief (1-2 sentences).`;
        
        return this.generateNarrative(prompt);
    }
    
    async respondToPlayer(playerAction, gameState) {
        const prompt = `A player has taken the following action: ${playerAction}
        
Current situation: ${gameState}
        
Describe what happens as a result, staying true to D&D rules and the established narrative.`;
        
        return this.generateNarrative(prompt);
    }
}

export const aiService = new AIService();