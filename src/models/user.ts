import mongoose, { Model, Document } from 'mongoose';
import { EmbedError } from './../embeds/Error';
import { getPlayerStats, Stats, StatsPartial } from './../services/pubg';

const UserSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  pubgNickname: {
    type: String,
    required: true,
    unique: true,
  },
  stats: {
    type: {
      kd: {
        type: Number,
        sparce: true,
      },
      avgDamage: {
        type: Number,
        sparce: true,
      },
      winRatio: {
        type: Number,
        sparce: true,
      },
      bestRank: {
        type: String,
        sparce: true,
      },
      roundsPlayed: {
        type: Number,
        sparce: true,
      },
    },
    sparce: true,
  },
});

export interface UserPartial {
  discordId: string;
  pubgNickname: string;
  stats?: Stats | StatsPartial | null;
}
export interface UserDocument extends UserPartial, Document {
  createdAt: string;
  updatedAt: string;
}

type LinkProps = {
  discordId: string;
  pubgNickname: string;
  force?: boolean;
};

interface UserModel extends Model<UserDocument> {
  linkPubgAccount: (
    props: LinkProps,
  ) => Promise<{
    newUser: UserDocument;
    oldUser?: UserDocument;
  }>;
  updatePubgStats: (props: { discordId: string }) => Promise<UserDocument>;
  deleteByPubgAccount: (pubgNickname: string) => Promise<UserDocument>;
}

UserSchema.set('timestamps', true);

// instance
UserSchema.methods = {};

// model
UserSchema.statics = {
  async deleteByPubgAccount(pubgNickname: string) {
    // find in DB
    const userWithNick: UserDocument = await this.findOne({ pubgNickname });
    if (userWithNick) {
      await userWithNick.delete();
    } else {
      throw new EmbedError(`**${pubgNickname}** neprijungtas prie jokio Discord accounto.`);
    }

    return userWithNick;
  },
  async linkPubgAccount({ discordId, pubgNickname, force }: LinkProps) {
    // find in DB
    const userWithNick: UserDocument = await this.findOne({ pubgNickname });
    if (userWithNick) {
      if (force && userWithNick.discordId !== discordId) {
        await userWithNick.delete();
      } else {
        throw new EmbedError(`<@${userWithNick.discordId}> jau prijungtas prie šio pubg accounto: **${pubgNickname}**.`);
      }
    }

    // get player stats from pubg api
    const stats = await getPlayerStats(pubgNickname);
    const newPlayer = await User.findOneAndUpdate(
      { discordId },
      { discordId, pubgNickname, stats },
      {
        new: true,
        upsert: true,
      },
    );
    return { newUser: newPlayer, oldUser: userWithNick };
  },
  async updatePubgStats({ discordId }: LinkProps) {
    // find in DB
    const user: UserDocument = await this.findOne({ discordId });
    if (!user) {
      throw new EmbedError(
        `<@${discordId}>, prijungt pubg accountą prie savo Discord accounto: \`/link PUBG_NAME\`.`,
      );
    }

    // get player stats from pubg api and update
    const stats = await getPlayerStats(user.pubgNickname);
    user.stats = stats;
    await user.save();
    return user;
  },
};

const User = mongoose.model<UserDocument, UserModel>('User', UserSchema);

export default User;
