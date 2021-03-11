const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const { inspect } = require('util');

class EvalCommand extends Command {
  constructor () {
    super('eval', {
      aliases: ['eval'],
      description: {
        content: 'Evaluates code',
        usage: 'eval [code] [-noeyes]',
        examples: [
          'eval process.exit(1);'
        ]
      },
      ownerOnly: true,
      args: [
        {
          id: 'code',
          match: 'text'
        },
        {
          id: 'noeyes',
          match: 'flag',
          flag: '-noeyes'
        }
      ]
    });
  }

  /**
   * @param {Message} message
   * @param {{code:string,noeyes:boolean}} args
   */
  async exec (message, args) {
    if (!args.code) return message.reply('I need code.');
    const embed = new MessageEmbed()
      .setColor(this.client.color);
    const start = Date.now();
    if (args.code.includes('await')) args.code = `(async () => { ${args.code} })()`;
    let result;
    try {
      // eslint-disable-next-line no-eval
      result = await eval(args.code);
    } catch (e) {
      result = e;
    }
    if (!args.noeyes) {
      // eslint-disable-next-line camelcase
      const o_o = RegExp(`${process.env.DISCORD_TOKEN}|${process.env.MONGODB_URI}|${process.env.HYPIXEL_KEY}`);
      result = inspect(result, { depth: 1 }).replace(o_o, '[👀]');
    }
    const executed = ((Date.now() - start) / 1000).toFixed(2);
    if (result.length > 1000) {
      embed.addField('📤 Output', `\`\`\`js\n${result.slice(0, 1000) + '\n...'}\n\`\`\``)
        .setFooter(`Executed in ${executed}s`);
      message.channel.send(embed);
    } else {
      embed.addField('📤 Output', `\`\`\`js\n${result}\n\`\`\``)
        .setFooter(`Executed in ${executed}s`);
      message.channel.send(embed);
    }
  }
}
module.exports = EvalCommand;
