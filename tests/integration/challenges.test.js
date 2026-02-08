import { describe, it, expect } from 'vitest';
import { DailyChallengeManager, generateDailyChallenge } from '../../src/data/challenges.js';
import { ChallengeTracker } from '../../src/game/challenge-tracker.js';

class InMemoryStorage {
  constructor() {
    this.data = new Map();
  }

  async save(storeName, item) {
    this.data.set(`${storeName}:${item.id}`, item);
  }

  async load(storeName, id) {
    return this.data.get(`${storeName}:${id}`) || null;
  }
}

describe('Daily challenge flow', () => {
  it('creates a challenge and completes it through tracker updates', async () => {
    const storage = new InMemoryStorage();
    const manager = new DailyChallengeManager(storage);

    const date = new Date(2025, 9, 22, 10, 0, 0);
    const challenge = generateDailyChallenge({ date, streak: 0, rng: () => 0 });
    await manager.saveChallenge(challenge);

    const active = await manager.getOrCreateChallenge(0, date);
    const tracker = new ChallengeTracker(active);

    tracker.recordJump(active.targetValue);

    expect(active.isCompleted).toBe(true);
  });
});
