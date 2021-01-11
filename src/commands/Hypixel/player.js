const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const hypixel = require('../../Hypixel');
const moment = require('moment');
const User = require('../../structures/models/User');
const { minigames } = require('../../constants');
const { Player } = require('hypixel-api-reborn');
require('moment-duration-format');

class PlayerCommand extends Command {
  constructor () {
    super('player', {
      aliases: ['player', 'hypixelplayer', 'p'],
      description: {
        content: 'Player\'s general stats or minigame stats',
        usage: 'player [nickname|uuid|@User] [minigame]',
        examples: [
          'player StavZDev duel',
          'player Minikloon',
          'player 709c585ef0194127b08f88ce44bfd158'
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
          match: 'content',
          type: (message, phrase) => {
            return phrase.split(/ +/)[1] || null;
          }
        },
        {
          id: 'compact',
          match: 'flag',
          flag: '-c'
        }
      ]
    });
    this.utils = {
      rankColors: {
        Default: '',
        VIP: 'https://dummyimage.com/32/00ff00/00ff00.png',
        MVP: 'https://dummyimage.com/32/00ffff/00ffff.png',
        'MVP++': 'https://dummyimage.com/32/ffaa00/ffaa00.png',
        Helper: 'https://dummyimage.com/32/5555FF/5555FF.png',
        Admin: 'https://dummyimage.com/32/AA0000/AA0000.png',
        Moderator: 'https://dummyimage.com/32/00AA00/00AA00.png',
        OWNER: 'https://dummyimage.com/32/AA0000/AA0000.png'
      }
    };
  }

  /**
   *
   * @param {Message} message
   * @param {{player:string,minigame:string,compact:boolean}} args
   */
  async exec (message, args) {
    const user = await User.findOne({ id: message.author.id });
    if (!user && !args.player) return message.reply('I need player nickname.');
    if (user && !args.player) args.player = user.uuid;
    let minigame;
    if (args.minigame) {
      minigame = minigames.find(m => m.aliases.includes(args.minigame.toLowerCase()));
      if (!minigame) return message.channel.send({ embed: { color: this.client.color, description: `List of available minigames:\n${minigames.map(m => m.aliases.sort((a, b) => b.length - a.length).map(a => `**${a}**`).join(', ')).join('\n')}\nUsage: \`${this.handler.prefix}${this.id} StavZDev ${minigames[Math.floor(Math.random() * (minigames.length - 1))].name}\`` } });
    }
    hypixel.getPlayer(args.player, { guild: true }).then(async player => {
      if (args.minigame) {
        this[minigame.name](message, player);
        return;
      }
      if (args.compact) {
        const embedCompact = new MessageEmbed()
          .setColor(this.client.color)
          .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname}`, this.utils.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.uuid}`)
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
        .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname}`, this.utils.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.uuid}`)
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

