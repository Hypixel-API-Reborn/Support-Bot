const { Listener } = require('discord-akairo');

class ReadyListener extends Listener {
  constructor () {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    });
  }

  async exec () {
    this.client.lastReload = Date.now();
    const guild = await this.client.guilds.fetch('660416184252104705', true, true);
    const members = await guild.members.fetch({ force: true });
    members.forEach(async (m) => await m.loadCache());
    this.client.user.setActivity({ name: '!help', type: 'LISTENING' });
  }
}
module.exports = ReadyListener;
