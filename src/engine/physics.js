/**
 * Physics Module
 * 
 * Provides gravity simulation and collision detection.
 * Uses Axis-Aligned Bounding Box (AABB) collision detection for efficiency.
 */

import { CONFIG } from '../config.js';

/**
 * Apply gravity to an object
 * @param {Object} object - Object with velocityY property
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function applyGravity(object, deltaTime) {
  if (!object || typeof object.velocityY !== 'number') {
    throw new Error('Object must have a velocityY property');
  }
  
  object.velocityY += CONFIG.PHYSICS.GRAVITY * deltaTime;
}

/**
 * Update object position based on velocity
 * @param {Object} object - Object with x, y, velocityX, velocityY properties
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updatePosition(object, deltaTime) {
  if (!object) return;
  
  if (typeof object.velocityX === 'number') {
    object.x += object.velocityX * deltaTime;
  }
  
  if (typeof object.velocityY === 'number') {
    object.y += object.velocityY * deltaTime;
  }
}

/**
 * Check if object is on ground
 * @param {Object} object - Object with y and height properties
 * @returns {boolean}
 */
export function isOnGround(object) {
  if (!object || typeof object.y !== 'number') {
    return false;
  }
  
  const objectBottom = object.y + (object.height || 0);
  return objectBottom >= CONFIG.PHYSICS.GROUND_Y;
}

/**
 * Clamp object to ground level
 * @param {Object} object - Object with y, height, and velocityY properties
 */
export function clampToGround(object) {
  if (!object) return;
  
  const height = object.height || 0;
  const bottomY = object.y + height;
  
  if (bottomY > CONFIG.PHYSICS.GROUND_Y) {
    object.y = CONFIG.PHYSICS.GROUND_Y - height;
    object.velocityY = 0;
  }
}

/**
 * AABB Collision Detection
 * Check if two rectangular objects are colliding
 * @param {Object} a - First object with x, y, width, height
 * @param {Object} b - Second object with x, y, width, height
 * @returns {boolean}
 */
export function checkCollision(a, b) {
  if (!a || !b) return false;
  
  // Validate objects have required properties
  if (typeof a.x !== 'number' || typeof a.y !== 'number' ||
      typeof b.x !== 'number' || typeof b.y !== 'number') {
    return false;
  }
  
  const aWidth = a.width || 0;
  const aHeight = a.height || 0;
  const bWidth = b.width || 0;
  const bHeight = b.height || 0;

  return (
    a.x <= b.x + bWidth &&
    a.x + aWidth >= b.x &&
    a.y <= b.y + bHeight &&
    a.y + aHeight >= b.y
  );
}

/**
 * Check collision between a point and a rectangle
 * @param {Object} point - Point with x, y properties
 * @param {Object} rect - Rectangle with x, y, width, height properties
 * @returns {boolean}
 */
export function checkPointCollision(point, rect) {
  if (!point || !rect) return false;
  
  return (
    point.x >= rect.x &&
    point.x <= rect.x + (rect.width || 0) &&
    point.y >= rect.y &&
    point.y <= rect.y + (rect.height || 0)
  );
}

/**
 * Check collision between a circle and a rectangle
 * @param {Object} circle - Circle with x, y, radius properties
 * @param {Object} rect - Rectangle with x, y, width, height properties
 * @returns {boolean}
 */
export function checkCircleRectCollision(circle, rect) {
  if (!circle || !rect) return false;
  
  const radius = circle.radius || 0;
  const rectWidth = rect.width || 0;
  const rectHeight = rect.height || 0;
  
  // Find closest point on rectangle to circle center
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rectWidth));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rectHeight));
  
  // Calculate distance between circle center and closest point
  const distanceX = circle.x - closestX;
  const distanceY = circle.y - closestY;
  const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
  
  return distanceSquared < (radius * radius);
}

/**
 * Get collision bounds for a sprite
 * @param {Object} sprite - Sprite with x, y, width, height properties
 * @returns {Object} Bounds object with x, y, width, height
 */
export function getBounds(sprite) {
  if (!sprite) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  const width = sprite.width || 0;
  const height = sprite.height || 0;
  let x = sprite.x;
  let y = sprite.y;
  
  // Handle anchor offset if present
  if (sprite.anchor) {
    x -= width * (sprite.anchor.x || 0);
    y -= height * (sprite.anchor.y || 0);
  }
  
  return { x, y, width, height };
}

export default {
  applyGravity,
  updatePosition,
  isOnGround,
  clampToGround,
  checkCollision,
  checkPointCollision,
  checkCircleRectCollision,
  getBounds
};
