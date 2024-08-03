import { ChannelType, GuildMemberRoleManager, Message, TextChannel, Webhook, WebhookType } from 'discord.js';
import { DiscordInviteRegex, HypixelAPIKeyRegex, IPAddressPattern, URLRegex } from '../utils/regex';
import { getAllowedDomains, getAntiLinkState } from '../utils/mongo';
import { autoModBypassRole } from '../../config.json';
import DiscordManager from '../DiscordManager';
import Infraction from '../utils/Infraction';

class MessageHandler {
  discord: DiscordManager;
  allowedDomains?: string[];
  constructor(discordManager: DiscordManager) {
    this.discord = discordManager;
    this.updateAllowedDomains();
  }

  async updateAllowedDomains() {
    this.allowedDomains = await getAllowedDomains();
  }

  async onMessage(message: Message) {
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
    this.updateAllowedDomains();
    const hypixelKeyTest = HypixelAPIKeyRegex.test(message.content);
    const ipTest = IPAddressPattern.test(message.content);
    const urlTest = this.isUrlAllowed(message.content);
    const discordTest = DiscordInviteRegex.test(message.content);
    const webhook = await this.getWebhook(message.channel);
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
    } else if (ipTest || !urlTest || discordTest) {
      const status = await getAntiLinkState();
      if (false === status) return;
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
  }

  async getWebhook(
    channel: TextChannel
  ): Promise<Webhook<WebhookType.ChannelFollower | WebhookType.Incoming> | undefined> {
    const webhooks = await channel.fetchWebhooks();

    if (0 === webhooks.size) {
      channel.createWebhook({
        name: channel.client.user.globalName ?? channel.client.user.username,
        avatar: channel.client.user.avatarURL()
      });

      await this.getWebhook(channel);
    }

    return webhooks.first();
  }

  isUrlAllowed(url: string): boolean {
    if (!this.allowedDomains) return false;
    const isValidUrl = URLRegex.test(url);
    if (!isValidUrl) return false;
    const match = url.match(URLRegex);
    if (!match) return false;
    const domain: string = match[3];
    if (this.allowedDomains.some((pattern) => pattern === domain) && !match[2]) {
      return true;
    } else if (!this.allowedDomains.some((pattern) => pattern === domain)) {
      return (
        this.allowedDomains.some((pattern) => pattern === `*.${domain}`) ||
        this.allowedDomains.some((pattern) => pattern === match[2] + domain)
      );
    }
    return false;
  }
}

export default MessageHandler;
