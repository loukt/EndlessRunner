/**
 * Camera Effects Module
 * 
 * Provides screen shake and other camera effects.
 */

export class CameraEffects {
  constructor() {
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeX = 0;
    this.shakeY = 0;
  }

  /**
   * Start a camera shake effect
   * @param {number} intensity - Shake intensity (pixels)
   * @param {number} duration - Duration in seconds
   */
  shake(intensity = 10, duration = 0.3) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  /**
   * Update camera shake
   * @param {number} deltaTime - Time elapsed since last frame
   * @returns {Object} Offset {x, y}
   */
  update(deltaTime) {
    if (this.shakeDuration > 0) {
      this.shakeDuration -= deltaTime;
      
      if (this.shakeDuration <= 0) {
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeDuration = 0;
      } else {
        // Random shake within intensity bounds
        const progress = this.shakeDuration / 0.3; // Normalize
        const currentIntensity = this.shakeIntensity * progress;
        this.shakeX = (Math.random() - 0.5) * currentIntensity * 2;
        this.shakeY = (Math.random() - 0.5) * currentIntensity * 2;
      }
    }
    
    return {
      x: this.shakeX,
      y: this.shakeY
    };
  }

  /**
   * Apply shake offset to a container
   * @param {PIXI.Container} container - Container to shake
   * @param {number} deltaTime - Time elapsed since last frame
   */
  applyToContainer(container, deltaTime) {
    const offset = this.update(deltaTime);
    container.x = offset.x;
    container.y = offset.y;
  }

  /**
   * Reset camera effects
   */
  reset() {
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeX = 0;
    this.shakeY = 0;
  }
}

export default CameraEffects;
