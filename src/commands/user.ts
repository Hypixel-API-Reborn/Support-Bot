// MAX MUTE TIME 2419200000
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle
} from 'discord.js';
import Infraction, { getUserInfractions } from '../functions/Infraction';

export const data = new SlashCommandBuilder()
  .setName('user')
  .setDescription('Manage Users')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('info')
      .setDescription('Get info of a user')
      .addUserOption((option) => option.setName('user').setDescription('The user to get info').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('infractions')
      .setDescription('Get user Infractions')
      .addUserOption((option) => option.setName('user').setDescription('The user to get infractions').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('warn')
      .setDescription('Warn a user')
      .addUserOption((option) => option.setName('user').setDescription('The user to warn').setRequired(true))
      .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the warn').setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('kick')
      .setDescription('Kick a user')
      .addUserOption((option) => option.setName('user').setDescription('The user to kick').setRequired(true))
      .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the kick').setRequired(false)
      )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    if (!interaction.guild) return;
    const subCommand = interaction.options.getSubcommand();
    const commandUser = interaction.options.getUser('user');
    if (!commandUser) {
      await interaction.reply({ content: 'Please provide a valid user', ephemeral: true });
      return;
    }
    const user = await interaction.guild.members.fetch(commandUser.id);
    if (!user) {
      await interaction.reply({ content: 'Please provide a valid user', ephemeral: true });
      return;
    }
    switch (subCommand) {
      case 'info': {
        const embed = new EmbedBuilder()
          .setTitle('User Infomation')
          .setTimestamp()
          .setColor(0xff8c00)
          .setDescription(
            `<@${user.id}>\n\nBot: ${user.user.bot}\nID: ${user.id}\n Created: <t:${
              user.user.createdTimestamp
            }:F> (<t:${user.user.createdTimestamp}:R>)\nJoined: <t:${
              user.joinedTimestamp
            }:F> (<t:${user.joinedTimestamp}:R>)\nRoles: ${user.roles.cache.map((role) => `<@&${role.id}>`)}`
          );
        await interaction.reply({
          embeds: [embed],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder().setCustomId(`logs.${user.id}`).setLabel('view logs').setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId(`kick.${user.id}`).setLabel('kick').setStyle(ButtonStyle.Danger),
              new ButtonBuilder().setCustomId(`ban.${user.id}`).setLabel('ban').setStyle(ButtonStyle.Danger)
            )
          ],
          ephemeral: true
        });
        await interaction.reply({ content: `<@${user.id}> has been warned`, ephemeral: true });
      }
      case 'infractions': {
        const userInfractions = await getUserInfractions(commandUser.id);
        if (!userInfractions.success) {
          await interaction.reply({ content: userInfractions.info, ephemeral: true });
          return;
        }
        const embed = new EmbedBuilder()
          .setTitle('User Infractions')
          .setDescription(
            `${userInfractions.info}\n\n${userInfractions.infractions
              ?.map((infraction) => infraction.toString())
              .join('\n\n')}`
          )
          .setColor(0xff8c00)
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
      case 'warn': {
        const reason = interaction.options.getString('reason') || 'No reason provided';
        new Infraction({
          automatic: false,
          reason: reason,
          type: 'WARN',
          user: { id: commandUser.id, staff: false, bot: commandUser.bot },
          staff: { id: interaction.user.id, staff: true, bot: interaction.user.bot }
        })
          .log()
          .save();
        await interaction.reply({ content: `<@${commandUser.id}> has been warned`, ephemeral: true });
      }
      case 'kick': {
        const reason = interaction.options.getString('reason') || 'No reason provided';
        new Infraction({
          automatic: false,
          reason: reason,
          type: 'KICK',
          user: { id: commandUser.id, staff: false, bot: commandUser.bot },
          staff: { id: interaction.user.id, staff: true, bot: interaction.user.bot }
        })
          .log()
          .save();
        await interaction.reply({ content: `<@${commandUser.id}> has been kicked`, ephemeral: true });
      }
      default: {
        await interaction.reply({ content: 'Invalid subcommand Please provide a valid subcommand', ephemeral: true });
      }
    }
  } catch (error) {
    console.log(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Something went wrong. Please try again later.', ephemeral: true });
      return;
    }
    await interaction.reply({ content: 'Something went wrong. Please try again later.', ephemeral: true });
  }
}
