import User from './../../models/user';
import { CommandResolver } from '.';
import { EmbedSuccessMessage } from '../../embeds/Success';
import { addStatsRoles } from '../../services/roles';
import { EmbedError, EmbedErrorMessage } from '../../embeds/Error';

const UpdateResolver: CommandResolver = async (client, message) => {
  if (message.channel.id !== process.env.ROLES_CHANNEL_ID) return;

  const feedbackMessage = await message.channel.send('Vykdomas atnaujinimas...');

  const updatedUser = await User.updatePubgStats({
    discordId: message.author.id,
  }).then(updated=>{
    if (new Date(updated.updatedAt).getTime() < new Date().getTime() - 3600000)
      feedbackMessage.edit(
        EmbedErrorMessage(`Accounto [${updated.pubgNickname}](https://pubg.op.gg/user/${updated.pubgNickname}) atnaujinimas neivykdytas`,)
      )
    else {
          feedbackMessage.edit(
          EmbedSuccessMessage(
            `Accountas [${updated.pubgNickname}](https://pubg.op.gg/user/${updated.pubgNickname}) atnaujintas.`,
          ),
        );
        if (
          typeof updated?.stats?.currentRank === 'string' &&
          typeof updated?.stats?.avgDamage === 'number' &&
          typeof updated?.stats?.kd === 'number' &&
          typeof updated?.stats?.winRatio === 'number' &&
          message?.member
        ) {
          addStatsRoles(message.member, updated.stats);
          feedbackMessage.edit(
            `${message.member.displayName}, **GameMode**: Squad-FPP, **Rank** : ${updated.stats.currentRank} ${updated.stats.currentSubRank}, **ADR**: ${updated.stats.avgDamage}, **K/D**: ${updated.stats.kd}, **WR**: ${updated.stats.winRatio}%`,
          );
        } 
      }
    return updated;
  }).catch(err=>{
    if (err instanceof EmbedError){
      feedbackMessage.edit(EmbedErrorMessage(err.message))
    } else {
      feedbackMessage.edit(EmbedErrorMessage("Atnaujinmas nepavyko, bandykite vėliau..."))
    }  
  });   
};

export default UpdateResolver;
