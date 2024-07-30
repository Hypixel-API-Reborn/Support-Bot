import { Client, Collection, REST, Routes } from 'discord.js';
import { eventMessage, errorMessage } from './logger';
import { SlashCommand } from '../types/main';
import { token } from '../../config.json';
import { readdirSync } from 'fs';

export default async function (client: Client): Promise<void> {
  try {
    client.commands = new Collection<string, SlashCommand>();
    const commandFiles = readdirSync('./src/commands');
    const commands = [];
    for (const file of commandFiles) {
      const command = await import(`../commands/${file}`);
      commands.push(command.data.toJSON());
      if (command.data.name) {
        client.commands.set(command.data.name, command);
      }
    }
    const rest = new REST({ version: '10' }).setToken(token);
    (async () => {
      try {
        const clientID = Buffer.from(token.split('.')[0], 'base64').toString('ascii');
        await rest.put(Routes.applicationCommands(clientID), { body: commands });
        eventMessage(`Successfully reloaded ${commands.length} application command(s).`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        errorMessage(error);
      }
    })();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorMessage(error);
  }
}
