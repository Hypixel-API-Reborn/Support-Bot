import { Client, Events, GatewayIntentBits } from 'discord.js';
import DeployCommands from './src/functions/DeployCommands';
import { execute } from './src/events/ready';
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
  execute(client);
});

client.login(token);
