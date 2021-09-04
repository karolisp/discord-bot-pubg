import User from './../../models/user';
import { CommandResolver } from '.';
import { EmbedSuccessMessage } from '../../embeds/Success';
import { addStatsRoles } from '../../services/roles';

const UpdateResolver: CommandResolver = async (client, message) => {
  if (message.channel.id !== process.env.ROLES_CHANNEL_ID) return;

  const feedbackMessage = await message.channel.send('Vykdomas atnaujinimas...');

  const updatedUser = await User.updatePubgStats({
    discordId: message.author.id,
  });

  await feedbackMessage.edit(
    EmbedSuccessMessage(
      `Accountas [${updatedUser.pubgNickname}](https://pubg.op.gg/user/${updatedUser.pubgNickname}) atnaujintas.`,
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
      `<@${message.author.id}>, **GameMode**: Squad-FPP, **Rank** (max): ${updatedUser.stats.bestRank}, **ADR**: ${updatedUser.stats.avgDamage}, **K/D**: ${updatedUser.stats.kd}, **WR**: ${updatedUser.stats.winRatio}%`,
    );
  }
};

export default UpdateResolver;
