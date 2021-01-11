const { Command } = require('discord-akairo');
const { MessageEmbed, Message } = require('discord.js');
const fetch = require('node-fetch');

class DocsCommand extends Command {
  constructor () {
    super('docs', {
      description: {
        content: 'Searches Hypixel API • Reborn docs for your query',
        usage: 'docs [query]',
        examples: [
          'docs Client',
          'docs Client#getPlayer',
          'docs Client.getGuild'
        ]
      },
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
        .setDescription(':eyes: Hypixel API • Reborn documentation is [here](https://hypixel.stavzdev.xyz/).');
      return message.channel.send(embed);
    }
    message.channel.send({ embed: docs.resolveEmbed(args.query) });
  }
}
module.exports = DocsCommand;
