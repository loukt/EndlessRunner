/**
 * Unit tests for StorageManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageManager } from '../../../src/data/storage.js';
import { CONFIG } from '../../../src/config.js';

describe('StorageManager', () => {
  let storage;

  beforeEach(async () => {
    storage = new StorageManager();
    await storage.init();
  });

  afterEach(async () => {
    // Clean up all stores
    for (const storeName of Object.values(CONFIG.STORAGE.STORE_NAMES)) {
      await storage.clear(storeName);
    }
    storage.destroy();
  });

  describe('init', () => {
    it('should initialize storage manager', async () => {
      expect(storage.useIndexedDB).toBeDefined();
      expect(storage.db || storage.useLocalStorage).toBeTruthy();
    });

    it('should create all required object stores', async () => {
      if (storage.useIndexedDB) {
        expect(storage.db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.PROFILE)).toBe(true);
        expect(storage.db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.COSMETICS)).toBe(true);
        expect(storage.db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.CHALLENGES)).toBe(true);
        expect(storage.db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.ACHIEVEMENTS)).toBe(true);
        expect(storage.db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.TRANSACTIONS)).toBe(true);
      }
    });

    it('should fallback to localStorage if IndexedDB unavailable', async () => {
      // Mock IndexedDB as unavailable
      const originalIndexedDB = window.indexedDB;
      delete window.indexedDB;

      const fallbackStorage = new StorageManager();
      await fallbackStorage.init();

      expect(fallbackStorage.useIndexedDB).toBe(false);

      // Restore
      window.indexedDB = originalIndexedDB;
      fallbackStorage.destroy();
    });
  });

  describe('save and load', () => {
    it('should save and load player profile', async () => {
      const profile = {
        id: 'player',
        highScore: 1000,
        totalCoins: 500,
        gamesPlayed: 10
      };

      await storage.save(CONFIG.STORAGE.STORE_NAMES.PROFILE, profile);
      const loaded = await storage.load(CONFIG.STORAGE.STORE_NAMES.PROFILE, 'player');

      expect(loaded).toEqual(profile);
    });

    it('should save and load cosmetic items', async () => {
      const cosmetic = {
        id: 'hat_001',
        category: 'hat',
        name: 'Cool Hat',
        price: 100,
        isUnlocked: true
      };

      await storage.save(CONFIG.STORAGE.STORE_NAMES.COSMETICS, cosmetic);
      const loaded = await storage.load(CONFIG.STORAGE.STORE_NAMES.COSMETICS, 'hat_001');

      expect(loaded).toEqual(cosmetic);
    });

    it('should save and load challenges', async () => {
      const challenge = {
        id: 'challenge_001',
        title: 'Jump 50 times',
        type: 'jump_count',
        target: 50,
        progress: 25,
        reward: 100,
        expiresAt: Date.now() + 86400000,
        isCompleted: false
      };

      await storage.save(CONFIG.STORAGE.STORE_NAMES.CHALLENGES, challenge);
      const loaded = await storage.load(CONFIG.STORAGE.STORE_NAMES.CHALLENGES, 'challenge_001');

      expect(loaded).toEqual(challenge);
    });

    it('should save and load achievements', async () => {
      const achievement = {
        id: 'achievement_001',
        title: 'First Jump',
        description: 'Complete your first jump',
        reward: 50,
        isUnlocked: true,
        unlockedAt: Date.now()
      };

      await storage.save(CONFIG.STORAGE.STORE_NAMES.ACHIEVEMENTS, achievement);
      const loaded = await storage.load(CONFIG.STORAGE.STORE_NAMES.ACHIEVEMENTS, 'achievement_001');

      expect(loaded).toEqual(achievement);
    });

    it('should save and load transactions', async () => {
      const transaction = {
        id: 'tx_001',
        productId: 'coins_500',
        amount: 500,
        price: 0.99,
        currency: 'USD',
        status: 'completed',
        createdAt: Date.now()
      };

      await storage.save(CONFIG.STORAGE.STORE_NAMES.TRANSACTIONS, transaction);
      const loaded = await storage.load(CONFIG.STORAGE.STORE_NAMES.TRANSACTIONS, 'tx_001');

      expect(loaded).toEqual(transaction);
    });

    it('should return null for non-existent items', async () => {
      const loaded = await storage.load(CONFIG.STORAGE.STORE_NAMES.PROFILE, 'nonexistent');

      expect(loaded).toBeNull();
    });

    it('should update existing items', async () => {
      const profile = {
        id: 'player',
        highScore: 1000
      };

      await storage.save(CONFIG.STORAGE.STORE_NAMES.PROFILE, profile);

      profile.highScore = 2000;
      await storage.save(CONFIG.STORAGE.STORE_NAMES.PROFILE, profile);

      const loaded = await storage.load(CONFIG.STORAGE.STORE_NAMES.PROFILE, 'player');
      expect(loaded.highScore).toBe(2000);
    });
  });

  describe('loadAll', () => {
    it('should load all items from store', async () => {
      const cosmetics = [
        { id: 'hat_001', category: 'hat', isUnlocked: true },
        { id: 'skin_001', category: 'skin', isUnlocked: false },
        { id: 'trail_001', category: 'trail', isUnlocked: true }
      ];

      for (const cosmetic of cosmetics) {
        await storage.save(CONFIG.STORAGE.STORE_NAMES.COSMETICS, cosmetic);
      }

      const loaded = await storage.loadAll(CONFIG.STORAGE.STORE_NAMES.COSMETICS);

      expect(loaded).toHaveLength(3);
      expect(loaded.map(c => c.id)).toEqual(['hat_001', 'skin_001', 'trail_001']);
    });

    it('should return empty array for empty store', async () => {
      const loaded = await storage.loadAll(CONFIG.STORAGE.STORE_NAMES.CHALLENGES);

      expect(loaded).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete item from store', async () => {
      const challenge = {
        id: 'challenge_001',
        title: 'Test Challenge'
      };

      await storage.save(CONFIG.STORAGE.STORE_NAMES.CHALLENGES, challenge);
      await storage.delete(CONFIG.STORAGE.STORE_NAMES.CHALLENGES, 'challenge_001');

      const loaded = await storage.load(CONFIG.STORAGE.STORE_NAMES.CHALLENGES, 'challenge_001');
      expect(loaded).toBeNull();
    });

    it('should not throw error when deleting non-existent item', async () => {
      await expect(
        storage.delete(CONFIG.STORAGE.STORE_NAMES.CHALLENGES, 'nonexistent')
      ).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all items from store', async () => {
      const cosmetics = [
        { id: 'hat_001', category: 'hat' },
        { id: 'skin_001', category: 'skin' },
        { id: 'trail_001', category: 'trail' }
      ];

      for (const cosmetic of cosmetics) {
        await storage.save(CONFIG.STORAGE.STORE_NAMES.COSMETICS, cosmetic);
      }

      await storage.clear(CONFIG.STORAGE.STORE_NAMES.COSMETICS);

      const loaded = await storage.loadAll(CONFIG.STORAGE.STORE_NAMES.COSMETICS);
      expect(loaded).toEqual([]);
    });

    it('should not affect other stores when clearing one', async () => {
      await storage.save(CONFIG.STORAGE.STORE_NAMES.PROFILE, { id: 'player', highScore: 1000 });
      await storage.save(CONFIG.STORAGE.STORE_NAMES.COSMETICS, { id: 'hat_001', category: 'hat' });

      await storage.clear(CONFIG.STORAGE.STORE_NAMES.COSMETICS);

      const profile = await storage.load(CONFIG.STORAGE.STORE_NAMES.PROFILE, 'player');
      expect(profile).not.toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle invalid store names', async () => {
      await expect(
        storage.save('invalid_store', { id: 'test' })
      ).rejects.toThrow();
    });

    it('should handle items without id', async () => {
      await expect(
        storage.save(CONFIG.STORAGE.STORE_NAMES.PROFILE, { highScore: 1000 })
      ).rejects.toThrow();
    });
  });

  describe('localStorage fallback', () => {
    it('should use localStorage when IndexedDB fails', async () => {
      // Mock IndexedDB failure
      const originalIndexedDB = window.indexedDB;
      window.indexedDB = {
        open: () => {
          throw new Error('IndexedDB unavailable');
        }
      };

      const fallbackStorage = new StorageManager();
      await fallbackStorage.init();

      const profile = {
        id: 'player',
        highScore: 1000
      };

      await fallbackStorage.save(CONFIG.STORAGE.STORE_NAMES.PROFILE, profile);
      const loaded = await fallbackStorage.load(CONFIG.STORAGE.STORE_NAMES.PROFILE, 'player');

      expect(loaded).toEqual(profile);
      expect(fallbackStorage.useIndexedDB).toBe(false);

      // Restore and cleanup
      window.indexedDB = originalIndexedDB;
      fallbackStorage.destroy();
    });
  });

  describe('destroy', () => {
    it('should close database connection', () => {
      const closeSpy = storage.db ? vi.spyOn(storage.db, 'close') : null;

      storage.destroy();

      if (closeSpy) {
        expect(closeSpy).toHaveBeenCalled();
      }
      expect(storage.db).toBeNull();
    });

    it('should handle destroy when not initialized', () => {
      const uninitializedStorage = new StorageManager();
      expect(() => uninitializedStorage.destroy()).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete game session data', async () => {
      // Create player profile
      const profile = {
        id: 'player',
        highScore: 0,
        totalCoins: 0,
        gamesPlayed: 0
      };
      await storage.save(CONFIG.STORAGE.STORE_NAMES.PROFILE, profile);

      // Add some cosmetics
      await storage.save(CONFIG.STORAGE.STORE_NAMES.COSMETICS, {
        id: 'hat_001',
        category: 'hat',
        isUnlocked: true
      });

      // Add active challenges
      await storage.save(CONFIG.STORAGE.STORE_NAMES.CHALLENGES, {
        id: 'challenge_001',
        title: 'Jump 50 times',
        progress: 0,
        isCompleted: false
      });

      // Load all data
      const loadedProfile = await storage.load(CONFIG.STORAGE.STORE_NAMES.PROFILE, 'player');
      const loadedCosmetics = await storage.loadAll(CONFIG.STORAGE.STORE_NAMES.COSMETICS);
      const loadedChallenges = await storage.loadAll(CONFIG.STORAGE.STORE_NAMES.CHALLENGES);

      expect(loadedProfile).not.toBeNull();
      expect(loadedCosmetics).toHaveLength(1);
      expect(loadedChallenges).toHaveLength(1);
    });

    it('should handle rapid save operations', async () => {
      const profile = {
        id: 'player',
        highScore: 0
      };

      // Rapid updates
      for (let i = 1; i <= 10; i++) {
        profile.highScore = i * 100;
        await storage.save(CONFIG.STORAGE.STORE_NAMES.PROFILE, profile);
      }

      const loaded = await storage.load(CONFIG.STORAGE.STORE_NAMES.PROFILE, 'player');
      expect(loaded.highScore).toBe(1000);
    });
  });
});
