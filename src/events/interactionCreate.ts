/* eslint-disable no-console */
import { Interaction, Events, InteractionType, EmbedBuilder, GuildMember } from 'discord.js';
import { teamRole, devRole } from '../../config.json';
import { Tag, modifyTag } from '../functions/mongo';
import { eventMessage } from '../functions/logger';

export const name = Events.InteractionCreate;
export const execute = async (interaction: Interaction) => {
  try {
    const memberRoles = (interaction.member as GuildMember).roles.cache.map((role) => role.id);
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      if (!interaction.channel) return;
      if (!interaction.guild) return;
      try {
        try {
          eventMessage(
            `Interaction Event trigged by ${interaction.user.username} (${interaction.user.id}
            ) ran command ${interaction.commandName} in ${interaction.guild.id} in ${interaction.channel.id}`
          );
        } catch (error: any) {
          console.log(error);
        }
        await command.execute(interaction);
      } catch (error: any) {
        console.log(error);
      }
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.autoComplete(interaction);
      } catch (error) {
        console.error(error);
      }
    } else if (interaction.type === InteractionType.ModalSubmit) {
      if ('tagForm' === interaction.customId) {
        const name = interaction.fields.getTextInputValue('tagFormName').toLowerCase();
        const content = interaction.fields.getTextInputValue('tagFormContent');

        new Tag(name, content, interaction.user.id, 'approved').save();
        const embed = new EmbedBuilder()
          .setTitle('Tag added')
          .setDescription(`The tag \`${name}\` has been added successfully`);
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
      if ('tagEditForm' === interaction.customId) {
        if (memberRoles.some((role) => [teamRole, devRole].includes(role))) return;
        const name = interaction.fields.getTextInputValue('tagFormUpdatedName').toLowerCase();
        const content = interaction.fields.getTextInputValue('tagFormUpdatedContent');

        const updatedTag = await modifyTag(name, new Tag(name, content, interaction.user.id, 'approved'));
        if (updatedTag.success) {
          const embed = new EmbedBuilder()
            .setTitle('Tag Updated')
            .setDescription(`The tag \`${name}\` has been added successfully`);
          await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (false === updatedTag.success && 'Tag not found' === updatedTag.info) {
          await interaction.reply({ content: 'This tag does not exist!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'An error occurred', ephemeral: true });
        }
      }
    }
  } catch (error: any) {
    console.log(error);
  }
};
