/**
 * HUD (Heads-Up Display) Module
 * 
 * Displays score and game information on screen.
 */

import * as PIXI from 'pixi.js';
import { CONFIG } from '../config.js';

export class HUD {
  constructor() {
    this.container = null;
    this.scoreText = null;
    this.levelText = null;
    this.gameOverText = null;
    this.instructionText = null;
  }

  /**
   * Create HUD elements
   * @param {PIXI.Container} stage - PixiJS stage
   */
  create(stage) {
    this.container = new PIXI.Container();
    stage.addChild(this.container);

    // Score text (top center)
    this.scoreText = new PIXI.Text('Score: 0', {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 4,
      align: 'center'
    });
    this.scoreText.anchor.set(0.5, 0);
    this.scoreText.x = CONFIG.CANVAS.WIDTH / 2;
    this.scoreText.y = 20;
    this.container.addChild(this.scoreText);

    // Level indicator (top left)
    this.levelText = new PIXI.Text('Level: 1', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFDD44,
      stroke: 0x000000,
      strokeThickness: 3,
      align: 'left'
    });
    this.levelText.x = 20;
    this.levelText.y = 20;
    this.container.addChild(this.levelText);

    // Instruction text (center)
    this.instructionText = new PIXI.Text('Click or Tap to Jump!', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 3,
      align: 'center'
    });
    this.instructionText.anchor.set(0.5);
    this.instructionText.x = CONFIG.CANVAS.WIDTH / 2;
    this.instructionText.y = CONFIG.CANVAS.HEIGHT / 2;
    this.container.addChild(this.instructionText);

    // Game over text (initially hidden)
    this.gameOverText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xFF4444,
      stroke: 0x000000,
      strokeThickness: 6,
      align: 'center'
    });
    this.gameOverText.anchor.set(0.5);
    this.gameOverText.x = CONFIG.CANVAS.WIDTH / 2;
    this.gameOverText.y = CONFIG.CANVAS.HEIGHT / 2 - 50;
    this.gameOverText.visible = false;
    this.container.addChild(this.gameOverText);
  }

  /**
   * Update score display
   * @param {number} score - Current score
   * @param {number} level - Current difficulty level (optional)
   * @param {number} highScore - Personal best score (optional)
   */
  updateScore(score, level = null, highScore = null) {
    if (this.scoreText) {
      let text = `Score: ${score}`;
      if (highScore !== null && highScore > 0) {
        text += ` (Best: ${highScore})`;
      }
      this.scoreText.text = text;
    }
    if (level !== null && this.levelText) {
      this.levelText.text = `Level: ${level}`;
    }
  }

  /**
   * Show game started state
   */
  showGameStarted() {
    if (this.instructionText) {
      this.instructionText.visible = false;
    }
    if (this.gameOverText) {
      this.gameOverText.visible = false;
    }
  }

  /**
   * Show game over screen
   * @param {number} score - Final score
   */
  showGameOver(score) {
    if (this.gameOverText) {
      this.gameOverText.text = `Game Over!\nScore: ${score}\n\nClick to Restart`;
      this.gameOverText.visible = true;
    }
    if (this.instructionText) {
      this.instructionText.visible = false;
    }
  }

  /**
   * Show ready state
   */
  showReady() {
    if (this.instructionText) {
      this.instructionText.visible = true;
    }
    if (this.gameOverText) {
      this.gameOverText.visible = false;
    }
  }

  /**
   * Reset HUD to initial state
   */
  reset() {
    if (this.scoreText) {
      this.scoreText.text = 'Score: 0';
    }
    this.showReady();
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
    this.scoreText = null;
    this.gameOverText = null;
    this.instructionText = null;
  }
}

export default HUD;
