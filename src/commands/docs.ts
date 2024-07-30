import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Doc from 'discord.js-docs';

export const data = new SlashCommandBuilder()
  .setName('docs')
  .setDescription('Shows info about the bot')
  .addStringOption((option) =>
    option.setName('query').setDescription('The query to search for').setRequired(false)
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  try {
    const query = interaction.options.getString('query') || null;
    if (!query) {
      const embed = new EmbedBuilder()
        .setTitle('Hypixel API • Reborn Documentation')
        .setDescription(
          'The documentation for Hypixel API • Reborn can be found [here](https://hypixel-api-reborn.github.io).'
        );
      return await interaction.reply({ embeds: [embed] });
    } else {
      const docs = await Doc.fetch(
        'https://raw.githubusercontent.com/hypixel-api-reborn/hypixel-api-reborn/docs/master.json',
        { force: true }
      );
      return await interaction.reply({ embeds: [docs.resolveEmbed(query)] });
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
