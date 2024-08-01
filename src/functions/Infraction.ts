import { infractionLogchannel } from '../../config.json';
import { ChannelType } from 'discord.js';
import { model, Schema } from 'mongoose';

export interface InfractionUser {
  id: string;
  staff: boolean;
  bot: boolean;
}

export type InfractionType = 'EVENT' | 'WARN' | 'KICK' | 'BAN' | 'MUTE' | 'UNMUTE';

export interface InfractionInfomation {
  automatic: boolean;
  reason: string;
  long: number | null;
  type: InfractionType;
  user: InfractionUser;
  staff: InfractionUser;
  timestamp: number;
}

const InteractionUserSchema = new Schema({ id: String, staff: Boolean, bot: Boolean });
const InfractionSchema = new Schema({
  automatic: Boolean,
  reason: String,
  long: {
    type: Number,
    default: null
  },
  type: String,
  user: InteractionUserSchema,
  staff: InteractionUserSchema,
  timestamp: Number
});
const InfractionModel = model('infraction', InfractionSchema);

class Infraction {
  private infraction: InfractionInfomation;
  constructor(infraction: InfractionInfomation) {
    this.infraction = infraction;
  }

  public save() {
    return new InfractionModel({
      automatic: this.infraction.automatic,
      reason: this.infraction.reason,
      long: this.infraction.long,
      type: this.infraction.type,
      user: this.infraction.user,
      staff: this.infraction.staff,
      timestamp: this.infraction.timestamp
    }).save();
  }

  public setAutomatic(automatic: boolean): this {
    this.infraction.automatic = automatic;
    return this;
  }

  public setReason(reason: string): this {
    this.infraction.reason = reason;
    return this;
  }

  public setLong(long: number | null): this {
    this.infraction.long = long;
    return this;
  }

  public setType(type: InfractionType): this {
    this.infraction.type = type;
    return this;
  }

  public setUser(user: InfractionUser): this {
    this.infraction.user = user;
    return this;
  }

  public setStaff(staff: InfractionUser): this {
    this.infraction.staff = staff;
    return this;
  }

  public setTimestamp(timestamp: number): this {
    this.infraction.timestamp = timestamp;
    return this;
  }

  public getAutomatic(): boolean {
    return this.infraction.automatic;
  }

  public getReason(): string {
    return this.infraction.reason;
  }

  public getLong(): number | null {
    return this.infraction.long;
  }

  public getType(): InfractionType {
    return this.infraction.type;
  }

  public getUser(): InfractionUser {
    return this.infraction.user;
  }

  public getStaff(): InfractionUser {
    return this.infraction.staff;
  }

  public getTimestamp(): number {
    return this.infraction.timestamp;
  }

  public toString(): string {
    return `Infraction: ${this.infraction.reason}\nType: ${this.infraction.type}\nLong: ${
      this.infraction.long
    }\nAutomatic: ${this.infraction.automatic ? 'Yes' : 'No'}\nUser: <@${this.infraction.user.id}>\nStaff: ${
      this.infraction.staff ? `<@${this.infraction.staff.id}>` : 'None'
    }\nTimestamp: <t:${Math.floor(
      this.infraction.timestamp / 1000
    )}:t> (<t:${Math.floor(this.infraction.timestamp / 1000)}:R>)`;
  }

  public log(): this {
    const channel = guild.channels.cache.get(infractionLogchannel);
    if (!channel || channel.type !== ChannelType.GuildText) return this;
    channel.send(this.toString());
    return this;
  }
}

export interface InfractionReturn {
  success: boolean;
  info: string;
  infraction?: Infraction;
  infractions?: Infraction[];
}

export async function getUserInfractions(id: string): Promise<InfractionReturn> {
  const userInfractions = await InfractionModel.find({ 'user.id': id });
  if (!userInfractions) return { success: false, info: 'No infractions found' };
  const foundInfraction: Infraction[] = [];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  userInfractions.forEach((infraction) => foundInfraction.push(new Infraction(infraction)));
  return { success: true, info: `User has ${foundInfraction.length} infractions`, infractions: foundInfraction };
}

export default Infraction;
