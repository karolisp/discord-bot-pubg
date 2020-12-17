import argv from 'yargs-parser';
import { Client, Message } from 'discord.js';
import { EmbedLookingForSomeone } from '../embeds/LookingForSomeone';
import { EmbedErrorMessage, EmbedError } from '../embeds/Error';
import { EmbedSuccessMessage } from '../embeds/Success';
import { parseAuthorIdFromLfsEmbed } from '../utils/embeds';
import { addStatsRoles } from '../services/roles';
import { computeChannelUsers, computeUserPartialFromDocument } from './../utils/helpers';
import User from './../models/user';
import AntiSpam from './../services/spam';

type CommandResolver = (client: Client, message: Message, argumentsParsed: argv.Arguments) => Promise<void>;

type Resolvers = {
  lfs: CommandResolver;
  '-': CommandResolver;
  '/link': CommandResolver;
  [key: string]: CommandResolver;
};

export const resolvers: Resolvers = {
  lfs: async (client, message) => {
    if (message.channel.id !== process.env.LFS_CHANNEL_ID) return;

    await message.delete();

    const authorChannel = message.member?.voice.channel;

    if (authorChannel && authorChannel.members.size > 0) {
      const authorChannelUsersDiscordIds = authorChannel?.members.map((member) => member.user.id);
      const channelUsersDocuments = await User.find({ discordId: { $in: authorChannelUsersDiscordIds } });
      const channelUsersWithStats = computeChannelUsers(
        authorChannel?.members,
        channelUsersDocuments,
        message.author.id,
      );
      const embed = await message.channel.send(EmbedLookingForSomeone(message, channelUsersWithStats, authorChannel));
      await embed.react('✉️');
    } else {
      const authorDocument = await User.findOne({ discordId: message.author.id });
      const users = [computeUserPartialFromDocument(message.author.id, authorDocument)];
      const embed = await message.channel.send(EmbedLookingForSomeone(message, users));
      await embed.react('👍');
    }
  },
  '-': async (client, message) => {
    if (message.channel.id !== process.env.LFS_CHANNEL_ID) return;

    await message.delete();
    const channel = await client.channels.fetch(process.env.LFS_CHANNEL_ID);
    if (channel.isText()) {
      const messages = await channel.messages.fetch();
      // find last embed initiated by the author and delete
      const authorEmbedsMessages = messages.filter(
        (m) => m.author.bot && m.embeds.length > 0 && parseAuthorIdFromLfsEmbed(m.embeds[0]) === message.author.id,
      );
      const firstAuthorEmbedMessage = authorEmbedsMessages.first();
      await firstAuthorEmbedMessage?.delete();
    }
  },
  '/link': async (client, message, argumentsParsed) => {
    if (message.channel.id !== process.env.ROLES_CHANNEL_ID) return;

    const pubgNickname = argumentsParsed._[1] || '';

    if (pubgNickname === '') {
      throw new EmbedError(
        `<@${message.author.id}> para associar a tua conta é necessário dizer o nome no pubg, exemplo:  \`/link NICK_DO_PUBG\``,
      );
    }

    const feedbackMessage = await message.channel.send('A associar contas...');

    const { stats } = await User.linkPubgAccount({
      discordId: message.author.id,
      pubgNickname,
    });

    await feedbackMessage.edit(
      EmbedSuccessMessage(
        `Ligaste a conta [${pubgNickname}](https://pubg.op.gg/user/${pubgNickname}) à tua conta de Discord!`,
      ),
    );
    if (
      typeof stats?.bestRank === 'string' &&
      typeof stats?.avgDamage === 'number' &&
      typeof stats?.kd === 'number' &&
      typeof stats?.winRatio === 'number' &&
      message?.member
    ) {
      await addStatsRoles(message.member, stats);
      await feedbackMessage.edit(
        `<@${message.author.id}>, **Modo**: Squad-FPP, **Rank** (maior): ${stats.bestRank}, **ADR**: ${stats.avgDamage}, **K/D**: ${stats.kd}, **WR**: ${stats.winRatio}%`,
      );
    }
  },
  '/update': async (client, message) => {
    if (message.channel.id !== process.env.ROLES_CHANNEL_ID) return;

    const feedbackMessage = await message.channel.send('A atualizar...');

    const updatedUser = await User.updatePubgStats({
      discordId: message.author.id,
    });

    await feedbackMessage.edit(
      EmbedSuccessMessage(
        `Conta atualizada [${updatedUser.pubgNickname}](https://pubg.op.gg/user/${updatedUser.pubgNickname}).`,
      ),
    );

    if (
      typeof updatedUser?.stats?.bestRank === 'string' &&
      typeof updatedUser?.stats?.avgDamage === 'number' &&
      typeof updatedUser?.stats?.kd === 'number' &&
      typeof updatedUser?.stats?.winRatio === 'number' &&
      message?.member
    ) {
      await addStatsRoles(message.member, updatedUser.stats);
      await feedbackMessage.edit(
        `<@${message.author.id}>, **Modo**: Squad-FPP, **Rank** (maior): ${updatedUser.stats.bestRank}, **ADR**: ${updatedUser.stats.avgDamage}, **K/D**: ${updatedUser.stats.kd}, **WR**: ${updatedUser.stats.winRatio}%`,
      );
    }
  },
};

export const COMMANDS = Object.keys(resolvers);

export const commandsResolver = async (client: Client, message: Message) => {
  const commandArgv = argv(message.content);

  const [command] = commandArgv._;
  if (!COMMANDS.includes(command)) return null;

  try {
    AntiSpam.log(message.author.id, message.content);
    const isSpamDetected = await AntiSpam.checkMessageInterval(message); // Check sent messages interval
    if (isSpamDetected) {
      await message.delete();
      throw new Error(`Spam detected: ${message.content} by ${message.author.id}`);
    }

    const resolver = resolvers[command];
    await resolver(client, message, commandArgv);
  } catch (err) {
    if (err.name === 'EmbedError') {
      await message.channel.send(EmbedErrorMessage(err.message));
    } else console.error(`Error running command resolver: "${command}"`, err.message);
  }
};
