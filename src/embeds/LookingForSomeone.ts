import { MessageEmbed } from 'discord.js';
import { Stats, StatsPartial } from './../services/pubg';

const inProgressMedia = [
  'https://media2.giphy.com/media/l3mZfUQOvmrjTTkiY/giphy.gif',
  'https://media.giphy.com/media/3oKIPmaM8aFolCcuI0/giphy.gif',
  'https://media1.giphy.com/media/3ohs7YomxqOz4GRHcQ/giphy.gif',
  'https://media1.giphy.com/media/3ohzdOE33hBQ7duPfi/giphy.gif',
  'https://media.giphy.com/media/qlCFjkSruesco/giphy.gif',
  'https://media.giphy.com/media/3oKIP5KxPss1gjwpG0/giphy.gif',
];

const missingPlayersMedia: { [key: number]: string } = {
  1: 'https://i.imgur.com/TvqWGPH.png',
  2: 'https://i.imgur.com/S8jNcjs.png',
  3: 'https://i.imgur.com/cx62O1M.png',
};

export type Author = {
  id: string;
  avatar: string | null;
};

export type Channel = {
  id: string | null;
  name: string | null;
};

export type LfsUsers =
  | {
      pubgNickname: string;
      discordId: string | null;
      stats?: Stats | StatsPartial | null;
    }[]
  | undefined;

export enum EmbedType {
  lfs = 'lfs',
}

export type LfsEmbedProps = {
  author: Author;
  channel?: Channel | null;
  note?: string;
  users: LfsUsers;
  footer?: EmbedType;
};

export const NOT_FOUND_MESSAGE = '¯\\_(ツ)_/¯';

const computeConclusion = (type: EmbedType, users: LfsUsers, authorId: string, channel?: Channel | null) => {
  if (users && users.length >= 4) return ``;
  return channel
    ? `Norintys prisijungti spauskite ✉️ arba pm <@${authorId}>`
    : `<@${authorId}> ieško squado. Spausk 👍 kad pakviesti`;
};

const computeAuthorAvatar = (channel: Channel, users: LfsUsers, author?: Author) => {
  if (users?.length === 4) {
    return `https://i.imgur.com/uww1e1O.png?channelId=${channel.id}&channelName=${encodeURIComponent(
      channel.name ?? '',
    )}`;
  }

  if (author && author.id && author.avatar) {
    return `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png?size=128&channelId=${
      channel.id
    }&channelName=${encodeURIComponent(channel.name ?? '')}`;
  }

  return `https://i.imgur.com/cqmAKYJ.png?channelId=${channel.id}&channelName=${encodeURIComponent(
    channel.name ?? '',
  )}`;
};

export const EmbedLookingForSomeone = ({ author, channel, users, note, footer }: LfsEmbedProps) => {
  const usersList = users?.map((user) => {
    if (user.pubgNickname === '' || user.stats === undefined) return `\n<@${user.discordId}>${NOT_FOUND_MESSAGE}`;
    return `\n**[${user?.pubgNickname}](https://pubg.op.gg/user/${user?.pubgNickname}?discordId=${user.discordId}&nick=${user?.pubgNickname})** - ${user?.stats?.bestRank}, KD ${user?.stats?.kd}, ADR ${user?.stats?.avgDamage}, WR ${user?.stats?.winRatio}%`;
  });

  const missingPlayers = users ? 4 - users.length : 0;
  const missingPlayersContent = users && users.length ? ` +${4 - users.length} ` : ' ';

  const title = missingPlayers > 0 ? `Ieško ${missingPlayersContent}` : `Šiuo metu lošia`;
  const titleChannel = channel ? `${title} @ ${channel.name}` : title;
  const embedType = footer ?? EmbedType.lfs;
  const conclusion = computeConclusion(embedType, users, author.id, channel);
  const footerComputed = users?.length === 4 ? '' : footer ?? EmbedType.lfs;

  const Embed = new MessageEmbed()
    .setColor(users?.length === 4 ? '#2FCC71' : '#0099ff')
    .setDescription(
      `
        ${usersList}

        ${conclusion}
        ${note ? `> ${note}` : ''}
      `,
    )
    .setFooter(footerComputed)
    .setTimestamp();

  const thumbnail =
    missingPlayers > 0
      ? missingPlayersMedia[missingPlayers]
      : inProgressMedia[Math.floor(Math.random() * inProgressMedia.length)];

  if (channel) {
    Embed.setThumbnail(thumbnail).setAuthor(titleChannel, computeAuthorAvatar(channel, users, author));
  }
  return Embed;
};
