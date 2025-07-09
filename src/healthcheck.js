import { Client } from 'discord.js';
import { config } from 'dotenv';
import { sequelize } from './services/database.js';

config();

async function checkHealth() {
    const checks = {
        discord: false,
        database: false
    };
    
    try {
        // Check Discord connection
        const client = new Client({ intents: [] });
        await client.login(process.env.DISCORD_TOKEN);
        checks.discord = client.ws.status === 0; // READY status
        client.destroy();
    } catch (error) {
        console.error('Discord health check failed:', error.message);
    }
    
    try {
        // Check database connection
        await sequelize.authenticate();
        checks.database = true;
    } catch (error) {
        console.error('Database health check failed:', error.message);
    }
    
    const allHealthy = Object.values(checks).every(status => status === true);
    
    if (!allHealthy) {
        console.error('Health check failed:', checks);
        process.exit(1);
    }
    
    console.log('Health check passed');
    process.exit(0);
}

checkHealth().catch(error => {
    console.error('Health check error:', error);
    process.exit(1);
});