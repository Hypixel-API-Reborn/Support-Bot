const { Message, MessageEmbed } = require('discord.js');
class EmbedPagesRenderer {
  constructor (client) {
    this.client = client;
  }

  /**
   *
   * @param {Message} message
   * @param {string[]|MessageEmbed[]} pages
   */
  render (message, pages) {
    let page = 0;
    let embed;
    if (typeof pages[page] === 'string') {
      embed = new MessageEmbed().setColor(this.client.color).setDescription(pages[page]).setFooter(`Page ${page} of ${pages.length}`);
    }
    if (pages[page] instanceof MessageEmbed) {
      embed = new MessageEmbed(pages[page]).setFooter(`Page ${page + 1} of ${pages.length}`);
    }
    message.channel.send(embed).then((msg) => {
      msg.react('⬅️').then((r) => {
        msg.react('➡️');
        const emojis = ['⬅️', '➡️'];
        const collector = msg.createReactionCollector((r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id, { time: 60000 });
        collector.on('collect', (r) => {
          let e;
          switch (r.emoji.name) {
            case emojis[0]: {page = page > 0 ? --page : pages.length - 1; e = emojis[0]; break;}
            case emojis[1]: {page = page + 1 < pages.length ? ++page : 0; e = emojis[1]; break;}
            default: {break;}
          }
          if (typeof pages[page] === 'string') {
            msg.edit(embed.setDescription(pages[page]).setFooter(`Page ${page + 1} of ${pages.length}`).setColor(this.client.color));
          }
          if (pages[page] instanceof MessageEmbed) {
            msg.edit(pages[page].setFooter(`Page ${page + 1} of ${pages.length}`));
          }
          msg.reactions.resolve(e).users.remove(message.author.id);
        });
        collector.on('end', () => {
          if (!msg.deleted) {
            msg.reactions.removeAll();
          }
        });
      });
    });
  }
}
module.exports = EmbedPagesRenderer;
