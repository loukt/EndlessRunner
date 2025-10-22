/**
 * Renderer Module
 * 
 * Handles PixiJS initialization and canvas management.
 * Provides a responsive canvas that adapts to screen size while maintaining aspect ratio.
 */

import * as PIXI from 'pixi.js';
import { CONFIG } from '../config.js';

export class Renderer {
  constructor() {
    this.app = null;
    this.initialized = false;
  }

  /**
   * Initialize the PixiJS Application
   * @param {HTMLElement} container - DOM element to attach canvas to
   * @returns {Promise<void>}
   */
  async init(container) {
    if (this.initialized) {
      console.warn('Renderer already initialized');
      return;
    }

    try {
      if (!container) {
        throw new Error('Invalid container');
      }

      // Create PixiJS Application (v7 API)
      this.app = new PIXI.Application({
        width: CONFIG.CANVAS.WIDTH,
        height: CONFIG.CANVAS.HEIGHT,
        backgroundColor: CONFIG.CANVAS.BACKGROUND_COLOR,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true,
        powerPreference: 'high-performance',
      });

      // Append canvas to container
      container.appendChild(this.app.view);

      // Make canvas responsive
      this.resize();
      window.addEventListener('resize', () => this.resize());

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize renderer:', error);
      throw error;
    }
  }

  /**
   * Resize canvas to fit container while maintaining aspect ratio
   */
  resize() {
    if (!this.app || !this.app.view) return;

    const canvas = this.app.view;
    const parent = canvas.parentElement;
    
    if (!parent) return;

    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    
    // Calculate scale to fit while maintaining aspect ratio
    const scaleX = parentWidth / CONFIG.CANVAS.WIDTH;
    const scaleY = parentHeight / CONFIG.CANVAS.HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    // Apply scale
    canvas.style.width = `${CONFIG.CANVAS.WIDTH * scale}px`;
    canvas.style.height = `${CONFIG.CANVAS.HEIGHT * scale}px`;
  }

  /**
   * Get the main stage container
   * @returns {PIXI.Container}
   */
  getStage() {
    if (!this.app) {
      throw new Error('Renderer not initialized');
    }
    return this.app.stage;
  }

  /**
   * Get the ticker for game loop
   * @returns {PIXI.Ticker}
   */
  getTicker() {
    if (!this.app) {
      throw new Error('Renderer not initialized');
    }
    return this.app.ticker;
  }

  /**
   * Get the renderer instance
   * @returns {PIXI.Renderer}
   */
  getRenderer() {
    if (!this.app) {
      throw new Error('Renderer not initialized');
    }
    return this.app.renderer;
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.app) {
      window.removeEventListener('resize', () => this.resize());
      this.app.destroy(true, { children: true, texture: true, baseTexture: true });
      this.app = null;
      this.initialized = false;
    }
  }
}

export default Renderer;
