import { Collection, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord';

export interface SlashCommand {
  command: SlashCommandBuilder | any;

  execute: (interaction: ChatInputCommandInteraction) => void;
}

export interface Tag {
  content: string;
  status: string;
  name: string;
  id: string;
}

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, SlashCommand>;
  }
}
