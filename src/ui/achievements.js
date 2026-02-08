/**
 * Achievements UI Module
 *
 * Displays achievement badges in menus.
 */

import * as PIXI from 'pixi.js';

export class AchievementsDisplay {
  constructor() {
    this.container = null;
    this.titleText = null;
    this.itemsContainer = null;
  }

  create(parent) {
    this.container = new PIXI.Container();
    this.container.visible = false;
    parent.addChild(this.container);

    this.titleText = new PIXI.Text('Achievements', {
      fontFamily: 'Arial',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 0xFFD700,
      stroke: 0x000000,
      strokeThickness: 3,
    });
    this.container.addChild(this.titleText);

    this.itemsContainer = new PIXI.Container();
    this.itemsContainer.y = 26;
    this.container.addChild(this.itemsContainer);
  }

  showAchievements(achievements, title = 'New Achievements') {
    if (!this.container) return;

    this.container.visible = achievements.length > 0;
    this.titleText.text = title;

    this.itemsContainer.removeChildren();

    achievements.slice(0, 3).forEach((achievement, index) => {
      const badge = this.createBadge(achievement);
      badge.y = index * 28;
      this.itemsContainer.addChild(badge);
    });
  }

  hide() {
    if (this.container) {
      this.container.visible = false;
    }
  }

  createBadge(achievement) {
    const badge = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(0x2C3E50, 0.85);
    bg.drawRoundedRect(0, 0, 320, 24, 6);
    bg.endFill();
    badge.addChild(bg);

    const iconText = new PIXI.Text(achievement.icon || '🏆', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xFFFFFF,
    });
    iconText.x = 8;
    iconText.y = 2;
    badge.addChild(iconText);

    const nameText = new PIXI.Text(achievement.name || 'Achievement', {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xFFFFFF,
    });
    nameText.x = 32;
    nameText.y = 4;
    badge.addChild(nameText);

    return badge;
  }
}

export default AchievementsDisplay;
