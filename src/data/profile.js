/**
 * Player Profile Module
 * 
 * Manages player profile data including high scores, achievements, and lifetime statistics.
 */

import { StorageManager } from './storage.js';
import { getCosmeticById } from './cosmetics.js';

const DEFAULT_COSMETIC_ID = 'cat-tabby';

export class PlayerProfile {
  constructor() {
    this.storage = null;
    this.profileId = 'player-profile';
    
    // Profile data
    this.highScore = 0;
    this.totalDistance = 0;
    this.totalJumps = 0;
    this.totalObstacles = 0;
    this.totalCoins = 0;
    this.lifetimeCoins = 0;
    this.gamesPlayed = 0;
    this.currentStreak = 0;
    this.lastPlayDate = null;
    this.achievements = [];
    this.ownedCosmetics = [DEFAULT_COSMETIC_ID]; // Default skin is always owned
    this.selectedCosmetic = DEFAULT_COSMETIC_ID;
    this.createdAt = null;
    this.lastPlayedAt = null;
  }

  /**
   * Initialize profile with storage
   * @param {StorageManager} storage - Storage manager instance
   */
  async init(storage) {
    this.storage = storage;
    await this.load();
  }

  /**
   * Load profile from storage
   */
  async load() {
    try {
      const saved = await this.storage.getProfile(this.profileId);
      
      if (saved) {
        // Load existing profile
        this.highScore = saved.highScore || 0;
        this.totalDistance = saved.totalDistance || 0;
        this.totalJumps = saved.totalJumps || 0;
        this.totalObstacles = saved.totalObstacles || 0;
        this.totalCoins = saved.totalCoins || 0;
        this.lifetimeCoins = saved.lifetimeCoins || 0;
        this.gamesPlayed = saved.gamesPlayed || 0;
        this.currentStreak = saved.currentStreak || 0;
        this.lastPlayDate = saved.lastPlayDate || null;
        this.achievements = saved.achievements || [];
        this.ownedCosmetics = saved.ownedCosmetics || [DEFAULT_COSMETIC_ID];
        this.selectedCosmetic = saved.selectedCosmetic || DEFAULT_COSMETIC_ID;
        this.createdAt = saved.createdAt;
        this.lastPlayedAt = saved.lastPlayedAt;

        this.normalizeCosmetics();
        
        console.log('Profile loaded:', saved);
      } else {
        // Create new profile
        this.createdAt = new Date().toISOString();
        await this.save();
        console.log('New profile created');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  /**
   * Save profile to storage
   */
  async save() {
    try {
      const data = {
        id: this.profileId,
        highScore: this.highScore,
        totalDistance: this.totalDistance,
        totalJumps: this.totalJumps,
        totalObstacles: this.totalObstacles,
        totalCoins: this.totalCoins,
        lifetimeCoins: this.lifetimeCoins,
        gamesPlayed: this.gamesPlayed,
        currentStreak: this.currentStreak,
        lastPlayDate: this.lastPlayDate,
        achievements: this.achievements,
        ownedCosmetics: this.ownedCosmetics,
        selectedCosmetic: this.selectedCosmetic,
        createdAt: this.createdAt,
        lastPlayedAt: this.lastPlayedAt,
        updatedAt: new Date().toISOString()
      };
      
      await this.storage.saveProfile(data);
      console.log('Profile saved');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }

  /**
   * Update high score if current score is higher
   * @param {number} score - Current game score
   * @returns {boolean} True if new high score achieved
   */
  updateHighScore(score) {
    if (score > this.highScore) {
      const previousBest = this.highScore;
      this.highScore = score;
      console.log(`New high score! ${previousBest} → ${score}`);
      return true;
    }
    return false;
  }

  /**
   * Record game session stats
   * @param {Object} sessionData - Session data from GameSession
   */
  async recordSession(sessionData) {
    // Update statistics
    this.totalDistance += sessionData.distance || 0;
    this.totalJumps += sessionData.jumps || 0;
    this.totalObstacles += sessionData.obstaclesPassed || 0;
    const coinsCollected = sessionData.coinsCollected || 0;
    this.totalCoins += coinsCollected;
    this.lifetimeCoins += coinsCollected;
    this.gamesPlayed += 1;
    this.lastPlayedAt = new Date().toISOString();
    this.updateStreak(new Date());
    
    // Check for new high score
    const isNewHighScore = this.updateHighScore(sessionData.score || 0);
    
    // Save profile
    await this.save();
    
    return {
      isNewHighScore,
      previousBest: isNewHighScore ? sessionData.score - 1 : this.highScore
    };
  }

  /**
   * Unlock an achievement
   * @param {string} achievementId - Achievement identifier
   */
  async unlockAchievement(achievementId) {
    if (!this.achievements.includes(achievementId)) {
      this.achievements.push(achievementId);
      await this.save();
      console.log(`Achievement unlocked: ${achievementId}`);
      return true;
    }
    return false;
  }

  /**
   * Check if achievement is unlocked
   * @param {string} achievementId - Achievement identifier
   * @returns {boolean} True if unlocked
   */
  hasAchievement(achievementId) {
    return this.achievements.includes(achievementId);
  }

  /**
   * Get profile statistics
   * @returns {Object} Profile stats
   */
  getStats() {
    return {
      highScore: this.highScore,
      totalDistance: Math.floor(this.totalDistance),
      totalJumps: this.totalJumps,
      totalObstacles: this.totalObstacles,
      totalCoins: this.totalCoins,
      lifetimeCoins: this.lifetimeCoins,
      gamesPlayed: this.gamesPlayed,
      currentStreak: this.currentStreak,
      achievementsUnlocked: this.achievements.length,
      averageScore: this.gamesPlayed > 0 ? Math.floor(this.totalDistance / this.gamesPlayed / 10) : 0
    };
  }

  /**
   * Update streak based on local calendar day
   * @param {Date} date - Date to evaluate
   */
  updateStreak(date) {
    const todayKey = this.getDateKey(date);
    if (!this.lastPlayDate) {
      this.currentStreak = 1;
      this.lastPlayDate = todayKey;
      return this.currentStreak;
    }

    if (this.lastPlayDate === todayKey) {
      return this.currentStreak;
    }

    const yesterday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    const yesterdayKey = this.getDateKey(yesterday);

    if (this.lastPlayDate === yesterdayKey) {
      this.currentStreak += 1;
    } else {
      this.currentStreak = 1;
    }

    this.lastPlayDate = todayKey;
    return this.currentStreak;
  }

  /**
   * Add coins to balance and lifetime total
   * @param {number} amount - Coins to add
   */
  addCoins(amount) {
    if (amount <= 0) return;
    this.totalCoins += amount;
    this.lifetimeCoins += amount;
  }

  getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Purchase a cosmetic item
   * @param {string} cosmeticId - Cosmetic identifier
   * @param {number} price - Cost in coins
   * @returns {boolean} True if purchase successful
   */
  async purchaseCosmetic(cosmeticId, price) {
    // Check if already owned
    if (this.ownedCosmetics.includes(cosmeticId)) {
      console.log('Cosmetic already owned:', cosmeticId);
      return false;
    }

    // Check if enough coins
    if (this.totalCoins < price) {
      console.log('Not enough coins. Have:', this.totalCoins, 'Need:', price);
      return false;
    }

    // Deduct coins and add cosmetic
    this.totalCoins -= price;
    this.ownedCosmetics.push(cosmeticId);
    await this.save();
    
    console.log('Cosmetic purchased:', cosmeticId, 'Coins remaining:', this.totalCoins);
    return true;
  }

  /**
   * Select a cosmetic to use
   * @param {string} cosmeticId - Cosmetic identifier
   * @returns {boolean} True if selection successful
   */
  async selectCosmetic(cosmeticId) {
    // Check if owned
    if (!this.ownedCosmetics.includes(cosmeticId)) {
      console.log('Cosmetic not owned:', cosmeticId);
      return false;
    }

    this.selectedCosmetic = cosmeticId;
    await this.save();
    
    console.log('Cosmetic selected:', cosmeticId);
    return true;
  }

  /**
   * Ensure cosmetic selections remain valid after theme updates
   */
  normalizeCosmetics() {
    if (!Array.isArray(this.ownedCosmetics) || this.ownedCosmetics.length === 0) {
      this.ownedCosmetics = [DEFAULT_COSMETIC_ID];
    }

    if (!this.ownedCosmetics.includes(DEFAULT_COSMETIC_ID)) {
      this.ownedCosmetics.push(DEFAULT_COSMETIC_ID);
    }

    if (!getCosmeticById(this.selectedCosmetic)) {
      this.selectedCosmetic = DEFAULT_COSMETIC_ID;
    }
  }

  /**
   * Check if cosmetic is owned
   * @param {string} cosmeticId - Cosmetic identifier
   * @returns {boolean} True if owned
   */
  ownsCosmetic(cosmeticId) {
    return this.ownedCosmetics.includes(cosmeticId);
  }

  /**
   * Reset profile (for testing or user request)
   */
  async reset() {
    this.highScore = 0;
    this.totalDistance = 0;
    this.totalJumps = 0;
    this.totalObstacles = 0;
    this.totalCoins = 0;
    this.lifetimeCoins = 0;
    this.gamesPlayed = 0;
    this.currentStreak = 0;
    this.lastPlayDate = null;
    this.achievements = [];
    this.ownedCosmetics = [DEFAULT_COSMETIC_ID];
    this.selectedCosmetic = DEFAULT_COSMETIC_ID;
    this.createdAt = new Date().toISOString();
    this.lastPlayedAt = null;
    await this.save();
    console.log('Profile reset');
  }
}

export default PlayerProfile;
