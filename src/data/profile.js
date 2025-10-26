/**
 * Player Profile Module
 * 
 * Manages player profile data including high scores, achievements, and lifetime statistics.
 */

import { StorageManager } from './storage.js';

export class PlayerProfile {
  constructor() {
    this.storage = null;
    this.profileId = 'player-profile';
    
    // Profile data
    this.highScore = 0;
    this.totalDistance = 0;
    this.totalJumps = 0;
    this.totalObstacles = 0;
    this.gamesPlayed = 0;
    this.achievements = [];
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
        this.gamesPlayed = saved.gamesPlayed || 0;
        this.achievements = saved.achievements || [];
        this.createdAt = saved.createdAt;
        this.lastPlayedAt = saved.lastPlayedAt;
        
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
        gamesPlayed: this.gamesPlayed,
        achievements: this.achievements,
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
    this.gamesPlayed += 1;
    this.lastPlayedAt = new Date().toISOString();
    
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
      gamesPlayed: this.gamesPlayed,
      achievementsUnlocked: this.achievements.length,
      averageScore: this.gamesPlayed > 0 ? Math.floor(this.totalDistance / this.gamesPlayed / 10) : 0
    };
  }

  /**
   * Reset profile (for testing or user request)
   */
  async reset() {
    this.highScore = 0;
    this.totalDistance = 0;
    this.totalJumps = 0;
    this.totalObstacles = 0;
    this.gamesPlayed = 0;
    this.achievements = [];
    this.createdAt = new Date().toISOString();
    this.lastPlayedAt = null;
    await this.save();
    console.log('Profile reset');
  }
}

export default PlayerProfile;
