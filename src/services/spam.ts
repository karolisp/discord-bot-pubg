import { Message } from 'discord.js';
import { millisToMinutes } from '../utils/helpers';
import { TTLCache } from '@brokerloop/ttlcache';

const CACHE_TTL_MS = 60000
const SENT_CACHE = new TTLCache<string, string>({
  ttl:   CACHE_TTL_MS,
  max:   500,
  clock: Date
});

type LfsLog = {
  reaction: string;
  lfsAuthorId: string;
  reactionAuthorId: string;
  timestamp?: number;
};

class AntiSpamLfsReactionClass {
  messagesCache: TTLCache

  constructor() {
    this.messagesCache = SENT_CACHE;
  }


  isSpam(log: LfsLog) {

    let lfskey = `${log.reaction}-${log.lfsAuthorId}-${log.reactionAuthorId}`

    if (this.messagesCache.get(lfskey) == undefined){
      this.messagesCache.set(lfskey,"sent")
      return false
    }
    else {
      return true
    }
  }
  getIntervalMinutes() {
    return millisToMinutes(CACHE_TTL_MS);
  }
}

export const AntiSpamLfsReaction = new AntiSpamLfsReactionClass();
