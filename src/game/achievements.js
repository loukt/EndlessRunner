/**
 * Achievements Module
 * 
 * Defines achievements and manages unlock logic.
 */

export class AchievementManager {
  constructor() {
    this.achievements = this.defineAchievements();
  }

  /**
   * Define all available achievements
   * @returns {Array} Array of achievement definitions
   */
  defineAchievements() {
    return [
      // Score milestones
      {
        id: 'score_100',
        name: 'Getting Started',
        description: 'Reach 100 points',
        icon: '🌟',
        condition: (stats) => stats.score >= 100
      },
      {
        id: 'score_500',
        name: 'Money Runner',
        description: 'Reach 500 points',
        icon: '💰',
        condition: (stats) => stats.score >= 500
      },
      {
        id: 'score_1000',
        name: 'Business Expert',
        description: 'Reach 1000 points',
        icon: '💼',
        condition: (stats) => stats.score >= 1000
      },
      {
        id: 'score_2000',
        name: 'Executive',
        description: 'Reach 2000 points',
        icon: '👔',
        condition: (stats) => stats.score >= 2000
      },
      {
        id: 'score_5000',
        name: 'CEO',
        description: 'Reach 5000 points',
        icon: '🏆',
        condition: (stats) => stats.score >= 5000
      },
      
      // Obstacle milestones
      {
        id: 'obstacles_50',
        name: 'Obstacle Dodger',
        description: 'Pass 50 obstacles',
        icon: '🚧',
        condition: (stats) => stats.obstaclesPassed >= 50
      },
      {
        id: 'obstacles_100',
        name: 'Obstacle Master',
        description: 'Pass 100 obstacles',
        icon: '🎯',
        condition: (stats) => stats.obstaclesPassed >= 100
      },
      {
        id: 'obstacles_500',
        name: 'Unstoppable',
        description: 'Pass 500 obstacles',
        icon: '⚡',
        condition: (stats) => stats.obstaclesPassed >= 500
      },
      
      // Jump milestones
      {
        id: 'jumps_100',
        name: 'Bouncy',
        description: 'Jump 100 times',
        icon: '🦘',
        condition: (stats) => stats.jumps >= 100
      },
      {
        id: 'jumps_500',
        name: 'Jump Master',
        description: 'Jump 500 times',
        icon: '🎪',
        condition: (stats) => stats.jumps >= 500
      },
      
      // Games played milestones
      {
        id: 'games_10',
        name: 'Persistent',
        description: 'Play 10 games',
        icon: '🎮',
        condition: (stats) => stats.gamesPlayed >= 10
      },
      {
        id: 'games_50',
        name: 'Dedicated',
        description: 'Play 50 games',
        icon: '🕹️',
        condition: (stats) => stats.gamesPlayed >= 50
      },
      {
        id: 'games_100',
        name: 'Addicted',
        description: 'Play 100 games',
        icon: '🎰',
        condition: (stats) => stats.gamesPlayed >= 100
      }
    ];
  }

  /**
   * Check which achievements were earned this session
   * @param {Object} sessionStats - Current session statistics
   * @param {Object} profileStats - Lifetime profile statistics
   * @param {Array} currentAchievements - Already unlocked achievement IDs
   * @returns {Array} Newly unlocked achievement IDs
   */
  checkAchievements(sessionStats, profileStats, currentAchievements) {
    const newlyUnlocked = [];
    
    // Combine session and profile stats for checking
    const stats = {
      score: sessionStats.score || 0,
      obstaclesPassed: profileStats.totalObstacles || 0,
      jumps: profileStats.totalJumps || 0,
      gamesPlayed: profileStats.gamesPlayed || 0
    };
    
    for (const achievement of this.achievements) {
      // Skip if already unlocked
      if (currentAchievements.includes(achievement.id)) {
        continue;
      }
      
      // Check if condition is met
      if (achievement.condition(stats)) {
        newlyUnlocked.push(achievement.id);
      }
    }
    
    return newlyUnlocked;
  }

  /**
   * Get achievement details by ID
   * @param {string} achievementId - Achievement identifier
   * @returns {Object|null} Achievement object or null
   */
  getAchievement(achievementId) {
    return this.achievements.find(a => a.id === achievementId) || null;
  }

  /**
   * Get all unlocked achievements
   * @param {Array} unlockedIds - Array of unlocked achievement IDs
   * @returns {Array} Array of achievement objects
   */
  getUnlockedAchievements(unlockedIds) {
    return this.achievements.filter(a => unlockedIds.includes(a.id));
  }

  /**
   * Get progress towards next achievements
   * @param {Object} stats - Current statistics
   * @param {Array} unlockedIds - Already unlocked achievement IDs
   * @returns {Array} Progress info for next achievements
   */
  getProgress(stats, unlockedIds) {
    const progress = [];
    
    for (const achievement of this.achievements) {
      if (unlockedIds.includes(achievement.id)) {
        continue;
      }
      
      // Calculate progress percentage (simplified)
      let percent = 0;
      if (achievement.id.startsWith('score_')) {
        const target = parseInt(achievement.id.split('_')[1]);
        percent = Math.min(100, (stats.score / target) * 100);
      } else if (achievement.id.startsWith('obstacles_')) {
        const target = parseInt(achievement.id.split('_')[1]);
        percent = Math.min(100, (stats.obstaclesPassed / target) * 100);
      } else if (achievement.id.startsWith('jumps_')) {
        const target = parseInt(achievement.id.split('_')[1]);
        percent = Math.min(100, (stats.jumps / target) * 100);
      } else if (achievement.id.startsWith('games_')) {
        const target = parseInt(achievement.id.split('_')[1]);
        percent = Math.min(100, (stats.gamesPlayed / target) * 100);
      }
      
      if (percent > 0 && percent < 100) {
        progress.push({
          achievement,
          percent: Math.floor(percent)
        });
      }
    }
    
    // Sort by progress descending
    return progress.sort((a, b) => b.percent - a.percent);
  }
}

export default AchievementManager;
