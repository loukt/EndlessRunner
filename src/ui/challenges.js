/**
 * Challenges UI Module
 *
 * Displays daily challenge progress and completion notifications.
 */

import * as PIXI from 'pixi.js';
import { CONFIG } from '../config.js';
import { getStreakMultiplier } from '../data/challenges.js';

export class ChallengesUI {
  constructor() {
    this.container = null;
    this.titleText = null;
    this.progressText = null;
    this.rewardText = null;
    this.streakText = null;
    this.progressBar = null;
    this.completionBanner = null;
  }

  create(stage) {
    this.container = new PIXI.Container();
    this.container.visible = false;
    stage.addChild(this.container);

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.6);
    bg.drawRoundedRect(20, 20, 360, 100, 10);
    bg.endFill();
    this.container.addChild(bg);

    this.titleText = new PIXI.Text('Daily Pounce', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xFFD700,
    });
    this.titleText.x = 35;
    this.titleText.y = 30;
    this.container.addChild(this.titleText);

    this.progressText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xFFFFFF,
    });
    this.progressText.x = 35;
    this.progressText.y = 55;
    this.container.addChild(this.progressText);

    this.rewardText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xCCCCCC,
    });
    this.rewardText.x = 35;
    this.rewardText.y = 75;
    this.container.addChild(this.rewardText);

    this.streakText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0x9CCC65,
    });
    this.streakText.x = 35;
    this.streakText.y = 92;
    this.container.addChild(this.streakText);

    this.progressBar = new PIXI.Graphics();
    this.container.addChild(this.progressBar);

    this.completionBanner = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 28,
      fontWeight: 'bold',
      fill: 0x4CAF50,
      stroke: 0x000000,
      strokeThickness: 4,
      align: 'center',
    });
    this.completionBanner.anchor.set(0.5);
    this.completionBanner.x = CONFIG.CANVAS.WIDTH / 2;
    this.completionBanner.y = CONFIG.CANVAS.HEIGHT / 2 - 120;
    this.completionBanner.visible = false;
    stage.addChild(this.completionBanner);
  }

  show(challenge, streak) {
    if (!this.container) return;
    this.container.visible = true;
    this.update(challenge, streak);
  }

  hide() {
    if (this.container) {
      this.container.visible = false;
    }
  }

  update(challenge, streak) {
    if (!challenge || !this.container) return;

    const progressLabel = this.getProgressLabel(challenge);
    this.progressText.text = progressLabel;

    const multiplier = getStreakMultiplier(streak);
    this.rewardText.text = `Reward: ${challenge.rewardCoins} fish (x${multiplier})`;
    this.streakText.text = `Streak: ${streak} day${streak === 1 ? '' : 's'}`;

    this.progressBar.clear();
    const ratio = challenge.targetValue > 0 ? Math.min(1, challenge.currentValue / challenge.targetValue) : 0;
    this.progressBar.beginFill(0x333333);
    this.progressBar.drawRoundedRect(220, 70, 140, 12, 6);
    this.progressBar.endFill();
    this.progressBar.beginFill(0x4CAF50);
    this.progressBar.drawRoundedRect(220, 70, 140 * ratio, 12, 6);
    this.progressBar.endFill();
  }

  showCompletion(rewardCoins) {
    if (!this.completionBanner) return;
    this.completionBanner.text = `Challenge Complete! +${rewardCoins} fish`;
    this.completionBanner.visible = true;

    setTimeout(() => {
      if (this.completionBanner) {
        this.completionBanner.visible = false;
      }
    }, 2500);
  }

  showStreakMilestone(streak) {
    if (!this.completionBanner) return;
    this.completionBanner.text = `Streak Milestone: ${streak} Days!`;
    this.completionBanner.visible = true;

    setTimeout(() => {
      if (this.completionBanner) {
        this.completionBanner.visible = false;
      }
    }, 2500);
  }

  getProgressLabel(challenge) {
    const current = Math.floor(challenge.currentValue);
    const target = Math.floor(challenge.targetValue);
    switch (challenge.type) {
      case 'jump_count':
        return `Jumps: ${current}/${target}`;
      case 'coin_collect':
        return `Fish: ${current}/${target}`;
      case 'distance':
        return `Distance: ${current}/${target}m`;
      default:
        return `${current}/${target}`;
    }
  }
}

export default ChallengesUI;
