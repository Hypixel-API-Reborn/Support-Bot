import { ChatInputCommandInteraction, GuildMemberRoleManager, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { contributorsRole, teamRole, devRole, autoModBypassRole } from '../../config.json';
import { readFileSync, writeFileSync } from 'fs';
import ms from 'ms';

export const data = new SlashCommandBuilder()
  .setName('automod')
  .setDescription('Manage AutoMod')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('permit')
      .setDescription('Allow someone to bypass automod')
      .addUserOption((option) => option.setName('user').setDescription('The user to permit').setRequired(true))
      .addStringOption((option) =>
        option.setName('time').setDescription('The Message link to reply with the tag').setRequired(false)
      )
  );

export interface Permit {
  id: string;
  removeTime: number;
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    if (!interaction.member || !interaction.guild) return;
    const subCommand = interaction.options.getSubcommand();
    const memberRoles = (interaction.member.roles as GuildMemberRoleManager).cache.map((role) => role.id);
    switch (subCommand) {
      case 'permit': {
        if (!memberRoles.some((role) => [contributorsRole, teamRole, devRole].includes(role))) {
          await interaction.reply({
            content: 'You do not have permission to use this command',
            ephemeral: true
          });
        }
        const permitData = readFileSync('data/permit.json');
        if (!permitData) {
          await interaction.reply({
            content: 'The linked data file does not exist. Please contact an administrator.'
          });
        }

        const permit = JSON.parse(permitData.toString());
        if (!permit) {
          await interaction.reply({
            content: 'The linked data file is malformed. Please contact an administrator.'
          });
        }
        const user = interaction.options.getUser('user');
        const time = interaction.options.getString('time') || '10m';
        if (!user) {
          await interaction.reply({
            content: 'Please provide a valid user',
            ephemeral: true
          });
          return;
        }
        const guildUser = await interaction.guild.members.fetch(user.id);
        const msTime = ms(time);
        const removeTime = Math.floor((new Date().getTime() + msTime) / 1000);
        permit.push({
          id: user.id,
          removeTime
        });
        writeFileSync('data/permit.json', JSON.stringify(permit));
        guildUser.roles.add(autoModBypassRole);
        const embed = new EmbedBuilder()
          .setTitle('User permitted')
          .setDescription(`User ${user} has been permitted to <t:${removeTime}:t> (<t:${removeTime}:R>)`);
        await interaction.reply({ embeds: [embed] });
        break;
      }
      default: {
        const embed = new EmbedBuilder()
          .setTitle('Invalid subcommand')
          .setDescription('Please provide a valid subcommand');
        await interaction.reply({ embeds: [embed] });
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'Something went wrong. Please try again later.',
        ephemeral: true
      });
      return;
    }
    await interaction.reply({
      content: 'Something went wrong. Please try again later.',
      ephemeral: true
    });
  }
}
