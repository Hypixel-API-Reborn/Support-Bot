import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle
} from 'discord.js';
import Infraction, { getUserInfractions } from '../utils/Infraction';
import ms from 'ms';

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
  .addSubcommand((subcommand) =>
    subcommand
      .setName('mute')
      .setDescription('Mute a user')
      .addUserOption((option) => option.setName('user').setDescription('The user to mute').setRequired(true))
      .addStringOption((option) => option.setName('time').setDescription('How long to mute').setRequired(true))
      .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the mute').setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('unmute')
      .setDescription('unmute a user')
      .addUserOption((option) => option.setName('user').setDescription('The user to mute').setRequired(true))
      .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the mute').setRequired(false)
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
            `<@${user.id}>\n\nBot: ${user.user.bot}\nID: ${user.id}\n Created: <t:${Math.floor(
              user.user.createdTimestamp / 1000
            )}:F> (<t:${Math.floor(user.user.createdTimestamp / 1000)}:R>)\nJoined: <t:${Math.floor(
              (user.joinedTimestamp ?? 0) / 1000
            )}:F> (<t:${Math.floor((user.joinedTimestamp ?? 0) / 1000)}:R>)\nRoles: ${user.roles.cache
              .map((role) => `<@&${role.id}>`)
              .filter((role) => role !== `<@&${interaction.guild?.id}>`)
              .join(', ')}`
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
        break;
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
        break;
      }
      case 'warn': {
        const reason = interaction.options.getString('reason') || 'No reason provided';
        new Infraction({
          automatic: false,
          reason: reason,
          type: 'WARN',
          long: null,
          user: { id: commandUser.id, staff: false, bot: commandUser.bot },
          staff: { id: interaction.user.id, staff: true, bot: interaction.user.bot },
          timestamp: Date.now(),
          extraInfo: ''
        })
          .log()
          .save();
        await interaction.reply({ content: `<@${commandUser.id}> has been warned`, ephemeral: true });
        break;
      }
      case 'kick': {
        const reason = interaction.options.getString('reason') || 'No reason provided';
        new Infraction({
          automatic: false,
          reason: reason,
          type: 'KICK',
          long: null,
          user: { id: commandUser.id, staff: false, bot: commandUser.bot },
          staff: { id: interaction.user.id, staff: true, bot: interaction.user.bot },
          timestamp: Date.now(),
          extraInfo: ''
        })
          .log()
          .save();
        await interaction.reply({ content: `<@${commandUser.id}> has been kicked`, ephemeral: true });
        break;
      }
      case 'mute': {
        const time = interaction.options.getString('time');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        if (!time) {
          await interaction.reply({ content: 'Please provide a time', ephemeral: true });
          return;
        }
        const long = ms(time);
        if (2419200000 < long) {
          await interaction.reply({ content: 'You cannot mute someone for longer then 28d', ephemeral: true });
          return;
        }
        user.timeout(long, reason);
        new Infraction({
          automatic: false,
          reason: reason,
          type: 'MUTE',
          long,
          user: { id: commandUser.id, staff: false, bot: commandUser.bot },
          staff: { id: interaction.user.id, staff: true, bot: interaction.user.bot },
          timestamp: Date.now(),
          extraInfo: ''
        })
          .log()
          .save();
        await interaction.reply({ content: `<@${commandUser.id}> has been muted`, ephemeral: true });
        break;
      }
      case 'unmute': {
        const reason = interaction.options.getString('reason') || 'No reason provided';
        user.timeout(null, reason);
        new Infraction({
          automatic: false,
          reason: reason,
          type: 'UNMUTE',
          long: null,
          user: { id: commandUser.id, staff: false, bot: commandUser.bot },
          staff: { id: interaction.user.id, staff: true, bot: interaction.user.bot },
          timestamp: Date.now(),
          extraInfo: ''
        })
          .log()
          .save();
        await interaction.reply({ content: `<@${commandUser.id}> has been unmuted`, ephemeral: true });
        break;
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
