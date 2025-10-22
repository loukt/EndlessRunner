/**
 * Game Configuration
 * 
 * All game constants and configuration values.
 * Modify these values to tune game difficulty and behavior.
 */

export const CONFIG = {
  // Canvas & Display
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: 0x87CEEB, // Sky blue
  },

  // Performance Targets
  PERFORMANCE: {
    TARGET_FPS: 60,
    FRAME_BUDGET_MS: 16, // 16ms = 60 FPS
    MAX_MEMORY_MB: 150,
    MAX_LOAD_TIME_MS: 2000,
  },

  // Physics
  PHYSICS: {
    GRAVITY: 1200, // pixels per second squared
    GROUND_Y: 500, // Y position of ground
  },

  // Player
  PLAYER: {
    WIDTH: 40,
    HEIGHT: 60,
    START_X: 100,
    JUMP_VELOCITY: -600, // pixels per second (negative = up)
    RUN_SPEED: 300, // pixels per second
    COLOR: 0x00FF00, // Green
  },

  // Obstacles
  OBSTACLES: {
    WIDTH: 30,
    HEIGHT: 50,
    MIN_SPACING: 200, // Minimum pixels between obstacles (hard difficulty)
    MAX_SPACING: 700, // Maximum pixels between obstacles (easy start)
    SPACING_REDUCTION_RATE: 0.995, // Multiplier per frame (gradual difficulty increase)
    SPAWN_X: 850, // Off-screen right
    COLOR: 0xFF0000, // Red
  },

  // Coins
  COINS: {
    RADIUS: 15,
    VALUE: 1,
    SPAWN_CHANCE: 0.3, // 30% chance per obstacle
    Y_RANGE: [200, 450], // Random Y position range
    COLOR: 0xFFD700, // Gold
  },

  // Scoring
  SCORING: {
    DISTANCE_MULTIPLIER: 1, // Score = distance * multiplier
    COINS_PER_RUN: 50, // Average coins per run
  },

  // Audio
  AUDIO: {
    VOLUME: {
      MASTER: 0.7,
      SFX: 1.0,
      MUSIC: 0.5,
    },
  },

  // Storage
  STORAGE: {
    DB_NAME: 'EndlessRunnerDB',
    DB_VERSION: 1,
    STORE_NAMES: {
      PROFILE: 'playerProfile',
      COSMETICS: 'cosmetics',
      CHALLENGES: 'challenges',
      ACHIEVEMENTS: 'achievements',
      TRANSACTIONS: 'transactions',
    },
  },

  // IAP
  IAP: {
    BUNDLES: [
      { id: 'coins_small', coins: 500, price: 0.99 },
      { id: 'coins_medium', coins: 3000, price: 4.99 },
      { id: 'coins_large', coins: 7500, price: 9.99 },
    ],
  },
};

export default CONFIG;
