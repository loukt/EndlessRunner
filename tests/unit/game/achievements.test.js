import { describe, it, expect } from 'vitest';
import { AchievementManager } from '../../../src/game/achievements.js';

describe('AchievementManager', () => {
  it('unlocks score achievement when threshold met', () => {
    const manager = new AchievementManager();
    const sessionStats = { score: 100, obstaclesPassed: 0, jumps: 0 };
    const profileStats = { totalObstacles: 0, totalJumps: 0, gamesPlayed: 0 };

    const unlocked = manager.checkAchievements(sessionStats, profileStats, []);
    expect(unlocked).toContain('score_100');
  });

  it('does not return already unlocked achievements', () => {
    const manager = new AchievementManager();
    const sessionStats = { score: 500, obstaclesPassed: 0, jumps: 0 };
    const profileStats = { totalObstacles: 0, totalJumps: 0, gamesPlayed: 0 };

    const unlocked = manager.checkAchievements(sessionStats, profileStats, ['score_500']);
    expect(unlocked).not.toContain('score_500');
  });
});
