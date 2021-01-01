const { Listener } = require('discord-akairo');
const { GuildMember } = require('discord.js');

class GuildMemberAddListener extends Listener {
  constructor () {
    super('guildMemberAdd', {
      emitter: 'client',
      event: 'guildMemberAdd'
    });
  }

  /**
   *
   * @param {GuildMember} member
   */
  exec (member) {
    if (member.user.bot) {
      member.roles.add('660418146133606430'); // Bot
    } else {
      member.roles.add('671649063808008192'); // User
    }
  }
}
module.exports = GuildMemberAddListener;
