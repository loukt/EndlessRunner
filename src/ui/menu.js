/**
 * Menu Module
 * 
 * Manages game menus including start screen, pause menu, and game over screen.
 */

import * as PIXI from 'pixi.js';
import { CONFIG } from '../config.js';
import { AchievementsDisplay } from './achievements.js';

export class Menu {
  constructor() {
    this.container = null;
    this.startScreen = null;
    this.gameOverScreen = null;
    this.pauseScreen = null;
    this.statisticsButton = null;
    this.settingsButton = null;
    this.shopButton = null;
    this.achievementsDisplay = null;
    this.onStatisticsClick = null;
    this.onSettingsClick = null;
    this.onShopClick = null;
    this.onPauseResume = null;
    this.onPauseSettings = null;
    this.onPauseShop = null;
    this.onPauseQuit = null;
  }

  /**
   * Create all menu screens
   * @param {PIXI.Container} stage - PixiJS stage
   */
  create(stage) {
    this.container = new PIXI.Container();
    this.container.visible = false;
    stage.addChild(this.container);

    this.createStartScreen();
    this.createGameOverScreen();
    this.createPauseScreen();
  }

  /**
   * Create the start screen
   */
  createStartScreen() {
    this.startScreen = new PIXI.Container();

    // Semi-transparent background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.7);
    bg.drawRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    bg.endFill();
    this.startScreen.addChild(bg);

    // Game title
    const title = new PIXI.Text('CAT RUNNER', {
      fontFamily: 'Arial',
      fontSize: 64,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 6,
      align: 'center',
    });
    title.anchor.set(0.5);
    title.x = CONFIG.CANVAS.WIDTH / 2;
    title.y = CONFIG.CANVAS.HEIGHT / 3;
    this.startScreen.addChild(title);

    // Subtitle
    const subtitle = new PIXI.Text('Tap/click to jump over obstacles', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xCCCCCC,
      align: 'center',
    });
    subtitle.anchor.set(0.5);
    subtitle.x = CONFIG.CANVAS.WIDTH / 2;
    subtitle.y = CONFIG.CANVAS.HEIGHT / 2 - 40;
    this.startScreen.addChild(subtitle);

    // Play button text
    const playText = new PIXI.Text('TAP TO START', {
      fontFamily: 'Arial',
      fontSize: 32,
      fontWeight: 'bold',
      fill: 0x4CAF50,
      stroke: 0x000000,
      strokeThickness: 4,
      align: 'center',
    });
    playText.anchor.set(0.5);
    playText.x = CONFIG.CANVAS.WIDTH / 2;
    playText.y = CONFIG.CANVAS.HEIGHT / 2 + 40;
    this.startScreen.addChild(playText);

