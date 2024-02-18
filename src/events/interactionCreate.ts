/* eslint-disable no-console */
import { TextChannel, Interaction, Events, Guild } from 'discord.js';
import { eventMessage } from '../functions/logger';

export const name = Events.InteractionCreate;
export const execute = async (interaction: Interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        try {
          let commandString = interaction.commandName;
          if (interaction.options) {
            for (const option of interaction.options.data) {
              commandString += ` ${option.name}:`;
              commandString += `${option.autocomplete ? option.autocomplete : ''}`;
              commandString += `${option.value ? option.value : ''}`;
              if (option.options) {
                for (const subOption of option.options) {
                  commandString += ` ${subOption.name}:`;
                  commandString += subOption.autocomplete ? subOption.autocomplete : '';
                  commandString += subOption.value ? subOption.value : '';
                  if (subOption.options) {
                    for (const subSubOption of subOption.options) {
                      commandString += ` ${subSubOption.name}:`;
                      commandString += subSubOption.autocomplete ? subSubOption.autocomplete : '';
                      commandString += subSubOption.value ? subSubOption.value : '';
                      commandString += subSubOption.user ? subSubOption.user : '';
                      commandString += subSubOption.member ? subSubOption.member : '';
                      commandString += subSubOption.channel ? subSubOption.channel : '';
                      commandString += subSubOption.role ? subSubOption.role : '';
                      commandString += subSubOption.attachment ? subSubOption.attachment : '';
                    }
                    commandString += ` ${subOption.user ? subOption.user : ''}`;
                    commandString += ` ${subOption.member ? subOption.member : ''}`;
                    commandString += ` ${subOption.channel ? subOption.channel : ''}`;
                    commandString += ` ${subOption.role ? subOption.role : ''}`;
                    commandString += ` ${subOption.attachment ? subOption.attachment : ''}`;
                  }
                  commandString += subOption.user ? subOption.user : '';
                  commandString += subOption.member ? subOption.member : '';
                  commandString += subOption.channel ? subOption.channel : '';
                  commandString += subOption.role ? subOption.role : '';
                  commandString += subOption.attachment ? subOption.attachment : '';
                }
              }
              commandString += option.user ? option.user : '';
              commandString += option.member ? option.member : '';
              commandString += option.channel ? option.channel : '';
              commandString += option.role ? option.role : '';
              commandString += option.attachment ? option.attachment : '';
            }
          }
          eventMessage(
            `Interaction Event trigged by ${interaction.user.discriminator == '0' ? interaction.user.username : `${interaction.user.username}#${interaction.user.discriminator}`} (${interaction.user.id}) ran command ${commandString} in ${(interaction.guild as Guild).id} in ${(interaction.channel as TextChannel).id}`
          );
        } catch (error: any) {
          console.log(error);
        }
        await command.execute(interaction);
      } catch (error: any) {
        console.log(error);
      }
    }
  } catch (error: any) {
    console.log(error);
  }
};
