/**
 * Database Migrations
 * 
 * Handles database version management and schema migrations.
 * Provides upgrade paths for future schema changes.
 */

import { CONFIG } from '../config.js';

/**
 * Migration definitions
 * Each migration should be idempotent and handle both upgrade and data migration
 */
const migrations = {
  // Version 1: Initial schema
  1: {
    description: 'Initial database schema with all core object stores',
    upgrade: (db) => {
      // Player Profile (singleton)
      if (!db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.PROFILE)) {
        db.createObjectStore(CONFIG.STORAGE.STORE_NAMES.PROFILE, { keyPath: 'id' });
      }

      // Cosmetic Items
      if (!db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.COSMETICS)) {
        const cosmeticsStore = db.createObjectStore(CONFIG.STORAGE.STORE_NAMES.COSMETICS, { keyPath: 'id' });
        cosmeticsStore.createIndex('category', 'category', { unique: false });
        cosmeticsStore.createIndex('isUnlocked', 'isUnlocked', { unique: false });
      }

      // Daily Challenges
      if (!db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.CHALLENGES)) {
        const challengesStore = db.createObjectStore(CONFIG.STORAGE.STORE_NAMES.CHALLENGES, { keyPath: 'id' });
        challengesStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        challengesStore.createIndex('isCompleted', 'isCompleted', { unique: false });
      }

      // Achievements
      if (!db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.ACHIEVEMENTS)) {
        const achievementsStore = db.createObjectStore(CONFIG.STORAGE.STORE_NAMES.ACHIEVEMENTS, { keyPath: 'id' });
        achievementsStore.createIndex('isUnlocked', 'isUnlocked', { unique: false });
      }

      // Purchase Transactions
      if (!db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.TRANSACTIONS)) {
        const transactionsStore = db.createObjectStore(CONFIG.STORAGE.STORE_NAMES.TRANSACTIONS, { keyPath: 'id' });
        transactionsStore.createIndex('createdAt', 'createdAt', { unique: false });
        transactionsStore.createIndex('status', 'status', { unique: false });
      }
    }
  }

  // Future migrations would be added here:
  // 2: {
  //   description: 'Add new feature X',
  //   upgrade: (db) => { ... }
  // }
};

/**
 * Apply migrations to database
 * @param {IDBDatabase} db - Database instance
 * @param {number} oldVersion - Previous version
 * @param {number} newVersion - Target version
 */
export function applyMigrations(db, oldVersion, newVersion) {
  // Apply each migration in sequence
  for (let version = oldVersion + 1; version <= newVersion; version++) {
    if (migrations[version]) {
      migrations[version].upgrade(db);
    }
  }
}

/**
 * Get current schema version
 * @returns {number}
 */
export function getCurrentVersion() {
  return CONFIG.STORAGE.DB_VERSION;
}

/**
 * Check if migration is needed
 * @param {number} currentVersion
 * @returns {boolean}
 */
export function needsMigration(currentVersion) {
  return currentVersion < getCurrentVersion();
}

export default {
  applyMigrations,
  getCurrentVersion,
  needsMigration,
  migrations
};
