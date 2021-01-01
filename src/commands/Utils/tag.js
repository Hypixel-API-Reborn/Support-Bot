const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const Tag = require('../../structures/models/Tag');

class TagCommand extends Command {
  constructor () {
    super('tag', {
      aliases: ['tag'],
      description: 'Tags',
      args: [
        {
          id: 'content',
          match: 'content'
        }
      ]
    });
  }

  /**
   *
   * @param {Message} message
   * @param {{content: string}} args1
   */
  async exec (message, args1) {
    if (!args1.content) {
      const tags = await Tag.find();
      let description = '**List of tags:**\n';
      for (let i = 0; i < tags.length; i++) {
        description += `${i + 1}. \`${tags[i].title}\`\n`;
      }
      const random = Math.floor(Math.random() * (tags.length - 1));
      description += `\nUsage: \`${this.client.commandHandler.prefix}${this.id} ${tags[random].title}\``;
      const embed = new MessageEmbed()
        .setDescription(description)
        .setColor(this.client.color);
      return message.channel.send(embed);
    }
    const args = args1.content.trim().split(' ');
    switch (args[0].toLowerCase()) {
      case 'add': {
        if (!this.client.isOwner(message.author)) return message.reply(':eyes: You are lier');
        if (!args[1]) return message.reply('I need tag title. e.g. `guideline-1`.');
        if (!args.slice(2).join(' ')) return message.reply('I need tag description. e.g. `Never gonna give you up, never gonna let you down`.');
        const newTag = new Tag({
          title: args[1].toLowerCase(),
          description: args.slice(2).join(' ')
        });
        newTag.save().then(() => {
          message.reply(`Tag **${args[1]}** created! Use: \`${this.client.commandHandler.prefix}${this.id} ${args[1]}\``);
        }).catch(e => {
          this.client.logger.error(e);
        });
        break;
      }
      case 'edit': {
        if (!this.client.isOwner(message.author)) return message.reply(':eyes: You are lier');
        if (!args[1]) return message.reply('I need tag title. e.g. `guideline-1`.');
        const tag = await Tag.findOne({ title: args[1].toLowerCase() });
        if (!tag) return message.reply(`Cannot find tag ${args[1]}`);
        if (!args.slice(2).join(' ')) return message.reply('I need tag description to edit. e.g. `Never gonna give you up, never gonna let you down`.');
        tag.description = args.slice(2).join(' ');
        tag.save().then(() => {
          message.reply(`Tag **${args[1]}** edited! Use: \`${this.client.commandHandler.prefix}${this.id} ${args[1]}\``);
        }).catch(e => {
          this.client.logger.error(e);
        });
        break;
      }
      case 'remove': {
        if (!this.client.isOwner(message.author)) return message.reply(':eyes: You are lier');
        if (!args[1]) return message.reply('I need tag title. e.g. `guideline-1`.');
        const tag = await Tag.findOne({ title: args[1].toLowerCase() });
        if (!tag) return message.reply(`Cannot find tag ${args[1]}`);
        tag.delete();
        message.reply(`Tag **${args[1]}** deleted!`);
        break;
      }
      case 'list': {
        const tags = await Tag.find();
        let description = '**List of tags:**\n';
        for (let i = 0; i < tags.length; i++) {
          description += `${i + 1}. \`${tags[i].title}\`\n`;
        }
        const random = Math.floor(Math.random() * (tags.length - 1));
        description += `\nUsage: \`${this.client.commandHandler.prefix}${this.id} ${tags[random].title}\``;
        const embed = new MessageEmbed()
          .setDescription(description)
          .setColor(this.client.color);
        message.channel.send(embed);
        break;
      }
      default: {
        const tag = await Tag.findOne({ title: args[0].toLowerCase() });
        if (!tag) return message.reply(`Cannot find tag \`${args[1]}\``);
        message.channel.send(`${tag.description}`);
        break;
      }
    }
  }
};
module.exports = TagCommand;
