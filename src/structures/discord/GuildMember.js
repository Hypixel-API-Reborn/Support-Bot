const { Structures } = require('discord.js');
const User = require('../models/User');
Structures.extend('GuildMember', (GuildMember) => {
  class GuildMemberExt extends GuildMember {
    constructor (...args) {
      super(...args);
      this.cache = {
        uuid: null
      };
    }

    async loadCache () {
      const user = await User.findOne({ id: this.id });
      if (!user) return null;
      this.cache.uuid = user.uuid;
    }
  }
  return GuildMemberExt;
});
