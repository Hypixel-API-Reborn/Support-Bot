const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const hypixel = require('../../Hypixel');
const moment = require('moment');
require('moment-duration-format');

class PlayerCommand extends Command {
  constructor () {
    super('player', {
      aliases: ['player', 'hypixelplayer', 'p'],
      description: {
        content: 'Player\'s general stats or minigame stats',
        usage: 'player [nickname|uuid|@User] [-c] [-m minigame]',
        examples: [
          'player StavZDev -m duels',
          'player Minikloon -c',
          'player 709c585ef0194127b08f88ce44bfd158',
          'player StavZDev -m skywars',
          'player StavZDev -m bw',
          'player StavZDev -m murdermystery'
        ]
      },
      args: [
        {
          id: 'player',
          type: (message, phrase) => {
            if (phrase.match(/^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/gmi) || phrase.match(/^[a-z0-9]{32}/gmi)) {
              return phrase;
            }
            if (phrase.length > 16) return null;
            return phrase;
          }
        },
        {
          id: 'minigame',
          match: 'option',
          flag: '-m'
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
 * @param {{player:string,minigame:string,compact:boolean}} args
 */
  async exec (message, args) {
    const { minigames } = this.client.utils.constants;
    const user = await this.client.getUser(message, args);
    if (!user) return message.reply('I need a player nickname');
    args.player = user;
    let minigame;
    if (args.minigame) {
      minigame = minigames.find((m) => m.aliases.includes(args.minigame.toLowerCase()));
      return this.client.commandHandler.runCommand(message, this.client.commandHandler.findCommand(minigame.name), [args.player]);
    }
    hypixel.getPlayer(args.player, { guild: true }).then(async (player) => {
      if (args.compact) {
        const embedCompact = new MessageEmbed()
          .setColor(this.client.color)
          .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}] ` : ''}${player.nickname}`, this.client.utils.constants.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.uuid}`)
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
        .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname}`, this.client.utils.constants.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.uuid}`)
        .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
        .addField('Level', `\`${player.level}\``, true);
      if (player.guild) {
        embed.addField('Guild', `[${player.guild.name}${player.guild.tag ? ` [${player.guild.tag}]` : ''}](${encodeURI(`https://plancke.io/hypixel/guild/name/${player.guild.name}`)})`, true)
          .addField('\u200B', '\u200B', true);
      }
      embed.addField('Karma', `\`${player.karma.toLocaleString()}\``, true)
        .addField('Achievement points', `\`${player.achievementPoints.toLocaleString()}\``, true)
        .addField('Social Media', `${player.socialMedia.length ? player.socialMedia.map((m) => `${m.name} - ${m.link.startsWith('http') ? `[click](${m.link})` : `\`${m.link}\``}`).join('\n') : '`None`'}`);
      if (player.isOnline && moment.isDate(player.lastLogin)) {
        const elapsed = moment.duration(Date.now() - player.lastLoginTimestamp).format('D[d] H[h] m[m] s[s]');
        embed.addField('Network status', `\`Online\` (for \`${elapsed}\`)`);
      } else if (!player.isOnline && moment.isDate(player.lastLogin)) {
        embed.addField('Last Login', `\`${moment(player.lastLoginTimestamp).fromNow()}\``);
      }
      message.channel.send(embed);
    }).catch((e) => {
      return message.reply(`Error: \`${e}\``);
    });
  }
}
module.exports = PlayerCommand;
