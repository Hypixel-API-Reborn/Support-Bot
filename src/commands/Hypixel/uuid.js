const { Command, Util } = require('discord-akairo');
const { Message } = require('discord.js');
const hypixel = require('../../Hypixel');

class UuidCommand extends Command {
  constructor () {
    super('uuid', {
      aliases: ['uuid'],
      description: {
        content: 'Returns player\'s UUID',
        usage: 'uuid [nickname|uuid|@User]',
        examples: [
          'uuid StavZDev'
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
      message.channel.send({ embed: { description: `${player.nickname}'s UUID is \`${player.uuid}\`.`, color: this.client.color } });
    }).catch((e) => {
      message.reply(`Error: \`${e}\``);
    });
  }
}
module.exports = UuidCommand;
