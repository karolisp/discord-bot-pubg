import { EmbedLookingForSomeone } from '../../embeds/LookingForSomeone';
import { computeChannelUsers, computeUserPartialFromDocument, clearQuotes } from './../../utils/helpers';
import { CommandResolver, QUOTE_REGEX, NOTE_LIMIT_CHARS } from '.';
import { deleteAllLfsAuthorEmbeds, parseMessageRelatedToChannel } from '../../utils/embeds';
import { EmbedError } from '../../embeds/Error';
import User from './../../models/user';

const LfsResolver: CommandResolver = async (client, message, argumentsParsed) => {
  if (message.channel.id !== process.env.LFS_CHANNEL_ID) return;

  await message.delete();
  const authorVoiceChannel = message.member?.voice.channel;
  const isNoteValid = QUOTE_REGEX.test(argumentsParsed._[1]);
  const note = clearQuotes(argumentsParsed._[1]) ?? '';

  if (note.length - 1 > NOTE_LIMIT_CHARS) {
    throw new EmbedError(
      `<@${message.author.id}> maximum 120 zenklu žinutėje \`lfs "žinutė"\`.`,
    );
  }

  // delete previous lfs embeds
  const textChannel = await client.channels.fetch(process.env.LFS_CHANNEL_ID);
  if (textChannel.isText()) {
    const messages = await textChannel.messages.fetch();
    await deleteAllLfsAuthorEmbeds(message.author.id, messages);

    // should only create lfs if theres not one already related to the channel
    if (authorVoiceChannel?.id) {
      const updatedMessages = await textChannel.messages.fetch();
      const messagesArr = updatedMessages.map((m) => m);
      const embedOfChannel = parseMessageRelatedToChannel(messagesArr, authorVoiceChannel?.id);
      if (
        embedOfChannel?.embedParsed?.channel?.id &&
        embedOfChannel?.embedParsed?.channel?.id === authorVoiceChannel?.id
      )
        return;
    }

    // should only create lfs if less than 4 players in channel
    if (authorVoiceChannel && authorVoiceChannel?.members?.size >= 4) {
      await message.member?.send('Voice Roome jau yra 4 žaidėjai, LFS žinutė nebuvo sukurta.');
      return;
    }
  }

  if (authorVoiceChannel && authorVoiceChannel.members.size > 0) {
    const authorVoiceChannelUsersDiscordIds = authorVoiceChannel?.members.map((member) => member.user.id);
    const channelUsersDocuments = await User.find({ discordId: { $in: authorVoiceChannelUsersDiscordIds } });
    const channelUsersWithStats = computeChannelUsers(
      authorVoiceChannel?.members,
      channelUsersDocuments,
      message.author.id,
    );
    const embed = await message.channel.send(
      EmbedLookingForSomeone({
        author: {
          id: message.author.id,
          avatar: message.author.avatar,
        },
        users: channelUsersWithStats,
        channel: {
          id: authorVoiceChannel.id,
          name: authorVoiceChannel.name,
        },
        note: isNoteValid ? note : '',
      }),
    );
    await embed.react('✉️');
  } else {
    const authorDocument = await User.findOne({ discordId: message.author.id });
    const users = [computeUserPartialFromDocument(message.author.id, authorDocument)];
    const embed = await message.channel.send(
      EmbedLookingForSomeone({
        author: {
          id: message.author.id,
          avatar: message.author.avatar,
        },
        users,
        note: isNoteValid ? note : '',
      }),
    );
    await embed.react('👍');
  }
};

export default LfsResolver;
