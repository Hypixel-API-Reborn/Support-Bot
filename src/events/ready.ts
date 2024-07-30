import deployEvents from '../functions/deployEvents';
import { eventMessage } from '../functions/logger';
import { connectDB } from '../functions/mongo';
import { Client } from 'discord.js';

export function execute(client: Client): void {
  try {
    eventMessage(`Logged in as ${client.user?.username} (${client.user?.id})!`);
    deployEvents(client);
    connectDB();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
}
