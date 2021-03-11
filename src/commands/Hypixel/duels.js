const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const hypixel = require('../../Hypixel');

class DuelsCommand extends Command {
  constructor () {
    super('duels', {
      aliases: ['duels'],
      description: {
        content: 'Player\'s duels stats',
        usage: 'duels [nickname|uuid|@User]',
        examples: [
          'duels StavZDev',
          'duels Minikloon',
          'duels 709c585ef0194127b08f88ce44bfd158'
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
        }
      ]
    });
  }

  /**
* @param {Message} message
* @param {{player:string}} args
*/
  async exec (message, args) {
    const user = await this.client.getUser(message, args);
    if (!user) return message.reply('I need a player nickname');
    args.player = user;
    hypixel.getPlayer(args.player).then((player) => {
      if (!player.stats || !player.stats.duels) return message.channel.send({ embed: { color: this.client.color, description: 'Player has no stats' } });
      const stats = player.stats.duels;
      const base = new MessageEmbed()
        .setColor(this.client.color)
        .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`);
      const overall = new MessageEmbed(base)
        .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | Duels`, this.client.utils.constants.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#Duels`)
        .addField('Overall', `${stats.title ? `Title: \`${stats.title}\`\n` : ''}Coins: \`${stats.coins.toLocaleString()}\`\nKills: \`${stats.kills.toLocaleString()}\`\nDeaths: \`${stats.deaths.toLocaleString()}\`\nWins: \`${stats.wins.toLocaleString()}\`\nLosses: \`${stats.losses.toLocaleString()}\`\nK/D ratio: \`${stats.KDRatio}\`\nW/L ratio: \`${stats.WLRatio}\``, true)
        .addField('Blitz Duel', `Winstreak: \`${stats.blitz.winstreak.toLocaleString()}\`\nKills: \`${stats.blitz.kills.toLocaleString()}\`\nDeaths: \`${stats.blitz.deaths.toLocaleString()}\`\nWins: \`${stats.blitz.wins.toLocaleString()}\`\nLosses: \`${stats.blitz.losses.toLocaleString()}\`\nK/D ratio: \`${stats.blitz.KDRatio}\`\nW/L ratio: \`${stats.blitz.WLRatio}\` Played games: \`${stats.blitz.playedGames}\``, true)
        .addField('Bow Duel', `Winstreak: \`${stats.bow.winstreak.toLocaleString()}\`\nKills: \`${stats.bow.kills.toLocaleString()}\`\nDeaths: \`${stats.bow.deaths.toLocaleString()}\`\nWins: \`${stats.bow.wins.toLocaleString()}\`\nLosses: \`${stats.bow.losses.toLocaleString()}\`\nK/D ratio: \`${stats.bow.KDRatio}\`\nW/L ratio: \`${stats.bow.WLRatio}\`\nPlayed games: \`${stats.bow.playedGames}\``, true)
        .addField('Classic Duel', `Winstreak: \`${stats.classic.winstreak.toLocaleString()}\`\nKills: \`${stats.classic.kills.toLocaleString()}\`\nDeaths: \`${stats.classic.deaths.toLocaleString()}\`\nWins: \`${stats.classic.wins.toLocaleString()}\`\nLosses: \`${stats.classic.losses.toLocaleString()}\`\nK/D ratio: \`${stats.classic.KDRatio}\`\nW/L ratio: \`${stats.classic.WLRatio}\`\nPlayed games: \`${stats.classic.playedGames}\``, true)
        .addField('Combo Duel', `Winstreak: \`${stats.combo.winstreak.toLocaleString()}\`\nKills: \`${stats.combo.kills.toLocaleString()}\`\nDeaths: \`${stats.combo.deaths.toLocaleString()}\`\nWins: \`${stats.combo.wins.toLocaleString()}\`\nLosses: \`${stats.combo.losses.toLocaleString()}\`\nK/D ratio: \`${stats.combo.KDRatio}\`\nW/L ratio: \`${stats.combo.WLRatio}\`\nPlayed games: \`${stats.combo.playedGames}\``, true)
        .addField('Sumo Duel', `Winstreak: \`${stats.sumo.winstreak.toLocaleString()}\`\nKills: \`${stats.sumo.kills.toLocaleString()}\`\nDeaths: \`${stats.sumo.deaths.toLocaleString()}\`\nWins: \`${stats.sumo.wins.toLocaleString()}\`\nLosses: \`${stats.sumo.losses.toLocaleString()}\`\nK/D ratio: \`${stats.sumo.KDRatio}\`\nW/L ratio: \`${stats.sumo.WLRatio}\`\nPlayed games: \`${stats.sumo.playedGames}\``, true)
        .addField('Megawalls Duel', `Winstreak: \`${stats.megawalls.winstreak.toLocaleString()}\`\nKills: \`${stats.megawalls.kills.toLocaleString()}\`\nDeaths: \`${stats.megawalls.deaths.toLocaleString()}\`\nWins: \`${stats.megawalls.wins.toLocaleString()}\`\nLosses: \`${stats.megawalls.losses.toLocaleString()}\`\nK/D ratio: \`${stats.megawalls.KDRatio}\`\nW/L ratio: \`${stats.megawalls.WLRatio}\`\nPlayed games: \`${stats.megawalls.playedGames}\``, true)
        .addField('Blitz Duel', `Winstreak: \`${stats.blitz.winstreak.toLocaleString()}\`\nKills: \`${stats.blitz.kills.toLocaleString()}\`\nDeaths: \`${stats.blitz.deaths.toLocaleString()}\`\nWins: \`${stats.blitz.wins.toLocaleString()}\`\nLosses: \`${stats.blitz.losses.toLocaleString()}\`\nK/D ratio: \`${stats.blitz.KDRatio}\`\nW/L ratio: \`${stats.blitz.WLRatio}\`\nPlayed games: \`${stats.blitz.playedGames}\``, true)
        .addField('Nodebuff Duel', `Winstreak: \`${stats.nodebuff.winstreak.toLocaleString()}\`\nKills: \`${stats.nodebuff.kills.toLocaleString()}\`\nDeaths: \`${stats.nodebuff.deaths.toLocaleString()}\`\nWins: \`${stats.nodebuff.wins.toLocaleString()}\`\nLosses: \`${stats.nodebuff.losses.toLocaleString()}\`\nK/D ratio: \`${stats.nodebuff.KDRatio}\`\nW/L ratio: \`${stats.nodebuff.WLRatio}\`\nPlayed games: \`${stats.nodebuff.playedGames}\``, true);
      const op = new MessageEmbed(base)
        .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | OP Duels`, this.client.utils.constants.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#Duels`)
        .addField('Overall', `Winstreak: \`${stats.op.overall.winstreak.toLocaleString()}\`\nKills: \`${stats.op.overall.kills.toLocaleString()}\`\nDeaths: \`${stats.op.overall.deaths.toLocaleString()}\`\nWins: \`${stats.op.overall.wins.toLocaleString()}\`\nLosses: \`${stats.op.overall.losses.toLocaleString()}\`\nK/D ratio: \`${stats.op.overall.KDRatio}\`\nW/L ratio: \`${stats.op.overall.WLRatio}\`\nPlayed games: \`${stats.op.overall.playedGames}\``, true)
        .addField('1v1', `Winstreak: \`${stats.op['1v1'].winstreak.toLocaleString()}\`\nKills: \`${stats.op['1v1'].kills.toLocaleString()}\`\nDeaths: \`${stats.op['1v1'].deaths.toLocaleString()}\`\nWins: \`${stats.op['1v1'].wins.toLocaleString()}\`\nLosses: \`${stats.op['1v1'].losses.toLocaleString()}\`\nK/D ratio: \`${stats.op['1v1'].KDRatio}\`\nW/L ratio: \`${stats.op['1v1'].WLRatio}\`\nPlayed games: \`${stats.op['1v1'].playedGames}\``, true)
        .addField('2v2', `Winstreak: \`${stats.op['2v2'].winstreak.toLocaleString()}\`\nKills: \`${stats.op['2v2'].kills.toLocaleString()}\`\nDeaths: \`${stats.op['2v2'].deaths.toLocaleString()}\`\nWins: \`${stats.op['2v2'].wins.toLocaleString()}\`\nLosses: \`${stats.op['2v2'].losses.toLocaleString()}\`\nK/D ratio: \`${stats.op['2v2'].KDRatio}\`\nW/L ratio: \`${stats.op['2v2'].WLRatio}\`\nPlayed games: \`${stats.op['2v2'].playedGames}\``, true);
      const bridge = new MessageEmbed(base)
        .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | Bridge Duels`, this.client.utils.constants.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#Duels`)
        .addField('Overall', `Winstreak: \`${stats.bridge.overall.winstreak.toLocaleString()}\`\nKills: \`${stats.bridge.overall.kills.toLocaleString()}\`\nDeaths: \`${stats.bridge.overall.deaths.toLocaleString()}\`\nWins: \`${stats.bridge.overall.wins.toLocaleString()}\`\nLosses: \`${stats.bridge.overall.losses.toLocaleString()}\`\nK/D ratio: \`${stats.bridge.overall.KDRatio}\`\nW/L ratio: \`${stats.bridge.overall.WLRatio}\`\nPlayed games: \`${stats.bridge.overall.playedGames}\``, true)
        .addField('1v1', `Winstreak: \`${stats.bridge['1v1'].winstreak.toLocaleString()}\`\nKills: \`${stats.bridge['1v1'].kills.toLocaleString()}\`\nDeaths: \`${stats.bridge['1v1'].deaths.toLocaleString()}\`\nWins: \`${stats.bridge['1v1'].wins.toLocaleString()}\`\nLosses: \`${stats.bridge['1v1'].losses.toLocaleString()}\`\nK/D ratio: \`${stats.bridge['1v1'].KDRatio}\`\nW/L ratio: \`${stats.bridge['1v1'].WLRatio}\`\nPlayed games: \`${stats.bridge['1v1'].playedGames}\``, true)
        .addField('\u200b', '\u200b', true)
        .addField('2v2', `Winstreak: \`${stats.bridge['2v2'].winstreak.toLocaleString()}\`\nKills: \`${stats.bridge['2v2'].kills.toLocaleString()}\`\nDeaths: \`${stats.bridge['2v2'].deaths.toLocaleString()}\`\nWins: \`${stats.bridge['2v2'].wins.toLocaleString()}\`\nLosses: \`${stats.bridge['2v2'].losses.toLocaleString()}\`\nK/D ratio: \`${stats.bridge['2v2'].KDRatio}\`\nW/L ratio: \`${stats.bridge['2v2'].WLRatio}\`\nPlayed games: \`${stats.bridge['2v2'].playedGames}\``, true)
        .addField('4v4', `Winstreak: \`${stats.bridge['4v4'].winstreak.toLocaleString()}\`\nKills: \`${stats.bridge['4v4'].kills.toLocaleString()}\`\nDeaths: \`${stats.bridge['4v4'].deaths.toLocaleString()}\`\nWins: \`${stats.bridge['4v4'].wins.toLocaleString()}\`\nLosses: \`${stats.bridge['4v4'].losses.toLocaleString()}\`\nK/D ratio: \`${stats.bridge['4v4'].KDRatio}\`\nW/L ratio: \`${stats.bridge['4v4'].WLRatio}\`\nPlayed games: \`${stats.bridge['4v4'].playedGames}\``, true)
        .addField('\u200b', '\u200b', true);
      const uhc = new MessageEmbed(base)
        .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | UHC Duels`, this.client.utils.constants.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#Duels`)
        .addField('Overall', `Winstreak: \`${stats.uhc.overall.winstreak.toLocaleString()}\`\nKills: \`${stats.uhc.overall.kills.toLocaleString()}\`Deaths: \`${stats.uhc.overall.deaths.toLocaleString()}\`\nWins: \`${stats.uhc.overall.wins.toLocaleString()}\`\nLosses: \`${stats.uhc.overall.losses.toLocaleString()}\`\nK/D ratio: \`${stats.uhc.overall.KDRatio}\`\nW/L ratio: \`${stats.uhc.overall.WLRatio}\`\nPlayed games: \`${stats.uhc.overall.playedGames}\``, true)
        .addField('1v1', `Winstreak: \`${stats.uhc['1v1'].winstreak.toLocaleString()}\`\nKills: \`${stats.uhc['1v1'].kills.toLocaleString()}\`\nDeaths: \`${stats.uhc['1v1'].deaths.toLocaleString()}\`\nWins: \`${stats.uhc['1v1'].wins.toLocaleString()}\`\nLosses: \`${stats.uhc['1v1'].losses.toLocaleString()}\`\nK/D ratio: \`${stats.uhc['1v1'].KDRatio}\`\nW/L ratio: \`${stats.uhc['1v1'].WLRatio}\`\nPlayed games: \`${stats.uhc['1v1'].playedGames}\``, true)
        .addField('\u200b', '\u200b', true)
        .addField('2v2', `Winstreak: \`${stats.uhc['2v2'].winstreak.toLocaleString()}\`\nKills: \`${stats.uhc['2v2'].kills.toLocaleString()}\`\nDeaths: \`${stats.uhc['2v2'].deaths.toLocaleString()}\`\nWins: \`${stats.uhc['2v2'].wins.toLocaleString()}\`\nLosses: \`${stats.uhc['2v2'].losses.toLocaleString()}\`\nK/D ratio: \`${stats.uhc['2v2'].KDRatio}\`\nW/L ratio: \`${stats.uhc['2v2'].WLRatio}\`\nPlayed games: \`${stats.uhc['2v2'].playedGames}\``, true)
        .addField('4v4', `Winstreak: \`${stats.uhc['4v4'].winstreak.toLocaleString()}\`\nKills: \`${stats.uhc['4v4'].kills.toLocaleString()}\`\nDeaths: \`${stats.uhc['4v4'].deaths.toLocaleString()}\`\nWins: \`${stats.uhc['4v4'].wins.toLocaleString()}\`\nLosses: \`${stats.uhc['4v4'].losses.toLocaleString()}\`\nK/D ratio: \`${stats.uhc['4v4'].KDRatio}\`\nW/L ratio: \`${stats.uhc['4v4'].WLRatio}\`\nPlayed games: \`${stats.uhc['4v4'].playedGames}\``, true)
        .addField('\u200b', '\u200b', true);
      const skywars = new MessageEmbed(base)
        .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | SkyWars Duels`, this.client.utils.constants.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#Duels`)
        .addField('Overall', `Winstreak: \`${stats.skywars.overall.winstreak.toLocaleString()}\` Kills: \`${stats.skywars.overall.kills.toLocaleString()}\`\nDeaths: \`${stats.skywars.overall.deaths.toLocaleString()}\`\nWins: \`${stats.skywars.overall.wins.toLocaleString()}\`\nLosses: \`${stats.skywars.overall.losses.toLocaleString()}\`\nK/D ratio: \`${stats.skywars.overall.KDRatio}\`\nW/L ratio: \`${stats.skywars.overall.WLRatio}\`\nPlayed games: \`${stats.skywars.overall.playedGames}\``, true)
        .addField('1v1', `Winstreak: \`${stats.skywars['1v1'].winstreak.toLocaleString()}\`\nKills: \`${stats.skywars['1v1'].kills.toLocaleString()}\`\nDeaths: \`${stats.skywars['1v1'].deaths.toLocaleString()}\`\nWins: \`${stats.skywars['1v1'].wins.toLocaleString()}\`\nLosses: \`${stats.skywars['1v1'].losses.toLocaleString()}\`\nK/D ratio: \`${stats.skywars['1v1'].KDRatio}\`\nW/L ratio: \`${stats.skywars['1v1'].WLRatio}\`\nPlayed games: \`${stats.skywars['1v1'].playedGames}\``, true)
        .addField('2v2', `Winstreak: \`${stats.skywars['2v2'].winstreak.toLocaleString()}\`\nKills: \`${stats.skywars['2v2'].kills.toLocaleString()}\`\nDeaths: \`${stats.skywars['2v2'].deaths.toLocaleString()}\`\nWins: \`${stats.skywars['2v2'].wins.toLocaleString()}\`\nLosses: \`${stats.skywars['2v2'].losses.toLocaleString()}\`\nK/D ratio: \`${stats.skywars['2v2'].KDRatio}\`\nW/L ratio: \`${stats.skywars['2v2'].WLRatio}\`\nPlayed games: \`${stats.skywars['2v2'].playedGames}\``, true);
      this.client.embedPages.render(message, [overall, op, bridge, uhc, skywars]);
    }).catch((e) => {
      return message.reply(`Error: \`${e}\``);
    });
  }
}
module.exports = DuelsCommand;
