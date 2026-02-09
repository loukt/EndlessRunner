/**
 * Settings Screen Module
 * 
 * Manages game settings including sound, music, and accessibility options.
 */

import * as PIXI from 'pixi.js';
import { CONFIG } from '../config.js';

export class SettingsScreen {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.onClose = null;
    this.settings = {
      soundEnabled: true,
      musicEnabled: true,
      reducedMotion: false
    };
  }

  /**
   * Create settings screen
   * @param {PIXI.Container} stage - PixiJS stage
   */
  create(stage) {
    this.container = new PIXI.Container();
    this.container.visible = false;
    stage.addChild(this.container);

    // Load saved settings
    this.loadSettings();

    // Semi-transparent background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.9);
    bg.drawRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    bg.endFill();
    bg.interactive = true; // Block clicks
    this.container.addChild(bg);

    // Title
    const title = new PIXI.Text('SETTINGS', {
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 5,
    });
    title.anchor.set(0.5, 0);
    title.x = CONFIG.CANVAS.WIDTH / 2;
    title.y = 50;
    this.container.addChild(title);

    // Settings options container
    this.optionsContainer = new PIXI.Container();
    this.optionsContainer.x = CONFIG.CANVAS.WIDTH / 2;
    this.optionsContainer.y = 150;
    this.container.addChild(this.optionsContainer);

    // Create toggle options
    this.createToggleOption('🔊 Sound Effects', 'soundEnabled', 0);
    this.createToggleOption('🎵 Music', 'musicEnabled', 80);
    this.createToggleOption('♿ Reduced Motion', 'reducedMotion', 160);

    // Close button
    const closeBtn = this.createButton('BACK', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 80, 0x666666);
    closeBtn.interactive = true;
    closeBtn.buttonMode = true;
    closeBtn.on('pointerdown', () => {
      this.hide();
      if (this.onClose) {
        this.onClose();
      }
    });
    this.container.addChild(closeBtn);
  }

  /**
   * Create a toggle option
   */
  createToggleOption(label, settingKey, yOffset) {
    const option = new PIXI.Container();
    option.y = yOffset;

    // Label text
    const labelText = new PIXI.Text(label, {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: 0xFFFFFF,
    });
    labelText.anchor.set(0, 0.5);
    labelText.x = -200;
    option.addChild(labelText);

    // Toggle button
    const toggleBtn = new PIXI.Graphics();
    const drawToggle = (enabled) => {
      toggleBtn.clear();
      toggleBtn.beginFill(enabled ? 0x4CAF50 : 0x666666);
      toggleBtn.drawRoundedRect(0, -15, 80, 30, 15);
      toggleBtn.endFill();
      
      toggleBtn.beginFill(0xFFFFFF);
      toggleBtn.drawCircle(enabled ? 65 : 15, 0, 12);
      toggleBtn.endFill();
    };

    toggleBtn.x = 150;
    toggleBtn.interactive = true;
    toggleBtn.buttonMode = true;
    
    drawToggle(this.settings[settingKey]);

    toggleBtn.on('pointerdown', () => {
      this.settings[settingKey] = !this.settings[settingKey];
      drawToggle(this.settings[settingKey]);
      this.saveSettings();
      this.onSettingChanged(settingKey, this.settings[settingKey]);
    });

    option.addChild(toggleBtn);
    this.optionsContainer.addChild(option);
  }

  /**
   * Create a button
   */
  createButton(text, x, y, color) {
    const button = new PIXI.Container();
    button.x = x;
    button.y = y;

    const bg = new PIXI.Graphics();
    bg.beginFill(color);
    bg.drawRoundedRect(-100, -25, 200, 50, 10);
    bg.endFill();
    button.addChild(bg);

    const label = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
    });
    label.anchor.set(0.5);
    button.addChild(label);

    return button;
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('game-settings');
      if (saved) {
        this.settings = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem('game-settings', JSON.stringify(this.settings));
      console.log('Settings saved:', this.settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Callback when setting changes (override this)
   */
  onSettingChanged(key, value) {
    console.log(`Setting changed: ${key} = ${value}`);
  }

  /**
   * Show settings screen
   */
  show() {
    this.container.visible = true;
    this.isVisible = true;
  }

  /**
   * Hide settings screen
   */
  hide() {
    this.container.visible = false;
    this.isVisible = false;
  }

  /**
   * Toggle visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
  }
}

export default SettingsScreen;
