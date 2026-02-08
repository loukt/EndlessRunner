/**
 * Challenge Tracker
 *
 * Tracks progress toward the active daily challenge during gameplay.
 */

export class ChallengeTracker {
  constructor(challenge) {
    this.challenge = challenge;
  }

  setChallenge(challenge) {
    this.challenge = challenge;
  }

  recordJump(count = 1) {
    return this.incrementProgress('jump_count', count);
  }

  recordCoins(count = 1) {
    return this.incrementProgress('coin_collect', count);
  }

  recordDistance(distanceDelta = 0) {
    return this.incrementProgress('distance', distanceDelta);
  }

  incrementProgress(type, amount) {
    if (!this.challenge || this.challenge.isCompleted) return false;
    if (this.challenge.type !== type) return false;

    this.challenge.currentValue = Math.max(0, this.challenge.currentValue + amount);

    if (this.challenge.currentValue >= this.challenge.targetValue) {
      this.challenge.isCompleted = true;
      this.challenge.completedAt = new Date().toISOString();
      return true;
    }

    return false;
  }

  getProgressRatio() {
    if (!this.challenge) return 0;
    if (this.challenge.targetValue <= 0) return 0;
    return Math.min(1, this.challenge.currentValue / this.challenge.targetValue);
  }
}

export default ChallengeTracker;
