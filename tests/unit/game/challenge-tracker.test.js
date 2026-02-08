import { describe, it, expect } from 'vitest';
import { ChallengeTracker } from '../../../src/game/challenge-tracker.js';

describe('ChallengeTracker', () => {
  it('tracks jump progress and completes challenge', () => {
    const challenge = {
      type: 'jump_count',
      targetValue: 3,
      currentValue: 0,
      isCompleted: false,
      completedAt: null,
    };

    const tracker = new ChallengeTracker(challenge);

    expect(tracker.recordJump()).toBe(false);
    expect(tracker.recordJump()).toBe(false);
    expect(tracker.recordJump()).toBe(true);

    expect(challenge.isCompleted).toBe(true);
    expect(challenge.currentValue).toBe(3);
    expect(challenge.completedAt).not.toBeNull();
  });

  it('ignores progress for other types', () => {
    const challenge = {
      type: 'coin_collect',
      targetValue: 10,
      currentValue: 0,
      isCompleted: false,
      completedAt: null,
    };

    const tracker = new ChallengeTracker(challenge);

    expect(tracker.recordJump()).toBe(false);
    expect(challenge.currentValue).toBe(0);

    expect(tracker.recordCoins(5)).toBe(false);
    expect(challenge.currentValue).toBe(5);
  });
});
