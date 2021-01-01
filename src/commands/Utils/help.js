const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

class HelpCommand extends Command {
  constructor () {
    super('help', {
      aliases: ['help', 'commands'],
      description: 'List of commands',
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
        if (category.id) list.addField(`• ${category.id}`, `${category.map(cmd => `\`${cmd.aliases[0]}\``).join(', ')}`);
      }
      return message.channel.send(list);
    }
    const command = new MessageEmbed()
      .setColor(this.client.color)
      .addField('Name', `\`${this.handler.prefix}${args.command.aliases[0]}\``, true)
      .addField('Category', `\`${args.command.categoryID}\``, true)
      .addField('\u200B', '\u200B', true)
      .addField('Description', `${args.command.description}`);
    message.channel.send(command);
  }
}
module.exports = HelpCommand;
