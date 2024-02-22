import { errorMessage, eventMessage } from '../functions/logger';
import { deployEvents } from '../functions/deployEvents';
import { Client } from 'discord.js';
import { connectDB } from '../functions/mongo';

export const execute = (client: Client) => {
  try {
    eventMessage(`Logged in as ${client.user?.username} (${client.user?.id})!`);
    deployEvents(client);
    connectDB();
  } catch (error: any) {
    errorMessage(error);
  }
};
