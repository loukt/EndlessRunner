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
    this.trashcanTextures = []; // Cache for trash can sprites
    this.trashcanSpritesheet = null;
    this.trashbagTexture = null; // Cache for trash bag sprite
  }

  /**
   * Initialize obstacle container
   * @param {PIXI.Container} stage - PixiJS stage
   * @param {PIXI.Renderer} renderer - PixiJS renderer for texture generation
   */
  async create(stage, renderer) {
    this.container = new PIXI.Container();
    this.container.name = 'obstacles';
    this.renderer = renderer;
    stage.addChild(this.container);
    
    // Ensure container is visible and at correct depth
    this.container.visible = true;
    this.container.zIndex = 10;
    
    // Load trash can and trash bag sprites
    await this.loadTrashcanSprites();
    await this.loadTrashbagSprite();
  }

  /**
   * Load trash can sprite sheet
   */
  async loadTrashcanSprites() {
    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const imagePath = baseUrl + 'assets/sprites/trashcans.png';
      const metadataUrl = baseUrl + 'assets/sprites/trashcans-spritesheet.json';
      
      // Fetch metadata
      const metadataResponse = await fetch(metadataUrl);
      if (!metadataResponse.ok) {
        throw new Error(`Failed to load trash can metadata: ${metadataResponse.status}`);
      }
      const metadata = await metadataResponse.json();
      
      // Create spritesheet and load
      this.trashcanSpritesheet = new PIXI.Spritesheet(
        PIXI.Texture.from(imagePath),
        metadata
      );
      await this.trashcanSpritesheet.parse();
      
      // Extract frames in order
      for (let i = 0; i < 3; i++) {
        const frameName = `sprite_${i}.png`;
        if (this.trashcanSpritesheet.textures[frameName]) {
          this.trashcanTextures.push(this.trashcanSpritesheet.textures[frameName]);
        }
      }
    } catch (error) {
      console.warn('Failed to load trash can sprites:', error);
      this.trashcanTextures = [];
    }
  }

  /**
   * Load trash bag sprite
   */
  async loadTrashbagSprite() {
    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const imagePath = baseUrl + 'assets/sprites/trashbag.png';
      const metadataUrl = baseUrl + 'assets/sprites/trashbag-spritesheet.json';
      
      // Fetch metadata
      const metadataResponse = await fetch(metadataUrl);
      if (!metadataResponse.ok) {
        throw new Error(`Failed to load trash bag metadata: ${metadataResponse.status}`);
      }
      const metadata = await metadataResponse.json();
      
      // Create spritesheet and load
      const spritesheet = new PIXI.Spritesheet(
        PIXI.Texture.from(imagePath),
        metadata
      );
      await spritesheet.parse();
      
      // Extract the single frame
      const frameName = 'sprite_0.png';
      if (spritesheet.textures[frameName]) {
        this.trashbagTexture = spritesheet.textures[frameName];
      }
    } catch (error) {
      console.warn('Failed to load trash bag sprite:', error);
      this.trashbagTexture = null;
    }
  }

  /**
   * Create a new obstacle with specific configuration
   * @param {Object} config - Obstacle configuration (height, width, color)
   * @returns {PIXI.Sprite}
   */
  createObstacle(config = null) {
    try {
      // Get config from difficulty manager if not provided
      if (!config) {
        config = this.difficultyManager.getObstacleConfig();
      }

      // Check if this is a trash bag and we have sprite loaded
      const theme = this.getObstacleTheme(config.type);
      if (theme.key === 'trash_bag' && this.trashbagTexture) {
        return this.createTrashbagSprite(config, theme);
      }

      // Check if this is a trash can and we have sprites loaded
      if (theme.key === 'trash_can' && this.trashcanTextures.length > 0) {
        return this.createTrashcanSprite(config, theme);
      }

      // Fall back to procedural drawing for other obstacles
      const graphics = new PIXI.Graphics();
      graphics.clear();

      const dimensions = this.getObstacleDimensions(config, theme);
      this.drawObstacle(graphics, dimensions, theme);

      // Create sprite from graphics (PixiJS v7 API)
      if (!this.renderer) {
        throw new Error('Renderer not available for obstacle texture generation');
      }

      const texture = this.renderer.generateTexture(graphics);
      const sprite = new PIXI.Sprite(texture);
      
      // Verify sprite was created
      if (!sprite || !texture) {
        throw new Error('Failed to create sprite or texture');
      }
      
      // Store obstacle data for reference
      sprite.obstacleType = config.type;
      sprite.obstacleEffect = theme.effect;
      sprite.obstacleHeight = dimensions.height;
      sprite.obstacleWidth = dimensions.width;
      
      // Position at right edge of screen, on ground
      sprite.x = CONFIG.CANVAS.WIDTH;
      sprite.y = CONFIG.PHYSICS.GROUND_Y - dimensions.height;
      
      // Clean up graphics object
      graphics.destroy();
      
      return sprite;
    } catch (error) {
      console.error('[OBSTACLE] Failed to create obstacle:', error);
      return null;
    }
  }

  /**
   * Create a trash can sprite from the sprite sheet
   * @param {Object} config - Obstacle configuration
   * @param {Object} theme - Theme data
   * @returns {PIXI.Sprite}
   */
  createTrashcanSprite(config, theme) {
    // Randomly pick one of the trash can textures
    const textureIndex = Math.floor(Math.random() * this.trashcanTextures.length);
    const texture = this.trashcanTextures[textureIndex];
    const sprite = new PIXI.Sprite(texture);
    
    // Store obstacle data for reference
    sprite.obstacleType = config.type;
    sprite.obstacleEffect = theme.effect;
    sprite.obstacleHeight = 93; // Actual frame height
    sprite.obstacleWidth = 87; // Actual frame width
    
    // Position at right edge of screen, on ground
    sprite.x = CONFIG.CANVAS.WIDTH;
    sprite.y = CONFIG.PHYSICS.GROUND_Y - 93;
    
    return sprite;
  }

  /**
   * Create a trash bag sprite from the sprite sheet
   * @param {Object} config - Obstacle configuration
   * @param {Object} theme - Theme data
   * @returns {PIXI.Sprite}
   */
  createTrashbagSprite(config, theme) {
    const sprite = new PIXI.Sprite(this.trashbagTexture);
    
    // Store obstacle data for reference
    sprite.obstacleType = config.type;
    sprite.obstacleEffect = theme.effect;
    sprite.obstacleHeight = 85; // Actual frame height
    sprite.obstacleWidth = 65; // Actual frame width
    
    // Position at right edge of screen, on ground
    sprite.x = CONFIG.CANVAS.WIDTH;
    sprite.y = CONFIG.PHYSICS.GROUND_Y - 85;
    
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
      console.warn(`[UPDATE] Spawning obstacle: traveled=${this.traveledDistance.toFixed(0)} >= nextSpawn=${this.nextSpawnDistance.toFixed(0)}`);
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
      if (obstacle && obstacle.texture) {
        this.container.addChild(obstacle);
        this.obstacles.push(obstacle);
        console.warn(`[OBSTACLE] Spawned at traveledDistance=${this.traveledDistance.toFixed(0)}, nextSpawn=${this.nextSpawnDistance.toFixed(0)}`);
      } else {
        console.error('[OBSTACLE] Failed to create obstacle - invalid texture');
      }
    }

    // Calculate next spawn distance using difficulty manager
    const spacing = this.difficultyManager.getObstacleSpacing();
    const variance = this.difficultyManager.getSpawnVariance();
    
    this.nextSpawnDistance = this.traveledDistance + spacing + variance;
    console.warn(`[OBSTACLE] Next spawn at ${this.nextSpawnDistance.toFixed(0)} (spacing=${spacing.toFixed(0)}, variance=${variance.toFixed(0)})`, this.nextSpawnDistance);
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
    const centerX = width / 2;

    // Main bag body (rounded bulbous shape)
    graphics.beginFill(0x1A1A1A);
    graphics.drawEllipse(centerX, height * 0.6, width * 0.45, height * 0.55);
    graphics.endFill();

    // Darker shading for folds and wrinkles
    graphics.beginFill(0x0F0F0F, 0.7);
    graphics.drawEllipse(centerX - width * 0.15, height * 0.5, width * 0.2, height * 0.3);
    graphics.drawEllipse(centerX + width * 0.15, height * 0.55, width * 0.18, height * 0.28);
    graphics.endFill();

    // Mid-tone wrinkles for texture
    graphics.beginFill(0x2A2A2A, 0.5);
    graphics.drawEllipse(centerX - width * 0.12, height * 0.65, width * 0.15, height * 0.2);
    graphics.drawEllipse(centerX + width * 0.1, height * 0.68, width * 0.12, height * 0.18);
    graphics.endFill();

    // Twisted/gathered top
    graphics.beginFill(0x2F2F2F);
    graphics.drawPolygon([
      centerX - width * 0.25, height * 0.15,
      centerX - width * 0.15, 0,
      centerX + width * 0.15, 0,
      centerX + width * 0.25, height * 0.15,
      centerX + width * 0.2, height * 0.25,
      centerX - width * 0.2, height * 0.25
    ]);
    graphics.endFill();

    // Darker fold lines in twisted top
    graphics.lineStyle(1, 0x0F0F0F, 0.8);
    graphics.moveTo(centerX - width * 0.1, 0);
    graphics.lineTo(centerX - width * 0.12, height * 0.2);
    graphics.moveTo(centerX, 0);
    graphics.lineTo(centerX, height * 0.22);
    graphics.moveTo(centerX + width * 0.1, 0);
    graphics.lineTo(centerX + width * 0.12, height * 0.2);

    // Tie/twist (yellow/gold)
    graphics.beginFill(0xFFD700);
    graphics.drawEllipse(centerX, height * 0.18, width * 0.18, 3);
    graphics.endFill();

    // Tie knot detail
    graphics.beginFill(0xFFC700);
    graphics.drawCircle(centerX - width * 0.12, height * 0.16, 2);
    graphics.drawCircle(centerX + width * 0.12, height * 0.16, 2);
    graphics.endFill();

    // Wrapped tie lines
    graphics.lineStyle(1, 0xFFD700, 0.8);
    graphics.drawArc(centerX - width * 0.08, height * 0.18, 5, Math.PI * 0.3, Math.PI * 0.7, false);
    graphics.drawArc(centerX + width * 0.08, height * 0.18, 5, Math.PI * 0.3, Math.PI * 0.7, false);
  }

  drawPuddle(graphics, config) {
    const width = config.width;
    const height = config.height;
    const centerY = config.height - height / 2;
    graphics.beginFill(0x4FC3F7);
    graphics.drawEllipse(width / 2, centerY, width * 0.55, height / 2);
    graphics.endFill();
    graphics.beginFill(0x81D4FA, 0.8);
    graphics.drawEllipse(width / 2 + 6, centerY - 1, width * 0.25, height / 3);
    graphics.endFill();
    graphics.lineStyle(1, 0x2D9CDB, 0.6);
    graphics.drawEllipse(width / 2, centerY, width * 0.55, height / 2);
  }

  drawTrashCan(graphics, config) {
    const width = config.width;
    const height = config.height;

    // Handle (top)
    graphics.beginFill(0x666666);
    graphics.drawRoundedRect(width * 0.15, 2, width * 0.7, 6, 3);
    graphics.endFill();

    // Lid/Rim bar
    graphics.beginFill(0x7A7A7A);
    graphics.drawRect(0, 8, width, 6);
    graphics.endFill();

    // Main container body
    graphics.beginFill(0x808080);
    graphics.drawRoundedRect(2, 14, width - 4, height - 14, 6);
    graphics.endFill();

    // Darker shade for depth (right side)
    graphics.beginFill(0x6B6B6B, 0.6);
    graphics.drawRoundedRect(width - 8, 14, 6, height - 14, 3);
    graphics.endFill();

    // Vertical grooves (3 ridges down the can)
    graphics.beginFill(0x707070);
    graphics.drawRoundedRect(width * 0.2 - 2, 20, 4, height - 20, 2);
    graphics.drawRoundedRect(width * 0.5 - 2, 20, 4, height - 20, 2);
    graphics.drawRoundedRect(width * 0.8 - 2, 20, 4, height - 20, 2);
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
          height: Math.max(6, Math.floor(config.height / 5))
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
