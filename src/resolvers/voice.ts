import { VoiceState, Client } from 'discord.js';
import { EmbedLookingForSomeone, EmbedType } from '../embeds/LookingForSomeone';
import User from '../models/user';
import { parseMessageRelatedToChannel } from './../utils/embeds';

export const voiceResolver = async (client: Client, oldState: VoiceState, newState: VoiceState) => {
  if (!process.env.LFS_CHANNEL_ID) return;

  const prevVoiceChannel = oldState.channel?.id;
  const newVoiceChannel = newState.channel?.id;
  const hasJoined = Boolean(newVoiceChannel);
  const hasSwitched = Boolean(hasJoined && prevVoiceChannel && prevVoiceChannel !== newVoiceChannel);
  const userId = newState.id;

  const textChannel = await client.channels.fetch(process.env.LFS_CHANNEL_ID);
  if (!textChannel.isText()) return;

  const messages = await textChannel.messages.fetch();
  const messagesArr = messages.map((m) => m);

  if (hasJoined) {
    // add user to embed
    const newMessageParsed = parseMessageRelatedToChannel(messagesArr, newVoiceChannel);
    if (newMessageParsed?.message && newMessageParsed?.embedParsed && newMessageParsed?.embedParsed.users) {
      const alreadyInEmbed = newMessageParsed.embedParsed.users.find((u) => u.discordId === userId);
      if (alreadyInEmbed) return;

      const { message } = newMessageParsed;
      const userDb = await User.findOne({ discordId: userId });
      const userNew = {
        pubgNickname: userDb?.pubgNickname ?? '',
        discordId: userDb?.discordId ?? userId,
        stats: {
          kd: userDb?.stats?.kd ?? undefined,
          avgDamage: userDb?.stats?.avgDamage ?? undefined,
          bestRank: userDb?.stats?.bestRank ?? undefined,
          winRatio: userDb?.stats?.winRatio ?? undefined,
          currentRank: userDb?.stats?.currentRank ?? undefined,
          currentSubRank: userDb?.stats?.currentSubRank ?? undefined,
        },
      };

      const usersNew = userNew?.discordId
        ? [...newMessageParsed.embedParsed.users, userNew]
        : newMessageParsed.embedParsed.users;

      if (usersNew.length >= 4) {
        await newMessageParsed.message.reactions.removeAll();
      }

      await message.edit('', EmbedLookingForSomeone({ ...newMessageParsed.embedParsed, users: usersNew }));
    }

    // only proceed to deleting the user from another embed if he switched channels
    if (!hasSwitched) {
      return;
    }
  }

  // Remove user from channel embed
  const prevMessageParsed = parseMessageRelatedToChannel(messagesArr, prevVoiceChannel);
  if (!prevMessageParsed?.message || !prevMessageParsed?.embedParsed || !prevMessageParsed?.embedParsed.users) return;
  const { message, embedParsed } = prevMessageParsed;

  // delete embed if only person on embed left or author left
  if (prevMessageParsed.embedParsed.users.length === 1 || embedParsed.author.id === userId) {
    await message.delete();
    return;
  }

  // remove from embed
  if (embedParsed.users && embedParsed.users.length > 1 && embedParsed.author && embedParsed.author.id !== null) {
    const newUsers = embedParsed.users.filter((u) => u.discordId !== userId);
    await message.edit(
      '',
      EmbedLookingForSomeone({
        ...embedParsed,
        users: newUsers,
      }),
    );
  }
};
