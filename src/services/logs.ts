import { Client } from 'discord.js';
import { EmbedErrorMessage } from './../embeds/Error';
import { EmbedDefaultMessage } from './../embeds/Default';

export const logError = async (client: Client, channelId: string, err: any) => {
  const isAdminChannel = channelId === process.env.ADMIN_CHANNEL_ID;
  const errMsg = (err instanceof Error)? err.message : `${err}`;
  // always show error on admin channel
  if (!isAdminChannel) {
    const adminChannel = process.env.ADMIN_CHANNEL_ID
      ? await client.channels.fetch(process.env.ADMIN_CHANNEL_ID)
      : null;

    if (adminChannel?.isText()) {
      adminChannel.send(EmbedErrorMessage(`${errMsg} in channel ${channelId}`));
    }
  }
};

export const logErrorWithUser = async (client: Client, channelId: string, err: Error, user: String, command: String) => {
  const isAdminChannel = channelId === process.env.ADMIN_CHANNEL_ID;

  // always show error on admin channel
  if (!isAdminChannel) {
    const adminChannel = process.env.ADMIN_CHANNEL_ID
      ? await client.channels.fetch(process.env.ADMIN_CHANNEL_ID)
      : null;

    if (adminChannel?.isText()) {
      adminChannel.send(EmbedErrorMessage(`${err.message} in channel ${channelId} by ${user} command ${command}`));
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
