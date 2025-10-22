/**
 * Obstacle Manager Module
 * 
 * Manages obstacle generation, movement, and lifecycle.
 */

import * as PIXI from 'pixi.js';
import { CONFIG } from '../config.js';

export class ObstacleManager {
  constructor(difficultyManager) {
    this.obstacles = [];
    this.container = null;
    this.renderer = null;
    this.nextSpawnDistance = CONFIG.OBSTACLES.MAX_SPACING;
    this.traveledDistance = 0;
    this.difficultyManager = difficultyManager;
  }

  /**
   * Initialize obstacle container
   * @param {PIXI.Container} stage - PixiJS stage
   * @param {PIXI.Renderer} renderer - PixiJS renderer for texture generation
   */
  create(stage, renderer) {
    this.container = new PIXI.Container();
    this.renderer = renderer;
    stage.addChild(this.container);
  }

  /**
   * Create a new obstacle with specific configuration
   * @param {Object} config - Obstacle configuration (height, width, color)
   * @returns {PIXI.Sprite}
   */
  createObstacle(config = null) {
    // Get config from difficulty manager if not provided
    if (!config) {
      config = this.difficultyManager.getObstacleConfig();
    }

    const graphics = new PIXI.Graphics();
    
    // Draw stack of money bills
    const billHeight = 4; // Height of each bill
    const numBills = Math.floor(config.height / billHeight);
    
    for (let i = 0; i < numBills; i++) {
      const yPos = i * billHeight;
      
      // Alternate green shades for depth
      const greenShade = i % 2 === 0 ? 0x2ECC71 : 0x27AE60;
      
      // Main bill body (green)
      graphics.beginFill(greenShade);
      graphics.drawRect(0, yPos, config.width, billHeight);
      graphics.endFill();
      
      // Dollar sign detail (darker green)
      graphics.beginFill(0x1E7E34);
      const signX = config.width / 2 - 1;
      graphics.drawRect(signX, yPos + 1, 2, billHeight - 2);
      graphics.endFill();
      
      // Border on bills
      graphics.lineStyle(0.5, 0x1E7E34, 1);
      graphics.drawRect(0, yPos, config.width, billHeight);
    }

    // Create sprite from graphics (PixiJS v7 API)
    const texture = this.renderer.generateTexture(graphics);
    const sprite = new PIXI.Sprite(texture);
    
    // Store obstacle data for reference
    sprite.obstacleType = config.type;
    sprite.obstacleHeight = config.height;
    sprite.obstacleWidth = config.width;
    
    // Position at right edge of screen, on ground
    sprite.x = CONFIG.CANVAS.WIDTH;
    sprite.y = CONFIG.PHYSICS.GROUND_Y - config.height;
    
    return sprite;
  }

  /**
   * Update obstacles (movement and spawning)
   * @param {number} deltaTime - Time elapsed since last frame
   * @param {number} scrollSpeed - Current scroll speed
   * @returns {number} Number of obstacles that passed off screen
   */
  update(deltaTime, scrollSpeed) {
    let obstaclesPassed = 0;

    // Move existing obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.x -= scrollSpeed * deltaTime;

      // Remove obstacles that are off screen
      if (obstacle.x + CONFIG.OBSTACLES.WIDTH < 0) {
        this.container.removeChild(obstacle);
        obstacle.destroy();
        this.obstacles.splice(i, 1);
        obstaclesPassed++;
      }
    }

    // Update traveled distance
    this.traveledDistance += scrollSpeed * deltaTime;

    // Spawn new obstacle if needed
    if (this.traveledDistance >= this.nextSpawnDistance) {
      this.spawnObstacle();
    }

    return obstaclesPassed;
  }

  /**
   * Spawn a new obstacle or pattern
   */
  spawnObstacle() {
    // Check if we should spawn a pattern (higher levels)
    if (this.difficultyManager.shouldUsePattern()) {
      this.spawnPattern();
    } else {
      // Spawn single obstacle
      const obstacle = this.createObstacle();
      this.container.addChild(obstacle);
      this.obstacles.push(obstacle);
    }

    // Calculate next spawn distance using difficulty manager
    const spacing = this.difficultyManager.getObstacleSpacing();
    const variance = this.difficultyManager.getSpawnVariance();
    
    this.nextSpawnDistance = this.traveledDistance + spacing + variance;
  }

  /**
   * Spawn a pattern of multiple obstacles
   */
  spawnPattern() {
    const pattern = this.difficultyManager.getObstaclePattern();
    
    for (const item of pattern) {
      const obstacle = this.createObstacle(item.config);
      obstacle.x += item.offsetX; // Apply pattern offset
      this.container.addChild(obstacle);
      this.obstacles.push(obstacle);
    }
  }

  /**
   * Get all obstacle bounds for collision detection
   * @returns {Array} Array of bounds objects
   */
  getObstacleBounds() {
    return this.obstacles.map(obstacle => ({
      x: obstacle.x,
      y: obstacle.y,
      width: obstacle.obstacleWidth || CONFIG.OBSTACLES.WIDTH,
      height: obstacle.obstacleHeight || CONFIG.OBSTACLES.HEIGHT
    }));
  }

  /**
   * Reset obstacle manager
   */
  reset() {
    // Remove all obstacles
    for (const obstacle of this.obstacles) {
      this.container.removeChild(obstacle);
      obstacle.destroy();
    }
    
    this.obstacles = [];
    this.traveledDistance = 0;
    this.nextSpawnDistance = CONFIG.OBSTACLES.MAX_SPACING;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.reset();
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}

export default ObstacleManager;
