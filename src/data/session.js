/**
 * Session Module
 * 
 * Manages game session data tracking including start time, duration, score, and metrics.
 */

export class GameSession {
  constructor() {
    this.sessionId = null;
    this.startTime = null;
    this.endTime = null;
    this.score = 0;
    this.obstaclesPassed = 0;
    this.coinsCollected = 0;
    this.jumps = 0;
    this.isActive = false;
  }

  /**
   * Start a new game session
   */
  start() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.endTime = null;
    this.score = 0;
    this.obstaclesPassed = 0;
    this.coinsCollected = 0;
    this.jumps = 0;
    this.isActive = true;
  }

  /**
   * End the current session
   */
  end() {
    if (!this.isActive) return;

    this.endTime = Date.now();
    this.isActive = false;
  }

  /**
   * Update session score
   * @param {number} score - New score value
   */
  setScore(score) {
    this.score = score;
  }

  /**
   * Increment obstacles passed counter
   */
  incrementObstacles() {
    this.obstaclesPassed++;
  }

  /**
   * Increment coins collected counter
   */
  incrementCoins() {
    this.coinsCollected++;
  }

  /**
   * Increment jumps counter
   */
  incrementJumps() {
    this.jumps++;
  }

  /**
   * Get session duration in milliseconds
   * @returns {number} Duration in ms
   */
  getDuration() {
    if (!this.startTime) return 0;
    const endTime = this.endTime || Date.now();
    return endTime - this.startTime;
  }

  /**
   * Get session duration in seconds
   * @returns {number} Duration in seconds
   */
  getDurationSeconds() {
    return Math.floor(this.getDuration() / 1000);
  }

  /**
   * Get session data as plain object
   * @returns {Object} Session data
   */
  getData() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.getDuration(),
      score: this.score,
      obstaclesPassed: this.obstaclesPassed,
      coinsCollected: this.coinsCollected,
      jumps: this.jumps,
      isActive: this.isActive,
    };
  }

  /**
   * Reset session data
   */
  reset() {
    this.sessionId = null;
    this.startTime = null;
    this.endTime = null;
    this.score = 0;
    this.obstaclesPassed = 0;
    this.coinsCollected = 0;
    this.jumps = 0;
    this.isActive = false;
  }

  /**
   * Generate a unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export default GameSession;
