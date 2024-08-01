import { Client, Events, GatewayIntentBits } from 'discord.js';
import DeployCommands from './src/utils/DeployCommands';
import ready from './src/events/ready';
import { token } from './config.json';

const client: Client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.Guilds
  ]
});

DeployCommands(client);

client.on(Events.ClientReady, () => {
  ready(client);
});

client.login(token);
