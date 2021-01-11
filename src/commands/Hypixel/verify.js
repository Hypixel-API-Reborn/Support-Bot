const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const User = require('../../structures/models/User');
const hypixel = require('../../Hypixel');
const { Errors } = require('hypixel-api-reborn');

class VerifyCommand extends Command {
  constructor () {
    super('verify', {
      aliases: ['verify'],
      description: {
        content: 'Connect your hypixel account to discord.',
        usage: 'verify [nickname]',
        examples: [
          'verify StavZDev',
          'verify lifelong'
        ]
      },
      channel: 'guild',
      cooldown: 10000,
      args: [
        {
          id: 'nickname',
          type: (message, phrase) => {
            if (phrase.length > 16) return null;
            return phrase;
          }
        }
      ]
    });
  }

  /**
   *
   * @param {Message} message
   * @param {{nickname:string}} args
   */
  async exec (message, args) {
    const user = await User.findOne({ id: message.author.id });
    if (user && user.uuid) return message.channel.send({ embed: { color: this.client.color, description: `You already connected your hypixel account to discord.\nUUID: **${user.uuid}**` } });
    if (!args.nickname) {
      const start = new MessageEmbed()
        .setColor(this.client.color)
        .setDescription(`Specify your nickname for verification. e.g. \`${this.handler.prefix}${this.id} StavZDev\`\n\n**You need connected Discord as social media on Hypixel Network.**`);
      return message.channel.send(start);
    }
    hypixel.getPlayer(args.nickname).then(async player => {
      if (!player.socialMedia.find(s => s.id === 'DISCORD')) return message.reply('You haven\'t connected Discord to Hypixel Network.');
      if (player.socialMedia.find(s => s.id === 'DISCORD').link !== message.author.tag) return message.reply('Connected Discord tag doesn\'t match your Discord tag.');
      const user1 = await User.findOne({ uuid: player.uuid });
      if (user1) return message.reply('This account already connected to another.');
      new User({
        id: message.author.id,
        uuid: player.uuid
      }).save(() => {
        message.reply(`Player \`${player.nickname}\` connected to your account.`);
      });
    }).catch(e => {
      if (e.message === Errors.PLAYER_DOES_NOT_EXIST) {
        message.reply(`Player \`${args.nickname}\` does not exist.`);
      } else {
        message.reply(`Error occurred: \`${e}\``);
      }
    });
  }
}
module.exports = VerifyCommand;
