/**
 * Statistics Screen Module
 * 
 * Displays lifetime player statistics and achievements.
 */

import * as PIXI from 'pixi.js';
import { CONFIG } from '../config.js';

export class StatisticsScreen {
  constructor() {
    this.container = null;
    this.isVisible = false;
  }

  /**
   * Create statistics screen
   * @param {PIXI.Container} stage - PixiJS stage
   */
  create(stage) {
    this.container = new PIXI.Container();
    this.container.visible = false;
    stage.addChild(this.container);

    // Semi-transparent background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.9);
    bg.drawRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    bg.endFill();
    bg.interactive = true; // Block clicks
    this.container.addChild(bg);

    // Title
    const title = new PIXI.Text('STATISTICS', {
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 5,
    });
    title.anchor.set(0.5, 0);
    title.x = CONFIG.CANVAS.WIDTH / 2;
    title.y = 30;
    this.container.addChild(title);

    // Stats container
    this.statsContainer = new PIXI.Container();
    this.statsContainer.x = 50;
    this.statsContainer.y = 100;
    this.container.addChild(this.statsContainer);

    // Achievements container
    this.achievementsContainer = new PIXI.Container();
    this.achievementsContainer.x = 50;
    this.achievementsContainer.y = 320;
    this.container.addChild(this.achievementsContainer);

    // Close button
    const closeBtn = this.createButton('BACK', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 60, 0x666666);
    closeBtn.interactive = true;
    closeBtn.buttonMode = true;
    closeBtn.on('pointerdown', () => this.hide());
    this.container.addChild(closeBtn);
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
   * Show statistics screen
   * @param {Object} profileStats - Player profile statistics
   * @param {Object} achievementManager - Achievement manager instance
   * @param {Array} unlockedAchievements - Array of unlocked achievement IDs
   */
  show(profileStats, achievementManager, unlockedAchievements) {
    this.container.visible = true;
    this.isVisible = true;

    // Clear previous stats
    this.statsContainer.removeChildren();
    this.achievementsContainer.removeChildren();

    // Display stats
    const stats = [
      `🏆 High Score: ${profileStats.highScore}`,
      `🎮 Games Played: ${profileStats.gamesPlayed}`,
      `🏃 Total Distance: ${profileStats.totalDistance}m`,
      `⬆️ Total Jumps: ${profileStats.totalJumps}`,
      `🚧 Obstacles Passed: ${profileStats.totalObstacles}`,
      `⭐ Achievements: ${profileStats.achievementsUnlocked}`,
    ];

    let yOffset = 0;
    for (const stat of stats) {
      const text = new PIXI.Text(stat, {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xFFFFFF,
      });
      text.y = yOffset;
      this.statsContainer.addChild(text);
      yOffset += 30;
    }

    // Display achievements section
    const achievementsTitle = new PIXI.Text('ACHIEVEMENTS', {
      fontFamily: 'Arial',
      fontSize: 28,
      fontWeight: 'bold',
      fill: 0xFFD700,
    });
    this.achievementsContainer.addChild(achievementsTitle);

    // Get all achievements
    const allAchievements = achievementManager.achievements;
    let achievementY = 40;

    for (const achievement of allAchievements.slice(0, 8)) { // Show first 8
      const isUnlocked = unlockedAchievements.includes(achievement.id);
      
      const achievementText = new PIXI.Text(
        `${achievement.icon} ${achievement.name}${isUnlocked ? ' ✓' : ' 🔒'}`,
        {
          fontFamily: 'Arial',
          fontSize: 18,
          fill: isUnlocked ? 0x4CAF50 : 0x888888,
        }
      );
      achievementText.y = achievementY;
      this.achievementsContainer.addChild(achievementText);

      const descText = new PIXI.Text(achievement.description, {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: isUnlocked ? 0xCCCCCC : 0x666666,
      });
      descText.x = 30;
      descText.y = achievementY + 20;
      this.achievementsContainer.addChild(descText);

      achievementY += 50;
    }
  }

  /**
   * Hide statistics screen
   */
  hide() {
    this.container.visible = false;
    this.isVisible = false;
  }

  /**
   * Toggle visibility
   */
  toggle(profileStats, achievementManager, unlockedAchievements) {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show(profileStats, achievementManager, unlockedAchievements);
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

export default StatisticsScreen;
