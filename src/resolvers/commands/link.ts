import User from './../../models/user';
import { GuildMember } from 'discord.js';
import { CommandResolver } from '.';
import { EmbedError } from '../../embeds/Error';
import { EmbedSuccessMessage } from '../../embeds/Success';
import { addStatsRoles, removeRoles } from '../../services/roles';

const LinkResolver: CommandResolver = async (client, message, argumentsParsed) => {
  const isLfsChannel = message.channel.id === process.env.ROLES_CHANNEL_ID;
  const isAdminChannel = message.channel.id === process.env.ADMIN_CHANNEL_ID;
  if (!isLfsChannel && !isAdminChannel) return;

  const pubgNickname = argumentsParsed._[1] || '';
  const discordId = argumentsParsed._[2] || '';
  const isAdminCommand = isAdminChannel && discordId;
  const command = isAdminChannel ? `\`/link NICK_DO_PUBG DISCORD_ID\`` : `\`/link NICK_DO_PUBG\``;

  if (pubgNickname === '') {
    throw new EmbedError(
      `<@${message.author.id}> Kad prijungti pubg accounta būtina pateikti tikslų vardą:  ${command}`,
    );
  }

  if (isAdminChannel && discordId === '') {
    throw new EmbedError(
      `<@${message.author.id}> Kad prijungti **${pubgNickname}** administravimo kanale, būtina pateikti prie kurio discord accounto jį prijungti:  ${command}`,
    );
  }

  const feedbackMessage = await message.channel.send('Prijunginėjamas accountas...');

  const {
    newUser: { stats },
    oldUser,
  } = await User.linkPubgAccount({
    discordId: isAdminChannel ? discordId : message.author.id,
    pubgNickname,
    force: isAdminChannel,
  });

  await feedbackMessage.edit(
    EmbedSuccessMessage(
      isAdminCommand
        ? `Jūs prijungėte [${pubgNickname}](https://pubg.op.gg/user/${pubgNickname}) accountą prie discord accounto <@${discordId}>`
        : `Sveikinimai prijungus [${pubgNickname}](https://pubg.op.gg/user/${pubgNickname}) prie savo Discord!`,
    ),
  );

  if (
    typeof stats?.currentRank === 'string' &&
    typeof stats?.avgDamage === 'number' &&
    typeof stats?.kd === 'number' &&
    typeof stats?.winRatio === 'number' &&
    message?.member
  ) {
    // remove roles from user that had the nickname before forced change
    if (isAdminCommand && oldUser?.discordId) {
      const oldMember = await message.guild?.members.fetch(oldUser.discordId);
      if (oldMember) {
        await removeRoles(oldMember);
        await message.channel.send(`Roles de <@${oldUser.discordId}> removidas.`);
      }
    }

    const linkedDiscordId = isAdminCommand ? discordId : message.author.id;
    let member: GuildMember | undefined = message.member;
    if (isAdminCommand) {
      member = await message.guild?.members.fetch(discordId);
    }
    if (!member) throw new EmbedError('Toks vartotojas nerastas...');
    await addStatsRoles(member, stats);
    const messageStats = `<@${linkedDiscordId}>, **GameMode**: Squad-FPP, **Rank** (max): ${stats.bestRank}, **ADR**: ${stats.avgDamage}, **K/D**: ${stats.kd}, **WR**: ${stats.winRatio}%.`;
    await feedbackMessage.edit(messageStats);
  }
};

export default LinkResolver;
