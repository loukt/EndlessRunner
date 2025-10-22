/**
 * Unit tests for InputManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputManager } from '../../../src/engine/input.js';

describe('InputManager', () => {
  let inputManager;
  let canvas;

  beforeEach(() => {
    // Create mock canvas
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    inputManager = new InputManager();
    inputManager.init(canvas);
  });

  afterEach(() => {
    if (inputManager) {
      inputManager.destroy();
    }
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  });

  describe('init', () => {
    it('should initialize input manager', () => {
      expect(inputManager.canvas).toBe(canvas);
      expect(inputManager.listeners).toBeDefined();
    });

    it('should throw error if canvas is invalid', () => {
      const manager = new InputManager();
      expect(() => manager.init(null)).toThrow('Invalid canvas');
    });

    it('should attach event listeners', () => {
      const addEventSpy = vi.spyOn(canvas, 'addEventListener');
      const manager = new InputManager();
      
      manager.init(canvas);

      expect(addEventSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(addEventSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: false });
    });
  });

  describe('event handling', () => {
    it('should emit press event on mouse down', () => {
      const pressSpy = vi.fn();
      inputManager.on('press', pressSpy);

      const event = new MouseEvent('mousedown', {
        clientX: 400,
        clientY: 300
      });
      canvas.dispatchEvent(event);

      expect(pressSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number)
        })
      );
    });

    it('should emit release event on mouse up', () => {
      const releaseSpy = vi.fn();
      inputManager.on('release', releaseSpy);

      const pressEvent = new MouseEvent('mousedown', { clientX: 400, clientY: 300 });
      const releaseEvent = new MouseEvent('mouseup', { clientX: 400, clientY: 300 });
      
      canvas.dispatchEvent(pressEvent);
      document.dispatchEvent(releaseEvent);

      expect(releaseSpy).toHaveBeenCalled();
    });

    it('should emit tap event on quick press/release', () => {
      vi.useFakeTimers();
      const tapSpy = vi.fn();
      inputManager.on('tap', tapSpy);

      const pressEvent = new MouseEvent('mousedown', { clientX: 400, clientY: 300 });
      const releaseEvent = new MouseEvent('mouseup', { clientX: 400, clientY: 300 });
      
      canvas.dispatchEvent(pressEvent);
      vi.advanceTimersByTime(100); // Quick tap (< 200ms)
      document.dispatchEvent(releaseEvent);

      expect(tapSpy).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('should emit press event on touch start', () => {
      const pressSpy = vi.fn();
      inputManager.on('press', pressSpy);

      const event = new TouchEvent('touchstart', {
        touches: [{ clientX: 400, clientY: 300 }]
      });
      canvas.dispatchEvent(event);

      expect(pressSpy).toHaveBeenCalled();
    });

    it('should handle multiple touch points (use first)', () => {
      const pressSpy = vi.fn();
      inputManager.on('press', pressSpy);

      const event = new TouchEvent('touchstart', {
        touches: [
          { clientX: 400, clientY: 300 },
          { clientX: 500, clientY: 400 }
        ]
      });
      canvas.dispatchEvent(event);

      expect(pressSpy).toHaveBeenCalledTimes(1);
    });

    it('should prevent context menu on long press', () => {
      const contextMenuEvent = new MouseEvent('contextmenu');
      const preventDefaultSpy = vi.spyOn(contextMenuEvent, 'preventDefault');

      canvas.dispatchEvent(contextMenuEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('double tap detection', () => {
    it('should detect double tap within 300ms', () => {
      vi.useFakeTimers();
      const doubleTapSpy = vi.fn();
      inputManager.on('doubletap', doubleTapSpy);

      // First tap
      canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 400, clientY: 300 }));
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 400, clientY: 300 }));

      // Second tap within 300ms
      vi.advanceTimersByTime(200);
      canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 400, clientY: 300 }));
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 400, clientY: 300 }));

      expect(doubleTapSpy).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('should not detect double tap after 300ms', () => {
      vi.useFakeTimers();
      const doubleTapSpy = vi.fn();
      inputManager.on('doubletap', doubleTapSpy);

      // First tap
      canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 400, clientY: 300 }));
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 400, clientY: 300 }));

      // Second tap after 300ms
      vi.advanceTimersByTime(400);
      canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 400, clientY: 300 }));
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 400, clientY: 300 }));

      expect(doubleTapSpy).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('getInputPosition', () => {
    it('should calculate position relative to canvas', () => {
      const rect = canvas.getBoundingClientRect();
      const event = new MouseEvent('mousedown', {
        clientX: rect.left + 400,
        clientY: rect.top + 300
      });

      const position = inputManager.getInputPosition(event);

      expect(position.x).toBeCloseTo(400, 1);
      expect(position.y).toBeCloseTo(300, 1);
    });

    it('should handle touch events', () => {
      const rect = canvas.getBoundingClientRect();
      const event = new TouchEvent('touchstart', {
        touches: [{
          clientX: rect.left + 400,
          clientY: rect.top + 300
        }]
      });

      const position = inputManager.getInputPosition(event);

      expect(position.x).toBeCloseTo(400, 1);
      expect(position.y).toBeCloseTo(300, 1);
    });
  });

  describe('event emitter', () => {
    it('should register event listeners', () => {
      const callback = vi.fn();
      inputManager.on('tap', callback);

      expect(inputManager.listeners.tap).toContain(callback);
    });

    it('should unregister event listeners', () => {
      const callback = vi.fn();
      inputManager.on('tap', callback);
      inputManager.off('tap', callback);

      expect(inputManager.listeners.tap).not.toContain(callback);
    });

    it('should handle multiple listeners for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      inputManager.on('tap', callback1);
      inputManager.on('tap', callback2);

      inputManager.emit('tap', { x: 400, y: 300 });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should pass data to event listeners', () => {
      const callback = vi.fn();
      inputManager.on('tap', callback);

      const data = { x: 400, y: 300, custom: 'value' };
      inputManager.emit('tap', data);

      expect(callback).toHaveBeenCalledWith(data);
    });
  });

  describe('destroy', () => {
    it('should remove all event listeners', () => {
      const removeEventSpy = vi.spyOn(canvas, 'removeEventListener');

      inputManager.destroy();

      expect(removeEventSpy).toHaveBeenCalled();
    });

    it('should clear all registered callbacks', () => {
      const callback = vi.fn();
      inputManager.on('tap', callback);

      inputManager.destroy();

      expect(Object.keys(inputManager.listeners).length).toBe(0);
    });

    it('should handle destroy when not initialized', () => {
      const manager = new InputManager();
      expect(() => manager.destroy()).not.toThrow();
    });
  });
});
