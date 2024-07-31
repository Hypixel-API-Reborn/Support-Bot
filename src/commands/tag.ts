import {
  ModalActionRowComponentBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ModalBuilder,
  EmbedBuilder,
  ChannelType
} from 'discord.js';
import { deleteTag, getTag, getTagNames } from '../functions/mongo';
import { supportCategory } from '../../config.json';

export const data = new SlashCommandBuilder()
  .setName('tag')
  .setDescription('Tag preset texts')
  .addSubcommand((subcommand) => subcommand.setName('add').setDescription('Add a new tag'))
  .addSubcommand((subcommand) =>
    subcommand
      .setName('edit')
      .setDescription('Edit a tag')
      .addStringOption((option) =>
        option.setName('name').setDescription('The name of the tag').setRequired(true).setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('delete')
      .setDescription('Delete a tag')
      .addStringOption((option) =>
        option.setName('name').setDescription('The name of the tag').setRequired(true).setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('send')
      .setDescription('Send a tag')
      .addStringOption((option) =>
        option.setName('name').setDescription('The name of the tag').setRequired(true).setAutocomplete(true)
      )
      .addUserOption((option) =>
        option.setName('user').setDescription('The user to mention this tag to').setRequired(false)
      )
      .addStringOption((option) =>
        option.setName('message-link').setDescription('The Message link to reply with the tag').setRequired(false)
      )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false);

export async function autoComplete(interaction: AutocompleteInteraction): Promise<void> {
  const focusedOption = interaction.options.getFocused(true);
  const input = focusedOption.value;
  const names = (await getTagNames()).names;
  if (!names) return;
  let choices: string | string[] = [];
  if (
    ('send' === interaction.options.getSubcommand() ||
      'edit' === interaction.options.getSubcommand() ||
      'delete' === interaction.options.getSubcommand()) &&
    'name' === focusedOption.name
  ) {
    choices = names.filter((name) => name.includes(input));
  }
  const displayedChoices = choices.slice(0, 25);
  await interaction.respond(displayedChoices.map((choice) => ({ name: choice, value: choice })));
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    if (!interaction.member) return;
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case 'add': {
        const modal = new ModalBuilder().setCustomId('tagForm').setTitle('Please enter the tag information');
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
        const tagFormNameReason = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(tagFormName);
        const tagFormContentReason = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          tagFormContent
        );
        modal.addComponents(tagFormNameReason, tagFormContentReason);
        await interaction.showModal(modal);
        break;
      }
      case 'edit': {
        let name = interaction.options.getString('name');
        if (!name) return;
        name = name.toLowerCase();
        const modal = new ModalBuilder()
          .setCustomId(`t.e.${name}`)
          .setTitle('Please enter the updated tag information');
        const tagFormContent = new TextInputBuilder()
          .setStyle(TextInputStyle.Paragraph)
          .setCustomId('tagFormUpdatedContent')
          .setLabel('New Tag Content')
          .setRequired(true);
        const tagFormContentReason = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          tagFormContent
        );
        modal.addComponents(tagFormContentReason);
        await interaction.showModal(modal);
        break;
      }
      case 'delete': {
        const name = interaction.options.getString('name');
        if (!name) return;
        const inputTag = await deleteTag(name.toLowerCase());
        if (inputTag.success) {
          await interaction.reply({ content: 'Tag deleted successfully', ephemeral: true });
          return;
        }
        await interaction.reply({ content: 'Tag not found', ephemeral: true });
        return;
      }
      case 'send': {
        const name = interaction.options.getString('name');
        if (!name) return;
        let messageLink = interaction.options.getString('message-link') || null;
        const user = interaction.options.getUser('user');
        const inputTag = await getTag(name.toLowerCase());
        if (!inputTag.success) await interaction.reply({ content: 'Tag not found', ephemeral: true });
        if (!inputTag.tag?.status) return;
        await interaction.deferReply({ ephemeral: true });
        if (messageLink) {
          if (!messageLink.includes('discord.com/channels/')) {
            await interaction.followUp({ content: 'Invalid message link', ephemeral: true });
            return;
          }
          if (!messageLink.includes('https://')) {
            await interaction.followUp({ content: 'Invalid message link', ephemeral: true });
            return;
          }
          if (messageLink.startsWith('https://canary.discord.com')) {
            messageLink = messageLink.replace('canary.', '');
          }
          if (messageLink.startsWith('https://ptb.discord.com')) {
            messageLink = messageLink.replace('ptb.', '');
          }
          const split = messageLink.split('https://discord.com/channels/')[1].split('/');
          const channel = await interaction.client.channels.fetch(split[1]);
          if (!channel) {
            await interaction.followUp({ content: 'Channel not found', ephemeral: true });
            return;
          }
          if (channel.type !== ChannelType.GuildText) {
            await interaction.followUp({ content: 'Invalid channel type', ephemeral: true });
            return;
          }
          if (channel.parentId !== supportCategory) {
            await interaction.followUp({ content: 'Tags can only be sent in support channels', ephemeral: true });
            return;
          }
          const message = await channel.messages.fetch(split[2]);
          if (!message) {
            await interaction.followUp({ content: 'Message not found', ephemeral: true });
            return;
          }
          message.reply({ content: user ? `${user.toString()}\n\n${inputTag.tag.content}` : inputTag.tag.content });
        } else {
          if (!interaction.channel) return;
          if (interaction.channel.type !== ChannelType.GuildText) {
            return;
          }
          if (interaction.channel.parentId !== supportCategory) {
            await interaction.followUp({ content: 'Tags can only be sent in support channels', ephemeral: true });
            return;
          }
          interaction.channel.send({
            content: user ? `${user.toString()}\n\n${inputTag.tag.content}` : inputTag.tag.content
          });
        }
        await interaction.followUp({ content: `Tag \`${name}\` sent` });
        return;
      }
      default: {
        const embed = new EmbedBuilder()
          .setTitle('Invalid subcommand')
          .setDescription('Please provide a valid subcommand');
        await interaction.reply({ embeds: [embed] });
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
