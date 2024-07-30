import { serverId, autoModBypassRole } from '../../config.json';
import { readFileSync, writeFileSync } from 'fs';
import { Permit } from '../commands/automod';
import { Client } from 'discord.js';

export default async function CheckPermits(client: Client) {
  const guild = await client.guilds.fetch(serverId);
  const permitData = readFileSync('data/permit.json');
  if (!permitData) return;
  const permit = JSON.parse(permitData.toString());
  if (!permit) return;

  const currentTime = Math.floor(new Date().getTime() / 1000);
  permit.forEach((user: Permit) => {
    if (user.removeTime < currentTime) {
      const guildMember = guild.members.cache.get(user.id);
      if (guildMember) {
        guildMember.roles.remove(autoModBypassRole);
      }
      permit.splice(permit.indexOf(user), 1);
    }
  });

  writeFileSync('data/permit.json', JSON.stringify(permit));
}
