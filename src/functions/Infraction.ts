import { infractionLogchannel } from '../../config.json';
import { ChannelType } from 'discord.js';
import { model, Schema } from 'mongoose';

export interface InfractionUser {
  id: string;
  staff: boolean;
  bot: boolean;
}

export type InfractionType = 'EVENT' | 'WARN' | 'KICK' | 'BAN';

export interface InfractionInfomation {
  automatic: boolean;
  reason: string;
  type: InfractionType;
  user: InfractionUser;
  staff: InfractionUser;
}

const InteractionUserSchema = new Schema({ id: String, staff: Boolean, bot: Boolean });
const InfractionSchema = new Schema({
  automatic: Boolean,
  reason: String,
  type: String,
  user: InteractionUserSchema,
  staff: InteractionUserSchema
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
      type: this.infraction.type,
      user: this.infraction.user,
      staff: this.infraction.staff
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
  public getInfraction(): InfractionInfomation {
    return this.infraction;
  }
  public getReason(): string {
    return this.infraction.reason;
  }
  public getType(): InfractionType {
    return this.infraction.type;
  }
  public getUser(): InfractionUser {
    return this.infraction.user;
  }
  public getStaff(): InfractionUser | null {
    return this.infraction.staff;
  }
  public isAutomatic(): boolean {
    return this.infraction.automatic;
  }
  public toString(): string {
    return `Infraction: ${this.infraction.reason}\nType: ${this.infraction.type}\nAutomatic: ${
      this.infraction.automatic ? 'Yes' : 'No'
    }\nUser: <@${this.infraction.user.id}>\nStaff: ${
      this.infraction.staff ? `<@${this.infraction.staff.id}>` : 'None'
    }`;
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
