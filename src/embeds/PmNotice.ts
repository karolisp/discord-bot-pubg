import { MessageEmbed, VoiceChannel } from 'discord.js';

export const EmbedPmNotice = (username: string) => {
  return new MessageEmbed().setColor('#0099ff').setDescription(`
    Jūsų žinutė buvo nusiųsta ${username}. Palaukite atsakymo.
  `);
};

export const EmbedPmNoticeAccept = (username: string, channelName?: string, channelInvite?: string) => {
  return new MessageEmbed().setColor('#00FF6D').setDescription(`
    ${username} kviečia prisijungti ${
    channelInvite && channelName
      ? `Junkitės prie kanalo **${channelName}** ${channelInvite}`
      : `Susisiekite su žaidėju.`
  }
  `);
};

export const EmbedPmNoticeWelcome = (username: string, channelName?: string, channelInvite?: string) => {
  return new MessageEmbed().setColor('#00FF6D').setDescription(`
    ${username} kviečia prisijungti prie kanalo **${channelName}**
    ${channelInvite}
  `);
};

export const EmbedPmNoticeDecline = (username: string) => {
  return new MessageEmbed().setColor('#FF1700').setDescription(`
    ${username} sako 🚫
  `);
};
