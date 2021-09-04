import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import { EmbedError } from './../embeds/Error';
import { get } from 'lodash';

dotenv.config();

const MINIMUM_GAMES = 8;

function roundHundredth(number: number) {
  return Math.round(number * 100) / 100;
}

function toPercentage(number: number) {
  const percentage = number * 100;
  return Math.round(percentage);
}

// config
const pubg = axios.create({
  baseURL: 'https://api.playbattlegrounds.com/shards/steam',
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
    Accept: 'application/vnd.api+json',
  },
});

type PubgSeason = {
  type: string;
  id: string;
  attributes: {
    isCurrentSeason: boolean;
    isOffseason: boolean;
  };
};

export enum Tier {
  Master,
  Diamond,
  Platinum,
  Gold,
  Silver,
  Bronze,
}

export type PubgTier = keyof typeof Tier | string;

interface PubgRankedStats {
  currentTier: {
    tier: PubgTier;
    subTier: string;
  };
  currentRankPoint: number;
  bestTier: {
    tier: PubgTier;
    subTier: string;
  };
  bestRankPoint: number;
  roundsPlayed: number;
  avgRank: number;
  avgSurvivalTime: number;
  top10Ratio: number;
  winRatio: number;
  assists: number;
  wins: number;
  kda: number;
  kdr: number;
  kills: number;
  deaths: number;
  roundMostKills: number;
  longestKill: number;
  headshotKills: number;
  headshotKillRatio: number;
  damageDealt: number;
  dBNOs: number;
  reviveRatio: number;
  revives: number;
  heals: number;
  boosts: number;
  weaponsAcquired: number;
  teamKills: number;
  playTime: number;
  killStreak: number;
}

type PubgPlayerResponse = {
  data: {
    type: string;
    attributes: {
      rankedGameModeStats?: {
        'squad-fpp'?: PubgRankedStats;
      };
    };
  };
};

export type Stats = {
  kd: number;
  avgDamage: number;
  bestRank: PubgTier;
  winRatio: number;
  roundsPlayed: number;
};

export type StatsPartial = {
  kd?: number;
  avgDamage?: number;
  bestRank?: PubgTier;
  winRatio?: number;
};

const getCurrentSeason = async (): Promise<PubgSeason> => {
  const url = `/seasons`;
  try {
    const {
      data: { data: seasons },
    } = await pubg.get(url);
    const currentSeason = seasons.find((season: PubgSeason) => season.attributes.isCurrentSeason);
    return currentSeason;
  } catch (err) {
    throw new Error(err);
  }
};

const getPlayerId = async (player: string): Promise<string> => {
  const url = `/players?filter[playerNames]=${player}`;
  if (typeof player !== 'string' || !player) throw new Error('Missing player name');
  try {
    const {
      data: { data },
    } = await pubg.get(url);
    const accountId = data[0].id || null;
    if (!accountId)
      throw new EmbedError(
        `Não encontramos nenhum jogador com o nickname \`${player}\`. Tens de escrever o nome do PUBG com as letras exatamente iguais ao PUBG (minúsculas e maiúsculas).`,
      );
    return accountId;
  } catch (err) {
    if (err && err.response && err.response.status && err.response.status === 404)
      throw new EmbedError(
        `Nepavyko rasti pubg veikėjo vardu \`${player}\`. Veikėjo vardas turi tiksliai atitikti pubg vardą (didžiosios, mažosios raidės ir t.t.).`,
      );

    if (err && err.response && err.response.status && err.response.status === 429)
      throw new EmbedError(`✋ Perdaug dažnai kviečiamas PUBG API, palaukite vieną minutę ⏱ ir bandykite dar kartą!`);
    else throw Error(err);
  }
};

/**
 * gets player squad-fpp stats
 * @param {string} - shards (platform: steam)
 * @returns {promise}
 */
export const getPlayerStats = async (player: string): Promise<Stats> => {
  if (typeof player !== 'string' || !player) throw Error('Missing player name');

  try {
    const { id: seasonId } = await getCurrentSeason();
    const playerId = await getPlayerId(player);

    const url = `/players/${playerId}/seasons/${seasonId}/ranked`;
    const {
      data: { data },
    }: AxiosResponse<PubgPlayerResponse> = await pubg.get(url);

    const pubgStats = data.attributes.rankedGameModeStats?.['squad-fpp'];
    const roundsPlayed = get(pubgStats, 'roundsPlayed', NaN);

    if (roundsPlayed < MINIMUM_GAMES || pubgStats === undefined)
      throw new EmbedError(`Norint gauti roles reikia sužaisti dabartiniame sezone minimum ${MINIMUM_GAMES} žaidimų.`);

    const wins = get(pubgStats, 'wins', NaN);
    const damageDealt = get(pubgStats, 'damageDealt', NaN);
    const kills = get(pubgStats, 'kills', NaN);
    const bestRank = get(pubgStats, 'bestTier.tier', undefined);
    const winRatio = get(pubgStats, 'winRatio', NaN);

    const kd = kills / (roundsPlayed - wins);
    const avgDamage = damageDealt / roundsPlayed;

    if (typeof kd !== 'number' || typeof avgDamage !== 'number') {
      throw new EmbedError(`Nepavyko nustatyti žaidėjo \`${player}\` rank`);
    }

    return {
      kd: roundHundredth(kd),
      avgDamage: roundHundredth(avgDamage),
      bestRank,
      winRatio: toPercentage(winRatio),
      roundsPlayed,
    };
  } catch (err) {
    if (err && err.response && err.response.status === 404)
      throw new EmbedError(`Norint gauti roles reikia sužaisti dabartiniame sezone minimum ${MINIMUM_GAMES} žaidimų.`);

    if (err.name === 'EmbedError') {
      throw new EmbedError(err.message);
    } else throw new Error(err);
  }
};
