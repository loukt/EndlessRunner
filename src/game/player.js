/**
 * Player Module
 * 
 * Manages the player character with jump mechanics and visual representation.
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
    this.colors = {
      fur: 0xD9A05B,
      patch: 0x8B5E3C,
      belly: 0xF5D7B2,
      collar: 0xCC3344,
      eyes: 0x2E2E2E
    };
    this.collisionEffect = null;
  }

  /**
   * Create the player sprite
   * @param {PIXI.Container} stage - PixiJS stage to add sprite to
   * @param {PIXI.Renderer} renderer - PixiJS renderer for texture generation
   */
  create(stage, renderer) {
    this.stage = stage;
    this.renderer = renderer;
    this.createCharacter();
  }

  /**
  * Create cat character with current colors
   */
  createCharacter() {
    // Remove old sprite if it exists
    if (this.sprite) {
      const oldX = this.sprite.x;
      const oldY = this.sprite.y;
      this.sprite.destroy();
      this.sprite = null;
      
      // Create new sprite and restore position
      this.createSpriteGraphics();
      this.sprite.x = oldX;
      this.sprite.y = oldY;
      this.sprite.tint = 0xFFFFFF;
    } else {
      // First time creation
      this.createSpriteGraphics();
      this.sprite.x = CONFIG.PLAYER.START_X;
      this.sprite.y = CONFIG.PHYSICS.GROUND_Y - 60;
      this.sprite.tint = 0xFFFFFF;
    }
  }

  /**
   * Create the sprite graphics
   */
  createSpriteGraphics() {
    // Create cat sprite using graphics
    const graphics = new PIXI.Graphics();

    // Body
    graphics.beginFill(this.colors.fur);
    graphics.drawEllipse(20, 34, 14, 16);
    graphics.endFill();

    // Belly
    graphics.beginFill(this.colors.belly);
    graphics.drawEllipse(20, 38, 8, 10);
    graphics.endFill();

    // Head
    graphics.beginFill(this.colors.fur);
    graphics.drawCircle(20, 14, 9);
    graphics.endFill();

    // Ears
    graphics.beginFill(this.colors.fur);
    graphics.drawPolygon([12, 8, 16, 2, 18, 10]);
    graphics.drawPolygon([22, 10, 24, 2, 28, 8]);
    graphics.endFill();

    // Face patch/stripe
    graphics.beginFill(this.colors.patch);
    graphics.drawEllipse(16, 14, 3, 4);
    graphics.endFill();

    // Eyes
    graphics.beginFill(this.colors.eyes);
    graphics.drawCircle(17, 14, 1.5);
    graphics.drawCircle(23, 14, 1.5);
    graphics.endFill();

    // Collar
    graphics.beginFill(this.colors.collar);
    graphics.drawRect(13, 20, 14, 3);
    graphics.endFill();

    // Legs and paws
    graphics.beginFill(this.colors.fur);
    graphics.drawRect(12, 46, 5, 10);
    graphics.drawRect(23, 46, 5, 10);
    graphics.endFill();
    graphics.beginFill(0x2B2B2B);
    graphics.drawRect(11, 56, 7, 4);
    graphics.drawRect(22, 56, 7, 4);
    graphics.endFill();

    // Tail
    graphics.beginFill(this.colors.fur);
    graphics.drawRoundedRect(30, 32, 8, 16, 4);
    graphics.endFill();

    // Stripe
    graphics.beginFill(this.colors.patch);
    graphics.drawRect(12, 30, 16, 3);
    graphics.endFill();

    // Create sprite from graphics (PixiJS v7 API)
    const texture = this.renderer.generateTexture(graphics);
    this.sprite = new PIXI.Sprite(texture);
    
    // Add to stage
    this.stage.addChild(this.sprite);
  }

  /**
   * Apply new colors to the character
   * @param {Object} colors - Color scheme {fur, patch, belly, collar, eyes}
   */
  applyColors(colors) {
    if (colors) {
      this.colors = { ...this.colors, ...colors };
      this.createCharacter();
      console.log('Applied colors to player:', colors);
    }
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
        this.wasInAir = false;
      }
    } else {
      this.wasInAir = true;
    }

    return justLanded;
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
  }
}

export default Player;
