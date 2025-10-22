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
import * as PIXI from 'pixi.js';
import { Player } from './game/player.js';
import { ObstacleManager } from './game/obstacle.js';
import { Scoring } from './game/scoring.js';
import { HUD } from './ui/hud.js';
import { Menu } from './ui/menu.js';
import { GameSession } from './data/session.js';
import { ParticleSystem } from './game/particles.js';
import { CameraEffects } from './game/camera.js';

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
    this.scoring = null;
    this.hud = null;
    this.menu = null;
    this.session = null;
    this.particles = null;
    this.camera = null;
    this.isRunning = false;
    this.isPaused = false;
    this.gameState = 'MENU'; // MENU, READY, PLAYING, GAME_OVER, PAUSED
    this.lastTime = 0;
    this.scrollSpeed = CONFIG.PLAYER.RUN_SPEED;
  }

  /**
   * Initialize all game systems
   */
  async init() {
    try {
      console.log('Initializing game systems...');

      // Get canvas container
      const container = document.getElementById('game-container');
      if (!container) {
        throw new Error('Game container not found');
      }

      // Initialize renderer
      this.renderer = new Renderer();
      await this.renderer.init(container);
      console.log('✓ Renderer initialized');

      // Initialize input manager
      this.input = new InputManager();
      this.input.init(this.renderer.getRenderer().view);
      console.log('✓ Input manager initialized');

      // Initialize audio manager
      this.audio = new AudioManager();
      this.audio.init();
      console.log('✓ Audio manager initialized');

      // Initialize storage
      this.storage = new StorageManager();
      await this.storage.init();
      console.log('✓ Storage initialized');

      // Load or create player profile
      await this.loadProfile();

      // Create game objects
      this.createGameObjects();

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

      console.log('Game initialized successfully!');
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
      // Try to load existing profile
      let profile = await this.storage.load(CONFIG.STORAGE.STORE_NAMES.PROFILE, 'player');
      
      if (!profile) {
        // Create new profile
        profile = {
          id: 'player',
          highScore: 0,
          totalCoins: 0,
          gamesPlayed: 0,
          totalDistance: 0,
          soundEnabled: true,
          musicEnabled: true,
          selectedCosmetics: {},
          firstPlayedAt: Date.now(),
          lastPlayedAt: Date.now(),
          currentStreak: 0,
          bestStreak: 0,
          statisticsVersion: 1
        };
        
        await this.storage.save(CONFIG.STORAGE.STORE_NAMES.PROFILE, profile);
        console.log('Created new player profile');
      } else {
        // Update last played time
        profile.lastPlayedAt = Date.now();
        await this.storage.save(CONFIG.STORAGE.STORE_NAMES.PROFILE, profile);
        console.log('Loaded existing player profile');
      }

      this.profile = profile;
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Create minimal profile in memory
      this.profile = {
        id: 'player',
        highScore: 0,
        totalCoins: 0,
        soundEnabled: true,
        musicEnabled: true
      };
    }
  }

  /**
   * Create game objects
   */
  createGameObjects() {
    const stage = this.renderer.getStage();
    const pixiRenderer = this.renderer.app.renderer;

    // Draw ground line and fill
    const ground = new PIXI.Graphics();
    // Draw grass/ground area
    ground.beginFill(0x8B7355); // Brown ground color
    ground.drawRect(0, CONFIG.PHYSICS.GROUND_Y, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT - CONFIG.PHYSICS.GROUND_Y);
    ground.endFill();
    // Draw ground line
    ground.lineStyle(3, 0x654321, 1); // Darker brown line
    ground.moveTo(0, CONFIG.PHYSICS.GROUND_Y);
    ground.lineTo(CONFIG.CANVAS.WIDTH, CONFIG.PHYSICS.GROUND_Y);
    stage.addChild(ground);

    // Create player
    this.player = new Player();
    this.player.create(stage, pixiRenderer);

    // Create obstacle manager
    this.obstacleManager = new ObstacleManager();
    this.obstacleManager.create(stage, pixiRenderer);

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

    // Create menu system (should be on top of HUD)
    this.menu = new Menu();
    this.menu.create(stage);

    // Create session tracker
    this.session = new GameSession();

    console.log('Game objects created');
  }

  /**
   * Setup input handlers
   */
  setupInput() {
    // Handle press (start of tap/click)
    this.input.on('press', () => {
      if (this.gameState === 'MENU' || this.gameState === 'READY') {
        this.startGame();
      } else if (this.gameState === 'PLAYING') {
        this.player.jump();
        this.session.incrementJumps();
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
      } else if (this.gameState === 'PAUSED') {
        this.resume();
      }
    });

    // Handle release (end of tap/click) for variable jump height
    this.input.on('release', () => {
      if (this.gameState === 'PLAYING') {
        this.player.cancelJump();
      }
    });
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
    this.menu.hide();
    this.hud.showGameStarted();
    console.log('Game started! Session:', this.session.sessionId);
  }

  /**
   * Restart the game
   */
  restartGame() {
    this.player.reset();
    this.obstacleManager.reset();
    this.scoring.reset();
    this.hud.reset();
    this.session.reset();
    this.particles.clear();
    this.camera.reset();
    this.scrollSpeed = CONFIG.PLAYER.RUN_SPEED;
    this.menu.showStartScreen();
    this.gameState = 'MENU';
    console.log('Game restarted - ready for new session');
  }

  /**
   * Game over
   */
  gameOver() {
    this.gameState = 'GAME_OVER';
    this.scoring.stop();
    this.session.end();
    this.player.die();
    
    // Create explosion particles at collision point
    const playerBounds = this.player.getBounds();
    this.particles.createExplosion(
      playerBounds.x + playerBounds.width / 2,
      playerBounds.y + playerBounds.height / 2
    );
    
    // Camera shake on collision
    this.camera.shake(15, 0.4);
    
    // Play collision sound (if loaded)
    if (this.audio && this.audio.initialized) {
      this.audio.playSound('collision');
    }
    
    const finalScore = this.scoring.getScore();
    
    // Update session score
    this.session.setScore(finalScore);
    
    // Check for high score
    const isNewHighScore = finalScore > this.profile.highScore;
    if (isNewHighScore) {
      this.profile.highScore = finalScore;
      this.saveProfile();
      console.log('New high score!', finalScore);
    }
    
    // Show game over menu
    this.menu.showGameOver(finalScore, isNewHighScore);
    
    // Log session data
    console.log('Game over. Session data:', this.session.getData());
  }

  /**
   * Save player profile
   */
  async saveProfile() {
    try {
      this.profile.lastPlayedAt = Date.now();
      await this.storage.save(CONFIG.STORAGE.STORE_NAMES.PROFILE, this.profile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }

  /**
   * Pause the game
   */
  pause() {
    if (this.gameState !== 'PLAYING') return;
    
    this.isPaused = true;
    this.gameState = 'PAUSED';
    this.menu.showPause();
    console.log('Game paused');
  }

  /**
   * Resume the game
   */
  resume() {
    if (this.gameState !== 'PAUSED') return;
    
    this.isPaused = false;
    this.gameState = 'PLAYING';
    this.menu.hide();
    console.log('Game resumed');
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

      // Update obstacles and track passed obstacles
      const obstaclesPassed = this.obstacleManager.update(deltaTime, this.scrollSpeed);
      if (obstaclesPassed > 0) {
        this.session.incrementObstacles();
        // Gradually increase difficulty (speed)
        this.scrollSpeed = Math.min(
          this.scrollSpeed + (obstaclesPassed * 2),
          CONFIG.PLAYER.RUN_SPEED * 1.5
        );
      }

      // Update scoring
      this.scoring.update(deltaTime, this.scrollSpeed);

      // Check collisions
      this.checkCollisions();

      // Update HUD
      this.hud.updateScore(this.scoring.getScore());
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
    const obstacles = this.obstacleManager.getObstacleBounds();

    for (const obstacle of obstacles) {
      if (Physics.checkCollision(playerBounds, obstacle)) {
        this.gameOver();
        break;
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

    console.log('Game destroyed');
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
