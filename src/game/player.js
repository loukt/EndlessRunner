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
    this.frames = [];
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameDuration = 0.08;
    this.jumpTexture = null;
    this.landTexture = null;
    this.landTimer = 0;
    this.landDuration = 0.12;
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
      this.destroyFrames();
      this.frames = this.generateRunFrames();
      this.jumpTexture = this.createJumpTexture();
      this.landTexture = this.createLandTexture();
      this.sprite.texture = this.frames[0];
      this.sprite.x = oldX;
      this.sprite.y = oldY;
      this.sprite.tint = 0xFFFFFF;
    } else {
      // First time creation
      this.frames = this.generateRunFrames();
      this.jumpTexture = this.createJumpTexture();
      this.landTexture = this.createLandTexture();
      this.sprite = new PIXI.Sprite(this.frames[0]);
      this.stage.addChild(this.sprite);
      this.sprite.x = CONFIG.PLAYER.START_X;
      this.sprite.y = CONFIG.PHYSICS.GROUND_Y - 60;
      this.sprite.tint = 0xFFFFFF;
    }

    this.frameIndex = 0;
    this.frameTimer = 0;
    this.landTimer = 0;
  }

  /**
   * Create the sprite graphics
   */
  generateRunFrames() {
    const frames = [];
    for (let i = 0; i < 4; i++) {
      const graphics = this.createFrameGraphics(i);
      const texture = this.renderer.generateTexture(graphics);
      graphics.destroy();
      frames.push(texture);
    }
    return frames;
  }

  createFrameGraphics(frameIndex) {
    // Create cat sprite using graphics
    const graphics = new PIXI.Graphics();

    const frontLegOffset = [0, 3, 0, -3];
    const backLegOffset = [3, 0, -3, 0];
    const pawOffset = [0, -2, 0, 2];
    const tailOffset = [0, 3, 0, -3];

    const frontY = 42 + frontLegOffset[frameIndex];
    const backY = 44 + backLegOffset[frameIndex];
    const pawY = 52 + pawOffset[frameIndex];
    const tailY = 28 + tailOffset[frameIndex];

    this.drawBody(graphics);

    // Legs and paws (four-legged run)
    this.drawLegs(graphics, frontY, backY, pawY);

    // Tail
    this.drawTail(graphics, tailY, 0x4);

    this.drawStripes(graphics);

    return graphics;
  }

  createJumpTexture() {
    const graphics = new PIXI.Graphics();
    this.drawBody(graphics, -2);
    this.drawTail(graphics, 24, 6);
    this.drawLegs(graphics, 48, 48, 54, true);
    this.drawStripes(graphics);
    const texture = this.renderer.generateTexture(graphics);
    graphics.destroy();
    return texture;
  }

  createLandTexture() {
    const graphics = new PIXI.Graphics();
    this.drawBody(graphics, 2);
    this.drawTail(graphics, 30, -2);
    this.drawLegs(graphics, 46, 46, 56, false, true);
    this.drawStripes(graphics);
    const texture = this.renderer.generateTexture(graphics);
    graphics.destroy();
    return texture;
  }

  drawBody(graphics, bodyOffsetY = 0) {
    const bodyY = 34 + bodyOffsetY;

    graphics.beginFill(this.colors.fur);
    graphics.drawEllipse(20, bodyY, 18, 12);
    graphics.endFill();

    graphics.beginFill(this.colors.belly);
    graphics.drawEllipse(22, bodyY + 3, 9, 6);
    graphics.endFill();

    graphics.beginFill(this.colors.fur);
    graphics.drawCircle(12, bodyY - 16, 9);
    graphics.endFill();

    graphics.beginFill(this.colors.fur);
    graphics.drawPolygon([4, bodyY - 20, 8, bodyY - 28, 10, bodyY - 18]);
    graphics.drawPolygon([14, bodyY - 18, 16, bodyY - 28, 20, bodyY - 20]);
    graphics.endFill();

    graphics.beginFill(this.colors.patch);
    graphics.drawEllipse(10, bodyY - 16, 3, 4);
    graphics.endFill();

    graphics.beginFill(this.colors.eyes);
    graphics.drawCircle(10, bodyY - 16, 1.5);
    graphics.drawCircle(15, bodyY - 16, 1.5);
    graphics.endFill();

    graphics.beginFill(this.colors.collar);
    graphics.drawRect(6, bodyY - 8, 14, 3);
    graphics.endFill();
  }

  drawLegs(graphics, frontY, backY, pawY, tucked = false, splayed = false) {
    const frontOffset = tucked ? -2 : 0;
    const backOffset = tucked ? 2 : 0;
    const splay = splayed ? 2 : 0;

    graphics.beginFill(this.colors.fur);
    graphics.drawRect(12, backY + backOffset, 4, 9 + splay);
    graphics.drawRect(18, frontY + frontOffset, 4, 9 + splay);
    graphics.drawRect(24, backY + backOffset, 4, 9 + splay);
    graphics.drawRect(28, frontY + frontOffset, 4, 9 + splay);
    graphics.endFill();

    graphics.beginFill(0x2B2B2B);
    graphics.drawRect(11, pawY, 6, 4);
    graphics.drawRect(17, pawY, 6, 4);
    graphics.drawRect(23, pawY, 6, 4);
    graphics.drawRect(27, pawY, 6, 4);
    graphics.endFill();
  }

  drawTail(graphics, tailY, tilt = 0) {
    graphics.beginFill(this.colors.fur);
    graphics.drawRoundedRect(32, tailY, 8, 16, 4);
    graphics.endFill();
    if (tilt !== 0) {
      graphics.beginFill(this.colors.fur);
      graphics.drawRoundedRect(30, tailY - 4, 8, 12, 4);
      graphics.endFill();
    }
  }

  drawStripes(graphics) {
    graphics.beginFill(this.colors.patch);
    graphics.drawRect(14, 30, 16, 3);
    graphics.drawRect(16, 35, 14, 2);
    graphics.drawRect(18, 40, 12, 2);
    graphics.endFill();
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

    if (this.landTimer > 0) {
      this.landTimer = Math.max(0, this.landTimer - deltaTime);
      if (this.landTexture) {
        this.sprite.texture = this.landTexture;
        return;
      }
    }

    if (this.isJumping || this.velocityY < 0) {
      if (this.jumpTexture) {
        this.sprite.texture = this.jumpTexture;
        return;
      }
      this.setFrame(0);
      return;
    }

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
    this.destroyFrames();
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }

  destroyFrames() {
    if (this.frames.length) {
      for (const texture of this.frames) {
        if (texture) {
          texture.destroy(true);
        }
      }
      this.frames = [];
    }
    if (this.jumpTexture) {
      this.jumpTexture.destroy(true);
      this.jumpTexture = null;
    }
    if (this.landTexture) {
      this.landTexture.destroy(true);
      this.landTexture = null;
    }
  }
}

export default Player;
