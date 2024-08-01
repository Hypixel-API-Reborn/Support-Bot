import CheckPermits from '../utils/CheckPermits';
import DeployEvents from '../utils/DeployEvents';
import { eventMessage } from '../utils/logger';
import { connectDB } from '../utils/mongo';
import { serverId } from '../../config.json';
import { Client } from 'discord.js';
import cron from 'node-cron';

export default async function (client: Client): Promise<void> {
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
