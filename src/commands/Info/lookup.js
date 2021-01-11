/* eslint-disable camelcase */
const { Command } = require('discord-akairo');
const { Message } = require('discord.js');
const moment = require('moment');

class LookupCommand extends Command {
  constructor () {
    super('lookup', {
      aliases: ['lookup', 'user', 'userinfo'],
      description: {
        content: 'Shows information about you or specified user.',
        usage: 'lookup [@User] [-c]',
        examples: [
          'lookup @StavZDev -c',
          'lookup User',
          'lookup 291568379423096832'
        ]
      },
      channel: 'guild',
      args: [
        {
          id: 'member',
          match: 'content',
          type: 'member',
          default: message => message.member
        },
        {
          id: 'compact',
          match: 'flag',
          flag: '-c'
        }
      ]
    });
    this.UIUtils = {
      statuses: {
        online: '<:online:662583105177255947>',
        idle: '<:idle:662583084079644683>',
        dnd: '<:dnd:662583053582860308>',
        offline: '<:offline:662583096071159808>',
        streaming: '<:streaming:662583074860695553>'
      },
      statuses1: {
        online: 'Online',
        idle: 'Idle',
        dnd: 'Do Not Disturb',
        offline: 'Offline',
        streaming: 'Streaming'
      },
      status_types: {
        PLAYING: 'Playing',
        WATCHING: 'Watching',
        LISTENING: 'Listening to',
        CUSTOM_STATUS: 'CUSTOM_STATUS',
        STREAMING: 'Streaming'
      },
      flags: {
        DISCORD_EMPLOYEE: '<:stuff:662583114995990529>',
        DISCORD_PARTNER: '<:partner:720935302641745981>',
        BUGHUNTER_LEVEL_1: '<:bughunter:720913706531291156>',
        BUGHUNTER_LEVEL_2: '<:bughunter:720913706531291156>',
        HYPESQUAD_EVENTS: '<:hypesquadevents:720913735421526087>',
        HOUSE_BRAVERY: '<:hsbravery:720913591879991317>',
        HOUSE_BRILLIANCE: '<:hsbrilliance:720913633919369256>',
        HOUSE_BALANCE: '<:hsbalance:720913643310415913>',
        EARLY_SUPPORTER: '<:earlysupporter:720913652991131678>',
        TEAM_USER: 'Team User',
        SYSTEM: 'System',
        VERIFIED_BOT: '<:verifiedbotbadge:720914033800249404>',
        VERIFIED_DEVELOPER: '<:botdeveloper:720908077523664936>'
      }
    };
  }

