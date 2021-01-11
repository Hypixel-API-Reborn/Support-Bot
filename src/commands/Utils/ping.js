const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

class PingCommand extends Command {
  constructor () {
    super('ping', {
      aliases: ['ping', 'latency'],
      description: {
        content: 'Shows bot\'s latency',
        usage: 'ping',
        examples: [
          'ping'
        ]
      }
    });
  }

  /**
   *
   * @param {Message} message
   */
  async exec (message) {
    const embed = new MessageEmbed()
      .setColor(this.client.color)
      .setDescription(`🏓 Discord: \`${this.client.ws.ping}ms\``);
    message.channel.send(embed);
  }
}
module.exports = PingCommand;
