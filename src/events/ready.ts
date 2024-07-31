import CheckPermits from '../functions/CheckPermits';
import DeployEvents from '../functions/DeployEvents';
import { eventMessage } from '../functions/logger';
import { connectDB } from '../functions/mongo';
import { Client } from 'discord.js';
import cron from 'node-cron';
export function execute(client: Client): void {
  try {
    eventMessage(`Logged in as ${client.user?.username} (${client.user?.id})!`);
    DeployEvents(client);
    connectDB();
    cron.schedule(`* * * * *`, () => CheckPermits(client));
  } catch (error) {
    console.log(error);
  }
}
