const Akairo = require('discord-akairo');
const { Message, MessageEmbed, version } = require('discord.js');
const fetch = require('node-fetch');
const ms = require('ms');
const moment = require('moment');

class StatsCommand extends Akairo.Command {
  constructor () {
    super('stats', {
      aliases: ['stats'],
      description: 'Shows bot\'s and Hypixel API • Reborn stats'
    });
  }

  /**
   *
   * @param {Message} message
   */
  async exec (message) {
    const downloadsFetch = await fetch('https://api.npmjs.org/downloads/range/2013-08-21:2100-08-21/hypixel-api-reborn').then(r => r.json());
    var downloads = 0;
    for (const item of downloadsFetch.downloads) downloads += item.downloads;
    const starsFetch = await fetch('https://api.github.com/repos/hypixel-api-reborn/hypixel-api-reborn').then(r => r.json());
    const stars = starsFetch.stargazers_count;
    const contributorsFetch = await fetch('https://api.github.com/repos/hypixel-api-reborn/hypixel-api-reborn/stats/contributors').then(r => r.json());
    const contributors = contributorsFetch.length;
    const akairoVersion = Akairo.version;
    const embed = new MessageEmbed()
      .setColor(this.client.color)
      .addField('Bot', `Ping: \`${this.client.ws.ping}ms\`\nUptime: \`${ms(this.client.uptime)}\`\nLast reload: \`${moment(this.client.lastReload).fromNow()}\``, true)
      .addField('Hypixel API • Reborn', `Downloads: \`${downloads.toLocaleString()}\`\nStars: \`${stars.toLocaleString()}\`\nContributors: \`${contributors.toLocaleString()}\``, true)
      .addField('\u200B', '\u200B', true)
      .addField('\u200B', `GitHub: [click here](https://github.com/hypixel-api-reborn/our-awesome-bot)\nDiscord.js: \`v${version}\`\nDiscord-akairo: \`v${akairoVersion}\``, true)
      .addField('\u200B', 'GitHub: [click here](https://github.com/hypixel-api-reborn/hypixel-api-reborn)\nNPM: [click here](https://www.npmjs.com/package/hypixel-api-reborn)\nDocs: [click here](https://hypixel-api-reborn.stavzdev.xyz)', true)
      .addField('\u200B', '\u200B', true);
    message.channel.send(embed);
  }
}
module.exports = StatsCommand;
