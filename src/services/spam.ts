import { Message } from 'discord.js';
import { millisToMinutes } from '../utils/helpers';

type Authors = {
  time: number;
  authorId: string;
}[];

type MessageLogs = {
  message: string;
  authorId: string;
}[];

class AntiSpam {
  authors: Authors;
  messageLog: MessageLogs;
  interval: number;

  constructor() {
    this.authors = [];
    this.messageLog = [];
    this.interval = 5000;
  }

  private logAuthor(authorId: string) {
    return this.authors.push({
      time: Math.floor(Date.now()),
      authorId,
    });
  }
  private logMessage(authorId: string, message: string) {
    return this.messageLog.push({
      message,
      authorId,
    });
  }

  public log(authorId: string, message: string) {
    this.logAuthor(authorId);
    this.logMessage(authorId, message);
  }

  private matchMessages(msg: Message) {
    if (msg.author.bot) {
      return;
    }
    let msgMatch = 0;
    this.messageLog.forEach((log) => {
      if (log.message === msg.content && log.authorId === msg.author.id) {
        msgMatch++;
      }
    });

    return msgMatch;
  }
  public checkMessageInterval(msg: Message) {
    return new Promise((resolve) => {
      if (msg.author.bot) {
        resolve(false);
      }
      const now = Date.now();
      const msgsMatched = this.matchMessages(msg);
      let spamDetected = false;
      if (msgsMatched && msgsMatched >= 2) {
        for (let i = 0; i < this.authors.length; i++) {
          if (this.authors[i].time > now - this.interval) {
            spamDetected = true;
          } else if (this.authors[i].time < now - this.interval) {
            this.messageLog.splice(
              this.messageLog.findIndex((message) => message.authorId === this.authors[i].authorId),
            );
            this.authors.splice(i);
          }
          if (this.messageLog.length >= 200) {
            this.messageLog.shift();
          }
        }
      }
      resolve(spamDetected);
    });
  }
}

export default new AntiSpam();

type LfsLog = {
  reaction: string;
  lfsAuthorId: string;
  reactionAuthorId: string;
  timestamp?: number;
};

const MINIMUM_LFS_INTERVAL = 120000;
class AntiSpamLfsReactionClass {
  logs: LfsLog[];
  interval: number;

  constructor() {
    this.logs = [];
    this.interval = MINIMUM_LFS_INTERVAL;
  }

  matchLogs(newLog: LfsLog) {
    const matches = this.logs.filter(
      (log) =>
        newLog.reaction === log.reaction &&
        newLog.lfsAuthorId === log.lfsAuthorId &&
        newLog.reactionAuthorId === log.reactionAuthorId,
    );
    return matches;
  }

  parse(log: LfsLog) {
    const now = Date.now();
    this.logs.push({ ...log, timestamp: now });

    const logsMatched = this.matchLogs(log);
    let isSpam = false;

    if (logsMatched.length > 1) {
      const spammedLog = logsMatched.find((logMatched, index) => {
        const timestamp = logMatched?.timestamp;
        if (typeof timestamp !== 'number') return false;
        const isMatchSpam = timestamp > now - this.interval;
        if (!isMatchSpam) this.logs.splice(index);
        return isMatchSpam;
      });
      isSpam = Boolean(spammedLog);
    }

    this.clear();
    return isSpam;
  }

  clear() {
    if (this.logs.length >= 200) {
      this.logs.shift();
    }
  }

  getIntervalMinutes() {
    return millisToMinutes(this.interval);
  }
}

export const AntiSpamLfsReaction = new AntiSpamLfsReactionClass();
