import CheckPermits from '../functions/CheckPermits';
import DeployEvents from '../functions/DeployEvents';
import { eventMessage } from '../functions/logger';
import { connectDB } from '../functions/mongo';
import { serverId } from '../../config.json';
import { Client } from 'discord.js';
import cron from 'node-cron';
export async function execute(client: Client): Promise<void> {
  try {
    eventMessage(`Logged in as ${client.user?.username} (${client.user?.id})!`);
    DeployEvents(client);
    connectDB();
    global.guild = await client.guilds.fetch(serverId);
    cron.schedule(`* * * * *`, () => CheckPermits());
  } catch (error) {
    console.log(error);
  }
}
