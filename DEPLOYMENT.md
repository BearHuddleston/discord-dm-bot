# Discord AI Dungeon Master - Docker Deployment Guide

## Prerequisites
- Docker Engine (20.10+)
- Docker Compose (2.0+)
- Discord Bot Token
- OpenAI API Key
- Server with at least 1GB RAM

## Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd discord-dm-bot
```

### 2. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your credentials
nano .env
```

Required environment variables:
```env
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
GUILD_ID=your_guild_id_for_testing

# AI Configuration
OPENAI_API_KEY=your_openai_api_key
AI_MODEL=gpt-4-turbo-preview

# Optional Configuration
ENABLE_VOICE=false
LOG_LEVEL=info
```

### 3. Build and Run with Docker Compose
```bash
# Build the Docker image
docker-compose build

# Start the services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f discord-dm-bot
```

### 4. Deploy Commands to Discord
```bash
# Run the deploy script inside the container
docker-compose exec discord-dm-bot node src/deploy-commands.js
```

## Production Deployment

### Using Docker Compose (Recommended)
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Update and restart
git pull
docker-compose build
docker-compose up -d
```

### Using Docker Run (Alternative)
```bash
# Build the image
docker build -t discord-dm-bot .

# Run the container
docker run -d \
  --name discord-dm-bot \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  --restart unless-stopped \
  discord-dm-bot
```

## Data Management

### Volumes
The following directories are persisted:
- `/app/data` - SQLite database and game data
- `/app/logs` - Application logs
- `/app/config` - Optional configuration files

### Backup Strategy
The docker-compose setup includes an automatic backup service that:
- Creates daily backups of the data directory
- Stores backups in `./backups`
- Automatically removes backups older than 7 days

Manual backup:
```bash
# Create manual backup
docker-compose exec backup tar -czf /backups/manual-backup-$(date +%Y%m%d).tar.gz -C /data .

# Restore from backup
docker-compose down
tar -xzf backups/backup-20240315-120000.tar.gz -C ./data
docker-compose up -d
```

## Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Bot only
docker-compose logs -f discord-dm-bot

# Last 100 lines
docker-compose logs --tail=100 discord-dm-bot
```

### Health Checks
```bash
# Check service status
docker-compose ps

# Manual health check
docker-compose exec discord-dm-bot node src/healthcheck.js
```

### Resource Usage
```bash
# View resource usage
docker stats discord-dm-bot

# View detailed container info
docker inspect discord-dm-bot
```

## Troubleshooting

### Bot Not Starting
1. Check logs: `docker-compose logs discord-dm-bot`
2. Verify environment variables: `docker-compose config`
3. Test Discord token: Ensure token is valid
4. Check database: Ensure data directory has write permissions

### Permission Issues
```bash
# Fix ownership (run on host)
sudo chown -R 1001:1001 ./data ./logs
```

### Database Issues
```bash
# Access SQLite database
docker-compose exec discord-dm-bot sqlite3 /app/data/dmbot.db

# Reset database (WARNING: Deletes all data)
docker-compose down
rm -f ./data/dmbot.db
docker-compose up -d
```

### Memory Issues
Adjust memory limits in docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      memory: 2G  # Increase as needed
```

## Updating

### Standard Update Process
```bash
# Pull latest changes
git pull

# Rebuild image
docker-compose build

# Restart services with zero downtime
docker-compose up -d --no-deps --build discord-dm-bot
```

### Major Updates
```bash
# Stop services
docker-compose down

# Backup data
cp -r ./data ./data.backup

# Pull updates
git pull

# Rebuild and start
docker-compose build
docker-compose up -d
```

## Security Considerations

### Network Security
- The bot runs in an isolated Docker network
- No ports are exposed by default
- Add firewall rules if exposing ports

### Secrets Management
```bash
# Use Docker secrets (Swarm mode)
echo "your_token" | docker secret create discord_token -

# Or use encrypted .env file
openssl enc -aes-256-cbc -salt -in .env -out .env.enc
```

### Running as Non-Root
The container runs as user `nodejs` (UID 1001) for security.

## Advanced Configuration

### Custom Network
```yaml
# In docker-compose.yml
networks:
  bot-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Multiple Bot Instances
```bash
# Copy compose file
cp docker-compose.yml docker-compose.bot2.yml

# Edit with different container names and env files
# Run second instance
docker-compose -f docker-compose.bot2.yml up -d
```

### Reverse Proxy (Optional)
For web dashboard access:
```nginx
server {
    listen 80;
    server_name bot.yourdomain.com;
    
    location / {
        proxy_pass http://discord-dm-bot:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Maintenance Scripts

### Daily Maintenance
Create `maintenance.sh`:
```bash
#!/bin/bash
# Rotate logs
docker-compose exec discord-dm-bot sh -c 'find /app/logs -name "*.log" -mtime +30 -delete'

# Database optimization
docker-compose exec discord-dm-bot sqlite3 /app/data/dmbot.db "VACUUM;"

# Health check
docker-compose exec discord-dm-bot node src/healthcheck.js
```

### Automated Updates (Optional)
Using Watchtower:
```yaml
# Add to docker-compose.yml
watchtower:
  image: containrrr/watchtower
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
  command: --interval 86400 discord-dm-bot
```

## Support

For issues:
1. Check logs first
2. Verify configuration
3. Test components individually
4. Create GitHub issue with logs

Remember to never share your tokens or API keys in support requests!