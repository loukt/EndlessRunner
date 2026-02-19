/**
 * Main Application Entry Point
 * 
 * Initializes all game systems and starts the game loop.
 * This is the entry point that ties all engine modules together.
 */

import { CONFIG } from './config.js';
import { Renderer } from './engine/renderer.js';
import { InputManager } from './engine/input.js';
import { AudioManager } from './engine/audio.js';
import { StorageManager } from './data/storage.js';
import * as Physics from './engine/physics.js';
import { Player } from './game/player.js';
import { ObstacleManager } from './game/obstacle.js';
import { Scoring } from './game/scoring.js';
import { HUD } from './ui/hud.js';
import { Menu } from './ui/menu.js';
import { GameSession } from './data/session.js';
import { ParticleSystem } from './game/particles.js';
import { CameraEffects } from './game/camera.js';
import { DifficultyManager } from './game/difficulty.js';
import { PlayerProfile } from './data/profile.js';
import { AchievementManager } from './game/achievements.js';
import { Celebration } from './ui/celebration.js';
import { StatisticsScreen } from './ui/statistics.js';
import { SettingsScreen } from './ui/settings.js';
import { CoinManager } from './game/coin.js';
import { Shop } from './ui/shop.js';
import { DailyChallengeManager } from './data/challenges.js';
import { ChallengeTracker } from './game/challenge-tracker.js';
import { ChallengesUI } from './ui/challenges.js';
import { BackgroundManager } from './game/background.js';

/**
 * Main application class
 */
class Game {
  constructor() {
    this.renderer = null;
    this.input = null;
    this.audio = null;
    this.storage = null;
    this.player = null;
    this.obstacleManager = null;
    this.difficultyManager = null;
    this.scoring = null;
    this.hud = null;
    this.menu = null;
    this.session = null;
    this.particles = null;
    this.camera = null;
    this.profile = null;
    this.achievementManager = null;
    this.celebration = null;
    this.statisticsScreen = null;
    this.settingsScreen = null;
    this.coinManager = null;
    this.shop = null;
    this.background = null;
    this.challengeManager = null;
    this.challengeTracker = null;
    this.challengeUI = null;
    this.activeChallenge = null;
    this.lastScoreForChallenge = 0;
    this.coinsCollectedThisRun = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.gameState = 'MENU'; // MENU, READY, PLAYING, GAME_OVER, PAUSED
    this.lastTime = 0;
    this.scrollSpeed = CONFIG.PLAYER.RUN_SPEED;
    this.handleKeyDown = null;
  }

  /**
   * Initialize all game systems
   */
  async init() {
    try {
      // Get canvas container
      const container = document.getElementById('game-container');
      if (!container) {
        throw new Error('Game container not found');
      }

      // Initialize renderer
      this.renderer = new Renderer();
      await this.renderer.init(container);

      // Initialize input manager
      this.input = new InputManager();
      this.input.init(this.renderer.getRenderer().view);

      // Initialize audio manager
      this.audio = new AudioManager();
      this.audio.init();

      // Initialize storage
      this.storage = new StorageManager();
      await this.storage.init();

      // Load or create player profile
      await this.loadProfile();

      // Create game objects
      await this.createGameObjects();

      // Initialize daily challenges
      await this.initChallenges();

      // Setup input handlers
      this.setupInput();

      // Setup visibility change handler for pause/resume
      this.setupVisibilityHandler();

      // Remove loading indicator
      this.removeLoadingIndicator();

      // Show start menu
      this.menu.showStartScreen();
      this.gameState = 'MENU';

      // Start game loop
      this.start();
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showError(error.message);
    }
  }

