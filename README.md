# Discord AI Dungeon Master 🎲

An AI-powered Dungeon Master bot for Discord that brings D&D 5e campaigns to life with dynamic storytelling, automated dice rolling, and voice interaction capabilities.

## Features ✨

- **AI-Powered Narration**: Dynamic story generation using GPT-4
- **Dice Rolling System**: Full notation support with advantage/disadvantage
- **Campaign Management**: Create and manage multiple D&D campaigns
- **NPC Generation**: AI-generated NPCs with personalities and backstories
- **Voice Integration**: Listen and respond to player voice commands (optional)
- **Persistent Memory**: Maintains campaign history and context
- **Interactive UI**: Buttons and menus for quick actions

## Quick Start 🚀

### Prerequisites
- Node.js 18+ (for local development)
- Docker & Docker Compose (for deployment)
- Discord Bot Token ([create one here](https://discord.com/developers/applications))
- OpenAI API Key ([get one here](https://platform.openai.com/api-keys))

### Docker Deployment (Recommended)

1. **Clone and configure**:
   ```bash
   git clone <repository-url>
   cd discord-dm-bot
   cp .env.example .env
   # Edit .env with your tokens
   ```

2. **Run setup script**:
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. **Invite bot to your server**:
   ```
   https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
   ```

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env file
   ```

3. **Start the bot**:
   ```bash
   npm run dev
   ```

4. **Deploy commands**:
   ```bash
   npm run deploy-commands
   ```

## Commands 📝

### Campaign Management
- `/campaign create <name> [setting]` - Start a new campaign
- `/campaign info` - View current campaign details
- `/campaign end` - End the active campaign

### AI Dungeon Master
- `/dm describe <location> [atmosphere]` - Generate scene descriptions
- `/dm npc <description>` - Create an NPC with personality
- `/dm narrate <action>` - Narrate player actions with AI

### Dice Rolling
- `/roll <dice> [reason] [type]` - Roll dice (e.g., `/roll 2d6+3`)
  - Supports advantage/disadvantage
  - Multiple dice notation
  - Quick roll buttons for combat

### Utility
- `/ping` - Check bot latency

## Configuration ⚙️

### Required Environment Variables
```env
# Discord
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_test_server_id

# AI Service
OPENAI_API_KEY=your_api_key
AI_MODEL=gpt-4-turbo-preview

# Optional
ENABLE_VOICE=false
DATABASE_PATH=./data/dmbot.db
```

### Optional Features
- **Voice Commands**: Set `ENABLE_VOICE=true` and install additional dependencies
- **Custom AI Models**: Change `AI_MODEL` to use different GPT versions
- **Web Dashboard**: Coming soon!

## Architecture 🏗️

```
discord-dm-bot/
├── src/
│   ├── commands/       # Slash commands
│   ├── events/         # Discord event handlers
│   ├── models/         # Database models
│   ├── services/       # AI and database services
│   └── utils/          # Helper functions
├── data/              # SQLite database
├── logs/              # Application logs
└── docker-compose.yml # Container orchestration
```

## Database Schema 📊

- **Campaigns**: Active game sessions
- **GameSessions**: Story history and context
- **Characters**: Player character sheets (coming soon)
- **Inventory**: Items and equipment (coming soon)

## Deployment Options 🚢

### Self-Hosted (Docker)
- Complete setup in 5 minutes
- Automatic backups included
- Resource limits configured
- See [DEPLOYMENT.md](DEPLOYMENT.md) for details

### Cloud Platforms
- **Small Scale** (1-10 servers): $10-20/month
- **Medium Scale** (10-100 servers): $50-100/month
- **Large Scale** (100+ servers): $200+/month

## Development 💻

### Project Structure
- Built with Discord.js v14
- ES6 modules
- SQLite with Sequelize ORM
- Winston logging
- Docker containerization

### Adding New Commands
1. Create file in `src/commands/`
2. Export `data` (SlashCommandBuilder) and `execute` function
3. Commands auto-load on startup

### Contributing
1. Fork the repository
2. Create feature branch
3. Make your changes
4. Submit pull request

## Roadmap 🗺️

- [ ] Character sheet management
- [ ] Combat tracker with initiative
- [ ] Inventory system
- [ ] Spell/ability tracking
- [ ] Web dashboard
- [ ] Multi-language support
- [ ] Integration with D&D Beyond
- [ ] Advanced voice features
- [ ] Campaign templates

## Troubleshooting 🔧

### Bot not responding
- Check bot token in `.env`
- Verify bot has proper permissions
- Run `/deploy-commands` to register slash commands

### AI features not working
- Verify OpenAI API key
- Check API usage limits
- Review logs: `docker-compose logs discord-dm-bot`

### Database issues
- Ensure `data/` directory has write permissions
- Check disk space
- Backup regularly

## Support 💬

- **Documentation**: See [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- **Issues**: Create a GitHub issue
- **Discord**: Join our support server (coming soon)

## License 📄

MIT License - see LICENSE file for details

## Acknowledgments 🙏

- Built with [Discord.js](https://discord.js.org/)
- Powered by [OpenAI GPT-4](https://openai.com/)
- Inspired by tabletop RPG communities everywhere

---

*Roll for initiative and let the adventure begin!* 🐉