  /**
   * @param {Message} message
   * @param {Player} player
   */
  skywars (message, player) {
    if (!player.stats || !player.stats.skywars) return message.channel.send({ embed: { color: this.client.color, description: 'Player has no stats' } });
    const stats = player.stats.skywars;
    function generateStats (mode, client) {
      if (!mode) {
        return `Coins: \`${stats.coins.toLocaleString()}\`\nKills: \`${stats.kills.toLocaleString()}\`\nDeaths: \`${stats.deaths.toLocaleString()}\`\nWins: \`${stats.wins.toLocaleString()}\`\nLosses: \`${stats.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.KDRatio}\`\nWin/Loss ratio: \`${stats.WLRatio}\``;
      }
      const s = client.utils.getFromObject(stats, mode);
      return `Kills: \`${s.kills.toLocaleString()}\`\nDeaths: \`${s.deaths.toLocaleString()}\`\nWins: \`${s.wins.toLocaleString()}\`\nLosses: \`${s.losses.toLocaleString()}\`\nKill/Death ratio: \`${s.KDRatio}\`\nWin/Loss ratio: \`${s.WLRatio}\`${s.playedGames ? `\nPlayed games: \`${s.playedGames}\`` : ''}`;
    }
    const overall = new MessageEmbed()
      .setColor(this.client.color)
      .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
      .setAuthor(`[${stats.levelFormatted}] ${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | SkyWars`, this.utils.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#${this.skywars.name}`)
      .addField('Overall', generateStats(), true)
      .addField('Solo', generateStats('solo.overall', this.client), true)
      .addField('Team', generateStats('team.overall', this.client), true)
      .addField('Ranked', generateStats('ranked', this.client), true)
      .addField('Mega', generateStats('mega.overall', this.client), true)
      .addField('Lab', generateStats('lab', this.client), true);
    const soloTeam = new MessageEmbed()
      .setColor(this.client.color)
      .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
      .setAuthor(`[${stats.levelFormatted}] ${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | SkyWars`, this.utils.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#${this.skywars.name}`)
      .addField('Solo Normal', generateStats('solo.normal', this.client), true)
      .addField('Solo Insane', generateStats('solo.insane', this.client), true)
      .addField('\u200b', '\u200b', true)
      .addField('Team Normal', generateStats('team.normal', this.client), true)
      .addField('Team Insane', generateStats('team.insane', this.client), true)
      .addField('\u200b', '\u200b', true);
    return this.client.embedPages.render(message, [overall, soloTeam]);
  }

  /**
   * @param {Message} message
   * @param {Player} player
   */
  bedwars (message, player) {
    if (!player.stats || !player.stats.bedwars) return message.channel.send({ embed: { color: this.client.color, description: 'Player has no stats' } });
    const stats = player.stats.bedwars;
    function generateStats (mode) {
      if (!mode) {
        return `Coins: \`${stats.coins.toLocaleString()}\`\nPrestige: \`${stats.prestige}\`\nKills: \`${stats.kills.toLocaleString()}\`\nDeaths: \`${stats.deaths.toLocaleString()}\`\nWins: \`${stats.wins.toLocaleString()}\`\nLosses: \`${stats.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.KDRatio}\`\nWin/Loss ratio: \`${stats.WLRatio}\`\nFinal Kill/Death ratio: \`${stats.finalKDRatio}\``;
      }
      return `Kills: \`${stats[mode].kills.toLocaleString()}\`\nDeaths: \`${stats[mode].deaths.toLocaleString()}\`\nWins: \`${stats[mode].wins.toLocaleString()}\`\nLosses: \`${stats[mode].losses.toLocaleString()}\`\nKill/Death ratio: \`${stats[mode].KDRatio}\`\nWin/Loss ratio: \`${stats[mode].WLRatio}\`\nPlayed games: \`${stats[mode].playedGames}\`\nFinal Kill/Death ratio: \`${stats[mode].finalKDRatio}\``;
    }
    const embed = new MessageEmbed()
      .setColor(this.client.color)
      .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
      .setAuthor(`[${stats.level}] ${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | BedWars`, this.utils.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#${this.bedwars.name}`)
      .addField('Overall', generateStats(), true)
      .addField('Solo', generateStats('solo'), true)
      .addField('Doubles', generateStats('doubles'), true)
      .addField('3v3v3v3', generateStats('threes'), true)
      .addField('4v4v4v4', generateStats('fours'), true)
      .addField('4v4', generateStats('4v4'), true);
    message.channel.send(embed);
  }

  /**
   * @param {Message} message
   * @param {Player} player
   */
  duels (message, player) {
    const embedPages = new (require('../../structures/client/EmbedPagesRenderer'))(this.client);
    if (!player.stats || !player.stats.duels) return message.channel.send({ embed: { color: this.client.color, description: 'Player has no stats' } });
    const stats = player.stats.duels;
    function generateStats (mode, client) {
      if (!mode) {
        return `${stats.title ? `Title: \`${stats.title}\`\n` : ''}Coins: \`${stats.coins.toLocaleString()}\`\nKills: \`${stats.kills.toLocaleString()}\`\nDeaths: \`${stats.deaths.toLocaleString()}\`\nWins: \`${stats.wins.toLocaleString()}\`\nLosses: \`${stats.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.KDRatio}\`\nWin/Loss ratio: \`${stats.WLRatio}\``;
      }
      const s = client.utils.getFromObject(stats, mode);
      return `Winstreak: \`${s.winstreak.toLocaleString()}\`\nKills: \`${s.kills.toLocaleString()}\`\nDeaths: \`${s.deaths.toLocaleString()}\`\nWins: \`${s.wins.toLocaleString()}\`\nLosses: \`${s.losses.toLocaleString()}\`\nKill/Death ratio: \`${s.KDRatio}\`\nWin/Loss ratio: \`${s.WLRatio}\`\nPlayed games: \`${s.playedGames}\``;
    }
    const overall = new MessageEmbed()
      .setColor(this.client.color)
      .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
      .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | Duels`, this.utils.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#${this.duels.name}`)
      .addField('Overall', generateStats(), true)
      .addField('Blitz Duel', generateStats('blitz', this.client), true)
      .addField('Bow Duel', generateStats('bow', this.client), true)
      .addField('Classic Duel', generateStats('classic', this.client), true)
      .addField('Combo Duel', generateStats('combo', this.client), true)
      .addField('Sumo Duel', generateStats('sumo', this.client), true)
      .addField('Megawalls Duel', generateStats('megawalls', this.client), true)
      .addField('Blitz Duel', generateStats('blitz', this.client), true)
      .addField('Nodebuff Duel', generateStats('nodebuff', this.client), true);
    const op = new MessageEmbed()
      .setColor(this.client.color)
      .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
      .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | OP Duels`, this.utils.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#${this.duels.name}`)
      .addField('Overall', generateStats('op.overall', this.client), true)
      .addField('1v1', generateStats('op.1v1', this.client), true)
      .addField('2v2', generateStats('op.2v2', this.client), true);
    const bridge = new MessageEmbed()
      .setColor(this.client.color)
      .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
      .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | The Bridge Duels`, this.utils.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#${this.duels.name}`)
      .addField('Overall', generateStats('bridge.overall', this.client), true)
      .addField('1v1', generateStats('bridge.1v1', this.client), true)
      .addField('\u200b', '\u200b', true)
      .addField('2v2', generateStats('bridge.2v2', this.client), true)
      .addField('4v4', generateStats('bridge.4v4', this.client), true)
      .addField('\u200b', '\u200b', true);
    const uhc = new MessageEmbed()
      .setColor(this.client.color)
      .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
      .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | UHC Duels`, this.utils.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#${this.duels.name}`)
      .addField('Overall', generateStats('uhc.overall', this.client), true)
      .addField('1v1', generateStats('uhc.1v1', this.client), true)
      .addField('\u200b', '\u200b', true)
      .addField('2v2', generateStats('uhc.2v2', this.client), true)
      .addField('4v4', generateStats('uhc.4v4', this.client), true)
      .addField('\u200b', '\u200b', true);
    const skywars = new MessageEmbed()
      .setColor(this.client.color)
      .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
      .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | SkyWars Duels`, this.utils.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#${this.duels.name}`)
      .addField('Overall', generateStats('skywars.overall', this.client), true)
      .addField('1v1', generateStats('skywars.1v1', this.client), true)
      .addField('2v2', generateStats('skywars.2v2', this.client), true);
    embedPages.render(message, [overall, op, bridge, uhc, skywars]);
  }

  /**
   * @param {Message} message
   * @param {Player} player
   */
  murdermystery (message, player) {
    if (!player.stats || !player.stats.murdermystery) return message.channel.send({ embed: { color: this.client.color, description: 'Player has no stats' } });
    const stats = player.stats.murdermystery;
    const murdermystery = new MessageEmbed()
      .setColor(this.client.color)
      .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
      .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | Murder Mystery`, this.utils.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#${this.duels.name}`)
      .addField('Overall', `Kills: \`${stats.kills.toLocaleString()}\`\nDeaths: \`${stats.deaths.toLocaleString()}\`\nWins: \`${stats.wins.toLocaleString()}\`\nKill/Death ratio: \`${stats.KDRatio}\`\nWin as Murderer: \`${stats.winsAsMurderer.toLocaleString()}\`\nWin as Detective: \`${stats.winsAsDetective.toLocaleString()}\`\nPlayed games: \`${stats.playedGames}\``, true)
      .addField('Double Up', `Kills: \`${stats.doubleUp.kills.toLocaleString()}\`\nDeaths: \`${stats.doubleUp.deaths.toLocaleString()}\`\nWins: \`${stats.doubleUp.wins.toLocaleString()}\`\nKill/Death ratio: \`${stats.doubleUp.KDRatio}\`\nPlayed games: \`${stats.doubleUp.playedGames}\``, true)
      .addField('Infection', `Kills: \`${stats.infection.kills.toLocaleString()}\`\nDeaths: \`${stats.infection.deaths.toLocaleString()}\`\nWins: \`${stats.infection.wins.toLocaleString()}\`\nKill/Death ratio: \`${stats.infection.KDRatio}\`\nPlayed games: \`${stats.infection.playedGames}\``, true);
    message.channel.send(murdermystery);
  }
}
module.exports = PlayerCommand;
