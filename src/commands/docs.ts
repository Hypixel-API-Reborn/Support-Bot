import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Doc from 'discord.js-docs';

export const data = new SlashCommandBuilder()
  .setName('docs')
  .setDescription('Shows info about the bot')
  .addStringOption((option) => option.setName('query').setDescription('The query to search for').setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    const query = interaction.options.getString('query') || null;
    if (!query) {
      const embed = new EmbedBuilder()
        .setTitle('Hypixel API • Reborn Documentation')
        .setDescription(
          'The documentation for Hypixel API • Reborn can be found [here](https://hypixel-api-reborn.github.io).'
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }
    const docs = await Doc.fetch(
      'https://raw.githubusercontent.com/hypixel-api-reborn/hypixel-api-reborn/docs/master.json',
      { force: true }
    );
    await interaction.reply({ embeds: [docs.resolveEmbed(query)] });
  } catch (error) {
    console.log(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Something went wrong. Please try again later.', ephemeral: true });
      return;
    }
    await interaction.reply({ content: 'Something went wrong. Please try again later.', ephemeral: true });
  }
}
