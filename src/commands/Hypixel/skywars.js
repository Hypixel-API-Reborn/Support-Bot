const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const hypixel = require('../../Hypixel');

class SkywarsCommand extends Command {
  constructor () {
    super('skywars', {
      aliases: ['skywars', 'sw'],
      description: {
        content: 'Player\'s skywars stats',
        usage: 'skywars [nickname|uuid|@User]',
        examples: [
          'skywars StavZDev',
          'skywars Minikloon',
          'skywars 709c585ef0194127b08f88ce44bfd158'
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
      if (!player.stats || !player.stats.skywars) return message.channel.send({ embed: { color: this.client.color, description: 'Player has no stats' } });
      const stats = player.stats.skywars;
      const base = new MessageEmbed()
        .setColor(this.client.color)
        .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
        .setAuthor(`[${stats.levelFormatted}] ${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | SkyWars`, this.client.utils.constants.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#SkyWars`);
      const overall = new MessageEmbed(base)
        .addField('Overall', `Kills: \`${stats.kills.toLocaleString()}\`\nDeaths: \`${stats.deaths.toLocaleString()}\`\nWins: \`${stats.wins.toLocaleString()}\`\nLosses: \`${stats.losses.toLocaleString()}\`\nKill/Death Ratio: \`${stats.KDRatio}\`\nWin/Loss Ratio: \`${stats.WLRatio}\`\nPlayed games: \`${stats.playedGames}\``, true)
        .addField('Solo', `Kills: \`${stats.solo.overall.kills.toLocaleString()}\`\nDeaths: \`${stats.solo.overall.deaths.toLocaleString()}\`\nWins: \`${stats.solo.overall.wins.toLocaleString()}\`\nLosses: \`${stats.solo.overall.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.solo.overall.KDRatio}\`\nWin/Loss ratio: \`${stats.solo.overall.WLRatio}\`\nPlayed games: \`${stats.solo.overall.playedGames.toLocaleString()}\``, true)
        .addField('Team', `Kills: \`${stats.team.overall.kills.toLocaleString()}\`\nDeaths: \`${stats.team.overall.deaths.toLocaleString()}\`\nWins: \`${stats.team.overall.wins.toLocaleString()}\`\nLosses: \`${stats.team.overall.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.team.overall.KDRatio}\`\nWin/Loss ratio: \`${stats.team.overall.WLRatio}\`\nPlayed games: \`${stats.team.overall.playedGames.toLocaleString()}\``, true)
        .addField('Ranked', `Kills: \`${stats.ranked.kills.toLocaleString()}\`\nDeaths: \`${stats.ranked.deaths.toLocaleString()}\`\nWins: \`${stats.ranked.wins.toLocaleString()}\`\nLosses: \`${stats.ranked.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.ranked.KDRatio}\`\nWin/Loss ratio: \`${stats.ranked.WLRatio}\`\nPlayed games: \`${stats.ranked.playedGames.toLocaleString()}\``, true)
        .addField('Mega', `Kills: \`${stats.mega.overall.kills.toLocaleString()}\`\nDeaths: \`${stats.mega.overall.deaths.toLocaleString()}\`\nWins: \`${stats.mega.overall.wins.toLocaleString()}\`\nLosses: \`${stats.mega.overall.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.mega.overall.KDRatio}\`\nWin/Loss ratio: \`${stats.mega.overall.WLRatio}\``, true)
        .addField('Lab', `Kills: \`${stats.lab.kills.toLocaleString()}\`\nDeaths: \`${stats.lab.deaths.toLocaleString()}\`\nWins: \`${stats.lab.wins.toLocaleString()}\`\nLosses: \`${stats.lab.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.lab.KDRatio}\`\nWin/Loss ratio: \`${stats.lab.WLRatio}\`\nPlayed games: \`${stats.ranked.playedGames.toLocaleString()}\``, true)
        .addField('Level Progress', `\`${Math.floor(stats.level)} ${this.renderProgressBar(stats.levelProgress)} ${Math.floor(stats.level + 1)}\`\n${stats.levelProgress.currentLevelXp} / ${stats.levelProgress.xpNextLevel} (${Math.round(stats.levelProgress.percent)}%)`);
      const soloTeam = new MessageEmbed(base)
        .addField('Solo Normal', `Kills: \`${stats.solo.normal.kills.toLocaleString()}\`\nDeaths: \`${stats.solo.normal.deaths.toLocaleString()}\`\nWins: \`${stats.solo.normal.wins.toLocaleString()}\`\nLosses: \`${stats.solo.normal.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.solo.normal.KDRatio}\`\nWin/Loss ratio: \`${stats.solo.normal.WLRatio}\``, true)
        .addField('Solo Insane', `Kills: \`${stats.solo.insane.kills.toLocaleString()}\`\nDeaths: \`${stats.solo.insane.deaths.toLocaleString()}\`\nWins: \`${stats.solo.insane.wins.toLocaleString()}\`\nLosses: \`${stats.solo.insane.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.solo.insane.KDRatio}\`\nWin/Loss ratio: \`${stats.solo.insane.WLRatio}\``, true)
        .addField('\u200b', '\u200b', true)
        .addField('Team Normal', `Kills: \`${stats.team.normal.kills.toLocaleString()}\`\nDeaths: \`${stats.team.normal.deaths.toLocaleString()}\`\nWins: \`${stats.team.normal.wins.toLocaleString()}\`\nLosses: \`${stats.team.normal.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.team.normal.KDRatio}\`\nWin/Loss ratio: \`${stats.team.normal.WLRatio}\``, true)
        .addField('Team Insane', `Kills: \`${stats.team.insane.kills.toLocaleString()}\`\nDeaths: \`${stats.team.insane.deaths.toLocaleString()}\`\nWins: \`${stats.team.insane.wins.toLocaleString()}\`\nLosses: \`${stats.team.insane.losses.toLocaleString()}\`\nKill/Death ratio: \`${stats.team.insane.KDRatio}\`\nWin/Loss ratio: \`${stats.team.insane.WLRatio}\``, true)
        .addField('\u200b', '\u200b', true);
      this.client.embedPages.render(message, [overall, soloTeam]);
    }).catch((e) => {
      return message.reply(`Error: \`${e}\``);
    });
  }

  /**
   * @param {*} progress
   * @return {string}
   */
  renderProgressBar (progress) {
    const progressOutOf30 = Math.round((progress.percent / 100) * 30);
    return `[${'■'.repeat(progressOutOf30)}${'━'.repeat(30 - progressOutOf30)}]`;
  }
}
module.exports = SkywarsCommand;
