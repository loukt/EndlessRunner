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

    const theme = this.getObstacleTheme(config.type);
    const dimensions = this.getObstacleDimensions(config, theme);
    this.drawObstacle(graphics, dimensions, theme);

    // Create sprite from graphics (PixiJS v7 API)
    const texture = this.renderer.generateTexture(graphics);
    const sprite = new PIXI.Sprite(texture);
    
    // Store obstacle data for reference
    sprite.obstacleType = config.type;
    sprite.obstacleEffect = theme.effect;
    sprite.obstacleHeight = dimensions.height;
    sprite.obstacleWidth = dimensions.width;
    
    // Position at right edge of screen, on ground
    sprite.x = CONFIG.CANVAS.WIDTH;
    sprite.y = CONFIG.PHYSICS.GROUND_Y - dimensions.height;
    
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
      height: obstacle.obstacleHeight || CONFIG.OBSTACLES.HEIGHT,
      effect: obstacle.obstacleEffect || null
    }));
  }

  /**
   * Map obstacle type to theme
   * @param {string} type - Obstacle type
   * @returns {Object} Theme data
   */
  getObstacleTheme(type) {
    switch (type) {
      case 'short':
        return { key: 'trash_bag', effect: 'filthy' };
      case 'medium':
        return { key: 'puddle', effect: 'wet' };
      case 'tall':
        return { key: 'trash_can', effect: 'filthy' };
      case 'wide':
        return { key: 'yarn', effect: 'tangled' };
      case 'extra_tall':
        return { key: 'vacuum', effect: 'startled' };
      default:
        return { key: 'trash_bag', effect: 'filthy' };
    }
  }

  /**
   * Draw an obstacle based on its theme
   * @param {PIXI.Graphics} graphics - Graphics object
   * @param {Object} config - Obstacle config
   * @param {Object} theme - Theme data
   */
  drawObstacle(graphics, config, theme) {
    switch (theme.key) {
      case 'puddle':
        this.drawPuddle(graphics, config);
        break;
      case 'trash_can':
        this.drawTrashCan(graphics, config);
        break;
      case 'yarn':
        this.drawYarn(graphics, config);
        break;
      case 'vacuum':
        this.drawVacuum(graphics, config);
        break;
      case 'trash_bag':
      default:
        this.drawTrashBag(graphics, config);
        break;
    }
  }

  drawTrashBag(graphics, config) {
    const width = config.width;
    const height = config.height;
    graphics.beginFill(0x2F2F2F);
    graphics.drawRoundedRect(0, 6, width, height - 6, 6);
    graphics.endFill();
    graphics.beginFill(0x1F1F1F);
    graphics.drawRect(width / 2 - 4, 0, 8, 8);
    graphics.endFill();
  }

  drawPuddle(graphics, config) {
    const width = config.width;
    const height = config.height;
    graphics.beginFill(0x4FC3F7);
    graphics.drawEllipse(width / 2, config.height - height / 2, width / 2, height / 2);
    graphics.endFill();
    graphics.beginFill(0x81D4FA, 0.8);
    graphics.drawEllipse(width / 2 + 6, config.height - height / 2 - 2, width / 4, height / 3);
    graphics.endFill();
  }

  drawTrashCan(graphics, config) {
    const width = config.width;
    const height = config.height;
    graphics.beginFill(0x6D6D6D);
    graphics.drawRoundedRect(2, 8, width - 4, height - 8, 4);
    graphics.endFill();
    graphics.beginFill(0x4D4D4D);
    graphics.drawRect(0, 0, width, 8);
    graphics.endFill();
    graphics.beginFill(0x3C3C3C);
    graphics.drawRect(width / 2 - 6, 2, 12, 3);
    graphics.endFill();
  }

  drawYarn(graphics, config) {
    const radius = Math.min(config.width, config.height) / 2;
    const centerX = config.width / 2;
    const centerY = config.height - radius;
    graphics.beginFill(0xD18BFF);
    graphics.drawCircle(centerX, centerY, radius);
    graphics.endFill();
    graphics.lineStyle(1.5, 0x8E5BB3, 1);
    graphics.moveTo(centerX - radius, centerY);
    graphics.lineTo(centerX + radius, centerY);
    graphics.moveTo(centerX - radius / 2, centerY - radius / 2);
    graphics.lineTo(centerX + radius / 2, centerY + radius / 2);
  }

  drawVacuum(graphics, config) {
    const width = config.width;
    const height = config.height;
    graphics.beginFill(0x3F51B5);
    graphics.drawRoundedRect(4, 10, width - 8, height - 10, 4);
    graphics.endFill();
    graphics.beginFill(0x263238);
    graphics.drawRect(width / 2 - 2, 0, 4, 12);
    graphics.endFill();
    graphics.beginFill(0xFFC107);
    graphics.drawCircle(width / 2, height - 6, 4);
    graphics.endFill();
  }

  /**
   * Get obstacle dimensions for theme-specific sizing
   * @param {Object} config - Obstacle config
   * @param {Object} theme - Theme data
   * @returns {Object} Dimensions
   */
  getObstacleDimensions(config, theme) {
    switch (theme.key) {
      case 'puddle':
        return {
          width: config.width,
          height: Math.max(10, Math.floor(config.height / 3))
        };
      case 'yarn':
        return {
          width: config.width,
          height: Math.min(config.height, config.width)
        };
      default:
        return { width: config.width, height: config.height };
    }
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
