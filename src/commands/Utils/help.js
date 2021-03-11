const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

class HelpCommand extends Command {
  constructor () {
    super('help', {
      aliases: ['help', 'commands'],
      description: {
        content: 'List of commands',
        usage: 'help [command]',
        examples: [
          'help player',
          'help lookup'
        ]
      },
      args: [
        {
          id: 'command',
          type: 'commandAlias',
          default: null
        }
      ]
    });
  }

  /**
   * @param {Message} message
   * @param {{command:Command|null}} args
   */
  async exec (message, args) {
    const list = new MessageEmbed()
      .setColor(this.client.color);
    if (!args.command) {
      for (const category of this.handler.categories.values()) {
        if (category.id) list.addField(`• ${category.id}`, `${category.filter((cmd) => !cmd.ownerOnly).map((cmd) => `\`${cmd.aliases[0]}\``).join(', ')}`);
      }
      return message.channel.send(list);
    }
    const command = new MessageEmbed()
      .setColor(this.client.color)
      .addField('Name', `\`${this.handler.prefix}${args.command.aliases[0]}\``, true)
      .addField('Category', `\`${args.command.categoryID}\``, true)
      .addField('\u200B', '\u200B', true);
    if (args.command.description) {
      command.addField('Description', `${args.command.description ? args.command.description.content : 'None'}`)
        .addField('Usage', `\`${this.handler.prefix}${args.command.description.usage}\``)
        .addField('Examples', `${args.command.description.examples.map((e) => `\`${this.handler.prefix}${e}\``).join('\n')}`);
    }
    message.channel.send(command);
  }
}
module.exports = HelpCommand;
