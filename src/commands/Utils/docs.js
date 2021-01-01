const { Command } = require('discord-akairo');
const { MessageEmbed, Message } = require('discord.js');
const fetch = require('node-fetch');

class DocsCommand extends Command {
  constructor () {
    super('docs', {
      description: 'Searches Hypixel API • Reborn docs for your query',
      aliases: ['docs'],
      args: [
        {
          id: 'query'
        }
      ]
    });
  }

  /**
   *
   * @param {Message} message
   * @param {{query: string[]}} args
   */
  async exec (message, args) {
    const master = await fetch('https://raw.githubusercontent.com/hypixel-api-reborn/hypixel-api-reborn/docs/master.json').then(r => r.json());
    const docs = new (require('../../../docs-gen'))('https://raw.githubusercontent.com/hypixel-api-reborn/hypixel-api-reborn/docs/master.json', master);
    if (!args.query) {
      const embed = new MessageEmbed()
        .setColor(this.client.color)
        .setDescription(':eyes: We have a documentation website - [click here](http://hypixel-api-reborn.stavzdev.xyz/)');
      return message.channel.send(embed);
    }
    message.channel.send({ embed: Object.assign(docs.resolveEmbed(args.query), { color: this.client.color, author: { name: 'Hypixel API • Reborn', url: 'https://hypixel-api-reborn.stavzdev.xyz', icon_url: null } }) });
  }
}
module.exports = DocsCommand;
