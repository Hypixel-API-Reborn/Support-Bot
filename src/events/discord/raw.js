const { Listener } = require('discord-akairo');

class RawListener extends Listener {
  constructor () {
    super('raw', {
      emitter: 'client',
      event: 'raw'
    });
  }

  async exec (r) {
    if (r.t === 'MESSAGE_REACTION_ADD' || r.t === 'MESSAGE_REACTION_REMOVE') {
      if (r.d.message_id === '748872989935796264') {
        if (r.d.emoji.name === '❤️') {
          const guild = await this.client.guilds.fetch('660416184252104705', true, true);
          const member = await guild.members.fetch({ user: r.d.user_id, force: true });
          const subRole = await guild.roles.fetch('748872097484505148', true, true);
          switch (r.t) {
            case 'MESSAGE_REACTION_ADD': {
              member.roles.add(subRole);
              break;
            }
            case 'MESSAGE_REACTION_REMOVE': {
              member.roles.remove(subRole);
              break;
            }
          }
        }
      }
    }
  }
}
module.exports = RawListener;
