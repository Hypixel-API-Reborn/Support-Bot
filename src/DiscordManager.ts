import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import InteractionHandler from './handlers/InteractionHandler';
import MessageHandler from './handlers/MessageHandler';
import { token, serverId } from '../config.json';
import CheckPermits from './utils/CheckPermits';
import { SlashCommand } from './types/main';
import { connectDB } from './utils/mongo';
import { readdirSync } from 'fs';
import cron from 'node-cron';

class DiscordManager {
  interactionHandler: InteractionHandler;
  messageHandler: MessageHandler;
  client?: Client;
  constructor() {
    this.interactionHandler = new InteractionHandler(this);
    this.messageHandler = new MessageHandler(this);
  }

  connect(): void {
    this.client = new Client({
      intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds
      ]
    });

    this.deployCommands();
    this.client.on('ready', () => this.ready());
    this.client.on('messageCreate', (message) => this.messageHandler.onMessage(message));
    this.client.on('interactionCreate', (interaction) => this.interactionHandler.onInteraction(interaction));

    this.client.login(token).catch((e) => console.log(e));
  }

  async ready() {
    if (!this.client) return;
    console.log(`Logged in as ${this.client.user?.username} (${this.client.user?.id})!`);
    global.guild = await this.client.guilds.fetch(serverId);
    cron.schedule(`* * * * *`, () => CheckPermits());
    connectDB();
  }

  async deployCommands(): Promise<void> {
    if (!this.client) return;
    this.client.commands = new Collection<string, SlashCommand>();
    const commandFiles = readdirSync('./src/commands');
    const commands = [];
    for (const file of commandFiles) {
      const command = await import(`./commands/${file}`);
      commands.push(command.data.toJSON());
      if (command.data.name) {
        this.client.commands.set(command.data.name, command);
      }
    }
    const rest = new REST({ version: '10' }).setToken(token);
    const clientID = Buffer.from(token.split('.')[0], 'base64').toString('ascii');
    await rest.put(Routes.applicationCommands(clientID), { body: commands });
    console.log(`Successfully reloaded ${commands.length} application command(s).`);
  }
}

export default DiscordManager;