    // Animated hint (pulse effect)
    const hint = new PIXI.Text('Hold for higher jumps!', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xFFEB3B,
      align: 'center',
    });
    hint.anchor.set(0.5);
    hint.x = CONFIG.CANVAS.WIDTH / 2;
    hint.y = CONFIG.CANVAS.HEIGHT / 2 + 100;
    this.startScreen.addChild(hint);

    // Shop button (center bottom, above other buttons)
    this.shopButton = this.createMenuButton('🛍️ SHOP', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 110, 0x9C27B0);
    this.shopButton.interactive = true;
    this.shopButton.buttonMode = true;
    this.shopButton.on('pointerdown', (e) => {
      this.stopNativeEvent(e);
      if (this.onShopClick) this.onShopClick();
    });
    this.startScreen.addChild(this.shopButton);

    // Statistics button (bottom left)
    this.statisticsButton = this.createMenuButton('📊 STATS', 100, CONFIG.CANVAS.HEIGHT - 50, 0x2196F3);
    this.statisticsButton.interactive = true;
    this.statisticsButton.buttonMode = true;
    this.statisticsButton.on('pointerdown', (e) => {
      this.stopNativeEvent(e);
      if (this.onStatisticsClick) this.onStatisticsClick();
    });
    this.startScreen.addChild(this.statisticsButton);

    // Settings button (bottom right)
    this.settingsButton = this.createMenuButton('⚙️ SETTINGS', CONFIG.CANVAS.WIDTH - 100, CONFIG.CANVAS.HEIGHT - 50, 0x607D8B);
    this.settingsButton.interactive = true;
    this.settingsButton.buttonMode = true;
    this.settingsButton.on('pointerdown', (e) => {
      this.stopNativeEvent(e);
      if (this.onSettingsClick) this.onSettingsClick();
    });
    this.startScreen.addChild(this.settingsButton);

    this.container.addChild(this.startScreen);
  }

  /**
   * Create a menu button
   */
  createMenuButton(text, x, y, color) {
    const button = new PIXI.Container();
    button.x = x;
    button.y = y;

    const label = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 18,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
    });
    label.anchor.set(0.5);

    const padX = 22;
    const width = Math.max(160, Math.ceil(label.width + padX * 2));
    const height = 44;

    const bg = new PIXI.Graphics();
    bg.beginFill(color);
    bg.drawRoundedRect(-width / 2, -height / 2, width, height, 10);
    bg.endFill();
    button.addChild(bg);
    button.addChild(label);

    this.addButtonFeedback(button);

    return button;
  }

  /**
   * Create the game over screen
   */
  createGameOverScreen() {
    this.gameOverScreen = new PIXI.Container();
    this.gameOverScreen.visible = false;

    // Semi-transparent background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.8);
    bg.drawRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    bg.endFill();
    this.gameOverScreen.addChild(bg);

    // Game over title
    const title = new PIXI.Text('GAME OVER', {
      fontFamily: 'Arial',
      fontSize: 56,
      fontWeight: 'bold',
      fill: 0xFF4444,
      stroke: 0x000000,
      strokeThickness: 6,
      align: 'center',
    });
    title.anchor.set(0.5);
    title.x = CONFIG.CANVAS.WIDTH / 2;
    title.y = CONFIG.CANVAS.HEIGHT / 3;
    this.gameOverScreen.addChild(title);

    // Score text (will be updated dynamically)
    this.finalScoreText = new PIXI.Text('Score: 0', {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 4,
      align: 'center',
    });
    this.finalScoreText.anchor.set(0.5);
    this.finalScoreText.x = CONFIG.CANVAS.WIDTH / 2;
    this.finalScoreText.y = CONFIG.CANVAS.HEIGHT / 2 - 50;
    this.gameOverScreen.addChild(this.finalScoreText);

    // Coins collected text
    this.coinsCollectedText = new PIXI.Text('🐟 Fish: 0', {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: 0xFFD700,
      stroke: 0x000000,
      strokeThickness: 3,
      align: 'center',
    });
    this.coinsCollectedText.anchor.set(0.5);
    this.coinsCollectedText.x = CONFIG.CANVAS.WIDTH / 2;
    this.coinsCollectedText.y = CONFIG.CANVAS.HEIGHT / 2;
    this.gameOverScreen.addChild(this.coinsCollectedText);

    // High score text (will be shown if new high score)
    this.highScoreText = new PIXI.Text('NEW HIGH SCORE!', {
      fontFamily: 'Arial',
      fontSize: 28,
      fontWeight: 'bold',
      fill: 0xFFD700,
      stroke: 0x000000,
      strokeThickness: 4,
      align: 'center',
    });
    this.highScoreText.anchor.set(0.5);
    this.highScoreText.x = CONFIG.CANVAS.WIDTH / 2;
    this.highScoreText.y = CONFIG.CANVAS.HEIGHT / 2 + 50;
    this.highScoreText.visible = false;
    this.gameOverScreen.addChild(this.highScoreText);

    // Achievements display
    this.achievementsDisplay = new AchievementsDisplay();
    this.achievementsDisplay.create(this.gameOverScreen);
    this.achievementsDisplay.container.x = CONFIG.CANVAS.WIDTH / 2 - 160;
    this.achievementsDisplay.container.y = CONFIG.CANVAS.HEIGHT / 2 + 80;

    // Restart button
    const restartText = new PIXI.Text('TAP TO RESTART', {
      fontFamily: 'Arial',
      fontSize: 28,
      fontWeight: 'bold',
      fill: 0x4CAF50,
      stroke: 0x000000,
      strokeThickness: 4,
      align: 'center',
    });
    restartText.anchor.set(0.5);
    restartText.x = CONFIG.CANVAS.WIDTH / 2;
    restartText.y = CONFIG.CANVAS.HEIGHT * 2 / 3;
    this.gameOverScreen.addChild(restartText);

    this.container.addChild(this.gameOverScreen);
  }

  /**
   * Create the pause screen
   */
  createPauseScreen() {
    this.pauseScreen = new PIXI.Container();
    this.pauseScreen.visible = false;

    // Semi-transparent background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.6);
    bg.drawRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    bg.endFill();
    this.pauseScreen.addChild(bg);

    // Pause text
    const pauseText = new PIXI.Text('PAUSED', {
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 6,
      align: 'center',
    });
    pauseText.anchor.set(0.5);
    pauseText.x = CONFIG.CANVAS.WIDTH / 2;
    pauseText.y = CONFIG.CANVAS.HEIGHT / 2 - 110;
    this.pauseScreen.addChild(pauseText);

    const resumeButton = this.createPauseButton('RESUME', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2 - 30, 0x4CAF50);
    resumeButton.on('pointerdown', (e) => {
      this.stopNativeEvent(e);
      if (this.onPauseResume) this.onPauseResume();
    });
    this.pauseScreen.addChild(resumeButton);

    const settingsButton = this.createPauseButton('SETTINGS', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2 + 40, 0x607D8B);
    settingsButton.on('pointerdown', (e) => {
      this.stopNativeEvent(e);
      if (this.onPauseSettings) this.onPauseSettings();
    });
    this.pauseScreen.addChild(settingsButton);

    const shopButton = this.createPauseButton('SHOP', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2 + 110, 0x9C27B0);
    shopButton.on('pointerdown', (e) => {
      this.stopNativeEvent(e);
      if (this.onPauseShop) this.onPauseShop();
    });
    this.pauseScreen.addChild(shopButton);

    const quitButton = this.createPauseButton('RESTART RUN', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2 + 180, 0xE53935);
    quitButton.on('pointerdown', (e) => {
      this.stopNativeEvent(e);
      if (this.onPauseQuit) this.onPauseQuit();
    });
    this.pauseScreen.addChild(quitButton);

    this.container.addChild(this.pauseScreen);
  }

  /**
   * Create a pause menu button
   */
  createPauseButton(text, x, y, color) {
    const button = new PIXI.Container();
    button.x = x;
    button.y = y;

    const bg = new PIXI.Graphics();
    bg.beginFill(color);
    bg.drawRoundedRect(-140, -24, 280, 48, 12);
    bg.endFill();
    button.addChild(bg);

    const label = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
    });
    label.anchor.set(0.5);
    button.addChild(label);

    button.interactive = true;
    button.buttonMode = true;

    this.addButtonFeedback(button);

    return button;
  }

  stopNativeEvent(e) {
    if (!e) return;
    if (typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    const nativeEvent = e.nativeEvent;
    if (nativeEvent && typeof nativeEvent.preventDefault === 'function') {
      nativeEvent.preventDefault();
    }
    if (nativeEvent && typeof nativeEvent.stopImmediatePropagation === 'function') {
      nativeEvent.stopImmediatePropagation();
    }
    if (nativeEvent && typeof nativeEvent.stopPropagation === 'function') {
      nativeEvent.stopPropagation();
    }
  }

  addButtonFeedback(button) {
    if (!button || typeof button.on !== 'function') return;

    const setScale = (s) => {
      button.scale.set(s);
    };

    button.on('pointerover', () => setScale(1.03));
    button.on('pointerout', () => setScale(1.0));
    button.on('pointerdown', () => setScale(0.97));
    button.on('pointerup', () => setScale(1.03));
    button.on('pointerupoutside', () => setScale(1.0));
  }

  /**
   * Show the start screen
   */
  showStartScreen() {
    this.container.visible = true;
    this.startScreen.visible = true;
    this.gameOverScreen.visible = false;
    this.pauseScreen.visible = false;
  }

  /**
   * Show the game over screen with score
   * @param {number} score - Final score
   * @param {boolean} isNewHighScore - Whether this is a new high score
   * @param {number} coinsCollected - Coins collected this run
   * @param {Array} achievements - Newly unlocked achievements
   */
  showGameOver(score, isNewHighScore = false, coinsCollected = 0, achievements = []) {
    this.container.visible = true;
    this.startScreen.visible = false;
    this.gameOverScreen.visible = true;
    this.pauseScreen.visible = false;

    this.finalScoreText.text = `Score: ${score}`;
    this.coinsCollectedText.text = `🐟 Fish: ${coinsCollected}`;
    this.highScoreText.visible = isNewHighScore;
    if (this.achievementsDisplay) {
      if (achievements.length > 0) {
        this.achievementsDisplay.showAchievements(achievements, 'New Achievements');
      } else {
        this.achievementsDisplay.hide();
      }
    }
  }

  /**
   * Show the pause screen
   */
  showPause() {
    this.container.visible = true;
    this.startScreen.visible = false;
    this.gameOverScreen.visible = false;
    this.pauseScreen.visible = true;
  }

  hidePause() {
    if (this.pauseScreen) {
      this.pauseScreen.visible = false;
    }
  }

  /**
   * Hide all menus (game is playing)
   */
  hide() {
    this.container.visible = false;
    this.startScreen.visible = false;
    this.gameOverScreen.visible = false;
    this.pauseScreen.visible = false;
  }

  /**
   * Clean up menu resources
   */
  destroy() {
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
  }
}

export default Menu;
