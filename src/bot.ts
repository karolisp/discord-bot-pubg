import { Client, Presence } from 'discord.js';
import dotenv from 'dotenv';
import { commandsResolver } from './resolvers/commands/index';
import { reactionsResolver } from './resolvers/reactions';
import { triggersResolver } from './resolvers/triggers';
import { voiceResolver } from './resolvers/voice';
import mongo from './services/database';
import setupRoles, { RANKS, updateRolesForMemberIfNeeded } from './services/roles';
import User from './models/user';
import { logAdminMessage } from './services/logs';


dotenv.config();
const client = new Client({ partials: ['GUILD_MEMBER', 'USER', 'REACTION'] });

client.login(process.env.DISCORDJS_BOT_TOKEN);

client.on('ready', async () => {
  console.log(`${client?.user?.tag} has logged in.`);

  // connect to db
  await mongo();

  // setup roles
  const guild = process.env.DISCORD_SERVER_ID ? await client.guilds.fetch(process.env.DISCORD_SERVER_ID) : null;
  if (!guild) throw new Error('Invalid guild ID');
  await setupRoles(guild);
});

client.on('error', (error) => {
  console.error(error);
});

client.on('message', async (message) => {
  if (message.author.bot) return;
  await commandsResolver(client, message);
  await triggersResolver(client, message);
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  const messageIsEmbed = Boolean(reaction.message.embeds.length > 0);

  if (messageIsEmbed) {
    reactionsResolver(client, reaction, user);
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  await voiceResolver(client, oldState, newState);
});

client.on('presenceUpdate', async (oldPresence, newPresence ) => {
  if (
      process.env.ENABLE_ON_PRESENCE_AUTO_ROLE_UPDATE=="true" 
      && oldPresence?.status !== newPresence.status
      && newPresence.member    
    ) {
      console.log(`Prilinkintas useris ${newPresence.user?.username} pakeite statusa, atnaujinamos roles...`)
      try{
        await updateRolesForMemberIfNeeded(newPresence.member)
      } catch (err) {
        if (err instanceof Error){
          logAdminMessage(client, err.message)
        } else {
          logAdminMessage(client, String(err))
        }
      }
    }     
  }
);
