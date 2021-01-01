const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const User = require('../../structures/models/User');
const fetch = require('node-fetch');

class VerifyCommand extends Command {
  constructor () {
    super('verify', {
      aliases: ['verify'],
      description: 'Connect your hypixel account to discord.',
      channel: 'guild'
    });
  }

  /**
   *
   * @param {Message} message
   */
  async exec (message) {
    const user = await User.findOne({ id: message.author.id });
    if (user && user.uuid) return message.channel.send({ embed: { color: this.client.color, description: `You already connected your hypixel account to discord.\nUUID: **${user.uuid}**` } });
    const start = new MessageEmbed()
      .setColor(this.client.color)
      .setDescription('You need a Hypixel API key to verify your identity.\n\n**I will make 1 API request for your UUID.\nYou can reset your API key after verification.**');
    message.channel.send(start).then((msg) => {
      if (msg.deletable) {
        msg.delete({ timeout: 15000 });
      }
    });
    setTimeout(async () => {
      const dm = await message.author.createDM().catch(e => {
        message.channel.send('I can\'t DM you.');
      });
      dm.send('Hello!\nYou have 5 minutes to enter you API key for verification.\n\nHow to get API key: <https://stavzdev.is-inside.me/cCMiZdoy.gif>').catch(e => {
        message.channel.send('I can\'t DM you.');
      });
      const collector = dm.createMessageCollector(m => (/([0-9a-z]){8}-([0-9a-z]){4}-([0-9a-z]){4}-([0-9a-z]){4}-([0-9a-z]){12}$/gm).test(m.content), { time: 300000, max: 1 });
      collector.on('collect', async (m) => {
        const key = m.content;
        let res = await fetch(`https://api.hypixel.net/key?key=${key}`);
        if (res.status !== 200) {
          return dm.send('Invalid API key!');
        }
        res = await res.json();
        if (!res.success) return dm.send('Try again later!');
        const user1 = await User.findOne({ uuid: res.record.owner });
        if (user1) return dm.send('This account is already connected to another.');
        dm.send(`You API key: ||${key.slice(0, 8) + key.slice(8).replace(/[^-]/g, '•')}||\nYour UUID: **${res.record.owner}**\n**Saving to DB...**`).then(async m => {
          const newUser = new User({
            id: message.author.id,
            uuid: res.record.owner
          });
          newUser.save().then(() => {
            m.edit(m.content.replace('**Saving to DB...**', '**Saved!**'));
          });
        });
      });
      collector.on('end', (collected) => {
        if (!collected.size || !(/([0-9a-z]){8}-([0-9a-z]){4}-([0-9a-z]){4}-([0-9a-z]){4}-([0-9a-z]){12}$/gm).test(collected.first().content)) {
          dm.send('Time is up!');
        }
      });
    }, 5000);
  }
}
module.exports = VerifyCommand;
