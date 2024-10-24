import User, { UserDocument } from './../../models/user';
import { removeRoles } from '../../services/roles';
import { EmbedError } from '../../embeds/Error';
import { CommandResolver } from '.';
import { EmbedSuccessMessage } from '../../embeds/Success';
import argv from 'yargs-parser';
import { Client, Message } from 'discord.js';


const UnlinkResolver: CommandResolver = async (client, message, argumentsParsed) => {
  const isAdminChannel = message.channel.id === process.env.ADMIN_CHANNEL_ID;
  const isRolesChannel = message.channel.id === process.env.ROLES_CHANNEL_ID;
  if (isAdminChannel) await unlinkAsAdmin(client,message,argumentsParsed)
  if (isRolesChannel) await unlinkAsUser(client,message,argumentsParsed)
};

const unlinkAsAdmin = async (client: Client, message: Message, argumentsParsed: argv.Arguments) => {
  const pubgNickname = argumentsParsed._[1] || '';
  const command = `\`/unlink PUBG_NICKNAME\``;
  const unlinkTargetId = message.author.id
  const unlinkTarget: UserDocument | null = await User.findOne({ pubgNickname })
  
  if (unlinkTarget == null){
    await message.channel.send(`<@${message.author.id}> nerastas discord useris prilinkintas prie ${pubgNickname}`);
    return;    
  }

  if (pubgNickname === '') {
    throw new EmbedError(
      `<@${message.author.id}> norint atjungti pubg accountą reikia pasakyti jo vardą:  ${command}`,
    );
  }

  const feedbackMessage = await message.channel.send('Vykdomas atjungimas...');
  const { discordId } = await User.deleteByPubgAccount(pubgNickname);

  const member = await message.guild?.members.fetch(discordId);
  if (member) {
    await removeRoles(member);
    await message.channel.send(`Nuo <@${discordId}> nuimtos rolės.`);
  }

  await feedbackMessage.edit(
    EmbedSuccessMessage(
      `Jūs atjungėte [${pubgNickname}](https://pubg.op.gg/user/${pubgNickname}) accountą nuo <@${discordId}>`,
    ),
  ); 
}

const unlinkAsUser = async (client: Client, message: Message, argumentsParsed: argv.Arguments) => {
  const pubgNickname = argumentsParsed._[1] || '';
  const command = `\`/unlink \``;
  const discordId = message.author.id
  const unlinkTarget: UserDocument | null = await User.findOne({ discordId })
  
  if (unlinkTarget == null){
    await message.channel.send(`<@${message.author.id}> nerastas prilinkintas accountas...`);
    return;    
  }

  if (!(unlinkTarget?.discordId == message.author.id)) {
    await message.channel.send(`<@${message.author.id}> nerastas discord useris prilinkintas prie ${pubgNickname}`);
    return;
  } 

  if (pubgNickname === '') {
    throw new EmbedError(
      `<@${message.author.id}> norint atjungti pubg accountą reikia pasakyti jo vardą:  ${command}`,
    );
  }

  const feedbackMessage = await message.channel.send('Vykdomas atjungimas...');
  const deletedUser = await User.deleteByPubgAccount(unlinkTarget.pubgNickname);

  const member = await message.guild?.members.fetch(deletedUser.discordId);
  if (member) {
    await removeRoles(member);
    await message.channel.send(`Nuo <@${discordId}> nuimtos rolės.`);
  }

  await feedbackMessage.edit(
    EmbedSuccessMessage(
      `[${pubgNickname}](https://pubg.op.gg/user/${pubgNickname}) atjungtas nuo <@${discordId}>`,
    ),
  );  
}

export default UnlinkResolver;
