/**
 * Coin class - Collectible currency for shop purchases
 */

import * as PIXI from 'pixi.js';
import { CONFIG } from '../config.js';

export class Coin {
  constructor() {
    this.container = null;
    this.x = 0;
    this.y = 0;
    this.collected = false;
    this.radius = 12; // Collision radius
    this.bobOffset = 0; // For floating animation
    this.bobSpeed = 3; // Speed of up/down animation
  }

  /**
   * Create coin sprite
   * @param {PIXI.Renderer} renderer - PixiJS renderer for texture generation
   */
  create(renderer) {
    this.container = new PIXI.Container();

    // Draw coin as gold circle with $ symbol
    const graphics = new PIXI.Graphics();
    
    // Outer gold circle
    graphics.beginFill(0xFFD700); // Gold color
    graphics.drawCircle(0, 0, this.radius);
    graphics.endFill();

    // Inner darker circle for depth
    graphics.beginFill(0xDAA520); // Darker gold
    graphics.drawCircle(0, 0, this.radius - 2);
    graphics.endFill();

    // Add shine effect (small white circle)
    graphics.beginFill(0xFFFFFF, 0.6);
    graphics.drawCircle(-3, -3, 3);
    graphics.endFill();

    // Create texture from graphics
    const texture = renderer.generateTexture(graphics);
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);

    // Add $ symbol
    const dollarSign = new PIXI.Text('$', {
      fontFamily: 'Arial',
      fontSize: 16,
      fontWeight: 'bold',
      fill: 0x000000,
      align: 'center'
    });
    dollarSign.anchor.set(0.5);
    dollarSign.position.set(0, 0);

    this.container.addChild(sprite);
    this.container.addChild(dollarSign);

    return this.container;
  }

  /**
   * Spawn coin at position
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  spawn(x, y) {
    this.x = x;
    this.y = y;
    this.collected = false;
    this.bobOffset = Math.random() * Math.PI * 2; // Random starting phase
    
    if (this.container) {
      this.container.position.set(x, y);
      this.container.visible = true;
    }
  }

  /**
   * Update coin animation
   * @param {number} deltaTime - Time since last update
   * @param {number} scrollSpeed - Speed of world scrolling
   */
  update(deltaTime, scrollSpeed) {
    if (this.collected || !this.container) return;

    // Move with world scroll
    this.x -= scrollSpeed * deltaTime;
    
    // Bobbing animation
    this.bobOffset += this.bobSpeed * deltaTime;
    const bobAmount = Math.sin(this.bobOffset) * 3; // 3 pixels up/down

    // Update container position
    this.container.position.set(this.x, this.y + bobAmount);

    // Rotation animation
    this.container.rotation += 2 * deltaTime;
  }

  /**
   * Check collision with player
   * @param {Object} playerBounds - Player collision bounds {x, y, width, height}
   * @returns {boolean} True if collected
   */
  checkCollision(playerBounds) {
    if (this.collected) return false;

    // Simple circle-rectangle collision
    const closestX = Math.max(playerBounds.x, Math.min(this.x, playerBounds.x + playerBounds.width));
    const closestY = Math.max(playerBounds.y, Math.min(this.y, playerBounds.y + playerBounds.height));

    const distanceX = this.x - closestX;
    const distanceY = this.y - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

    return distanceSquared < (this.radius * this.radius);
  }

  /**
   * Collect the coin
   */
  collect() {
    this.collected = true;
    if (this.container) {
      this.container.visible = false;
    }
  }

  /**
   * Check if coin is off screen
   * @returns {boolean} True if off screen
   */
  isOffScreen() {
    return this.x < -50;
  }

  /**
   * Reset coin state
   */
  reset() {
    this.collected = false;
    this.x = 0;
    this.y = 0;
    this.bobOffset = 0;
    if (this.container) {
      this.container.visible = false;
    }
  }

  /**
   * Destroy coin
   */
  destroy() {
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
  }
}

/**
 * CoinManager - Manages multiple coins
 */
export class CoinManager {
  constructor() {
    this.coins = [];
    this.container = null;
    this.spawnTimer = 0;
    this.spawnInterval = 2.0; // Spawn every 2 seconds on average
    this.spawnChance = 0.5; // 50% chance to spawn
    this.minY = CONFIG.PHYSICS.GROUND_Y - 150; // Spawn up to 150px above ground
    this.maxY = CONFIG.PHYSICS.GROUND_Y - 30; // At least 30px above ground
  }

  /**
   * Create coin manager
   * @param {PIXI.Container} stage - Stage to add coins to
   * @param {PIXI.Renderer} renderer - PixiJS renderer
   */
  create(stage, renderer) {
    this.container = new PIXI.Container();
    this.renderer = renderer;
    stage.addChild(this.container);

    // Pre-create a pool of coins
    for (let i = 0; i < 10; i++) {
      const coin = new Coin();
      const coinSprite = coin.create(renderer);
      this.container.addChild(coinSprite);
      coin.container.visible = false;
      this.coins.push(coin);
    }
  }

  /**
   * Update all coins
   * @param {number} deltaTime - Time since last update
   * @param {number} scrollSpeed - Speed of world scrolling
   * @param {boolean} isPlaying - Whether game is playing
   */
  update(deltaTime, scrollSpeed, isPlaying) {
    if (!isPlaying) return;

    // Update spawn timer
    this.spawnTimer += deltaTime;

    // Try to spawn new coin
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      if (Math.random() < this.spawnChance) {
        this.spawnCoin();
      }
    }

    // Update all active coins
    for (const coin of this.coins) {
      if (!coin.collected && coin.container && coin.container.visible) {
        coin.update(deltaTime, scrollSpeed);

        // Remove coins that are off screen
        if (coin.isOffScreen()) {
          coin.reset();
        }
      }
    }
  }

  /**
   * Spawn a new coin
   */
  spawnCoin() {
    // Find an inactive coin
    const coin = this.coins.find(c => !c.container.visible);
    if (!coin) return;

    // Random Y position between min and max
    const y = this.minY + Math.random() * (this.maxY - this.minY);
    
    // Spawn off screen to the right
    const x = CONFIG.CANVAS.WIDTH + 50;

    coin.spawn(x, y);
  }

  /**
   * Check collisions with player
   * @param {Object} playerBounds - Player collision bounds
   * @returns {number} Number of coins collected this frame
   */
  checkCollisions(playerBounds) {
    let collected = 0;

    for (const coin of this.coins) {
      if (coin.checkCollision(playerBounds)) {
        coin.collect();
        collected++;
      }
    }

    return collected;
  }

  /**
   * Reset all coins
   */
  reset() {
    this.spawnTimer = 0;
    for (const coin of this.coins) {
      coin.reset();
    }
  }

  /**
   * Destroy all coins
   */
  destroy() {
    for (const coin of this.coins) {
      coin.destroy();
    }
    this.coins = [];
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}
