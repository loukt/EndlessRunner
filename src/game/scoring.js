/**
 * Scoring Module
 * 
 * Manages score calculation and tracking during gameplay.
 */

export class Scoring {
  constructor() {
    this.score = 0;
    this.distance = 0;
    this.startTime = 0;
    this.isActive = false;
  }

  /**
   * Start scoring (game started)
   */
  start() {
    this.score = 0;
    this.distance = 0;
    this.startTime = Date.now();
    this.isActive = true;
  }

  /**
   * Stop scoring (game over)
   */
  stop() {
    this.isActive = false;
  }

  /**
   * Update score based on distance traveled
   * @param {number} deltaTime - Time elapsed since last frame
   * @param {number} scrollSpeed - Current scroll speed
   */
  update(deltaTime, scrollSpeed) {
    if (!this.isActive) return;

    // Add distance traveled
    const distanceTraveled = scrollSpeed * deltaTime;
    this.distance += distanceTraveled;

    // Score is based on distance (1 point per pixel traveled, divided by 10)
    this.score = Math.floor(this.distance / 10);
  }

  /**
   * Get current score
   * @returns {number}
   */
  getScore() {
    return this.score;
  }

  /**
   * Get distance traveled
   * @returns {number}
   */
  getDistance() {
    return Math.floor(this.distance);
  }

  /**
   * Get time survived in seconds
   * @returns {number}
   */
  getTimeSurvived() {
    if (this.startTime === 0) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Reset scoring
   */
  reset() {
    this.score = 0;
    this.distance = 0;
    this.startTime = 0;
    this.isActive = false;
  }
}

export default Scoring;
