const { Message, MessageEmbed } = require('discord.js');
const hypixel = require('../../Hypixel');
const { methodAlias } = require('../../constants.json');
class WrapperCommand extends Command {
    constructor () {
      super('wrapper', {
        aliases: ['w'],
        description: 'Return programatically parsed results from the API',
        cooldown: 15000,
        ratelimit: 2,
        args: [
          {
            id: 'method',
            type: (message, phrase) => {
              return methodAlias[phrase.toLowerCase()];
            }
          },
          {
            id: 'args',
            match:'content'
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
      if(!args.method) return message.channel.send('I need to know which method to call.');
      args.args = args.args.split(/ +/);
      if(args.args.length>1 && method!=='getGuild' ) return message.channel.send('Too many arguments. Only 1 is allowed, except for getGuild');
      const result = await hypixel[args.method](...args)
      if(noParse){
          return message.channel.send('API Result : ',{files:[JSON.stringify(result)]});
      }
      return message.channel.send(new MessageEmbed()
      .addFields(this.format(result))
      .addField('\u200B','More results might be hidden')
      .setColor('RANDOM')
      .setTitle(args.method)
      .setTimestamp()
      )
    }

    /**
     * Parses response from wrapper to an array of fields.
     * @param {any} result Response from wrapper
     */
    format(result){
        if(Array.isArray(result)) return this.format(result[0]);
        if(typeof result === 'object'){ 
            const obj = Object.getOwnPropertyNames(result).reduce((a, b) => {
            if(Array.isArray(result[b])) a[b]=result[b].toString().join(',');
            else a[b] = typeof result[b] === "object" ? JSON.stringify(O(result[b])) : result[b];
                return a;
            }, {});
            return Object.keys(obj).map(x=>({'name':x,'value':obj[x].toString()})).slice(0,24);
        }
        return [{name:'Response',value:String(object)}]
    }
  }
  module.exports = WrapperCommand;
  