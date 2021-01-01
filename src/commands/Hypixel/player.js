const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const Hypixel = require('hypixel-api-reborn');
const moment = require('moment');
const User = require('../../structures/models/User');
require('moment-duration-format');

class PlayerCommand extends Command {
  constructor () {
    super('player', {
      aliases: ['player', 'hypixelplayer'],
      args: [
        {
          id: 'player',
          type: (message, phrase) => {
            if (phrase.length > 16) return null;
            return phrase;
          }
        },
        {
          id: 'compact',
          match: 'flag',
          flag: '-c'
        }
      ]
    });
  }

  /**
   *
   * @param {Message} message
   * @param {{player:string, compact:boolean}} args
   */
  async exec (message, args) {
    const hypixel = new Hypixel.Client(this.client.config.HYPIXEL_KEY, { cache: true });
    const user = await User.findOne({ id: message.author.id });
    if (!user && !args.player) return message.reply('I need player nickname.');
    if (user && !args.player) args.player = user.uuid;
    hypixel.getPlayer(args.player, { guild: true }).then(async player => {
      if (args.compact) {
        const embedCompact = new MessageEmbed()
          .setColor(this.client.color)
          .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname}`, `https://visage.surgeplay.com/face/64/${player.uuid}`, `https://plancke.io/hypixel/player/stats/${player.uuid}`)
          .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
          .addField('Level', `\`${player.level}\``, true);
        if (player.guild) {
          embedCompact.addField('Guild', `[${player.guild.name}${player.guild.tag ? ` [${player.guild.tag}]` : ''}](${encodeURI(`https://plancke.io/hypixel/guild/name/${player.guild.name}`)})`, true);
        }
        if (player.isOnline && moment.isDate(player.lastLogin)) {
          const elapsed = moment.duration(Date.now() - player.lastLogin).format('D[d] H[h] m[m] s[s]');
          embedCompact.addField('Network status', `\`Online\` (for \`${elapsed}\`)`, true);
        } else if (!player.isOnline && moment.isDate(player.lastLogin)) {
          embedCompact.addField('Last Login', `\`${moment(player.lastLogin).fromNow()}\``, true);
        }
        return message.channel.send(embedCompact);
      }
      const embed = new MessageEmbed()
        .setColor(this.client.color)
        .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname}`, `https://visage.surgeplay.com/face/64/${player.uuid}`, `https://plancke.io/hypixel/player/stats/${player.uuid}`)
        .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
        .addField('Level', `\`${player.level}\``, true);
      if (player.guild) {
        embed.addField('Guild', `[${player.guild.name}${player.guild.tag ? ` [${player.guild.tag}]` : ''}](${encodeURI(`https://plancke.io/hypixel/guild/name/${player.guild.name}`)})`, true)
          .addField('\u200B', '\u200B', true);
      }
      embed.addField('Karma', `\`${player.karma.toLocaleString()}\``, true)
        .addField('Achievement points', `\`${player.achievementPoints.toLocaleString()}\``, true)
        .addField('Social Media', `${player.socialMedia.length ? player.socialMedia.map(m => `${m.name} - ${m.link.startsWith('http') ? `[click](${m.link})` : `\`${m.link}\``}`).join('\n') : '`None`'}`);
      if (player.isOnline && moment.isDate(player.lastLogin)) {
        const elapsed = moment.duration(Date.now() - player.lastLoginTimestamp).format('D[d] H[h] m[m] s[s]');
        embed.addField('Network status', `\`Online\` (for \`${elapsed}\`)`);
      } else if (!player.isOnline && moment.isDate(player.lastLogin)) {
        embed.addField('Last Login', `\`${moment(player.lastLoginTimestamp).fromNow()}\``);
      }
      message.channel.send(embed);
    });
  }
}
module.exports = PlayerCommand;
