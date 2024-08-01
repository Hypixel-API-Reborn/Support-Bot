import { ChannelType, GuildMemberRoleManager, Message, TextChannel, Webhook, WebhookType } from 'discord.js';
import { HypixelAPIKeyRegex, IPAddressPattern, URLRegex, DiscordInviteRegex } from '../utils/regex';
import { autoModBypassRole } from '../../config.json';
import Infraction from '../utils/Infraction';

const allowedDomains: string[] = [
  'hypixel.net',
  '*.hypixel.net',
  'discord.com',
  '*.discord.com',
  'kath.lol',
  '*.kathund.wtf',
  'kathund.wtf',
  'hypixel-api-reborn.github.io'
];

function matchWildcard(domain: string, pattern: string): boolean {
  const regexPattern = pattern.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(domain);
}

function isUrlAllowed(url: string): boolean {
  const isValidUrl = URLRegex.test(url);
  if (!isValidUrl) return false;
  const match = url.match(URLRegex);
  const domain = match ? match[2] : null;
  if (!domain) return false;
  return !allowedDomains.some((pattern) => matchWildcard(domain, pattern));
}

async function getWebhook(
  channel: TextChannel
): Promise<Webhook<WebhookType.ChannelFollower | WebhookType.Incoming> | undefined> {
  const webhooks = await channel.fetchWebhooks();

  if (0 === webhooks.size) {
    channel.createWebhook({
      name: channel.client.user.globalName ?? channel.client.user.username,
      avatar: channel.client.user.avatarURL()
    });

    await getWebhook(channel);
  }

  return webhooks.first();
}

export default async function (message: Message): Promise<void> {
  try {
    if (
      message.channel.type !== ChannelType.GuildText ||
      message.author.bot ||
      !message.channel ||
      !message.member ||
      !message.guild
    ) {
      return;
    }
    const memberRoles = (message.member.roles as GuildMemberRoleManager).cache.map((role) => role.id);
    if (memberRoles.includes(autoModBypassRole)) return;
    const hypixelKeyTest = HypixelAPIKeyRegex.test(message.content);
    const ipTest = IPAddressPattern.test(message.content);
    const urlTest = isUrlAllowed(message.content);
    const discordTest = DiscordInviteRegex.test(message.content);
    const webhook = await getWebhook(message.channel);
    if (!webhook) return;
    if (hypixelKeyTest) {
      const filteredContent = message.content.replace(HypixelAPIKeyRegex, '[API Key Removed]');
      webhook.send({
        username: message.member.nickname ?? message.author.globalName ?? message.author.username,
        avatarURL: message.member.avatarURL() ?? message.author.avatarURL() ?? undefined,
        content: filteredContent
      });
      const alert = await message.reply({ content: 'Hey thats your Hypixel API Key. Please dont post that' });
      message.delete();
      new Infraction({
        automatic: true,
        reason: 'Automod Pickup',
        long: null,
        type: 'AutoMod',
        user: { id: message.author.id, staff: false, bot: message.author.bot },
        staff: { id: message.client.user.id, staff: true, bot: message.client.user.bot },
        timestamp: Date.now(),
        extraInfo: `Message: ${message.content}\[Jump to Message](${message.url})`
      })
        .log()
        .save();
      setTimeout(() => alert.delete(), 10000);
    } else if (ipTest || urlTest || discordTest) {
      const filteredContent = message.content
        .replace(IPAddressPattern, '[Content Removed]')
        .replace(URLRegex, '[Content Removed]')
        .replace(DiscordInviteRegex, '[Content Removed]');
      webhook.send({
        username: message.member.nickname ?? message.author.globalName ?? message.author.username,
        avatarURL: message.member.avatarURL() ?? message.author.avatarURL() ?? undefined,
        content: filteredContent
      });
      message.delete();
      new Infraction({
        automatic: true,
        reason: 'Automod Pickup',
        long: null,
        type: 'AutoMod',
        user: { id: message.author.id, staff: false, bot: message.author.bot },
        staff: { id: message.client.user.id, staff: true, bot: message.client.user.bot },
        timestamp: Date.now(),
        extraInfo: `**Message:**\n\`\`\`\n${message.content}\n\`\`\`\n[Jump to Message](${message.url})`
      })
        .log()
        .save();
    }
  } catch (error) {
    console.log(error);
  }
}
