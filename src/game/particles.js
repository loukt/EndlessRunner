/**
 * Particle System Module
 * 
 * Creates visual effects like dust particles, sparkles, and explosions.
 */

import * as PIXI from 'pixi.js';
import { CONFIG } from '../config.js';

export class ParticleSystem {
  constructor() {
    this.container = null;
    this.particles = [];
  }

  /**
   * Initialize particle container
   * @param {PIXI.Container} stage - PixiJS stage
   */
  create(stage) {
    this.container = new PIXI.Container();
    stage.addChild(this.container);
  }

  /**
   * Create landing dust particles
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  createLandingDust(x, y) {
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(0xD2B48C, 0.8); // Tan color
      particle.drawCircle(0, 0, Math.random() * 3 + 2);
      particle.endFill();

      particle.x = x + (Math.random() - 0.5) * 20;
      particle.y = y;
      particle.vx = (Math.random() - 0.5) * 100;
      particle.vy = -Math.random() * 100 - 50;
      particle.lifetime = 0.5;
      particle.maxLifetime = 0.5;

      this.container.addChild(particle);
      this.particles.push(particle);
    }
  }

  /**
   * Create collision explosion particles
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  createExplosion(x, y) {
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(0xFF6B6B, 1.0); // Red color
      particle.drawCircle(0, 0, Math.random() * 4 + 2);
      particle.endFill();

      particle.x = x;
      particle.y = y;
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = Math.random() * 150 + 100;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.lifetime = 0.8;
      particle.maxLifetime = 0.8;

      this.container.addChild(particle);
      this.particles.push(particle);
    }
  }

  /**
   * Create jump sparkle particles
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  createJumpSparkles(x, y) {
    const particleCount = 5;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(0xFFFFFF, 0.9); // White sparkle
      particle.drawCircle(0, 0, Math.random() * 2 + 1);
      particle.endFill();

      particle.x = x + (Math.random() - 0.5) * 20;
      particle.y = y + 40;
      particle.vx = (Math.random() - 0.5) * 50;
      particle.vy = -Math.random() * 50;
      particle.lifetime = 0.3;
      particle.maxLifetime = 0.3;

      this.container.addChild(particle);
      this.particles.push(particle);
    }
  }

  /**
   * Update all particles
   * @param {number} deltaTime - Time elapsed since last frame
   */
  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      
      // Apply gravity to particles
      particle.vy += 400 * deltaTime;
      
      // Update lifetime
      particle.lifetime -= deltaTime;
      
      // Fade out
      particle.alpha = particle.lifetime / particle.maxLifetime;
      
      // Remove dead particles
      if (particle.lifetime <= 0) {
        this.container.removeChild(particle);
        particle.destroy();
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Clear all particles
   */
  clear() {
    for (const particle of this.particles) {
      this.container.removeChild(particle);
      particle.destroy();
    }
    this.particles = [];
  }

  /**
   * Clean up particle system
   */
  destroy() {
    this.clear();
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
  }
}

export default ParticleSystem;
