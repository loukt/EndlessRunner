/**
 * Storage Module
 * 
 * Data persistence layer with IndexedDB (primary) and localStorage (fallback).
 * Provides abstraction layer for all game data storage operations.
 */

import { CONFIG } from '../config.js';

export class StorageManager {
  constructor() {
    this.db = null;
    this.useIndexedDB = true;
    this.useLocalStorage = false;
    this.initialized = false;
  }

  /**
   * Initialize storage (IndexedDB with localStorage fallback)
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) {
      console.warn('StorageManager already initialized');
      return;
    }

    try {
      // Try IndexedDB first
      await this.initIndexedDB();
      this.useIndexedDB = true;
      this.useLocalStorage = false;
      this.initialized = true;
    } catch (error) {
      console.warn('IndexedDB not available, falling back to localStorage:', error);
      this.useIndexedDB = false;
      this.useLocalStorage = true;
      this.initialized = true;
    }
  }

  /**
   * Initialize IndexedDB
   * @returns {Promise<void>}
   */
  initIndexedDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB || typeof window.indexedDB.open !== 'function') {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      // In some test environments, IndexedDB exists but never resolves.
      // Use a short timeout to fall back to localStorage rather than hanging the suite.
      const timeoutMs = 500;
      let settled = false;
      const timeoutId = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error('IndexedDB init timeout'));
      }, timeoutMs);

      const settleOnce = (fn) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        fn();
      };

      let request;
      try {
        request = window.indexedDB.open(CONFIG.STORAGE.DB_NAME, CONFIG.STORAGE.DB_VERSION);
      } catch (error) {
        settleOnce(() => reject(error));
        return;
      }

      request.onerror = () => settleOnce(() => reject(request.error));
      request.onsuccess = () => {
        this.db = request.result;
        settleOnce(() => resolve());
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.PROFILE)) {
          db.createObjectStore(CONFIG.STORAGE.STORE_NAMES.PROFILE, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.COSMETICS)) {
          const cosmeticsStore = db.createObjectStore(CONFIG.STORAGE.STORE_NAMES.COSMETICS, { keyPath: 'id' });
          cosmeticsStore.createIndex('category', 'category', { unique: false });
          cosmeticsStore.createIndex('isUnlocked', 'isUnlocked', { unique: false });
        }

        if (!db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.CHALLENGES)) {
          const challengesStore = db.createObjectStore(CONFIG.STORAGE.STORE_NAMES.CHALLENGES, { keyPath: 'id' });
          challengesStore.createIndex('expiresAt', 'expiresAt', { unique: false });
          challengesStore.createIndex('isCompleted', 'isCompleted', { unique: false });
        }

        if (!db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.ACHIEVEMENTS)) {
          const achievementsStore = db.createObjectStore(CONFIG.STORAGE.STORE_NAMES.ACHIEVEMENTS, { keyPath: 'id' });
          achievementsStore.createIndex('isUnlocked', 'isUnlocked', { unique: false });
        }

        if (!db.objectStoreNames.contains(CONFIG.STORAGE.STORE_NAMES.TRANSACTIONS)) {
          const transactionsStore = db.createObjectStore(CONFIG.STORAGE.STORE_NAMES.TRANSACTIONS, { keyPath: 'id' });
          transactionsStore.createIndex('createdAt', 'createdAt', { unique: false });
          transactionsStore.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  /**
   * Save data to storage
   * @param {string} storeName - Name of the object store
   * @param {Object} data - Data to save (must have 'id' property)
   * @returns {Promise<void>}
   */
  async save(storeName, data) {
    if (!this.initialized) {
      throw new Error('StorageManager not initialized');
    }

    this.validateStoreName(storeName);
    if (!data || typeof data.id === 'undefined' || data.id === null || data.id === '') {
      throw new Error('Data must have an id');
    }

    if (this.useIndexedDB) {
      return this.saveIndexedDB(storeName, data);
    } else {
      return this.saveLocalStorage(storeName, data);
    }
  }

  /**
   * Save to IndexedDB
   * @param {string} storeName
   * @param {Object} data
   * @returns {Promise<void>}
   */
  saveIndexedDB(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save to localStorage
   * @param {string} storeName
   * @param {Object} data
   * @returns {Promise<void>}
   */
  async saveLocalStorage(storeName, data) {
    try {
      const key = `${CONFIG.STORAGE.DB_NAME}_${storeName}_${data.id}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('localStorage save failed:', error);
      throw error;
    }
  }

  /**
   * Load data from storage
   * @param {string} storeName - Name of the object store
   * @param {string} id - ID of the data to load
   * @returns {Promise<Object|null>}
   */
  async load(storeName, id) {
    if (!this.initialized) {
      throw new Error('StorageManager not initialized');
    }

    this.validateStoreName(storeName);

    if (this.useIndexedDB) {
      return this.loadIndexedDB(storeName, id);
    } else {
      return this.loadLocalStorage(storeName, id);
    }
  }

  /**
   * Load from IndexedDB
   * @param {string} storeName
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  loadIndexedDB(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load from localStorage
   * @param {string} storeName
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async loadLocalStorage(storeName, id) {
    try {
      const key = `${CONFIG.STORAGE.DB_NAME}_${storeName}_${id}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('localStorage load failed:', error);
      return null;
    }
  }

  /**
   * Load all data from a store
   * @param {string} storeName
   * @returns {Promise<Array>}
   */
  async loadAll(storeName) {
    if (!this.initialized) {
      throw new Error('StorageManager not initialized');
    }

    this.validateStoreName(storeName);

    if (this.useIndexedDB) {
      return this.loadAllIndexedDB(storeName);
    } else {
      return this.loadAllLocalStorage(storeName);
    }
  }

  /**
   * Load all from IndexedDB
   * @param {string} storeName
   * @returns {Promise<Array>}
   */
  loadAllIndexedDB(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load all from localStorage
   * @param {string} storeName
   * @returns {Promise<Array>}
   */
  async loadAllLocalStorage(storeName) {
    try {
      const prefix = `${CONFIG.STORAGE.DB_NAME}_${storeName}_`;
      const results = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const data = localStorage.getItem(key);
          if (data) {
            results.push(JSON.parse(data));
          }
        }
      }
      
      return results;
    } catch (error) {
      console.error('localStorage loadAll failed:', error);
      return [];
    }
  }

  /**
   * Delete data from storage
   * @param {string} storeName
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(storeName, id) {
    if (!this.initialized) {
      throw new Error('StorageManager not initialized');
    }

    this.validateStoreName(storeName);

    if (this.useIndexedDB) {
      return this.deleteIndexedDB(storeName, id);
    } else {
      return this.deleteLocalStorage(storeName, id);
    }
  }

  /**
   * Delete from IndexedDB
   * @param {string} storeName
   * @param {string} id
   * @returns {Promise<void>}
   */
  deleteIndexedDB(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete from localStorage
   * @param {string} storeName
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteLocalStorage(storeName, id) {
    try {
      const key = `${CONFIG.STORAGE.DB_NAME}_${storeName}_${id}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage delete failed:', error);
      throw error;
    }
  }

  /**
   * Clear all data from a store
   * @param {string} storeName
   * @returns {Promise<void>}
   */
  async clear(storeName) {
    if (!this.initialized) {
      throw new Error('StorageManager not initialized');
    }

    this.validateStoreName(storeName);

    if (this.useIndexedDB) {
      return this.clearIndexedDB(storeName);
    } else {
      return this.clearLocalStorage(storeName);
    }
  }

  /**
   * Clear IndexedDB store
   * @param {string} storeName
   * @returns {Promise<void>}
   */
  clearIndexedDB(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear localStorage for a store
   * @param {string} storeName
   * @returns {Promise<void>}
   */
  async clearLocalStorage(storeName) {
    try {
      const prefix = `${CONFIG.STORAGE.DB_NAME}_${storeName}_`;
      const keysToDelete = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('localStorage clear failed:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.initialized = false;
  }

  validateStoreName(storeName) {
    const valid = Object.values(CONFIG.STORAGE.STORE_NAMES).includes(storeName);
    if (!valid) {
      throw new Error(`Invalid store name: ${storeName}`);
    }
  }
}

export default StorageManager;
