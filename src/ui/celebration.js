/**
 * Celebration Module
 * 
 * Displays celebration animations for achievements and new high scores.
 */

import * as PIXI from 'pixi.js';
import { CONFIG } from '../config.js';

export class Celebration {
  constructor() {
    this.container = null;
    this.particles = [];
    this.textElements = [];
    this.isPlaying = false;
    this.duration = 0;
    this.maxDuration = 3; // 3 seconds
  }

  /**
   * Create celebration container
   * @param {PIXI.Container} stage - PixiJS stage
   */
  create(stage) {
    this.container = new PIXI.Container();
    this.container.visible = false;
    stage.addChild(this.container);
  }

  /**
   * Play new high score celebration
   * @param {number} newScore - New high score value
   * @param {number} _previousBest - Previous best score
   */
  playNewHighScore(newScore, _previousBest) {
    this.clear();
    this.isPlaying = true;
    this.duration = 0;
    this.container.visible = true;

    // Create "NEW BEST!" text
    const text = new PIXI.Text('NEW BEST!', {
      fontFamily: 'Arial',
      fontSize: 72,
      fill: 0xFFD700, // Gold
      stroke: 0xFF6B00, // Orange stroke
      strokeThickness: 6,
      align: 'center',
      fontWeight: 'bold'
    });
    text.anchor.set(0.5);
    text.x = CONFIG.CANVAS.WIDTH / 2;
    text.y = CONFIG.CANVAS.HEIGHT / 2 - 50;
    text.alpha = 0;
    this.container.addChild(text);
    this.textElements.push(text);

    // Create score text
    const scoreText = new PIXI.Text(`${newScore}`, {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 4,
      align: 'center'
    });
    scoreText.anchor.set(0.5);
    scoreText.x = CONFIG.CANVAS.WIDTH / 2;
    scoreText.y = CONFIG.CANVAS.HEIGHT / 2 + 30;
    scoreText.alpha = 0;
    this.container.addChild(scoreText);
    this.textElements.push(scoreText);

    // Create explosion of confetti particles
    this.createConfetti(CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2, 50);
  }

  /**
   * Play achievement unlock celebration
   * @param {Object} achievement - Achievement object
   */
  playAchievementUnlock(achievement) {
    this.clear();
    this.isPlaying = true;
    this.duration = 0;
    this.container.visible = true;

    // Create "ACHIEVEMENT!" text
    const text = new PIXI.Text('ACHIEVEMENT!', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0x00FF00, // Green
      stroke: 0x004400,
      strokeThickness: 4,
      align: 'center',
      fontWeight: 'bold'
    });
    text.anchor.set(0.5);
    text.x = CONFIG.CANVAS.WIDTH / 2;
    text.y = CONFIG.CANVAS.HEIGHT / 2 - 60;
    text.alpha = 0;
    this.container.addChild(text);
    this.textElements.push(text);

    // Create achievement name text
    const nameText = new PIXI.Text(`${achievement.icon} ${achievement.name}`, {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 3,
      align: 'center'
    });
    nameText.anchor.set(0.5);
    nameText.x = CONFIG.CANVAS.WIDTH / 2;
    nameText.y = CONFIG.CANVAS.HEIGHT / 2;
    nameText.alpha = 0;
    this.container.addChild(nameText);
    this.textElements.push(nameText);

    // Create description text
    const descText = new PIXI.Text(achievement.description, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xCCCCCC,
      align: 'center'
    });
    descText.anchor.set(0.5);
    descText.x = CONFIG.CANVAS.WIDTH / 2;
    descText.y = CONFIG.CANVAS.HEIGHT / 2 + 40;
    descText.alpha = 0;
    this.container.addChild(descText);
    this.textElements.push(descText);

    // Create star burst particles
    this.createStarBurst(CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2, 30);
  }

  /**
   * Create confetti particles
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} count - Number of particles
   */
  createConfetti(x, y, count) {
    const colors = [0xFFD700, 0xFF6B00, 0xFF1493, 0x00FF00, 0x00BFFF];

    for (let i = 0; i < count; i++) {
      const graphics = new PIXI.Graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];
      graphics.beginFill(color);
      graphics.drawRect(0, 0, 8, 8);
      graphics.endFill();

      const sprite = new PIXI.Sprite(graphics.generateTexture());
      sprite.x = x;
      sprite.y = y;
      sprite.anchor.set(0.5);

      // Random velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 200;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 100; // Upward bias

      this.particles.push({
        sprite,
        vx,
        vy,
        lifetime: 2 + Math.random(),
        age: 0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 10
      });

      this.container.addChild(sprite);
    }
  }

  /**
   * Create star burst particles
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} count - Number of particles
   */
  createStarBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const graphics = new PIXI.Graphics();
      graphics.beginFill(0xFFFFFF);
      graphics.drawCircle(0, 0, 4);
      graphics.endFill();

      const sprite = new PIXI.Sprite(graphics.generateTexture());
      sprite.x = x;
      sprite.y = y;
      sprite.anchor.set(0.5);

      // Radial velocity
      const angle = (i / count) * Math.PI * 2;
      const speed = 150 + Math.random() * 100;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.particles.push({
        sprite,
        vx,
        vy,
        lifetime: 1.5 + Math.random() * 0.5,
        age: 0,
        rotation: 0,
        rotationSpeed: 0
      });

      this.container.addChild(sprite);
    }
  }

  /**
   * Update celebration animation
   * @param {number} deltaTime - Time elapsed since last frame
   */
  update(deltaTime) {
    if (!this.isPlaying) return;

    this.duration += deltaTime;

    // Fade in text elements
    for (const text of this.textElements) {
      if (text.alpha < 1) {
        text.alpha = Math.min(1, text.alpha + deltaTime * 2);
      }
      
      // Pulse effect
      const pulse = Math.sin(this.duration * 3) * 0.1 + 1;
      text.scale.set(pulse);
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.age += deltaTime;

      // Physics
      particle.sprite.x += particle.vx * deltaTime;
      particle.sprite.y += particle.vy * deltaTime;
      particle.vy += 300 * deltaTime; // Gravity
      particle.sprite.rotation += particle.rotationSpeed * deltaTime;

      // Fade out
      particle.sprite.alpha = 1 - (particle.age / particle.lifetime);

      // Remove dead particles
      if (particle.age >= particle.lifetime) {
        this.container.removeChild(particle.sprite);
        particle.sprite.destroy();
        this.particles.splice(i, 1);
      }
    }

    // End celebration after duration
    if (this.duration >= this.maxDuration) {
      this.stop();
    }
  }

  /**
   * Stop celebration and hide
   */
  stop() {
    this.isPlaying = false;
    this.container.visible = false;
    this.clear();
  }

  /**
   * Clear all celebration elements
   */
  clear() {
    // Remove text elements
    for (const text of this.textElements) {
      this.container.removeChild(text);
      text.destroy();
    }
    this.textElements = [];

    // Remove particles
    for (const particle of this.particles) {
      this.container.removeChild(particle.sprite);
      particle.sprite.destroy();
    }
    this.particles = [];

    this.duration = 0;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.clear();
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}

export default Celebration;
