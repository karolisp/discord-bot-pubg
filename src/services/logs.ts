import { Client } from 'discord.js';
import { EmbedErrorMessage } from './../embeds/Error';
import { EmbedDefaultMessage } from './../embeds/Default';

export const logError = async (client: Client, channelId: string, err: Error) => {
  const isAdminChannel = channelId === process.env.ADMIN_CHANNEL_ID;

  // always show error on admin channel
  if (!isAdminChannel) {
    const adminChannel = process.env.ADMIN_CHANNEL_ID
      ? await client.channels.fetch(process.env.ADMIN_CHANNEL_ID)
      : null;

    if (adminChannel?.isText()) {
      adminChannel.send(EmbedErrorMessage(err.message));
    }
  }
};

export const logAdminMessage = async (client: Client, message: string) => {
  const adminChannel = process.env.ADMIN_CHANNEL_ID ? await client.channels.fetch(process.env.ADMIN_CHANNEL_ID) : null;

  if (adminChannel?.isText()) {
    adminChannel.send(EmbedDefaultMessage(message));
  }
};

export const logServerLogMessage = async (client: Client, message: string) => {
  const logChannel = process.env.LOG_CHANNEL_ID ? await client.channels.fetch(process.env.LOG_CHANNEL_ID) : null;

  if (logChannel?.isText()) {
    logChannel.send(EmbedDefaultMessage(message));
  }
};
