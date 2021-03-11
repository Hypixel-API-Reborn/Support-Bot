const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const hypixel = require('../../Hypixel');

class MurdermysteryCommand extends Command {
  constructor () {
    super('murdermystery', {
      aliases: ['murdermystery', 'mm'],
      description: {
        content: 'Player\'s murder mystery stats',
        usage: 'murdermystery [nickname|uuid|@User]',
        examples: [
          'murdermystery StavZDev',
          'murdermystery Minikloon',
          'murdermystery 709c585ef0194127b08f88ce44bfd158'
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
      if (!player.stats || !player.stats.murdermystery) return message.channel.send({ embed: { color: this.client.color, description: 'Player has no stats' } });
      const stats = player.stats.murdermystery;
      const murdermystery = new MessageEmbed()
        .setColor(this.client.color)
        .setThumbnail(`https://visage.surgeplay.com/face/64/${player.uuid}`)
        .setAuthor(`${player.rank !== 'Default' ? `[${player.rank}]` : ''} ${player.nickname} | Murder Mystery`, this.client.utils.constants.rankColors[player.rank === 'MVP++' ? player.rank : player.rank.replace(/\+/g, '')], `https://plancke.io/hypixel/player/stats/${player.nickname}#MurderMystery`)
        .addField('Overall', `Kills: \`${stats.kills.toLocaleString()}\`\nDeaths: \`${stats.deaths.toLocaleString()}\`\nWins: \`${stats.wins.toLocaleString()}\`\nKill/Death ratio: \`${stats.KDRatio}\`\nWin as Murderer: \`${stats.winsAsMurderer.toLocaleString()}\`\nWin as Detective: \`${stats.winsAsDetective.toLocaleString()}\`\nPlayed games: \`${stats.playedGames}\``, true)
        .addField('Double Up', `Kills: \`${stats.doubleUp.kills.toLocaleString()}\`\nDeaths: \`${stats.doubleUp.deaths.toLocaleString()}\`\nWins: \`${stats.doubleUp.wins.toLocaleString()}\`\nKill/Death ratio: \`${stats.doubleUp.KDRatio}\`\nPlayed games: \`${stats.doubleUp.playedGames}\``, true)
        .addField('Infection', `Kills: \`${stats.infection.kills.toLocaleString()}\`\nDeaths: \`${stats.infection.deaths.toLocaleString()}\`\nWins: \`${stats.infection.wins.toLocaleString()}\`\nKill/Death ratio: \`${stats.infection.KDRatio}\`\nPlayed games: \`${stats.infection.playedGames}\``, true);
      message.channel.send(murdermystery);
    }).catch((e) => {
      return message.reply(`Error: \`${e}\``);
    });
  }
}
module.exports = MurdermysteryCommand;