  /**
   * @param {Message} message
   * @param {} args
   */
  async exec (message, args) {
    const status_types = this.UIUtils.status_types;
    const statuses = this.UIUtils.statuses1;
    const roles = this.getMemberRoles(args.member, message.guild.id);
    const status = this.getStatus(args.member.user);
    const statusEmoji = this.UIUtils.statuses[status];
    const statusType = this.getStatusType(args.member.user, status_types);
    const statusName = statuses[status];
    const flags = this.getUserFlags(args.member.user);
    const activities = args.member.presence.activities;
    if (args.compact) {
      const embed = this.client.util.embed()
        .setColor(args.member.displayHexColor === '#000000' ? this.client.color : args.member.displayHexColor)
        .setDescription([`**${args.member.user.tag}**`, `\n${args.member.presence.activities[0] ? `${statusEmoji} ${statusType === 'CUSTOM_STATUS' ? '' : status_types[args.member.presence.activities[0].type]}  ${statusType === 'CUSTOM_STATUS' ? args.member.presence.activities[0].state == null ? `**${statusName}**` : `**${args.member.presence.activities[0].state}**` : args.member.presence.activities[0].type === 'LISTENING' && args.member.presence.activities[0].syncID ? `**[${args.member.presence.activities[0].details}](https://open.spotify.com/track/${args.member.presence.activities[0].syncID})** by **${args.member.presence.activities[0].state}**` : `**${args.member.presence.activities[0].name}**`}` : `${statusEmoji} **${statusName}**`}`])
        .addField('Registration date', `${moment(args.member.user.createdAt).calendar()} (\`${moment(args.member.user.createdAt).fromNow()}\`)`, true)
        .addField('Join Date', `${moment(args.member.joinedAt).calendar()} (\`${moment(args.member.joinedAt).fromNow()}\`)`, true)
        .setFooter(`ID: ${args.member.id}`)
        .setThumbnail(args.member.user.avatarURL({ dynamic: true }));
      message.channel.send(embed);
      return;
    }
    const embed = this.client.util.embed()
      .setColor(args.member.displayHexColor === '#000000' ? this.client.color : args.member.displayHexColor)
      .setDescription([`**${args.member.user.tag}**`, `\n${args.member.presence.activities[0] ? `${statusEmoji} ${statusType === 'CUSTOM_STATUS' ? '' : status_types[args.member.presence.activities[0].type]}  ${statusType === 'CUSTOM_STATUS' ? args.member.presence.activities[0].state == null ? `**${statusName}**` : `**${args.member.presence.activities[0].state}**` : args.member.presence.activities[0].type === 'LISTENING' && args.member.presence.activities[0].syncID ? `**[${args.member.presence.activities[0].details}](https://open.spotify.com/track/${args.member.presence.activities[0].syncID})** by **${args.member.presence.activities[0].state}**` : `**${args.member.presence.activities[0].name}**`}` : `${statusEmoji} **${statusName}**`}`]);
    if (activities.length && activities.length > 1) {
      activities.splice(0, 1);
      embed.addField('Activities', `${activities.map(a => `• ${a.type === 'CUSTOM_STATUS' ? '' : status_types[a.type]} ${a.type === 'CUSTOM_STATUS' && a.state === null ? '' : a.type === 'LISTENING' && a.syncID ? `**${`[${a.details}](https://open.spotify.com/track/${a.syncID})`}** by **${a.state}**` : a.type === 'CUSTOM_STATUS' ? `**${a.state}**` : `**${a.name}**`}`).join('\n')}`);
    }
    embed.addField('Join Position', this.joinPosition(args.member.id, message.guild), true)
      .addField('\u200B', '\u200B', true)
      .addField('\u200B', '\u200B', true)
      .addField('Registration date', `${moment(args.member.user.createdAt).calendar()} (\`${moment(args.member.user.createdAt).fromNow()}\`)`, true)
      .addField('Join Date', `${moment(args.member.joinedAt).calendar()} (\`${moment(args.member.joinedAt).fromNow()}\`)`, true)
      .addField(`Roles [${roles.size == null ? '0' : roles.size}]`, `${roles.size === 0 ? '`None`' : `${roles.roles.join(', ')}`}`);
    if (flags) {
      embed.addField('User Badges', flags.join(''));
    }
    embed.setFooter(`ID: ${args.member.id}`)
      .setThumbnail(args.member.user.avatarURL({ dynamic: true }));
    message.channel.send(embed);
  }

  // eslint-disable-next-line camelcase
  getStatusType (user, status_types) {
    if (user.presence.activities[0] && user.presence.status !== 'offline') {
      return status_types[user.presence.activities[0].type];
    }
    return null;
  }

  getStatus (user) {
    if (user.presence.activities[0] && user.presence.activities[0].type === 'STREAMING') {
      return 'streaming';
    }
    return user.presence.status;
  }

  getMemberRoles (member, guildId) {
    const first = member.roles.cache.size - 1;
    let roles = member.roles.cache.filter(r => r.id !== guildId).map(r => r).sort((b, a) => a.position - b.position);
    if (!roles.length) {
      return {
        size: 0,
        roles: 'None'
      };
    }
    if (roles.length > 10) {
      const rol = roles.length - 10;
      roles = roles.slice(0, 10);
      roles.push(`...${rol} more`);
      return {
        size: first,
        roles
      };
    }
    return {
      size: first,
      roles
    };
  }

  getUserFlags (member) {
    if (!member.flags.bitfield) return null;
    return member.flags.toArray().map(flag => this.UIUtils.flags[flag]);
  }

  joinPosition (id, guild) {
    if (!id) return;
    if (!guild) return;
    const arr = guild.members.cache.array();
    arr.sort((a, b) => a.joinedAt - b.joinedAt);
    for (let index = 0; index < arr.length; index++) {
      if (arr[index].id === id) return index + 1;
    }
  }
}
module.exports = LookupCommand;
