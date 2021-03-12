const { Command } = require('discord-akairo');
const hypixel = require('../../Hypixel');
const User = require('../../structures/models/User');
const moment = require('moment');
require('moment-duration-format');
const { MessageEmbed, Message } = require('discord.js');

class StatusCommand extends Command {
  constructor () {
    super('status', {
      aliases: ['status'],
      description: {
        content: 'Player\'s network status',
        usage: 'status [player|uuid|@User]',
        examples: [
          'status StavZDev'
        ]
      },
      args: [
        {
          id: 'player',
          type: (message, phrase) => {
            if (/^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/gmi.test(phrase) || /^[a-z0-9]{32}/gmi.test(phrase)) {
              return phrase;
            }
            if (phrase.length > 16) return null;
            return phrase;
          }
        }
      ]
    });
  }

  /**
   *
   * @param {Message} message
   * @param {{player:string}} args
   */
  async exec (message, args) {
    const user = await User.findOne({ id: message.author.id });
    if (!user && !args.player) return message.reply('I need player nickname.');
    if (user && !args.player) args.player = user.uuid;
    hypixel.getStatus(args.player).then(async (status) => {
      const player = await hypixel.getPlayer(args.player, { noCaching: true });
      const embed = new MessageEmbed()
        .setColor(this.client.color)
        .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname}`, `https://visage.surgeplay.com/face/64/${player.uuid}`);
      if (!status.online) {
        embed.setDescription(`**Player is offline**\nLast login: \`${player.lastLoginTimestamp ? moment(player.lastLoginTimestamp).fromNow() : 'unknown'}\``);
        return message.channel.send(embed);
      }
      embed.setDescription(`**Player is online for ${moment.duration(Date.now() - player.lastLogin).format('D[d] H[h] m[m] s[s]')}**\nGame: \`${status.game.toString()}\`\nMode: \`${status.mode}\`${status.map ? `\nMap: \`${status.map}\`` : ''}`);
      message.channel.send(embed);
    }).catch((e) => {
      return message.reply(`Error: \`${e}\``);
    });
  }
}
module.exports = StatusCommand;
