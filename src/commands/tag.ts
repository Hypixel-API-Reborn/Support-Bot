import {
  ModalActionRowComponentBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  SlashCommandBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ModalBuilder,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';
import { contributorsRole, teamRole, devRole } from '../../config.json';
import { getTag, getTagNames } from '../functions/mongo';
import { Tag as TagType } from '../types/main';
import { GuildMember } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('tag')
  .setDescription('Tag preset texts')
  .addSubcommand((subcommand) => subcommand.setName('add').setDescription('Add a new tag'))
  .addSubcommand((subcommand) =>
    subcommand
      .setName('send')
      .setDescription('Send a tag')
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription('The name of the tag')
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addUserOption((option) =>
        option.setName('user').setDescription('The user to mention this tag to').setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName('message-link')
          .setDescription('The Message link to reply with the tag')
          .setRequired(false)
      )
  );

export const autoComplete = async (interaction: AutocompleteInteraction) => {
  const focusedOption = interaction.options.getFocused(true);
  const input = focusedOption.value;
  const names = (await getTagNames()).names as string[];
  let choices: string | any[] = [];
  if (interaction.options.getSubcommand() === 'send' && focusedOption.name === 'name') {
    choices = names.filter((name) => name.includes(input));
  }
  const displayedChoices = choices.slice(0, 25);
  await interaction.respond(displayedChoices.map((choice) => ({ name: choice, value: choice })));
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  try {
    const subCommand = interaction.options.getSubcommand();
    const memberRoles = (interaction.member as GuildMember).roles.cache.map((role) => role.id);
    switch (subCommand) {
      case 'add': {
        if (memberRoles.some((role) => [contributorsRole, teamRole, devRole].includes(role))) {
          const modal = new ModalBuilder()
            .setCustomId('tagForm')
            .setTitle('Please enter the tag information');

          const tagFormName = new TextInputBuilder()
            .setStyle(TextInputStyle.Short)
            .setCustomId('tagFormName')
            .setRequired(true)
            .setLabel('Name');

          const tagFormContent = new TextInputBuilder()
            .setStyle(TextInputStyle.Paragraph)
            .setCustomId('tagFormContent')
            .setLabel('Tag Content')
            .setRequired(true);

          const tagFormNameReason =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(tagFormName);
          const tagFormContentReason =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(tagFormContent);
          modal.addComponents(tagFormNameReason, tagFormContentReason);
          await interaction.showModal(modal);
        } else {
          return await interaction.reply({
            content: 'You do not have permission to use this command',
            ephemeral: true,
          });
        }
        break;
      }
      case 'send': {
        const name = (interaction.options.getString('name') as string).toLowerCase();
        const messageLink = interaction.options.getString('message-link') || null;
        const user = interaction.options.getUser('user');
        const inputTag = await getTag(name);
        if (inputTag.success) {
          await interaction.deferReply({ ephemeral: true });
          if (messageLink) {
            const split = messageLink.split('https://discord.com/channels/')[1].split('/');
            const channel = await interaction.client.channels.fetch(split[1]);
            if (!channel) {
              return await interaction.followUp({
                content: 'Channel not found',
                ephemeral: true,
              });
            }
            const message = await (channel as TextChannel).messages.fetch(split[2]);
            if (!message) {
              return await interaction.followUp({
                content: 'Message not found',
                ephemeral: true,
              });
            }
            message.reply({
              content: user
                ? `${user.toString()}\n\n${(inputTag.tag as TagType).content}`
                : (inputTag.tag as TagType).content,
            });
          } else {
            (interaction.channel as TextChannel).send({
              content: user
                ? `${user.toString()}\n\n${(inputTag.tag as TagType).content}`
                : (inputTag.tag as TagType).content,
            });
          }

          const embed = new EmbedBuilder()
            .setTitle('Tag sent')
            .setDescription(`Tag \`${name}\` sent`);
          return await interaction.followUp({ embeds: [embed] });
        } else {
          return await interaction.reply({
            content: 'Tag not found',
            ephemeral: true,
          });
        }
      }
      default: {
        const embed = new EmbedBuilder()
          .setTitle('Invalid subcommand')
          .setDescription('Please provide a valid subcommand');
        return await interaction.reply({ embeds: [embed] });
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    if (interaction.replied || interaction.deferred) {
      return await interaction.followUp({
        content: 'Something went wrong. Please try again later.',
        ephemeral: true,
      });
    } else {
      return await interaction.reply({
        content: 'Something went wrong. Please try again later.',
        ephemeral: true,
      });
    }
  }
};