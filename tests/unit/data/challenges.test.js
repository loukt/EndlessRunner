import { describe, it, expect } from 'vitest';
import {
  CHALLENGE_TYPES,
  generateDailyChallenge,
  getChallengeId,
  getNextMidnight,
  getStreakMultiplier,
  isChallengeExpired,
} from '../../../src/data/challenges.js';

describe('Daily challenge generation', () => {
  it('creates a challenge with valid type and id', () => {
    const date = new Date(2025, 9, 22, 12, 0, 0);
    const rng = () => 0; // Always first type
    const challenge = generateDailyChallenge({ date, streak: 0, rng });

    expect(CHALLENGE_TYPES).toContain(challenge.type);
    expect(challenge.id).toBe(getChallengeId(date));
    expect(challenge.currentValue).toBe(0);
    expect(challenge.isCompleted).toBe(false);
  });

  it('sets expiration at next midnight', () => {
    const date = new Date(2025, 9, 22, 23, 45, 0);
    const challenge = generateDailyChallenge({ date, streak: 0, rng: () => 0 });
    const expected = getNextMidnight(date).toISOString();

    expect(challenge.expiresAt).toBe(expected);
  });

  it('computes streak multiplier thresholds', () => {
    expect(getStreakMultiplier(0)).toBe(1);
    expect(getStreakMultiplier(2)).toBe(1);
    expect(getStreakMultiplier(3)).toBe(2);
    expect(getStreakMultiplier(7)).toBe(3);
    expect(getStreakMultiplier(30)).toBe(5);
  });

  it('detects expiration correctly', () => {
    const date = new Date(2025, 9, 22, 10, 0, 0);
    const challenge = generateDailyChallenge({ date, streak: 0, rng: () => 0 });

    const beforeExpiry = new Date(2025, 9, 22, 23, 0, 0);
    const afterExpiry = new Date(2025, 9, 23, 0, 1, 0);

    expect(isChallengeExpired(challenge, beforeExpiry)).toBe(false);
    expect(isChallengeExpired(challenge, afterExpiry)).toBe(true);
  });
});
