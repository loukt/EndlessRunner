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

    this.textureWidth = 48;
    this.textureHeight = 60;
    this.groundLocalY = 56;
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
      const texture = this.generateFixedTexture(graphics);
      graphics.destroy();
      frames.push(texture);
    }
    return frames;
  }

  createFrameGraphics(frameIndex) {
    const graphics = new PIXI.Graphics();
    const poses = [
      // Frame 0: stretch
      {
        bodyBob: 0,
        headBob: 0,
        tailLift: 1,
        frontA: { dx: 10, knee: 8 },
        frontB: { dx: -6, knee: 10 },
        backA: { dx: -10, knee: 10 },
        backB: { dx: 6, knee: 8 }
      },
      // Frame 1: gather
      {
        bodyBob: 1,
        headBob: 1,
        tailLift: 0,
        frontA: { dx: 2, knee: 12 },
        frontB: { dx: -2, knee: 12 },
        backA: { dx: -2, knee: 12 },
        backB: { dx: 2, knee: 12 }
      },
      // Frame 2: stretch (swap)
      {
        bodyBob: 0,
        headBob: 0,
        tailLift: 1,
        frontA: { dx: -6, knee: 10 },
        frontB: { dx: 10, knee: 8 },
        backA: { dx: 6, knee: 8 },
        backB: { dx: -10, knee: 10 }
      },
      // Frame 3: gather
      {
        bodyBob: 1,
        headBob: 1,
        tailLift: 0,
        frontA: { dx: -2, knee: 12 },
        frontB: { dx: 2, knee: 12 },
        backA: { dx: 2, knee: 12 },
        backB: { dx: -2, knee: 12 }
      }
    ];

    this.drawCat(graphics, poses[frameIndex % poses.length]);
    return graphics;
  }

  createJumpTexture() {
    const graphics = new PIXI.Graphics();
    // Jump: stretched body, tucked legs
    this.drawCat(graphics, {
      bodyBob: -1,
      headBob: -1,
      tailLift: 2,
      frontA: { dx: 6, knee: 16, tucked: true },
      frontB: { dx: 2, knee: 16, tucked: true },
      backA: { dx: -6, knee: 16, tucked: true },
      backB: { dx: -2, knee: 16, tucked: true }
    });
    const texture = this.generateFixedTexture(graphics);
    graphics.destroy();
    return texture;
  }

  createLandTexture() {
    const graphics = new PIXI.Graphics();
    // Land: crouched, legs splayed and absorbing impact
    this.drawCat(graphics, {
      bodyBob: 3,
      headBob: 2,
      tailLift: 0,
      frontA: { dx: 5, knee: 14, splayed: true },
      frontB: { dx: 0, knee: 14, splayed: true },
      backA: { dx: -5, knee: 14, splayed: true },
      backB: { dx: 0, knee: 14, splayed: true }
    });
    const texture = this.generateFixedTexture(graphics);
    graphics.destroy();
    return texture;
  }

  generateFixedTexture(graphics) {
    const region = new PIXI.Rectangle(0, 0, this.textureWidth, this.textureHeight);
    return this.renderer.generateTexture(graphics, { region, resolution: 1 });
  }

  drawCat(graphics, pose) {
    const groundY = this.groundLocalY;
    const bodyCenterX = 23;
    const bodyCenterY = 34 + (pose.bodyBob || 0);
    const bodyRx = 18;
    const bodyRy = 10;

    // Tail first (behind body)
    this.drawTail(graphics, {
      baseX: bodyCenterX - 16,
      baseY: bodyCenterY - 2,
      lift: pose.tailLift || 0
    });

    // Body
    graphics.beginFill(this.colors.fur);
    graphics.drawEllipse(bodyCenterX, bodyCenterY, bodyRx, bodyRy);
    graphics.endFill();

    // Belly hint
    graphics.beginFill(this.colors.belly, 0.9);
    graphics.drawEllipse(bodyCenterX + 3, bodyCenterY + 3, 9, 5);
    graphics.endFill();

    // Head (front/right)
    const headX = bodyCenterX + 18;
    const headY = bodyCenterY - 12 + (pose.headBob || 0);
    graphics.beginFill(this.colors.fur);
    graphics.drawCircle(headX, headY, 8);
    graphics.endFill();

    // Muzzle
    graphics.beginFill(this.colors.fur);
    graphics.drawEllipse(headX + 7, headY + 2, 5, 3);
    graphics.endFill();

    // Ears
    graphics.beginFill(this.colors.fur);
    graphics.drawPolygon([
      headX - 4,
      headY - 6,
      headX - 2,
      headY - 14,
      headX + 1,
      headY - 7
    ]);
    graphics.drawPolygon([
      headX + 1,
      headY - 6,
      headX + 3,
      headY - 14,
      headX + 6,
      headY - 7
    ]);
    graphics.endFill();

    // Eyes
    graphics.beginFill(this.colors.eyes);
    graphics.drawCircle(headX + 2, headY - 1, 1.3);
    graphics.drawCircle(headX + 5, headY - 1, 1.3);
    graphics.endFill();

    // Collar
    graphics.beginFill(this.colors.collar);
    graphics.drawRoundedRect(headX - 9, headY + 6, 14, 3, 1);
    graphics.endFill();

    // Legs (stroke-style for more organic silhouette)
    const shoulderX = bodyCenterX + 9;
    const hipX = bodyCenterX - 6;
    const legTopY = bodyCenterY + 4;

    // Far legs first (slightly darker)
    this.drawLeg(graphics, {
      topX: hipX - 1,
      topY: legTopY,
      footX: hipX + (pose.backB?.dx || 0) - 1,
      footY: groundY,
      kneeDrop: pose.backB?.knee || 12,
      tucked: !!pose.backB?.tucked,
      splayed: !!pose.backB?.splayed,
      color: this.colors.patch
    });
    this.drawLeg(graphics, {
      topX: shoulderX - 1,
      topY: legTopY - 1,
      footX: shoulderX + (pose.frontB?.dx || 0) - 1,
      footY: groundY,
      kneeDrop: pose.frontB?.knee || 12,
      tucked: !!pose.frontB?.tucked,
      splayed: !!pose.frontB?.splayed,
      color: this.colors.patch
    });

    // Near legs
    this.drawLeg(graphics, {
      topX: hipX + 1,
      topY: legTopY + 1,
      footX: hipX + (pose.backA?.dx || 0) + 1,
      footY: groundY,
      kneeDrop: pose.backA?.knee || 12,
      tucked: !!pose.backA?.tucked,
      splayed: !!pose.backA?.splayed,
      color: this.colors.fur
    });
    this.drawLeg(graphics, {
      topX: shoulderX + 1,
      topY: legTopY,
      footX: shoulderX + (pose.frontA?.dx || 0) + 1,
      footY: groundY,
      kneeDrop: pose.frontA?.knee || 12,
      tucked: !!pose.frontA?.tucked,
      splayed: !!pose.frontA?.splayed,
      color: this.colors.fur
    });

    // Body stripes (subtle)
    this.drawStripes(graphics, bodyCenterX, bodyCenterY);
  }

  drawTail(graphics, { baseX, baseY, lift }) {
    const liftAmount = Math.max(-2, Math.min(3, lift || 0));

    graphics.lineStyle({
      width: 5,
      color: this.colors.fur,
      cap: PIXI.LINE_CAP.ROUND,
      join: PIXI.LINE_JOIN.ROUND
    });
    graphics.moveTo(baseX, baseY);
    graphics.bezierCurveTo(
      baseX - 10,
      baseY - (6 + liftAmount * 3),
      baseX - 18,
      baseY - (2 + liftAmount * 4),
      baseX - 14,
      baseY + (10 - liftAmount * 2)
    );
    graphics.lineStyle(0);
  }

  drawLeg(graphics, { topX, topY, footX, footY, kneeDrop, tucked, splayed, color }) {
    const kneeY = tucked ? topY + Math.max(8, kneeDrop - 4) : topY + kneeDrop;
    const kneeX = splayed ? (topX + footX) / 2 + (footX > topX ? 2 : -2) : (topX + footX) / 2;

    graphics.lineStyle({
      width: 4,
      color,
      cap: PIXI.LINE_CAP.ROUND,
      join: PIXI.LINE_JOIN.ROUND
    });
    graphics.moveTo(topX, topY);
    graphics.lineTo(kneeX, kneeY);
    graphics.lineTo(footX, footY - (tucked ? 6 : 0));
    graphics.lineStyle(0);

    // Paw
    graphics.beginFill(0x1F1F1F, 0.95);
    graphics.drawEllipse(footX, footY, 4.5, 2.2);
    graphics.endFill();
  }

  drawStripes(graphics, bodyCenterX, bodyCenterY) {
    graphics.beginFill(this.colors.patch, 0.55);
    graphics.drawRoundedRect(bodyCenterX - 2, bodyCenterY - 10, 10, 3, 1);
    graphics.drawRoundedRect(bodyCenterX - 5, bodyCenterY - 4, 12, 3, 1);
    graphics.drawRoundedRect(bodyCenterX - 7, bodyCenterY + 2, 10, 3, 1);
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
