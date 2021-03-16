const { Command } = require('discord-akairo');
const { MessageEmbed, Message } = require('discord.js');
const hypixel = require('../../Hypixel');
const moment = require('moment');
const { APIIncident } = require('hypixel-api-reborn');

class IncidentsCommand extends Command {
  constructor () {
    super('incidents', {
      aliases: ['incidents', 'apiincidents'],
      description: {
        content: 'Shows Hypixel API incidents',
        usage: 'incidents',
        examples: [
          'incidents'
        ]
      }
    });
  }
  /**
   * @param {Message} message
   */
  async exec (message) {
    const status = await hypixel.getAPIStatus();
    const embed = new MessageEmbed()
      .setColor(this.client.color)
      .setAuthor('API Incidents', this.client.user.avatarURL(), 'https://status.hypixel.net/');
    if (status.currentIncidents.length) {
      status.currentIncidents.forEach((i) => {
        embed.addField('• Current Incident', this.parseIncident(i));
      });
    }
    const pastIncident = status.incidents[0];
    embed.addField('Past Incident', this.parseIncident(pastIncident));
    message.channel.send(embed);
  }

  /**
   * @param {APIIncident} incident
   * @return {string}
   */
  parseIncident (incident) {
    return `Started at: \`${moment(incident.startTimestamp)}\`\n\n${incident.snippet.length > 900 ? incident.snippet.slice(900) + `\n[click here](${incident.link})` : incident.snippet}`;
  }
}
module.exports = IncidentsCommand;
