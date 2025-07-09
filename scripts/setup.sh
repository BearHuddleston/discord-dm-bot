#!/bin/bash

# Discord AI Dungeon Master - Setup Script

set -e

echo "🎲 Discord AI Dungeon Master - Docker Setup"
echo "=========================================="

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check for Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data logs backups config

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your credentials before proceeding!"
    echo "   Required: DISCORD_TOKEN, CLIENT_ID, GUILD_ID, OPENAI_API_KEY"
    exit 1
fi

# Validate required environment variables
echo "🔍 Validating environment variables..."
source .env
required_vars=("DISCORD_TOKEN" "CLIENT_ID" "GUILD_ID" "OPENAI_API_KEY")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        echo "   Please edit .env file and set all required variables."
        exit 1
    fi
done

# Build Docker image
echo "🔨 Building Docker image..."
docker-compose build

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for bot to be ready
echo "⏳ Waiting for bot to initialize..."
sleep 10

# Check health
echo "🏥 Checking bot health..."
if docker-compose exec discord-dm-bot node src/healthcheck.js; then
    echo "✅ Bot is healthy!"
else
    echo "❌ Bot health check failed. Check logs with: docker-compose logs discord-dm-bot"
    exit 1
fi

# Deploy commands
echo "📤 Deploying Discord commands..."
docker-compose exec discord-dm-bot node src/deploy-commands.js

echo ""
echo "✨ Setup complete! Your Discord AI Dungeon Master is ready."
echo ""
echo "📋 Useful commands:"
echo "   View logs:         docker-compose logs -f discord-dm-bot"
echo "   Stop bot:          docker-compose down"
echo "   Restart bot:       docker-compose restart discord-dm-bot"
echo "   Update bot:        git pull && docker-compose build && docker-compose up -d"
echo ""
echo "🎮 Invite your bot to Discord and start playing!"