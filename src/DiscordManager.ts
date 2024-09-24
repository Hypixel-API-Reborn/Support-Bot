import {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  ApplicationIntegrationType,
  InteractionContextType
} from 'discord.js';
import InteractionHandler from './handlers/InteractionHandler';
import BugReportHandler from './handlers/BugReportHandler';
import MessageHandler from './handlers/MessageHandler';
import StateHandler from './handlers/StateHandler';
import { SlashCommand } from './types/main';
import { token, serverId } from '../config.json';
import Logger from './utils/logger';
import { existsSync, readdirSync, writeFileSync } from 'fs';

class DiscordManager {
  interactionHandler: InteractionHandler;
  bugReportHandler: BugReportHandler;
  messageHandler: MessageHandler;
  stateHandler: StateHandler;
  client?: Client;
  logger: Logger;
  constructor() {
    this.interactionHandler = new InteractionHandler(this);
    this.bugReportHandler = new BugReportHandler(this);
    this.messageHandler = new MessageHandler(this);
    this.stateHandler = new StateHandler(this);
    this.logger = new Logger();
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
    this.deployServerCommands();
    this.client.on('ready', () => this.stateHandler.onReady());
    this.client.on('messageCreate', (message) => this.messageHandler.onMessage(message));
    this.client.on('interactionCreate', (interaction) => this.interactionHandler.onInteraction(interaction));
    this.client.on('threadCreate', (channel) => this.bugReportHandler.onCreate(channel));

    this.client.login(token).catch((e) => this.logger.error(e));
    if (!existsSync('data/permit.json')) writeFileSync('data/permit.json', JSON.stringify([], null, 2));
  }

  async deployCommands(): Promise<void> {
    if (!this.client) return;
    this.client.commands = new Collection<string, SlashCommand>();
    const commandFiles = readdirSync('./src/commands/global');
    const commands = [];
    for (const file of commandFiles) {
      const command = new (await import(`./commands/global/${file}`)).default(this);
      commands.push(
        command.data
          .setContexts(
            InteractionContextType.PrivateChannel,
            InteractionContextType.BotDM,
            InteractionContextType.Guild
          )
          .setIntegrationTypes(ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall)
          .toJSON()
      );
      if (command.data.name) {
        this.client.commands.set(command.data.name, command);
      }
    }
    const rest = new REST({ version: '10' }).setToken(token);
    const clientID = Buffer.from(token.split('.')[0], 'base64').toString('ascii');
    await rest.put(Routes.applicationCommands(clientID), { body: commands });
    this.logger.discord(`Successfully reloaded ${commands.length} application command(s).`);
  }

  async deployServerCommands(): Promise<void> {
    if (!this.client) return;
    this.client.commands = new Collection<string, SlashCommand>();
    const commandFiles = readdirSync('./src/commands/server');
    const commands = [];
    for (const file of commandFiles) {
      const command = new (await import(`./commands/server/${file}`)).default(this);
      commands.push(
        command.data
          .setContexts(InteractionContextType.Guild)
          .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
          .toJSON()
      );
      if (command.data.name) {
        this.client.commands.set(command.data.name, command);
      }
    }
    const rest = new REST({ version: '10' }).setToken(token);
    const clientID = Buffer.from(token.split('.')[0], 'base64').toString('ascii');
    await rest.put(Routes.applicationGuildCommands(clientID, serverId), { body: commands });
    this.logger.discord(`Successfully reloaded ${commands.length} server command(s).`);
  }
}

export default DiscordManager;
