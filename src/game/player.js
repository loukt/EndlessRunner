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
      suit: 0x1A1A2E,
      tie: 0xCC0000,
      shirt: 0xFFFFFF,
      skin: 0xFFDBB5,
      briefcase: 0x8B4513
    };
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
   * Create businessman character with current colors
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
    } else {
      // First time creation
      this.createSpriteGraphics();
      this.sprite.x = CONFIG.PLAYER.START_X;
      this.sprite.y = CONFIG.PHYSICS.GROUND_Y - 60;
    }
  }

  /**
   * Create the sprite graphics
   */
  createSpriteGraphics() {
    // Create businessman sprite using graphics
    const graphics = new PIXI.Graphics();
    
    // Draw businessman character
    // Head (circle with skin tone)
    graphics.beginFill(this.colors.skin); // Skin tone
    graphics.drawCircle(20, 8, 8); // Head
    graphics.endFill();
    
    // Suit jacket
    graphics.beginFill(this.colors.suit); // Suit color
    graphics.drawRect(12, 16, 16, 22); // Torso
    graphics.endFill();
    
    // White shirt/collar
    graphics.beginFill(this.colors.shirt);
    graphics.drawRect(16, 18, 8, 4); // Collar
    graphics.endFill();
    
    // Tie
    graphics.beginFill(this.colors.tie);
    graphics.drawRect(18, 22, 4, 10); // Tie
    graphics.endFill();
    
    // Arms (running pose - one forward, one back)
    graphics.beginFill(this.colors.suit);
    graphics.drawRect(8, 20, 4, 12); // Left arm (back)
    graphics.drawRect(28, 22, 4, 10); // Right arm (forward)
    graphics.endFill();
    
    // Pants (dark gray)
    graphics.beginFill(0x333333);
    graphics.drawRect(12, 38, 7, 22); // Left leg
    graphics.drawRect(21, 38, 7, 22); // Right leg
    graphics.endFill();
    
    // Shoes (black)
    graphics.beginFill(0x000000);
    graphics.drawRect(10, 58, 9, 4); // Left shoe
    graphics.drawRect(21, 58, 9, 4); // Right shoe
    graphics.endFill();
    
    // Briefcase (held in hand)
    graphics.beginFill(this.colors.briefcase);
    graphics.drawRect(28, 32, 8, 6);
    graphics.endFill();
    graphics.lineStyle(1, this.colors.briefcase * 0.8);
    graphics.drawRect(28, 32, 8, 6);

    // Create sprite from graphics (PixiJS v7 API)
    const texture = this.renderer.generateTexture(graphics);
    this.sprite = new PIXI.Sprite(texture);
    
    // Add to stage
    this.stage.addChild(this.sprite);
  }

  /**
   * Apply new colors to the character
   * @param {Object} colors - Color scheme {suit, tie, shirt, skin, briefcase}
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
   */
  die() {
    this.isAlive = false;
    this.isJumpPressed = false;
    if (this.sprite) {
      this.sprite.tint = 0xFF0000; // Turn red
    }
  }

  /**
   * Reset player to initial state
   */
  reset() {
    this.isAlive = true;
    this.velocityY = 0;
    this.isJumping = false;
    this.isJumpPressed = false;
    
    if (this.sprite) {
      this.sprite.y = CONFIG.PHYSICS.GROUND_Y - CONFIG.PLAYER.HEIGHT;
      this.sprite.tint = 0xFFFFFF; // Reset color
    }
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
