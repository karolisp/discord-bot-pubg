import { MessageEmbed } from 'discord.js';

export const EmbedPmRequest = (authorId: string, username: string|null) => {
  return new MessageEmbed()
    .setColor('#0099ff')
    .setDescription(`Žaidėjas ${username}<@${authorId}> norėtų prisijungti...`)
    .setFooter('lfs')
    .setTimestamp();
};

export const EmbedPmRequestAccept = (authorId: string, username: string|null) => {
  return new MessageEmbed()
    .setColor('#00FF6D')
    .setDescription(`${username}<@${authorId}> pakviestas`)
    .setFooter('✅')
    .setTimestamp();
};

export const EmbedPmRequestDecline = (authorId: string, username: string|null) => {
  return new MessageEmbed()
    .setColor('#FF1700')
    .setDescription(`${username}<@${authorId}> atmestas.`)
    .setFooter('❌')
    .setTimestamp();
};
