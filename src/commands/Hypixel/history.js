const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const moment = require('moment');
const { Utils } = require('hypixel-api-reborn');
const fetch = require('node-fetch');

class HistoryCommand extends Command {
  constructor () {
    super('history', {
      aliases: ['history'],
      description: {
        content: 'Player\'s name history',
        usage: 'history [nickname|uuid|@User]',
        examples: [
          'history StavZDev'
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
    Utils.toUuid(args.player).then(async (uuid) => {
      const history = await fetch(`https://api.mojang.com/user/profiles/${uuid}/names`).then((r) => r.json());
      const embed = new MessageEmbed()
        .setColor(this.client.color)
        .setAuthor(`${history[history.length - 1].name}'s name history`)
        .addField('Nickname', `${history.map((h) => `\`${h.name}\``).join('\n')}`, true)
        .addField('Date', `${history.map((h) => `\`${h.changedToAt ? moment(h.changedToAt).calendar() : 'Original'}\``).join('\n')}`, true);
      message.channel.send(embed);
    }).catch((e) => {
      message.reply(`Error: \`${e}\``);
    });
  }
}
module.exports = HistoryCommand;
