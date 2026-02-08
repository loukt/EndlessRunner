import { describe, it, expect } from 'vitest';
import { PlayerProfile } from '../../src/data/profile.js';
import { AchievementManager } from '../../src/game/achievements.js';

class MemoryStorage {
  constructor() {
    this.profile = null;
  }

  async getProfile() {
    return this.profile;
  }

  async saveProfile(data) {
    this.profile = { ...data };
  }
}

describe('Score progression flow', () => {
  it('persists high score and unlocks achievements', async () => {
    const storage = new MemoryStorage();
    const profile = new PlayerProfile();
    await profile.init(storage);

    const achievementManager = new AchievementManager();
    const sessionData = { score: 120, distance: 120, jumps: 2, obstaclesPassed: 1, coinsCollected: 0 };

    const result = await profile.recordSession(sessionData);
    expect(result.isNewHighScore).toBe(true);
    expect(profile.highScore).toBe(120);

    const unlocked = achievementManager.checkAchievements(sessionData, profile.getStats(), profile.achievements);
    expect(unlocked).toContain('score_100');
  });

  it('loads persisted high score on new profile', async () => {
    const storage = new MemoryStorage();
    const profile = new PlayerProfile();
    await profile.init(storage);

    await profile.recordSession({ score: 200, distance: 200, jumps: 2, obstaclesPassed: 1, coinsCollected: 0 });

    const secondProfile = new PlayerProfile();
    await secondProfile.init(storage);

    expect(secondProfile.highScore).toBe(200);
  });
});
