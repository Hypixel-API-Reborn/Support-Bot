const { AkairoClient, CommandHandler, ListenerHandler } = require('discord-akairo');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const EmbedPagesRenderer = require('./EmbedPagesRenderer');
require('../prototypes/String');
require('../discord/GuildMember');
class Client extends AkairoClient {
  constructor () {
    super({ ownerID: '291568379423096832' }, { partials: ['GUILD_MEMBER', 'MESSAGE', 'REACTION', 'USER'] });
    this.config = dotenv.config().parsed;
    this.utils = new (require('./Utils'))();
    this.logger = new (require('./Logger'))();
    this.commandHandler = new CommandHandler(this, { directory: './src/commands', prefix: '?', automateCategories: true, defaultCooldown: 5000, commandUtil: true, ignoreCooldown: '291568379423096832' });
    this.listenerHandler = new ListenerHandler(this, { directory: './src/events', automateCategories: true });
    this.embedPages = new EmbedPagesRenderer(this);
    this.color = '#ff8c00';
    this.lastReload = null;
  }

  async run () {
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
      this.logger.info('Successfully connected to MongoDB!');
    }).catch(e => {
      this.logger.error('Something went wrong while connecting to MongoDB.');
      this.logger.error(e);
    });
    this.commandHandler.loadAll();
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.loadAll();
    this.login(process.env.DISCORD_TOKEN).then(() => {
      this.logger.info('Successfully connected to Discord! ' + this.user.tag + ' ready to work!');
    }).catch(e => {
      this.logger.error('Something went wrong while connecting to Discord.');
      this.logger.error(e);
    });
  }
}
module.exports = Client;
