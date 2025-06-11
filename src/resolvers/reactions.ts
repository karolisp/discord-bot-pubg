import { Client, MessageReaction, User, PartialUser } from 'discord.js';
import { EmbedPmRequest } from '../embeds/PmRequest';
import { EmbedPmNotice, EmbedPmNoticeAccept, EmbedPmNoticeWelcome, EmbedPmNoticeDecline } from '../embeds/PmNotice';
import { EmbedPmRequestAccept, EmbedPmRequestDecline } from '../embeds/PmRequest';
import { parseAuthorIdFromLfsEmbed, isLfsTeamEmbed } from '../utils/embeds';
import { parseUserIdFromMention } from '../utils/helpers';
import { AntiSpamLfsReaction } from './../services/spam';
import { logError } from './../services/logs';

type ReactionResolver = (client: Client, reaction: MessageReaction, user: User | PartialUser) => Promise<void>;

type Resolvers = {
  [key: string]: ReactionResolver;
};

export const resolvers: Resolvers = {
  '✉️': async (client, reaction, user) => {
    // todo if user is already in team it shouldnt proceed
    // make sure its in the LFS channel
    if (reaction.message.channel.id !== process.env.LFS_CHANNEL_ID) throw new Error('Forbidden: Invalid lfs channel');

    const [embed] = reaction.message.embeds;

    const authorEmbed: User | PartialUser | undefined = client.users.cache.find(
      (user) => user.id === parseAuthorIdFromLfsEmbed(embed),
    );
    const authorReaction: User | PartialUser = user;

    // most be a lfs embed and author different from "reactor"
    if (authorEmbed && authorEmbed?.id !== authorReaction.id && isLfsTeamEmbed(embed)) {
      const isSpam = AntiSpamLfsReaction.isSpam({
        reaction: reaction.emoji.name,
        lfsAuthorId: authorEmbed.id,
        reactionAuthorId: user.id,
      });

      if (isSpam) {
        await authorReaction.send(
          `<@${
            user.id
          }>, tam pačiam gavėjui jūs galite siųsti ne daugiau vieną ✉️ per ${AntiSpamLfsReaction.getIntervalMinutes()} minutes(-čių) `,
        );
        return;
      }

      await authorReaction.send(EmbedPmNotice(authorEmbed.id));
      const embedPmRequest = await authorEmbed.send(EmbedPmRequest(authorReaction.id, authorReaction.username));
      await embedPmRequest.react('✅');
      await embedPmRequest.react('❌');
    }
  },
  '✅': async (client, reaction, user) => {
    // make sure its in a PM
    if (reaction.message.channel.type !== 'dm') throw new Error('Forbidden: Invalid dm channel');

    const [embed] = reaction.message.embeds;
    const embedType = embed.footer?.text;

    if (embedType === 'lfs') {
      const lfsReactionAuthorId = embed.description ? parseUserIdFromMention(embed.description) : null;
      if (lfsReactionAuthorId && process.env.DISCORD_SERVER_ID) {
        const lfsReactionAuthor = client.users.cache.find((user) => user.id === lfsReactionAuthorId);
        await reaction.message.edit(EmbedPmRequestAccept(lfsReactionAuthorId, lfsReactionAuthor?.username?lfsReactionAuthor?.username:""));

        const guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
        const member = await guild.members.fetch(user.id);
        const lfsAuthorChannel = member.voice.channel;
        const lfsAuthorChannelInvite = await lfsAuthorChannel?.createInvite();
        const lfsAuthorChannelName = lfsAuthorChannel?.toString();

        lfsReactionAuthor?.send(EmbedPmNoticeAccept(user.username?user.username:user.id, lfsAuthorChannelName, lfsAuthorChannelInvite?.url));
      }
    }
  },
  '❌': async (client, reaction, user) => {
    // make sure its in a PM
    if (reaction.message.channel.type !== 'dm') throw new Error('Forbidden: Invalid dm channel');

    const [embed] = reaction.message.embeds;
    const embedType = embed.footer?.text;

    if (embedType === 'lfs') {
      const lfsReactionAuthorId = embed.description ? parseUserIdFromMention(embed.description) : null;
      if (lfsReactionAuthorId && process.env.DISCORD_SERVER_ID) {
        const lfsReactionAuthor = client.users.cache.find((user) => user.id === lfsReactionAuthorId);
        await reaction.message.edit(EmbedPmRequestDecline(lfsReactionAuthorId, user.username));
        lfsReactionAuthor?.send(EmbedPmNoticeDecline(user.username?user.username:user.id));
      }
    }
  },
  '👍': async (client, reaction, user) => {
    // make sure its in the LFS channel
    if (reaction.message.channel.id !== process.env.LFS_CHANNEL_ID) throw new Error('Forbidden: Invalid lfs channel');

    const [embed] = reaction.message.embeds;
    const embedType = embed.footer?.text;
    const isSoloLfs = !embed.author?.name;
    const lfsAuthorId = embed.description ? parseUserIdFromMention(embed.description) : null;
    const isNotAuthor = lfsAuthorId !== user.id;

    if (embedType === 'lfs' && isNotAuthor && isSoloLfs && process.env.DISCORD_SERVER_ID && lfsAuthorId) {
      const guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
      const reactionMember = await guild.members.fetch(user.id);
      const lfsAuthor = client.users.cache.find((user) => user.id === lfsAuthorId);
      const reactionAuthorChannel = reactionMember?.voice.channel;

      if (!reactionAuthorChannel) {
        await user.send(`<@${user.id}>, jei norite pakviesti kitus žaidėjus - turite būti viename iš balso kanalų.`);
        return;
      }

      const isSpam = AntiSpamLfsReaction.isSpam({
        reaction: reaction.emoji.name,
        lfsAuthorId,
        reactionAuthorId: user.id,
      });

      if (isSpam) {
        await reactionMember.send(
          `<@${
            user.id
          }>, tam pačiam gavėjui jūs galite siųsti ne daugiau vieną ✉️ per ${AntiSpamLfsReaction.getIntervalMinutes()} minutes(-čių)`,
        );
        return;
      }

      const channelName = reactionAuthorChannel?.name;
      const channelInvite = await reactionAuthorChannel?.createInvite();
      await lfsAuthor?.send(EmbedPmNoticeWelcome(user.username ? user.username : user.id, channelName, channelInvite?.url));
    }
  },
};

export const REACTIONS = Object.keys(resolvers);

export const reactionsResolver = async (client: Client, reaction: MessageReaction, user: User | PartialUser) => {
  if (!REACTIONS.includes(reaction.emoji.name)) return null;

  try {
    const emoji = reaction.emoji.name;
    const resolver = resolvers[emoji];
    await resolver(client, reaction, user);
  } catch (err) {
    console.error(`Error running reaction resolver: "${reaction.emoji.name} - "`, (err instanceof Error)? err.message : `${err}`);
    await logError(client, reaction.message.channel.id, err);
  }
};
