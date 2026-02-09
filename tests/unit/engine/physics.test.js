/**
 * Unit tests for Physics
 */

import { describe, it, expect } from 'vitest';
import * as Physics from '../../../src/engine/physics.js';
import { CONFIG } from '../../../src/config.js';

describe('Physics', () => {
  describe('applyGravity', () => {
    it('should increase velocityY over time', () => {
      const object = { velocityY: 0 };
      const deltaTime = 1 / 60; // One frame at 60 FPS

      Physics.applyGravity(object, deltaTime);

      expect(object.velocityY).toBeGreaterThan(0);
    });

    it('should apply correct gravity acceleration', () => {
      const object = { velocityY: 0 };
      const deltaTime = 1; // One second

      Physics.applyGravity(object, deltaTime);

      expect(object.velocityY).toBeCloseTo(CONFIG.PHYSICS.GRAVITY, 1);
    });

    it('should accumulate velocity over multiple frames', () => {
      const object = { velocityY: 0 };
      const deltaTime = 1 / 60;

      Physics.applyGravity(object, deltaTime);
      const firstVelocity = object.velocityY;
      
      Physics.applyGravity(object, deltaTime);
      const secondVelocity = object.velocityY;

      expect(secondVelocity).toBeGreaterThan(firstVelocity);
    });

    it('should handle negative initial velocity', () => {
      const object = { velocityY: -500 }; // Jumping up
      const deltaTime = 1 / 60;

      Physics.applyGravity(object, deltaTime);

      expect(object.velocityY).toBeGreaterThan(-500);
    });
  });

  describe('updatePosition', () => {
    it('should update x position based on velocityX', () => {
      const object = { x: 0, y: 0, velocityX: 100, velocityY: 0 };
      const deltaTime = 1; // One second

      Physics.updatePosition(object, deltaTime);

      expect(object.x).toBe(100);
    });

    it('should update y position based on velocityY', () => {
      const object = { x: 0, y: 0, velocityX: 0, velocityY: 50 };
      const deltaTime = 1; // One second

      Physics.updatePosition(object, deltaTime);

      expect(object.y).toBe(50);
    });

    it('should update both x and y positions', () => {
      const object = { x: 0, y: 0, velocityX: 100, velocityY: 50 };
      const deltaTime = 0.5; // Half second

      Physics.updatePosition(object, deltaTime);

      expect(object.x).toBe(50);
      expect(object.y).toBe(25);
    });

    it('should handle negative velocities', () => {
      const object = { x: 100, y: 100, velocityX: -50, velocityY: -30 };
      const deltaTime = 1;

      Physics.updatePosition(object, deltaTime);

      expect(object.x).toBe(50);
      expect(object.y).toBe(70);
    });
  });

  describe('isOnGround', () => {
    it('should return true when object is on ground', () => {
      const object = { y: CONFIG.PHYSICS.GROUND_Y - 60, height: 60 };

      expect(Physics.isOnGround(object)).toBe(true);
    });

    it('should return false when object is above ground', () => {
      const object = { y: CONFIG.PHYSICS.GROUND_Y - 100, height: 60 };

      expect(Physics.isOnGround(object)).toBe(false);
    });

    it('should consider object height', () => {
      const object = { y: CONFIG.PHYSICS.GROUND_Y - 30, height: 60 };

      expect(Physics.isOnGround(object)).toBe(true);
    });
  });

  describe('clampToGround', () => {
    it('should prevent object from going below ground', () => {
      const object = { y: CONFIG.PHYSICS.GROUND_Y + 100, height: 60 };

      Physics.clampToGround(object);

      expect(object.y).toBe(CONFIG.PHYSICS.GROUND_Y - 60);
    });

    it('should not affect object above ground', () => {
      const object = { y: CONFIG.PHYSICS.GROUND_Y - 100, height: 60 };
      const originalY = object.y;

      Physics.clampToGround(object);

      expect(object.y).toBe(originalY);
    });

    it('should reset velocityY when clamping', () => {
      const object = { y: CONFIG.PHYSICS.GROUND_Y + 100, height: 60, velocityY: 500 };

      Physics.clampToGround(object);

      expect(object.velocityY).toBe(0);
    });
  });

  describe('checkCollision', () => {
    it('should detect collision when objects overlap', () => {
      const a = { x: 0, y: 0, width: 50, height: 50 };
      const b = { x: 25, y: 25, width: 50, height: 50 };

      expect(Physics.checkCollision(a, b)).toBe(true);
    });

    it('should not detect collision when objects do not overlap', () => {
      const a = { x: 0, y: 0, width: 50, height: 50 };
      const b = { x: 100, y: 100, width: 50, height: 50 };

      expect(Physics.checkCollision(a, b)).toBe(false);
    });

    it('should detect collision when objects touch edges', () => {
      const a = { x: 0, y: 0, width: 50, height: 50 };
      const b = { x: 50, y: 0, width: 50, height: 50 };

      expect(Physics.checkCollision(a, b)).toBe(true);
    });

    it('should detect collision when one object is inside another', () => {
      const a = { x: 0, y: 0, width: 100, height: 100 };
      const b = { x: 25, y: 25, width: 10, height: 10 };

      expect(Physics.checkCollision(a, b)).toBe(true);
    });

    it('should handle objects with different sizes', () => {
      const a = { x: 0, y: 0, width: 100, height: 50 };
      const b = { x: 50, y: 25, width: 30, height: 80 };

      expect(Physics.checkCollision(a, b)).toBe(true);
    });
  });

  describe('checkCircleRectCollision', () => {
    it('should detect collision when circle overlaps rectangle', () => {
      const circle = { x: 50, y: 50, radius: 20 };
      const rect = { x: 40, y: 40, width: 50, height: 50 };

      expect(Physics.checkCircleRectCollision(circle, rect)).toBe(true);
    });

    it('should not detect collision when circle is far from rectangle', () => {
      const circle = { x: 0, y: 0, radius: 10 };
      const rect = { x: 100, y: 100, width: 50, height: 50 };

      expect(Physics.checkCircleRectCollision(circle, rect)).toBe(false);
    });

    it('should detect collision when circle center is inside rectangle', () => {
      const circle = { x: 50, y: 50, radius: 10 };
      const rect = { x: 30, y: 30, width: 50, height: 50 };

      expect(Physics.checkCircleRectCollision(circle, rect)).toBe(true);
    });

    it('should detect collision at rectangle corners', () => {
      const circle = { x: 0, y: 0, radius: 15 };
      const rect = { x: 10, y: 10, width: 50, height: 50 };

      expect(Physics.checkCircleRectCollision(circle, rect)).toBe(true);
    });

    it('should not detect collision when circle just touches edge', () => {
      const circle = { x: 0, y: 50, radius: 10 };
      const rect = { x: 11, y: 30, width: 50, height: 50 };

      expect(Physics.checkCircleRectCollision(circle, rect)).toBe(false);
    });
  });

  describe('getBounds', () => {
    it('should return sprite bounds', () => {
      const sprite = {
        x: 100,
        y: 200,
        width: 50,
        height: 60
      };

      const bounds = Physics.getBounds(sprite);

      expect(bounds.x).toBe(100);
      expect(bounds.y).toBe(200);
      expect(bounds.width).toBe(50);
      expect(bounds.height).toBe(60);
    });

    it('should handle sprites with anchor offset', () => {
      const sprite = {
        x: 100,
        y: 200,
        width: 50,
        height: 60,
        anchor: { x: 0.5, y: 0.5 }
      };

      const bounds = Physics.getBounds(sprite);

      expect(bounds.x).toBe(75); // 100 - (50 * 0.5)
      expect(bounds.y).toBe(170); // 200 - (60 * 0.5)
      expect(bounds.width).toBe(50);
      expect(bounds.height).toBe(60);
    });

    it('should handle sprites without anchor', () => {
      const sprite = {
        x: 100,
        y: 200,
        width: 50,
        height: 60
      };

      const bounds = Physics.getBounds(sprite);

      expect(bounds.x).toBe(100);
      expect(bounds.y).toBe(200);
    });
  });

  describe('integration tests', () => {
    it('should simulate realistic jump physics', () => {
      const player = {
        x: 0,
        y: CONFIG.PHYSICS.GROUND_Y - CONFIG.PLAYER.HEIGHT,
        velocityX: 0,
        velocityY: CONFIG.PLAYER.JUMP_VELOCITY, // -600
        height: CONFIG.PLAYER.HEIGHT
      };

      const deltaTime = 1 / 60;
      let maxHeight = player.y;

      // Simulate jump for 2 seconds
      for (let i = 0; i < 120; i++) {
        Physics.applyGravity(player, deltaTime);
        Physics.updatePosition(player, deltaTime);
        Physics.clampToGround(player);

        maxHeight = Math.min(maxHeight, player.y);
      }

      // Should jump up (y decreases) then land back on ground
      expect(maxHeight).toBeLessThan(CONFIG.PHYSICS.GROUND_Y - CONFIG.PLAYER.HEIGHT);
      expect(player.y).toBe(CONFIG.PHYSICS.GROUND_Y - CONFIG.PLAYER.HEIGHT);
      expect(player.velocityY).toBe(0);
    });

    it('should simulate falling from height', () => {
      const object = {
        x: 0,
        y: 0, // High up
        velocityX: 0,
        velocityY: 0,
        height: 50
      };

      const deltaTime = 1 / 60;

      // Simulate falling for 2 seconds
      for (let i = 0; i < 120; i++) {
        Physics.applyGravity(object, deltaTime);
        Physics.updatePosition(object, deltaTime);
        Physics.clampToGround(object);
      }

      // Should land on ground
      expect(object.y).toBe(CONFIG.PHYSICS.GROUND_Y - 50);
      expect(object.velocityY).toBe(0);
    });
  });
});
