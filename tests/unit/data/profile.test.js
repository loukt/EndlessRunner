import { describe, it, expect } from 'vitest';
import { PlayerProfile } from '../../../src/data/profile.js';

class FakeStorage {
  constructor() {
    this.saved = null;
  }

  async getProfile() {
    return this.saved;
  }

  async saveProfile(data) {
    this.saved = { ...data };
  }
}

describe('PlayerProfile persistence', () => {
  it('initializes new profile with defaults', async () => {
    const storage = new FakeStorage();
    const profile = new PlayerProfile();
    await profile.init(storage);

    expect(profile.highScore).toBe(0);
    expect(profile.totalCoins).toBe(0);
    expect(profile.lifetimeCoins).toBe(0);
    expect(profile.currentStreak).toBe(0);
  });

  it('records session stats and updates streak', async () => {
    const storage = new FakeStorage();
    const profile = new PlayerProfile();
    await profile.init(storage);

    const sessionData = { score: 200, distance: 300, jumps: 5, obstaclesPassed: 3, coinsCollected: 4 };
    await profile.recordSession(sessionData);

    expect(profile.highScore).toBe(200);
    expect(profile.totalCoins).toBe(4);
    expect(profile.lifetimeCoins).toBe(4);
    expect(profile.gamesPlayed).toBe(1);
    expect(profile.currentStreak).toBe(1);

    const stats = profile.getStats();
    expect(stats.lifetimeCoins).toBe(4);
    expect(stats.currentStreak).toBe(1);
  });

  it('increments streak on consecutive days and resets after gap', () => {
    const profile = new PlayerProfile();
    profile.updateStreak(new Date(2026, 0, 1));
    expect(profile.currentStreak).toBe(1);

    profile.updateStreak(new Date(2026, 0, 2));
    expect(profile.currentStreak).toBe(2);

    profile.updateStreak(new Date(2026, 0, 4));
    expect(profile.currentStreak).toBe(1);
  });
});
