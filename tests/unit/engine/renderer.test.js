/**
 * Unit tests for Renderer
 * 
 * Note: These tests are skipped because PixiJS requires WebGL which is not available in jsdom.
 * The renderer will be tested in the performance tests with Playwright in a real browser.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Renderer } from '../../../src/engine/renderer.js';
import { CONFIG } from '../../../src/config.js';

describe.skip('Renderer', () => {
  let renderer;
  let container;

  beforeEach(() => {
    // Create mock container
    container = document.createElement('div');
    container.id = 'game-container';
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    renderer = new Renderer();
  });

  afterEach(() => {
    if (renderer) {
      renderer.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('init', () => {
    it('should initialize PixiJS application', async () => {
      await renderer.init(container);

      expect(renderer.app).toBeDefined();
      expect(renderer.app.stage).toBeDefined();
      expect(renderer.app.ticker).toBeDefined();
    });

    it('should throw error if container is invalid', async () => {
      await expect(renderer.init(null)).rejects.toThrow('Invalid container');
    });

    it('should set canvas background color', async () => {
      await renderer.init(container);
      
      expect(renderer.app.renderer.background.color).toBeDefined();
    });

    it('should enable antialiasing', async () => {
      await renderer.init(container);
      
      expect(renderer.app.renderer.options.antialias).toBe(true);
    });

    it('should use device pixel ratio', async () => {
      await renderer.init(container);
      
      expect(renderer.app.renderer.resolution).toBeGreaterThan(0);
    });
  });

  describe('resize', () => {
    beforeEach(async () => {
      await renderer.init(container);
    });

    it('should resize canvas to container dimensions', () => {
      container.style.width = '1024px';
      container.style.height = '768px';

      renderer.resize();

      expect(renderer.app.renderer.width).toBe(1024);
      expect(renderer.app.renderer.height).toBe(768);
    });

    it('should maintain aspect ratio', () => {
      const aspectRatio = CONFIG.CANVAS.WIDTH / CONFIG.CANVAS.HEIGHT;
      
      container.style.width = '1000px';
      container.style.height = '1000px';

      renderer.resize();

      const canvasAspect = renderer.app.renderer.width / renderer.app.renderer.height;
      expect(Math.abs(canvasAspect - aspectRatio)).toBeLessThan(0.01);
    });

    it('should handle window resize events', () => {
      const resizeSpy = vi.spyOn(renderer, 'resize');

      window.dispatchEvent(new Event('resize'));

      expect(resizeSpy).toHaveBeenCalled();
    });
  });

  describe('getStage', () => {
    it('should return PixiJS stage', async () => {
      await renderer.init(container);

      const stage = renderer.getStage();

      expect(stage).toBeDefined();
      expect(stage.children).toBeDefined();
    });

    it('should throw error if not initialized', () => {
      expect(() => renderer.getStage()).toThrow('Renderer not initialized');
    });
  });

  describe('getTicker', () => {
    it('should return PixiJS ticker', async () => {
      await renderer.init(container);

      const ticker = renderer.getTicker();

      expect(ticker).toBeDefined();
      expect(ticker.add).toBeDefined();
      expect(ticker.remove).toBeDefined();
    });

    it('should throw error if not initialized', () => {
      expect(() => renderer.getTicker()).toThrow('Renderer not initialized');
    });
  });

  describe('getRenderer', () => {
    it('should return PixiJS renderer', async () => {
      await renderer.init(container);

      const pixiRenderer = renderer.getRenderer();

      expect(pixiRenderer).toBeDefined();
      expect(pixiRenderer.view).toBeDefined();
    });

    it('should throw error if not initialized', () => {
      expect(() => renderer.getRenderer()).toThrow('Renderer not initialized');
    });
  });

  describe('destroy', () => {
    it('should clean up PixiJS application', async () => {
      await renderer.init(container);
      const destroySpy = vi.spyOn(renderer.app, 'destroy');

      renderer.destroy();

      expect(destroySpy).toHaveBeenCalled();
    });

    it('should remove window resize listener', async () => {
      await renderer.init(container);
      const removeListenerSpy = vi.spyOn(window, 'removeEventListener');

      renderer.destroy();

      expect(removeListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should handle destroy when not initialized', () => {
      expect(() => renderer.destroy()).not.toThrow();
    });

    it('should clear texture cache', async () => {
      await renderer.init(container);
      // PixiJS automatically clears textures on destroy
      const app = renderer.app;

      renderer.destroy();

      expect(app.stage.destroyed).toBe(true);
    });
  });
});
