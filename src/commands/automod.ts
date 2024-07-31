import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { autoModBypassRole } from '../../config.json';
import { readFileSync, writeFileSync } from 'fs';
import ms from 'ms';

export const data = new SlashCommandBuilder()
  .setName('automod')
  .setDescription('Manage AutoMod')
  .addSubcommandGroup((subgroup) =>
    subgroup
      .setName('user')
      .setDescription('Manage Automod for a user')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('permit')
          .setDescription('Allow someone to bypass automod')
          .addUserOption((option) => option.setName('user').setDescription('The user to permit').setRequired(true))
          .addStringOption((option) =>
            option.setName('time').setDescription('How long to permit a user').setRequired(false)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('unpermit')
          .setDescription('Remove someones automod bypass')
          .addUserOption((option) => option.setName('user').setDescription('The user to remove').setRequired(true))
      )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false);
export interface UserPermit {
  id: string;
  removeTime: number;
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    if (!interaction.guild) return;
    const subgroup = interaction.options.getSubcommandGroup();
    const subCommand = interaction.options.getSubcommand();
    switch (subgroup) {
      case 'user': {
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
        const permitData = readFileSync('data/permit.json');
        if (!permitData) {
          await interaction.reply({
            content: 'The linked data file does not exist. Please contact an administrator.',
            ephemeral: true
          });
        }
        let permit = JSON.parse(permitData.toString());
        if (!permit) {
          await interaction.reply({
            content: 'The linked data file is malformed. Please contact an administrator.',
            ephemeral: true
          });
        }
        switch (subCommand) {
          case 'permit': {
            const time = interaction.options.getString('time') || '10m';
            const msTime = ms(time);
            const removeTime = Math.floor((new Date().getTime() + msTime) / 1000);
            permit.push({ id: user.id, removeTime });
            writeFileSync('data/permit.json', JSON.stringify(permit));
            user.roles.add(autoModBypassRole);
            await interaction.reply({
              content: `${user} has been permitted to <t:${removeTime}:t> (<t:${removeTime}:R>)`
            });
            break;
          }
          case 'unpermit': {
            const permitUser = permit.find((data: UserPermit) => data.id === user.id);
            if (!permitUser) {
              await interaction.reply({ content: 'User is not permited', ephemeral: true });
              return;
            }
            user.roles.remove(autoModBypassRole);
            permit = permit.filter((data: UserPermit) => data.id !== user.id);
            writeFileSync('data/permit.json', JSON.stringify(permit));
            await interaction.reply({ content: `${user} is no longer permited` });
            break;
          }
          default: {
            await interaction.reply({
              content: 'Invalid subcommand Please provide a valid subcommand',
              ephemeral: true
            });
          }
        }
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
