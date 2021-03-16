const { Command } = require('discord-akairo');
const hypixel = require('../../Hypixel');
const { Message, MessageEmbed } = require('discord.js');
const { Player } = require('hypixel-api-reborn');

class CompareCommand extends Command {
  constructor () {
    super('compare', {
      aliases: ['compare', 'vs'],
      description: {
        content: 'Compare players stats',
        usage: 'compare [player] [player] [mode]',
        examples: [
          'compare StavZDev Plancke sw',
          'compare StavZDev Plancke bw',
          'compare StavZDev Plancke duels',
          'compare StavZDev Plancke mm'
        ]
      },
      args: [
        {
          id: 'firstPlayer',
          match: 'phrase',
          type: 'string'
        },
        {
          id: 'secondPlayer',
          match: 'phrase',
          type: 'string'
        },
        {
          id: 'minigame',
          match: 'phrase',
          type: 'string'
        }
      ]
    });
  }

  /**
   *
   * @param {Message} message
   * @param {} args
   */
  async exec (message, args) {
    const { minigames } = this.client.utils.constants;
    if (!args.firstPlayer || !args.secondPlayer || !args.minigame || args.firstPlayer === args.secondPlayer) {
      return message.reply(`Usage: \`${this.handler.prefix}${this.description.usage}\``);
    }
    let minigame;
    if (args.minigame) {
      minigame = minigames.find((m) => m.aliases.includes(args.minigame.toLowerCase()));
      if (!minigame) return message.channel.send({ embed: { color: this.client.color, description: `List of available minigames:\n${minigames.map((m) => m.aliases.sort((a, b) => b.length - a.length).map((a) => `**${a}**`).join(', ')).join('\n')}\nUsage: \`${this.handler.prefix}${this.id} StavZDev Plancke ${minigames[Math.floor(Math.random() * (minigames.length - 1))].name}\`` } });
    }
    const firstPlayer = await hypixel.getPlayer(args.firstPlayer);
    const secondPlayer = await hypixel.getPlayer(args.secondPlayer);
    if (!firstPlayer || !secondPlayer) return message.reply('Provide a valid nickname');
    message.channel.send(this[minigame.name](firstPlayer, secondPlayer));
  }

  /**
   *
   * @param {number} a
   * @param {number} b
   */
  compare (a, b) {
    a = (a - Math.floor(a)) === 0 ? Math.floor(a) : a;
    b = (b - Math.floor(b)) === 0 > 1 ? Math.floor(b) : b;
    return `\`${a.toLocaleString()}\` | \`${b.toLocaleString()}\`\n${a > b ? '<:green_triangle:798041899343544350>' : (a === b ? '—' : '<:red_triangle_down:798041931514511372>')} \`${Math.abs(a - b).toLocaleString()}\``;
  }

  /**
   * @param {Player} first
   * @param {Player} second
   */
  skywars (first, second) {
    const fps = first.stats.skywars;
    const sps = second.stats.skywars;
    if (!fps || !sps) return { description: 'One of these players has no stats in SkyWars', color: this.client.color };
    const embed = new MessageEmbed()
      .setTitle('Overall SkyWars stats compare')
      .setColor(this.client.color)
      .setThumbnail('https://hypixel.net/styles/hypixel-uix/hypixel/game-icons/Skywars-64.png')
      .setDescription(`[${first.rank !== 'Default' ? `[${first.rank}]` : ''} ${first.nickname}](https://plancke.io/hypixel/player/stats/${first.uuid}) **VS** [${second.rank !== 'Default' ? `[${second.rank}]` : ''} ${second.nickname}](https://plancke.io/hypixel/player/stats/${second.uuid})`)
      .addField('Level', `${this.compare(Math.floor(fps.level), Math.floor(sps.level))}`, true)
      .addField('Coins', `${this.compare(fps.coins, sps.coins)}`, true)
      .addField('Winstreak', `${this.compare(fps.winstreak, sps.winstreak)}`, true)
      .addField('Souls', `${this.compare(fps.souls, sps.souls)}`, true)
      .addField('Shards', `${this.compare(fps.shards, sps.shards)}`, true)
      .addField('Heads', `${this.compare(fps.heads, sps.heads)}`, true)
      .addField('Wins', `${this.compare(fps.wins, sps.wins)}`, true)
      .addField('Losses', `${this.compare(fps.losses, sps.losses)}`, true)
      .addField('WL Ratio', `${this.compare(fps.WLRatio, sps.WLRatio)}`, true)
      .addField('Kills', `${this.compare(fps.kills, sps.kills)}`, true)
      .addField('Deaths', `${this.compare(fps.deaths, sps.deaths)}`, true)
      .addField('KD Ratio', `${this.compare(fps.KDRatio, sps.KDRatio)}`, true)
      .addField('Total Games', `${this.compare(fps.playedGames, sps.playedGames)}`, true);
    return embed;
  }

