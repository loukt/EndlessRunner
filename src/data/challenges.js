/**
 * Daily Challenges Module
 *
 * Generates and persists daily challenges with streak-based rewards.
 */

import { CONFIG } from '../config.js';

export const CHALLENGE_TYPES = ['jump_count', 'coin_collect', 'distance'];

const BASE_TARGETS = {
  jump_count: 50,
  coin_collect: 20,
  distance: 1000,
};

const BASE_REWARDS = {
  jump_count: 50,
  coin_collect: 75,
  distance: 100,
};

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getChallengeId(date = new Date()) {
  return `challenge_${getTodayKey(date)}`;
}

export function getNextMidnight(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
}

export function getStreakMultiplier(streak) {
  if (streak >= 30) return 5;
  if (streak >= 7) return 3;
  if (streak >= 3) return 2;
  return 1;
}

export function generateDailyChallenge({ date = new Date(), streak = 0, rng = Math.random } = {}) {
  const type = CHALLENGE_TYPES[Math.floor(rng() * CHALLENGE_TYPES.length)];
  const baseTarget = BASE_TARGETS[type];
  const targetValue = Math.round(baseTarget + streak * (type === 'distance' ? 50 : 5));
  const baseReward = BASE_REWARDS[type];
  const rewardCoins = baseReward * getStreakMultiplier(streak);

  return {
    id: getChallengeId(date),
    date: getTodayKey(date),
    type,
    targetValue,
    currentValue: 0,
    rewardCoins,
    isCompleted: false,
    completedAt: null,
    expiresAt: getNextMidnight(date).toISOString(),
  };
}

export function isChallengeExpired(challenge, now = new Date()) {
  if (!challenge || !challenge.expiresAt) return true;
  return new Date(challenge.expiresAt).getTime() <= now.getTime();
}

export class DailyChallengeManager {
  constructor(storage) {
    this.storage = storage;
  }

  async loadChallenge(date = new Date()) {
    const id = getChallengeId(date);
    return this.storage.load(CONFIG.STORAGE.STORE_NAMES.CHALLENGES, id);
  }

  async saveChallenge(challenge) {
    return this.storage.save(CONFIG.STORAGE.STORE_NAMES.CHALLENGES, challenge);
  }

  async getOrCreateChallenge(streak = 0, date = new Date()) {
    const existing = await this.loadChallenge(date);
    if (existing && !isChallengeExpired(existing, date)) {
      return existing;
    }

    const created = generateDailyChallenge({ date, streak });
    await this.saveChallenge(created);
    return created;
  }
}

export default DailyChallengeManager;
