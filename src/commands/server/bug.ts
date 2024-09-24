import {
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits
} from 'discord.js';
import DiscordManager from '../../DiscordManager';
import Command from '../../utils/Command';
import { bugReports } from '../../../config.json';

class BugReportsCommand extends Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
  constructor(discord: DiscordManager) {
    super(discord);
    this.data = new SlashCommandBuilder()
      .setName('bug-report')
      .setDescription('Manage Bug Reports')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('rename')
          .setDescription('Rename a Bug Report')
          .addStringOption((option) =>
            option.setName('name').setDescription('New Name of the bug report').setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('status')
          .setDescription('Set the Status of a Bug Report')
          .addStringOption((option) =>
            option
              .setName('status')
              .setDescription('Status of the bug report')
              .setRequired(true)
              .addChoices(
                { name: 'Fixed', value: bugReports.tags.fixed },
                { name: 'Confirmed', value: bugReports.tags.confirmed },
                { name: "Won't Fix", value: bugReports.tags.wontFix },
                { name: 'Fixed On Github', value: bugReports.tags.fixedOnGithub },
                { name: 'Duplicate', value: bugReports.tags.duplicate },
                { name: 'Missing Info', value: bugReports.tags.missingInfo }
              )
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('type')
          .setDescription('Set the Type of a Bug Report')
          .addStringOption((option) =>
            option
              .setName('type')
              .setDescription('Type of the bug report')
              .setRequired(true)
              .addChoices(
                { name: 'Bot', value: bugReports.tags.bot },
                { name: 'Package', value: bugReports.tags.package }
              )
          )
      )
      .addSubcommand((subcommand) => subcommand.setName('lock').setDescription('Lock a Bug Report'))
      .addSubcommand((subcommand) => subcommand.setName('unlock').setDescription('Unlock a Bug Report'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      if (!interaction.guild || !interaction.channel || !interaction.channel.isThread()) return;
      const subCommand = interaction.options.getSubcommand();
      switch (subCommand) {
        case 'rename': {
          const name = interaction.options.getString('name');
          if (!name) {
            await interaction.reply({ content: 'Please provide a valid name', ephemeral: true });
            return;
          }
          await interaction.channel.edit({ name: name });
          await interaction.reply({ content: 'Bug Report has been renamed', ephemeral: true });
          break;
        }
        case 'status': {
          const status = interaction.options.getString('status');
          if (!status) {
            await interaction.reply({ content: 'Please provide a valid status', ephemeral: true });
            return;
          }
          await interaction.channel.send(
            `Hey <@${interaction.channel.ownerId}> your bug report status has been updated. **Old:** \`${this.lookUpTag(
              interaction.channel.appliedTags.filter(
                (tag) => tag !== bugReports.tags.bot && tag !== bugReports.tags.package
              )[0]
            )}\` **New:** \`${this.lookUpTag(status)}\``
          );
          await interaction.channel.edit({
            appliedTags: [
              ...interaction.channel.appliedTags.filter(
                (tag) => tag === bugReports.tags.bot || tag === bugReports.tags.package
              ),
              status
            ]
          });
          await interaction.reply({ content: 'Bug Report status has been updated', ephemeral: true });
          break;
        }
        case 'type': {
          const status = interaction.options.getString('type');
          if (!status) {
            await interaction.reply({ content: 'Please provide a valid type', ephemeral: true });
            return;
          }
          await interaction.channel.send(
            `Hey <@${interaction.channel.ownerId}> your bug report type has been updated. **Old:** \`${this.lookUpTag(
              interaction.channel.appliedTags.filter(
                (tag) => tag === bugReports.tags.bot || tag === bugReports.tags.package
              )[0]
            )}\` **New:** \`${this.lookUpTag(status)}\``
          );
          await interaction.channel.edit({
            appliedTags: [
              ...interaction.channel.appliedTags.filter(
                (tag) => tag !== bugReports.tags.bot && tag !== bugReports.tags.package
              ),
              status
            ]
          });
          await interaction.reply({ content: 'Bug Report status has been updated', ephemeral: true });
          break;
        }
        case 'lock': {
          await interaction.channel.send({ content: `Bug Report has been locked by <@${interaction.user.id}>` });
          await interaction.channel.edit({ locked: true });
          await interaction.reply({ content: 'Bug Report has been locked', ephemeral: true });
          break;
        }
        case 'unlock': {
          await interaction.channel.send({ content: `Bug Report has been unlocked by <@${interaction.user.id}>` });
          await interaction.channel.edit({ locked: false });
          await interaction.reply({ content: 'Bug Report has been unlocked', ephemeral: true });
          break;
        }
        default: {
          await interaction.reply({ content: 'Invalid subcommand Please provide a valid subcommand', ephemeral: true });
        }
      }
    } catch (error) {
      if (error instanceof Error) this.discord.logger.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Something went wrong. Please try again later.', ephemeral: true });
        return;
      }
      await interaction.reply({ content: 'Something went wrong. Please try again later.', ephemeral: true });
    }
  }

  lookUpTag(tagId: string): string {
    return (Object.keys(bugReports.tags)[Object.values(bugReports.tags).indexOf(tagId)] || 'Unknown')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}
export default BugReportsCommand;
