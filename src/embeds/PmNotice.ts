import { MessageEmbed, VoiceChannel } from 'discord.js';

export const EmbedPmNotice = (authorId: string) => {
  return new MessageEmbed().setColor('#0099ff').setDescription(`
    Jūsų žinutė buvo nusiųsta <@${authorId}>. Palaukite atsakymo.
  `);
};

export const EmbedPmNoticeAccept = (authorId: string, channelName?: string, channelInvite?: string) => {
  return new MessageEmbed().setColor('#00FF6D').setDescription(`
    <@${authorId}> kviečia prisijungti ${
    channelInvite && channelName
      ? `Junkitės prie kanalo **${channelName}** ${channelInvite}`
      : `Susisiekite su žaidėju.`
  }
  `);
};

export const EmbedPmNoticeWelcome = (authorId: string, channelName?: string, channelInvite?: string) => {
  return new MessageEmbed().setColor('#00FF6D').setDescription(`
    <@${authorId}> kviečia prisijungti prie kanalo **${channelName}**
    ${channelInvite}
  `);
};

export const EmbedPmNoticeDecline = (authorId: string) => {
  return new MessageEmbed().setColor('#FF1700').setDescription(`
    <@${authorId}> sako 🚫
  `);
};
