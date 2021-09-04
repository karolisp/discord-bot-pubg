import { CommandResolver, ALLOWED_ROLES, QUOTE_REGEX } from '.';
import { EmbedSuccessMessage } from '../../embeds/Success';
import { clearQuotes } from './../../utils/helpers';
import { logAdminMessage } from '../../services/logs';
import { EmbedErrorMessage } from '../../embeds/Error';

const RoleResolver: CommandResolver = async (client, message, argumentsParsed) => {
  if (message.channel.id !== process.env.ROLES_CHANNEL_ID || !process.env.DISCORD_SERVER_ID) return;

  const isRoleValid = QUOTE_REGEX.test(argumentsParsed._[1]);
  const roleName = isRoleValid ? clearQuotes(argumentsParsed._[1]).toLowerCase() : '';

  if (!isRoleValid) {
    await message.channel.send(
      EmbedErrorMessage(
        `<@${
          message.author.id
        }> Rolė nerasta, nepamirškite parašyti rolės kabutėse, galimos rolės: **${ALLOWED_ROLES.map(
          (r) => `\`"${r}"\``,
        ).join(',')}**.`,
      ),
    );
    return;
  }

  if (!ALLOWED_ROLES.includes(roleName)) {
    await message.channel.send(
      EmbedErrorMessage(
        `<@${message.author.id}> jūs galite pridėti/nuimti tik šias roles: **${ALLOWED_ROLES.join(', ')}**.`,
      ),
    );
    return;
  }

  const guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
  const role = roleName ? guild.roles.cache.find((r) => r.name.toLowerCase() === roleName, {}) : null;

  if (role) {
    // remove when already has role
    const memberRole = message.member?.roles.cache.find((r) => r.name.toLowerCase() === roleName);
    if (memberRole) {
      await message.member?.roles.remove(memberRole);
      await message.channel.send(EmbedSuccessMessage(`<@${message.author.id}> rolė **${role.name}** panaikinta.`));
      // if (roleName === 'streamer') {
      //   logAdminMessage(
      //     client,
      //     `Senhores administradores, removam o <@${message.author.id}> do [stream bot](https://mee6.xyz/dashboard/345984356340203520/twitch).`,
      //   );
      // }

      return;
    }
    // add
    await message.member?.roles.add(role);
    await message.channel.send(
      EmbedSuccessMessage(
        `<@${message.author.id}> pridėta rolė **${role.name}**`,
      ),
    );
    return;
  }

  await message.channel.send(
    EmbedErrorMessage(`<@${message.author.id}> rolė "${roleName}" neegzistuoja, ar tikrai gerai parašėte?`),
  );
};

export default RoleResolver;
