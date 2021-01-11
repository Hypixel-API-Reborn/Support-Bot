const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

class ReloadCommand extends Command {
  constructor () {
    super('reload', {
      aliases: ['reload', 'r'],
      description: {
        content: 'Command reloader',
        usage: 'reload [command] [-a]',
        examples: [
          'reload -a',
          'reload player'
        ]
      },
      ownerOnly: true,
      args: [
        {
          id: 'command',
          type: 'commandAlias'
        },
        {
          id: 'all',
          match: 'flag',
          flag: '-a'
        }
      ]
    });
  }

  /**
   *
   * @param {Message} message
   * @param {{command:Command,all:boolean}} args
   */
  async exec (message, args) {
    if (args.all) {
      this.client.commandHandler.reloadAll();
      return message.channel.send({ embed: { color: this.client.color, description: 'All commands are reloaded' } });
    }
    if (!args.command) return message.reply('Specify a command.');
    this.client.commandHandler.reload(args.command);
    message.channel.send({ embed: { color: this.client.color, description: `Command \`${args.command}\` successfully reloaded` } });
  }
}
module.exports = ReloadCommand;
