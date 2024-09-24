import DiscordManager from '../DiscordManager';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message, MessageType, ThreadChannel } from 'discord.js';
import { bugReports } from '../../config.json';

class BugReportHandler {
  discord: DiscordManager;
  constructor(discordManager: DiscordManager) {
    this.discord = discordManager;
  }

  async onCreate(channel: ThreadChannel) {
    if (!channel.parentId || !this.checkParentId(channel.parentId)) return;
    await channel.join();
    await channel
      .send({
        content: `Hey <@${
          channel.ownerId
        }> Please provide as much information as possible to help us resolve the issue.`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel('Close')
              .setStyle(ButtonStyle.Danger)
              .setCustomId(`bugReportClose.${channel.id}`)
          )
        ]
      })
      .then((message) => message.pin());
    const messages = await channel.messages
      .fetch()
      .then((messages) =>
        messages.filter(
          (message) =>
            message.author.id === this.discord.client?.user?.id &&
            false === message.pinned &&
            message.type === MessageType.ChannelPinnedMessage &&
            true === message.system &&
            '' === message.content
        )
      );
    messages.forEach((message: Message) => message.delete());
  }

  checkParentId(parentId: string) {
    return bugReports.channelId === parentId;
  }
}

export default BugReportHandler;