  /**
   * @param {Player} first
   * @param {Player} second
   */
  duels (first, second) {
    const fps = first.stats.duels;
    const sps = second.stats.duels;
    if (!fps || !sps) return { description: 'One of these players has no stats in Duels', color: this.client.color };
    const embed = new MessageEmbed()
      .setTitle('Overall Duels stats compare')
      .setColor(this.client.color)
      .setThumbnail('https://hypixel.net/styles/hypixel-uix/hypixel/game-icons/Duels-64.png')
      .setDescription(`[${first.rank !== 'Default' ? `[${first.rank}]` : ''} ${first.nickname}](https://plancke.io/hypixel/player/stats/${first.uuid}) **VS** [${second.rank !== 'Default' ? `[${second.rank}]` : ''} ${second.nickname}](https://plancke.io/hypixel/player/stats/${second.uuid})`)
      .addField('Coins', `${this.compare(fps.coins, sps.coins)}`, true)
      .addField('Total Games', `${this.compare(fps.playedGames, sps.playedGames)}`, true)
      .addField('\u200b', `\u200b`, true)
      .addField('Wins', `${this.compare(fps.wins, sps.wins)}`, true)
      .addField('Losses', `${this.compare(fps.losses, sps.losses)}`, true)
      .addField('WL Ratio', `${this.compare(fps.WLRatio, sps.WLRatio)}`, true)
      .addField('Kills', `${this.compare(fps.kills, sps.kills)}`, true)
      .addField('Deaths', `${this.compare(fps.deaths, sps.deaths)}`, true)
      .addField('KD Ratio', `${this.compare(fps.KDRatio, sps.KDRatio)}`, true);
    return embed;
  }

  /**
   * @param {Player} first
   * @param {Player} second
   */
  bedwars (first, second) {
    const fps = first.stats.bedwars;
    const sps = second.stats.bedwars;
    if (!fps || !sps) return { description: 'One of these players has no stats in BedWars', color: this.client.color };
    const embed = new MessageEmbed()
      .setTitle('Overall BedWars stats compare')
      .setColor(this.client.color)
      .setThumbnail('https://hypixel.net/styles/hypixel-uix/hypixel/game-icons/BedWars-64.png')
      .setDescription(`[${first.rank !== 'Default' ? `[${first.rank}]` : ''} ${first.nickname}](https://plancke.io/hypixel/player/stats/${first.uuid}) **VS** [${second.rank !== 'Default' ? `[${second.rank}]` : ''} ${second.nickname}](https://plancke.io/hypixel/player/stats/${second.uuid})`)
      .addField('Level', `${this.compare(Math.floor(fps.level), Math.floor(sps.level))}`, true)
      .addField('Coins', `${this.compare(fps.coins, sps.coins)}`, true)
      .addField('Winstreak', `${this.compare(fps.winstreak, sps.winstreak)}`, true)
      .addField('Wins', `${this.compare(fps.wins, sps.wins)}`, true)
      .addField('Losses', `${this.compare(fps.losses, sps.losses)}`, true)
      .addField('WL Ratio', `${this.compare(fps.WLRatio, sps.WLRatio)}`, true)
      .addField('Kills', `${this.compare(fps.kills, sps.kills)}`, true)
      .addField('Deaths', `${this.compare(fps.deaths, sps.deaths)}`, true)
      .addField('KD Ratio', `${this.compare(fps.KDRatio, sps.KDRatio)}`, true)
      .addField('Beds Broken', `${this.compare(fps.beds.broken, sps.beds.broken)}`, true)
      .addField('Beds Lost', `${this.compare(fps.beds.lost, sps.beds.lost)}`, true)
      .addField('BBL Ratio', `${this.compare(fps.beds.BLRatio, sps.beds.BLRatio)}`, true)
      .addField('Total Games', `${this.compare(fps.playedGames, sps.playedGames)}`, true);
    return embed;
  }

  /**
   * @param {Player} first
   * @param {Player} second
   */
  murdermystery (first, second) {
    const fps = first.stats.murdermystery;
    const sps = second.stats.murdermystery;
    if (!fps || !sps) return { description: 'One of these players has no stats in Murder Mystery', color: this.client.color };
    const embed = new MessageEmbed()
      .setTitle('Overall Murder Mystery stats compare')
      .setColor(this.client.color)
      .setThumbnail('https://hypixel.net/styles/hypixel-uix/hypixel/game-icons/MurderMystery-64.png')
      .setDescription(`[${first.rank !== 'Default' ? `[${first.rank}]` : ''} ${first.nickname}](https://plancke.io/hypixel/player/stats/${first.uuid}) **VS** [${second.rank !== 'Default' ? `[${second.rank}]` : ''} ${second.nickname}](https://plancke.io/hypixel/player/stats/${second.uuid})`)
      .addField('Coins', `${this.compare(fps.coins, sps.coins)}`, true)
      .addField('Wins', `${this.compare(fps.wins, sps.wins)}`, true)
      .addField('Total Games', `${this.compare(fps.playedGames, sps.playedGames)}`, true)
      .addField('Kills', `${this.compare(fps.kills, sps.kills)}`, true)
      .addField('Deaths', `${this.compare(fps.deaths, sps.deaths)}`, true)
      .addField('KD Ratio', `${this.compare(fps.KDRatio, sps.KDRatio)}`, true)
      .addField('Wins as Murderer', `${this.compare(fps.winsAsMurderer, sps.winsAsMurderer)}`, true)
      .addField('Wins as Detective', `${this.compare(fps.winsAsDetective, sps.winsAsDetective)}`, true)
      .addField('\u200b', `\u200b`, true);
    return embed;
  }
}
module.exports = CompareCommand;
