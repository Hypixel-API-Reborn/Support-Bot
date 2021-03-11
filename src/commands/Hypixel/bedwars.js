const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const hypixel = require('../../Hypixel');

class BedwarsCommand extends Command {
  constructor () {
    super('bedwars', {
      aliases: ['bedwars', 'bw'],
      description: {
        content: 'Player\'s bedwars stats',
        usage: 'bedwars [nickname|uuid|@User]',
        examples: [
          'bedwars StavZDev',
          'bedwars Minikloon',
          'bedwars 709c585ef0194127b08f88ce44bfd158'
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
      if (!player.stats || !player.stats.bedwars) return message.channel.send({ embed: { color: this.client.color, description: 'Player has no stats' } });
      const stats = player.stats.bedwars;
      const embed = new MessageEmbed()
        .setColor(this.client.color)
        .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
        .setAuthor(`[${stats.level}] ${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | BedWars`, this.client.utils.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#BedWars`)
        .addField('Overall', `Coins: \`${stats.coins.toLocaleString()}\`\nPrestige: \`${stats.prestige}\`\nKills: \`${stats.kills.toLocaleString()}\`\nDeaths: \`${stats.deaths.toLocaleString()}\`\nWins: \`${stats.wins.toLocaleString()}\`\nLosses: \`${stats.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.KDRatio}\`\nWin/Loss ratio: \`${stats.WLRatio}\`\nFinal K/D ratio: \`${stats.finalKDRatio}\``, true)
        .addField('Solo', `Kills: \`${stats.solo.kills.toLocaleString()}\`\nDeaths: \`${stats.solo.deaths.toLocaleString()}\`\nWins: \`${stats.solo.wins.toLocaleString()}\`\nLosses: \`${stats.solo.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.solo.KDRatio}\`\nWin/Loss ratio: \`${stats.solo.WLRatio}\`\nPlayed games: \`${stats.solo.playedGames}\`\nFinal K/D ratio: \`${stats.solo.finalKDRatio}\``, true)
        .addField('Doubles', `Kills: \`${stats.doubles.kills.toLocaleString()}\`\nDeaths: \`${stats.doubles.deaths.toLocaleString()}\`\nWins: \`${stats.doubles.wins.toLocaleString()}\`\nLosses: \`${stats.doubles.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.doubles.KDRatio}\`\nWin/Loss ratio: \`${stats.doubles.WLRatio}\`\nPlayed games: \`${stats.doubles.playedGames}\`\nFinal K/D ratio: \`${stats.doubles.finalKDRatio}\``, true)
        .addField('3v3v3v3', `Kills: \`${stats.threes.kills.toLocaleString()}\`\nDeaths: \`${stats.threes.deaths.toLocaleString()}\`\nWins: \`${stats.threes.wins.toLocaleString()}\`\nLosses: \`${stats.threes.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.threes.KDRatio}\`\nWin/Loss ratio: \`${stats.threes.WLRatio}\`\nPlayed games: \`${stats.threes.playedGames}\`\nFinal K/D ratio: \`${stats.threes.finalKDRatio}\``, true)
        .addField('4v4v4v4', `Kills: \`${stats.fours.kills.toLocaleString()}\`\nDeaths: \`${stats.fours.deaths.toLocaleString()}\`\nWins: \`${stats.fours.wins.toLocaleString()}\`\nLosses: \`${stats.fours.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.fours.KDRatio}\`\nWin/Loss ratio: \`${stats.fours.WLRatio}\`\nPlayed games: \`${stats.fours.playedGames}\`\nFinal K/D ratio: \`${stats.fours.finalKDRatio}\``, true)
        .addField('4v4', `Kills: \`${stats['4v4'].kills.toLocaleString()}\`\nDeaths: \`${stats['4v4'].deaths.toLocaleString()}\`\nWins: \`${stats['4v4'].wins.toLocaleString()}\`\nLosses: \`${stats['4v4'].losses.toLocaleString()}\`\nKill/Death ratio: \`${stats['4v4'].KDRatio}\`\nWin/Loss ratio: \`${stats['4v4'].WLRatio}\`\nPlayed games: \`${stats['4v4'].playedGames}\`\nFinal K/D ratio: \`${stats['4v4'].finalKDRatio}\``, true);
      message.channel.send(embed);
    }).catch((e) => {
      return message.reply(`Error: \`${e}\``);
    });
  }
}
module.exports = BedwarsCommand;
