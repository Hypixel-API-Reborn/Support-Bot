const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const hypixel = require('../../Hypixel');
const { methodAlias } = require('../../constants');
const { MessageAttachment } = require('discord.js');
class WrapperCommand extends Command {
  constructor () {
    super('wrapper', {
      aliases: ['wrapper', 'w'],
      description: {
        content: 'Return programatically parsed results from the API',
        usage: 'wrapper [endpoint] [args]',
        examples: [
          'w player StavZDev',
          'w online',
          'w guild player Sk1er',
          'w player StavZDev > uuid'
        ]
      },
      cooldown: 15000,
      args: [
        {
          id: 'method',
          type: (message, phrase) => {
            return methodAlias[phrase.toLowerCase()];
          }
        },
        {
          id: 'args',
          match: 'text'
        },
        {
          id: 'noParse',
          match: 'flag',
          flag: '-raw'
        }
      ]
    });
  }

  /**
   *
   * @param {Message} message
   * @param {{method:string, args:string, noParse:boolean}} args
   */
  async exec (message, args) {
    if (!args.method) {
      const embed = new MessageEmbed()
        .setColor(this.client.color)
        .setDescription(`I need to know which method to call.\n\nList of methods:\n${Object.keys(methodAlias).map(ma => `${ma} => \`${methodAlias[ma]}\``).join('\n')}\n\nUsage: \`${this.handler.prefix}${this.id} player StavZDev\``);
      return message.channel.send(embed);
    }
    args.args = args.args.split(/ +/);
    const gte = (args.args.indexOf('>') + 1 || args.args.length) - 1;
    const query = args.args.slice(0,gte);
    const path = args.args.slice(gte).join(' ').slice(1).split('>').filter((x) => x !== '');
    if (query.length > 2 && args.method !== 'getGuild') return message.channel.send('Too many arguments. Only 1 is allowed, except for getGuild');
    query.shift();
    let result = await hypixel[args.method](...query).catch(e => {
      message.channel.send(`Error occurred: \`${e}\``);
    });
    path.forEach((element) => result ? result[element] : undefined );
    if (!result) return message.channel.send('API Result is undefined. Maybe it is due to an invalid path or simply because the result is undefined.')
    if (args.noParse && result) {
      const attachment = new MessageAttachment(Buffer.from(JSON.stringify(result, null, 4)), 'result.json');
      return message.channel.send('API Result : ', { files: [attachment] });
    }
    return message.channel.send(new MessageEmbed()
      .addFields(this.format(result))
      .addField('\u200B', 'More results might be hidden')
      .setColor(this.client.color)
      .setTitle(args.method)
      .setTimestamp()
    );
  }

  /**
     * Parses response from wrapper to an array of fields.
     * @param {any} result Response from wrapper
     */
  format (result) {
    if (Array.isArray(result)) return this.format(result[0]);
    if (typeof result === 'object') {
      const obj = Object.getOwnPropertyNames(result).reduce((a, b) => {
        if (Array.isArray(result[b])) a[b] = result[b].join(', ') || '[ ]';
        else a[b] = typeof result[b] === 'object' ? JSON.stringify(result[b]) : result[b];
        return a;
      }, {});
      return Object.keys(obj).map(x => ({ name: x, value: obj[x].toString().length > 1024 ? obj[x].toString().slice(0, 1024) : obj[x].toString() })).slice(0, 24);
    }
    return [{ name: 'Response', value: String(result) }];
  }
}
module.exports = WrapperCommand;
