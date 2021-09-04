import { MessageEmbed } from 'discord.js';

export const EmbedPmRequest = (authorId: string) => {
  return new MessageEmbed()
    .setColor('#0099ff')
    .setDescription(`Žaidėjas <@${authorId}> norėtų prisijungti...`)
    .setFooter('lfs')
    .setTimestamp();
};

export const EmbedPmRequestAccept = (authorId: string) => {
  return new MessageEmbed()
    .setColor('#00FF6D')
    .setDescription(`<@${authorId}> pakviestas`)
    .setFooter('✅')
    .setTimestamp();
};

export const EmbedPmRequestDecline = (authorId: string) => {
  return new MessageEmbed()
    .setColor('#FF1700')
    .setDescription(`<@${authorId}> atmestas.`)
    .setFooter('❌')
    .setTimestamp();
};
