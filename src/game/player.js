/**
 * Player Module
 * 
 * Manages the player character with jump mechanics and sprite-based animation.
 */

import * as PIXI from 'pixi.js';
import { CONFIG } from '../config.js';
import * as Physics from '../engine/physics.js';

export class Player {
  constructor() {
    this.sprite = null;
    this.velocityY = 0;
    this.isJumping = false;
    this.isAlive = true;
    this.isJumpPressed = false; // Track if jump button is held
    this.wasInAir = false; // Track if player was in air last frame (for landing detection)
    this.renderer = null;
    this.stage = null;
    this.collisionEffect = null;
    this.frames = [];
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameDuration = 0.1;
    this.jumpFrameIndex = 0; // Frame to use when jumping
    this.landFrameIndex = 7; // Frame to use when landing
    this.landTimer = 0;
    this.landDuration = 0.12;
    this.spritesheetLoaded = false;
  }

  /**
   * Create the player sprite
   * @param {PIXI.Container} stage - PixiJS stage to add sprite to
   * @param {PIXI.Renderer} renderer - PixiJS renderer for texture generation
   */
  async create(stage, renderer) {
    this.stage = stage;
    this.renderer = renderer;
    await this.loadSpritessheet();
    this.createCharacter();
  }

  /**
   * Load sprite sheet from assets
   */
  async loadSpritessheet() {
    try {
      // Fetch metadata from public folder
      const metadataResponse = await fetch('/assets/sprites/cat-spritesheet.json');
      const metadata = await metadataResponse.json();
      
      const spritesheet = new PIXI.Spritesheet(
        PIXI.Texture.from('/assets/sprites/cat-spritesheet.png'),
        metadata
      );
      await spritesheet.parse();
      
      // Extract frames in order
      for (let i = 0; i < 8; i++) {
        const frameName = `cat_${i}.png`;
        if (spritesheet.textures[frameName]) {
          this.frames.push(spritesheet.textures[frameName]);
        }
      }
      this.spritesheetLoaded = this.frames.length > 0;
    } catch (error) {
      console.warn('Failed to load spritesheet, using fallback:', error);
      this.spritesheetLoaded = false;
      // Fallback: create default texture if spritesheet fails
      if (!this.frames.length) {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x8B6914);
        graphics.drawCircle(24, 30, 20);
        graphics.endFill();
        const texture = this.renderer.generateTexture(graphics, { 
          region: new PIXI.Rectangle(0, 0, 48, 60), 
          resolution: 1 
        });
        graphics.destroy();
        this.frames.push(texture);
      }
    }
  }

  /**
   * Create cat character sprite
   */
  createCharacter() {
    if (!this.frames.length) return;

    // Remove old sprite if it exists
    if (this.sprite) {
      const oldX = this.sprite.x;
      const oldY = this.sprite.y;
      this.sprite.texture = this.frames[0];
      this.sprite.x = oldX;
      this.sprite.y = oldY;
      this.sprite.tint = 0xFFFFFF;
    } else {
      // First time creation
      this.sprite = new PIXI.Sprite(this.frames[0]);
      this.stage.addChild(this.sprite);
      this.sprite.x = CONFIG.PLAYER.START_X;
      this.sprite.y = CONFIG.PHYSICS.GROUND_Y - 60;
      this.sprite.tint = 0xFFFFFF;
      this.sprite.scale.set(0.6); // Scale down sprite sheet frames
    }

    this.frameIndex = 0;
    this.frameTimer = 0;
    this.landTimer = 0;
  }

  /**
   * Make the player jump
   */
  jump() {
    if (!this.isAlive) return;
    
    // Only jump if on ground
    if (Physics.isOnGround({
      y: this.sprite.y,
      height: CONFIG.PLAYER.HEIGHT
    })) {
      this.velocityY = CONFIG.PLAYER.JUMP_VELOCITY;
      this.isJumping = true;
      this.isJumpPressed = true;
    }
  }

  /**
   * Cancel jump (for variable jump height)
   * Called when jump button is released
   */
  cancelJump() {
    this.isJumpPressed = false;
    
    // If moving upward, cut the velocity for a shorter jump
    if (this.velocityY < 0) {
      this.velocityY *= 0.5; // Cut velocity by half
    }
  }

  /**
   * Update player physics and position
   * @param {number} deltaTime - Time elapsed since last frame
   * @returns {boolean} True if player just landed this frame
   */
  update(deltaTime) {
    if (!this.isAlive || !this.sprite) return false;

    let justLanded = false;

    // Apply gravity to velocity
    // Use stronger gravity if jump button is not held (for tighter control)
    const gravityMultiplier = this.isJumpPressed && this.velocityY < 0 ? 0.8 : 1.0;
    this.velocityY += CONFIG.PHYSICS.GRAVITY * deltaTime * gravityMultiplier;

    // Update position based on velocity
    this.sprite.y += this.velocityY * deltaTime;

    // Clamp to ground if below
    const groundY = CONFIG.PHYSICS.GROUND_Y - CONFIG.PLAYER.HEIGHT;
    if (this.sprite.y > groundY) {
      this.sprite.y = groundY;
      this.velocityY = 0;
      this.isJumping = false;
      this.isJumpPressed = false;
      
      // Detect landing (was in air, now on ground)
      if (this.wasInAir) {
        justLanded = true;
        this.landTimer = this.landDuration;
        this.wasInAir = false;
      }
    } else {
      this.wasInAir = true;
    }

    this.updateAnimation(deltaTime);

    return justLanded;
  }

  updateAnimation(deltaTime) {
    if (!this.frames.length) {
      return;
    }

    // Show landing frame briefly
    if (this.landTimer > 0) {
      this.landTimer = Math.max(0, this.landTimer - deltaTime);
      if (this.landFrameIndex < this.frames.length) {
        this.sprite.texture = this.frames[this.landFrameIndex];
      }
      return;
    }

    // Show jump frame during jump
    if (this.isJumping || this.velocityY < 0) {
      if (this.jumpFrameIndex < this.frames.length) {
        this.sprite.texture = this.frames[this.jumpFrameIndex];
      }
      return;
    }

    // Animate running frames
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer -= this.frameDuration;
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      this.sprite.texture = this.frames[this.frameIndex];
    }
  }

  setFrame(index) {
    if (!this.frames.length) return;
    const safeIndex = Math.max(0, Math.min(index, this.frames.length - 1));
    if (this.frameIndex !== safeIndex) {
      this.frameIndex = safeIndex;
      this.sprite.texture = this.frames[this.frameIndex];
    }
  }

  /**
   * Get player collision bounds
   * @returns {Object} Bounds with x, y, width, height
   */
  getBounds() {
    if (!this.sprite) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    return {
      x: this.sprite.x,
      y: this.sprite.y,
      width: CONFIG.PLAYER.WIDTH,
      height: CONFIG.PLAYER.HEIGHT
    };
  }

  /**
   * Kill the player (game over)
   * @param {string} effectType - Collision effect type
   */
  die(effectType = null) {
    this.isAlive = false;
    this.isJumpPressed = false;
    this.applyCollisionEffect(effectType);
  }

  /**
   * Reset player to initial state
   */
  reset() {
    this.isAlive = true;
    this.velocityY = 0;
    this.isJumping = false;
    this.isJumpPressed = false;
    this.collisionEffect = null;
    
    if (this.sprite) {
      this.sprite.y = CONFIG.PHYSICS.GROUND_Y - CONFIG.PLAYER.HEIGHT;
      this.sprite.tint = 0xFFFFFF; // Reset color
    }
  }

  /**
   * Apply a visual effect when the cat collides
   * @param {string|null} effectType - Effect key
   */
  applyCollisionEffect(effectType) {
    if (!this.sprite) return;
    this.collisionEffect = effectType;

    const tints = {
      wet: 0x6EC6FF,
      filthy: 0x8B5A2B,
      tangled: 0xB57CFF,
      startled: 0xFFDD55,
      default: 0xFF6B6B
    };

    const tint = tints[effectType] || tints.default;
    this.sprite.tint = tint;
  }

  /**
   * Clean up player resources
   */
  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    // Sprite sheet textures are managed by PIXI and will be cleaned up automatically
    this.frames = [];
  }
}

export default Player;
