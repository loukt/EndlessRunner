/**
 * Difficulty Manager Module
 * 
 * Controls progressive difficulty scaling based on score/distance.
 * Manages obstacle patterns, spacing, heights, and game speed.
 */

import { CONFIG } from '../config.js';

export class DifficultyManager {
  constructor() {
    this.score = 0;
    this.level = 1;
    this.obstaclesPassed = 0;
  }

  /**
   * Update difficulty based on current score
   * @param {number} score - Current game score
   * @param {number} obstaclesPassed - Total obstacles passed
   */
  update(score, obstaclesPassed) {
    this.score = score;
    this.obstaclesPassed = obstaclesPassed;
    this.level = this.calculateLevel();
  }

  /**
   * Calculate current difficulty level (1-10)
   * @returns {number} Current difficulty level
   */
  calculateLevel() {
    // Level increases every 200 points, capped at 10 (slower progression)
    return Math.min(10, Math.floor(this.score / 200) + 1);
  }

  /**
   * Get current spacing between obstacles
   * @returns {number} Spacing in pixels
   */
  getObstacleSpacing() {
    const { MIN_SPACING, MAX_SPACING } = CONFIG.OBSTACLES;
    
    // Gradually reduce spacing based on level (10 levels)
    // Level 1: MAX_SPACING (700px)
    // Level 10: MIN_SPACING (300px) - Increased minimum for safety
    const safeMinSpacing = Math.max(300, MIN_SPACING); // Ensure always passable
    const spacingRange = MAX_SPACING - safeMinSpacing;
    const levelProgress = (this.level - 1) / 9; // 0 to 1
    
    return MAX_SPACING - (spacingRange * levelProgress);
  }

  /**
   * Get random obstacle configuration
   * @returns {Object} Obstacle config with type, height, width
   */
  getObstacleConfig() {
    const level = this.level;
    
    // Define obstacle types with increasing complexity
    // Heights reduced to ensure all obstacles are jumpable
    const obstacleTypes = [
      // Level 1-2: Only short obstacles
      { type: 'short', height: 30, width: 30, weight: level <= 2 ? 1 : 0.4 },
      
      // Level 3+: Medium obstacles
      { type: 'medium', height: 45, width: 30, weight: level >= 3 ? 0.4 : 0 },
      
      // Level 5+: Tall obstacles
      { type: 'tall', height: 60, width: 30, weight: level >= 5 ? 0.3 : 0 },
      
      // Level 7+: Wide obstacles (harder to judge timing)
      { type: 'wide', height: 45, width: 50, weight: level >= 7 ? 0.2 : 0 },
      
      // Level 9+: Extra tall (requires good timing but still jumpable)
      { type: 'extra_tall', height: 70, width: 30, weight: level >= 9 ? 0.15 : 0 },
    ];

    // Filter available types and select randomly based on weights
    const availableTypes = obstacleTypes.filter(t => t.weight > 0);
    const totalWeight = availableTypes.reduce((sum, t) => sum + t.weight, 0);
    
    let random = Math.random() * totalWeight;
    for (const type of availableTypes) {
      random -= type.weight;
      if (random <= 0) {
        return {
          type: type.type,
          height: type.height,
          width: type.width,
          color: this.getObstacleColor(type.type)
        };
      }
    }

    // Fallback to short obstacle
    return {
      type: 'short',
      height: 30,
      width: 30,
      color: 0x8B4513
    };
  }

  /**
   * Get color for obstacle type
   * @param {string} type - Obstacle type
   * @returns {number} Hex color code
   */
  getObstacleColor(type) {
    const colors = {
      short: 0x8B4513,      // Brown
      medium: 0x654321,     // Dark brown
      tall: 0xA0522D,       // Sienna
      wide: 0xD2691E,       // Chocolate
      extra_tall: 0x8B0000  // Dark red
    };
    return colors[type] || 0x8B4513;
  }

  /**
   * Get game speed multiplier based on difficulty
   * @returns {number} Speed multiplier (1.0 - 1.5)
   */
  getSpeedMultiplier() {
    // Speed increases gradually with level
    // Level 1: 1.0x
    // Level 10: 1.5x
    return 1.0 + (this.level - 1) * 0.055;
  }

  /**
   * Check if pattern generation should be used
   * @returns {boolean} True if patterns enabled
   */
  shouldUsePattern() {
    // Higher levels can spawn patterns (multiple obstacles)
    // Only at level 8+ with 10% chance (reduced for safety)
    return this.level >= 8 && Math.random() < 0.1;
  }

  /**
   * Get obstacle pattern (for advanced levels)
   * @returns {Array} Array of obstacle configs with relative positions
   */
  getObstaclePattern() {
    const patterns = [
      // Double obstacle (wide spacing to ensure passable)
      [
        { config: this.getObstacleConfig(), offsetX: 0 },
        { config: this.getObstacleConfig(), offsetX: 200 }
      ],
      
      // Triple staggered (only short obstacles for safety)
      [
        { config: { type: 'short', height: 30, width: 30, color: 0x8B4513 }, offsetX: 0 },
        { config: { type: 'short', height: 30, width: 30, color: 0x8B4513 }, offsetX: 150 },
        { config: { type: 'short', height: 30, width: 30, color: 0x8B4513 }, offsetX: 300 }
      ]
    ];

    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  /**
   * Get spawn variance (randomness in spacing)
   * @returns {number} Random offset in pixels
   */
  getSpawnVariance() {
    // Higher levels have less variance (more predictable but harder)
    // Keep minimum at 50px to prevent too-tight spacing
    const maxVariance = 100 - (this.level * 5);
    return (Math.random() - 0.5) * Math.max(50, maxVariance);
  }

  /**
   * Reset difficulty to starting values
   */
  reset() {
    this.score = 0;
    this.level = 1;
    this.obstaclesPassed = 0;
  }

  /**
   * Get difficulty stats for display
   * @returns {Object} Stats object
   */
  getStats() {
    return {
      level: this.level,
      score: this.score,
      obstaclesPassed: this.obstaclesPassed,
      spacing: Math.round(this.getObstacleSpacing()),
      speedMultiplier: this.getSpeedMultiplier().toFixed(2)
    };
  }
}

export default DifficultyManager;