  /**
   * Load or create player profile
   */
  async loadProfile() {
    try {
      // Initialize player profile with new ProfilePlayer class
      this.profile = new PlayerProfile();
      await this.profile.init(this.storage);
      
      // Initialize achievement manager
      this.achievementManager = new AchievementManager();
      
      // Apply selected cosmetic if available
      if (this.profile.selectedCosmetic && this.player) {
        const { getCosmeticById } = await import('./data/cosmetics.js');
        const cosmetic = getCosmeticById(this.profile.selectedCosmetic);
        if (cosmetic) {
          this.applyCosmetic(cosmetic);
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }

  /**
   * Initialize daily challenge state
   */
  async initChallenges() {
    this.challengeManager = new DailyChallengeManager(this.storage);
    this.activeChallenge = await this.challengeManager.getOrCreateChallenge(
      this.profile.currentStreak,
      new Date()
    );
    this.challengeTracker = new ChallengeTracker(this.activeChallenge);
    this.lastScoreForChallenge = 0;

    if (this.challengeUI) {
      this.challengeUI.show(this.activeChallenge, this.profile.currentStreak);
    }
  }

  /**
   * Create game objects
   */
  async createGameObjects() {
    const stage = this.renderer.getStage();
    const pixiRenderer = this.renderer.app.renderer;

    this.background = new BackgroundManager();
    this.background.create(stage);

    // Create difficulty manager
    this.difficultyManager = new DifficultyManager();

    // Create player
    this.player = new Player();
    await this.player.create(stage, pixiRenderer);

    // Create obstacle manager with difficulty manager
    this.obstacleManager = new ObstacleManager(this.difficultyManager);
    await this.obstacleManager.create(stage, pixiRenderer);

    // Create coin manager
    this.coinManager = new CoinManager();
    this.coinManager.create(stage, pixiRenderer);

    if (this.background) {
      this.background.attachOverlay(stage);
    }

    // Create scoring
    this.scoring = new Scoring();

    // Create particle system (before player so particles are behind UI)
    this.particles = new ParticleSystem();
    this.particles.create(stage);

    // Create camera effects
    this.camera = new CameraEffects();

    // Create HUD (should be on top)
    this.hud = new HUD();
    this.hud.create(stage);
    this.hud.onPauseClick = () => {
      if (this.gameState === 'PLAYING') {
        this.pause();
      } else if (this.gameState === 'PAUSED') {
        this.resume();
      }
    };

    // Create menu system (should be on top of HUD)
    this.menu = new Menu();
    this.menu.create(stage);

    // Create celebration system (on top of everything)
    this.celebration = new Celebration();
    this.celebration.create(stage);

    // Create statistics screen (on top of everything)
    this.statisticsScreen = new StatisticsScreen();
    this.statisticsScreen.create(stage);

    // Create settings screen (on top of everything)
    this.settingsScreen = new SettingsScreen();
    this.settingsScreen.create(stage);
    if (this.audio) {
      const settings = this.settingsScreen.getSettings();
      this.audio.soundEnabled = settings.soundEnabled;
      this.audio.musicEnabled = settings.musicEnabled;
    }

    // Create shop screen (on top of everything)
    this.shop = new Shop();
    this.shop.create(stage);

    // Create challenges UI (on top of everything)
    this.challengeUI = new ChallengesUI();
    this.challengeUI.create(stage);

    // Wire up menu callbacks
    this.menu.onStatisticsClick = () => {
      if (this.profile && this.achievementManager) {
        this.menu.hide();
        const stats = this.profile.getStats();
        this.statisticsScreen.show(stats, this.achievementManager, this.profile.achievements);
      }
    };

    this.menu.onSettingsClick = () => {
      this.menu.hide();
      this.settingsScreen.show();
    };

    this.menu.onShopClick = () => {
      if (this.profile) {
        this.menu.hide();
        this.shop.show(this.profile);
      }
    };

    this.menu.onPauseResume = () => {
      this.resume();
    };

    this.menu.onPauseSettings = () => {
      this.menu.hidePause();
      this.settingsScreen.show();
    };

    this.menu.onPauseShop = () => {
      this.menu.hidePause();
      if (this.profile) {
        this.shop.show(this.profile);
      }
    };

    this.menu.onPauseQuit = () => {
      this.restartGame();
      this.startGame();
    };

    // Wire up settings callback to audio
    this.settingsScreen.onSettingChanged = (key, value) => {
      if (key === 'soundEnabled' && this.audio) {
        this.audio.soundEnabled = value;
      } else if (key === 'musicEnabled' && this.audio) {
        this.audio.musicEnabled = value;
      }
      // reducedMotion would be used by particle system and camera shake
    };

    this.settingsScreen.onClose = () => {
      if (this.gameState === 'PAUSED') {
        this.menu.showPause();
      } else if (this.gameState === 'MENU') {
        this.menu.showStartScreen();
      }
    };

    // Wire up shop callbacks
    this.shop.onPurchase = (_cosmetic) => {
      // Play purchase sound if available
      if (this.audio) {
        this.audio.playSound('coin');
      }
    };

    this.shop.onSelect = (cosmetic) => {
      // Apply cosmetic to player
      this.applyCosmetic(cosmetic);
    };

    this.shop.onClose = () => {
      if (this.gameState === 'PAUSED') {
        this.menu.showPause();
      } else if (this.gameState === 'MENU') {
        this.menu.showStartScreen();
      }
    };

    this.statisticsScreen.onClose = () => {
      if (this.gameState === 'MENU') {
        this.menu.showStartScreen();
      }
    };

    // Create session tracker
    this.session = new GameSession();
  }

  /**
   * Setup input handlers
   */
  setupInput() {
    // Handle press (start of tap/click)
    this.input.on('press', () => {
      if (this.audio) {
        this.audio.resume();
      }

      const isOverlayOpen =
        (this.settingsScreen && this.settingsScreen.isVisible) ||
        (this.shop && this.shop.isVisible) ||
        (this.statisticsScreen && this.statisticsScreen.isVisible);

      if ((this.gameState === 'MENU' || this.gameState === 'READY') && !isOverlayOpen) {
        this.startGame();
      } else if (this.gameState === 'PLAYING') {
        this.player.jump();
        this.session.incrementJumps();
        if (this.challengeTracker) {
          const completed = this.challengeTracker.recordJump(1);
          if (completed) {
            this.handleChallengeCompletion();
          }
        }
        // Create jump sparkles
        const playerBounds = this.player.getBounds();
        this.particles.createJumpSparkles(
          playerBounds.x + playerBounds.width / 2,
          playerBounds.y + playerBounds.height
        );
        // Play jump sound (if loaded)
        if (this.audio && this.audio.initialized) {
          this.audio.playSound('jump');
        }
      } else if (this.gameState === 'GAME_OVER') {
        this.restartGame();
      }
    });

    // Handle release (end of tap/click) for variable jump height
    this.input.on('release', () => {
      if (this.gameState === 'PLAYING') {
        this.player.cancelJump();
      }
    });

    this.handleKeyDown = (event) => {
      if (this.audio) {
        this.audio.resume();
      }
      const key = event.key.toLowerCase();
      if (key === 'p' || key === 'escape') {
        event.preventDefault();
        if (this.gameState === 'PLAYING') {
          this.pause();
        } else if (this.gameState === 'PAUSED') {
          this.resume();
        }
      }
    };
    window.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastTime = performance.now();

    // Use PixiJS ticker for game loop
    const ticker = this.renderer.getTicker();
    ticker.add(this.update, this);
  }

  /**
   * Start the game
   */
  startGame() {
    this.gameState = 'PLAYING';
    this.session.start();
    this.scoring.start();
    this.lastScoreForChallenge = 0;
    this.coinsCollectedThisRun = 0;
    this.menu.hide();
    this.hud.showGameStarted();
    this.hud.updateCoins(0);
    if (this.challengeUI) {
      this.challengeUI.hide();
    }
  }

  /**
   * Restart the game
   */
  restartGame() {
    this.player.reset();
    this.obstacleManager.reset();
    this.coinManager.reset();
    this.lastScoreForChallenge = 0;
    this.coinsCollectedThisRun = 0;
    this.difficultyManager.reset();
    if (this.challengeUI) {
      this.challengeUI.hide();
    }
    this.scoring.reset();
    this.hud.reset();
    this.session.reset();
    this.particles.clear();
    this.camera.reset();
    this.scrollSpeed = CONFIG.PLAYER.RUN_SPEED;
    this.menu.showStartScreen();
    this.gameState = 'MENU';
    this.refreshChallenge();
  }

  /**
   * Game over
   */
  async gameOver(collisionEffect = null) {
    this.gameState = 'GAME_OVER';
    this.scoring.stop();
    this.session.end();
    this.player.die(collisionEffect);
    
    // Create explosion particles at collision point
    const playerBounds = this.player.getBounds();
    this.particles.createExplosion(
      playerBounds.x + playerBounds.width / 2,
      playerBounds.y + playerBounds.height / 2,
      this.getCollisionColor(collisionEffect)
    );
    
    // Camera shake on collision
    this.camera.shake(15, 0.4);
    
    // Play collision sound (if loaded)
    if (this.audio && this.audio.initialized) {
      this.audio.playSound('collision');
    }
    
    const finalScore = this.scoring.getScore();
    
    // Update session score and coins
    this.session.setScore(finalScore);
    const sessionData = this.session.getData();
    sessionData.coinsCollected = this.coinsCollectedThisRun;
    
    // Record session in profile
    const result = await this.profile.recordSession(sessionData);

    // Streak milestone notification
    if (this.challengeUI && [3, 7, 30].includes(this.profile.currentStreak)) {
      this.challengeUI.showStreakMilestone(this.profile.currentStreak);
    }
    
    // Check for high score celebration
    if (result.isNewHighScore) {
      // Trigger celebration after a short delay
      setTimeout(() => {
        this.celebration.playNewHighScore(finalScore, result.previousBest);
      }, 500);
    }
    
    // Check for achievements
    const profileStats = this.profile.getStats();
    const newAchievements = this.achievementManager.checkAchievements(
      sessionData,
      profileStats,
      this.profile.achievements
    );

    const unlockedAchievements = [];
    
    // Unlock new achievements
    for (const achievementId of newAchievements) {
      await this.profile.unlockAchievement(achievementId);
      const achievement = this.achievementManager.getAchievement(achievementId);

      if (achievement) {
        unlockedAchievements.push(achievement);
      }
      
      // Show achievement celebration after high score celebration
      setTimeout(() => {
        this.celebration.playAchievementUnlock(achievement);
      }, result.isNewHighScore ? 3500 : 500);
    }

    // Persist challenge progress and refresh daily challenge
    if (this.challengeManager && this.activeChallenge) {
      await this.challengeManager.saveChallenge(this.activeChallenge);
    }
    await this.refreshChallenge();
    
    // Show game over menu
    this.menu.showGameOver(finalScore, result.isNewHighScore, this.coinsCollectedThisRun, unlockedAchievements);
  }

  /**
   * Pause the game
   */
  pause() {
    if (this.gameState !== 'PLAYING') return;
    
    this.isPaused = true;
    this.gameState = 'PAUSED';
    this.menu.showPause();
  }

  /**
   * Resume the game
   */
  resume() {
    if (this.gameState !== 'PAUSED') return;
    
    this.isPaused = false;
    this.gameState = 'PLAYING';
    this.menu.hide();
  }

  /**
   * Setup visibility change handler for pause/resume
   */
  setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab/window hidden - pause if playing
        if (this.gameState === 'PLAYING') {
          this.pause();
        }
      }
      // Note: We don't auto-resume to prevent surprising the player
      // They must tap to resume
    });
  }

  /**
   * Stop the game loop
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    const ticker = this.renderer.getTicker();
    ticker.remove(this.update, this);
  }

  /**
   * Main game loop update
   * @param {number} delta - Delta time from PixiJS ticker
   */
  update(delta) {
    if (!this.isRunning) {
      return;
    }

    // Calculate delta time in seconds
    // PixiJS delta is in frames at 60 FPS, so divide by 60
    const deltaTime = delta / 60;

    // Only update gameplay when playing
    if (this.gameState === 'PLAYING') {
      // Update player and check for landing
      const justLanded = this.player.update(deltaTime);
      if (justLanded) {
        // Create landing dust particles
        const playerBounds = this.player.getBounds();
        this.particles.createLandingDust(
          playerBounds.x + playerBounds.width / 2,
          playerBounds.y + playerBounds.height
        );
      }

      // Update difficulty based on current score
      const currentScore = this.scoring.getScore();
      const obstaclesPassed = this.session.obstaclesPassed;
      this.difficultyManager.update(currentScore, obstaclesPassed);
      
      // Update scroll speed based on difficulty
      const speedMultiplier = this.difficultyManager.getSpeedMultiplier();
      this.scrollSpeed = CONFIG.PLAYER.RUN_SPEED * speedMultiplier;

      if (this.background) {
        this.background.update(deltaTime, this.scrollSpeed, this.difficultyManager.level);
      }

      // Update obstacles
      const newObstaclesPassed = this.obstacleManager.update(deltaTime, this.scrollSpeed);
      if (newObstaclesPassed > 0) {
        this.session.incrementObstacles();
      }

      // Update coins
      this.coinManager.update(deltaTime, this.scrollSpeed, true);

      // Update scoring
      this.scoring.update(deltaTime, this.scrollSpeed);

      // Track distance progress for challenges
      if (this.challengeTracker) {
        const updatedScore = this.scoring.getScore();
        const scoreDelta = updatedScore - this.lastScoreForChallenge;
        if (scoreDelta > 0) {
          const completed = this.challengeTracker.recordDistance(scoreDelta);
          if (completed) {
            this.handleChallengeCompletion();
          }
        }
        this.lastScoreForChallenge = updatedScore;
      }

      // Check collisions
      this.checkCollisions();

      // Update HUD with score, level, and high score
      const currentLevel = this.difficultyManager.level;
      const highScore = this.profile ? this.profile.highScore : 0;
      this.hud.updateScore(this.scoring.getScore(), currentLevel, highScore);
      this.hud.updateCoins(this.coinsCollectedThisRun);
    }

    // Update celebration animation
    if (this.celebration) {
      this.celebration.update(deltaTime);
    }

    if (this.background && this.gameState !== 'PLAYING') {
      this.background.update(deltaTime, 0, this.difficultyManager.level);
    }

    // Update particles (always, even when not playing for fade out)
    if (this.particles) {
      this.particles.update(deltaTime);
    }

    // Update camera effects
    if (this.camera) {
      const stage = this.renderer.getStage();
      this.camera.applyToContainer(stage, deltaTime);
    }

    // Performance monitoring (in development mode)
    if (CONFIG.PERFORMANCE.ENABLE_MONITORING) {
      this.monitorPerformance();
    }
  }

  /**
   * Check collisions between player and obstacles
   */
  checkCollisions() {
    if (!this.player.isAlive) return;

    const playerBounds = this.player.getBounds();
    
    // Check obstacle collisions
    const obstacles = this.obstacleManager.getObstacleBounds();
    for (const obstacle of obstacles) {
      if (Physics.checkCollision(playerBounds, obstacle)) {
        this.gameOver(obstacle.effect);
        break;
      }
    }

    // Check coin collisions
    const coinsCollected = this.coinManager.checkCollisions(playerBounds);
    if (coinsCollected > 0) {
      this.coinsCollectedThisRun += coinsCollected;
      if (this.challengeTracker) {
        const completed = this.challengeTracker.recordCoins(coinsCollected);
        if (completed) {
          this.handleChallengeCompletion();
        }
      }
      
      // Play coin collection sound
      if (this.audio) {
        this.audio.playSound('coin');
      }
      
      // Create sparkle particles at player position
      if (this.particles) {
        this.particles.createSparkles(
          playerBounds.x + playerBounds.width / 2,
          playerBounds.y + playerBounds.height / 2
        );
      }
    }
  }

  /**
   * Monitor performance metrics
   */
  monitorPerformance() {
    const now = performance.now();
    const frameTime = now - this.lastTime;
    this.lastTime = now;

    // Check frame time
    if (frameTime > CONFIG.PERFORMANCE.TARGET_FRAME_TIME) {
      console.warn(`Frame time exceeded target: ${frameTime.toFixed(2)}ms`);
    }

    // Check memory (if available)
    if (performance.memory) {
      const memoryMB = performance.memory.usedJSHeapSize / (1024 * 1024);
      if (memoryMB > CONFIG.PERFORMANCE.MAX_MEMORY_MB) {
        console.warn(`Memory usage high: ${memoryMB.toFixed(2)}MB`);
      }
    }
  }

  /**
   * Remove loading indicator
   */
  removeLoadingIndicator() {
    const loader = document.getElementById('loading');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.remove();
      }, 300);
    }
  }

  /**
   * Show error message
   * @param {string} message
   */
  showError(message) {
    const loader = document.getElementById('loading');
    if (loader) {
      loader.innerHTML = `
        <div style="color: #ff4444; text-align: center; padding: 20px;">
          <h2>Error</h2>
          <p style="margin: 10px 0;">${message}</p>
          <p style="font-size: 14px; margin-top: 20px;">
            Please check the console (F12) for details.
          </p>
        </div>
      `;
    }
  }

  /**
   * Cleanup and destroy game
   */
  destroy() {
    this.stop();

    if (this.particles) {
      this.particles.destroy();
    }

    if (this.menu) {
      this.menu.destroy();
    }

    if (this.hud) {
      this.hud.destroy();
    }

    if (this.scoring) {
      this.scoring.reset();
    }

    if (this.obstacleManager) {
      this.obstacleManager.destroy();
    }

    if (this.player) {
      this.player.destroy();
    }

    if (this.storage) {
      this.storage.destroy();
    }

    if (this.audio) {
      this.audio.destroy();
    }

    if (this.input) {
      this.input.destroy();
    }

    if (this.renderer) {
      this.renderer.destroy();
    }

    if (this.handleKeyDown) {
      window.removeEventListener('keydown', this.handleKeyDown);
      this.handleKeyDown = null;
    }
  }

  /**
   * Apply cosmetic to player
   * @param {Object} cosmetic - Cosmetic item with colors
   */
  applyCosmetic(cosmetic) {
    if (this.player && cosmetic && cosmetic.colors) {
      this.player.applyColors(cosmetic.colors);
    }
  }

  /**
   * Refresh the active challenge and update UI
   */
  async refreshChallenge() {
    if (!this.challengeManager || !this.profile) return;
    this.activeChallenge = await this.challengeManager.getOrCreateChallenge(
      this.profile.currentStreak,
      new Date()
    );

    if (this.challengeTracker) {
      this.challengeTracker.setChallenge(this.activeChallenge);
    } else {
      this.challengeTracker = new ChallengeTracker(this.activeChallenge);
    }

    if (this.challengeUI) {
      this.challengeUI.show(this.activeChallenge, this.profile.currentStreak);
    }
  }

  /**
   * Handle challenge completion rewards
   */
  async handleChallengeCompletion() {
    if (!this.activeChallenge || !this.activeChallenge.isCompleted) return;

    const rewardCoins = this.activeChallenge.rewardCoins || 0;
    if (rewardCoins > 0 && this.profile) {
      this.profile.addCoins(rewardCoins);
      await this.profile.save();
    }

    if (this.challengeManager) {
      await this.challengeManager.saveChallenge(this.activeChallenge);
    }

    if (this.challengeUI) {
      this.challengeUI.showCompletion(rewardCoins);
    }
  }

  /**
   * Get collision particle color by effect
   * @param {string|null} effect - Collision effect key
   * @returns {number} Hex color
   */
  getCollisionColor(effect) {
    const colors = {
      wet: 0x6EC6FF,
      filthy: 0x8B5A2B,
      tangled: 0xB57CFF,
      startled: 0xFFD54F,
      default: 0xFF6B6B
    };

    return colors[effect] || colors.default;
  }
}

// Initialize game when page loads
let game = null;

window.addEventListener('DOMContentLoaded', async () => {
  game = new Game();
  await game.init();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (game) {
    game.destroy();
  }
});

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
  if (game) {
    if (document.hidden) {
      game.stop();
    } else {
      game.start();
    }
  }
});

export { Game };
