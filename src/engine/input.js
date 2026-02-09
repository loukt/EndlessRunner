/**
 * Input Module
 * 
 * Unified input handler for touch and mouse events.
 * Provides a simple tap/click interface for game controls.
 */

export class InputManager {
  constructor() {
    this.canvas = null;
    this.listeners = {};
    this.isPressed = false;
    this.pressStartTime = 0;
    this.lastTapTime = 0;
    this.doubleTapThreshold = 300; // ms
    this.tapThreshold = 200; // ms

    this.handlePressBound = null;
    this.handleReleaseBound = null;
    this.handleContextMenuBound = null;
  }

  /**
   * Initialize input event listeners
   * @param {HTMLElement} element - Element to attach listeners to (usually canvas)
   */
  init(element) {
    if (!element || typeof element.addEventListener !== 'function') {
      throw new Error('Invalid canvas');
    }

    this.canvas = element;
    if (!this.listeners || typeof this.listeners !== 'object' || Array.isArray(this.listeners)) {
      this.listeners = {};
    }

    this.handlePressBound = this.handlePress.bind(this);
    this.handleReleaseBound = this.handleRelease.bind(this);
    this.handleContextMenuBound = (e) => e.preventDefault();

    // Press starts on the canvas
    this.canvas.addEventListener('mousedown', this.handlePressBound);
    this.canvas.addEventListener('touchstart', this.handlePressBound, { passive: false });

    // Release can happen outside the canvas
    document.addEventListener('mouseup', this.handleReleaseBound);
    document.addEventListener('touchend', this.handleReleaseBound, { passive: false });

    // Prevent context menu on long press
    this.canvas.addEventListener('contextmenu', this.handleContextMenuBound);
  }

  /**
   * Handle press/touch start
   * @param {Event} event
   */
  handlePress(event) {
    if (event && event.defaultPrevented) {
      return;
    }

    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    if (this.isPressed) return;
    this.isPressed = true;

    const now = Date.now();
    const isDoubleTap = now - this.lastTapTime < this.doubleTapThreshold;
    this.lastTapTime = now;
    this.pressStartTime = now;
    this.pendingDoubleTap = isDoubleTap;

    const position = this.getInputPosition(event);
    this.emit('press', { x: position.x, y: position.y });
  }

  /**
   * Handle release/touch end
   * @param {Event} event
   */
  handleRelease(event) {
    if (!this.isPressed) return;
    
    this.isPressed = false;

    const shouldIgnore = !!(event && event.defaultPrevented);

    const now = Date.now();
    const duration = now - (this.pressStartTime || now);
    const position = this.getInputPosition(event);

    if (shouldIgnore) {
      this.pendingDoubleTap = false;
      return;
    }

    this.emit('release', { x: position.x, y: position.y });

    // Tap is a quick press+release
    if (duration <= this.tapThreshold) {
      this.emit('tap', { x: position.x, y: position.y });
      if (this.pendingDoubleTap) {
        this.emit('doubletap', { x: position.x, y: position.y });
      }
    }

    this.pendingDoubleTap = false;
  }

  /**
   * Get input position from mouse or touch event
   * @param {Event} event
   * @returns {{x: number, y: number}}
   */
  getInputPosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if (event.touches && event.touches.length > 0) {
      // Touch event
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (event.changedTouches && event.changedTouches.length > 0) {
      // Touch end event
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else {
      // Mouse event
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  /**
   * Register event listener
   * @param {string} eventType - Event type (tap, press, release)
   * @param {Function} callback - Callback function
   */
  on(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  /**
   * Unregister event listener
   * @param {string} eventType
   * @param {Function} callback
   */
  off(eventType, callback) {
    const callbacks = this.listeners[eventType];
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emit event to all registered listeners
   * @param {string} eventType
   * @param {Object} data
   */
  emit(eventType, data) {
    const callbacks = this.listeners[eventType];
    if (!callbacks) return;
    callbacks.forEach((callback) => callback(data));
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    if (this.canvas && this.handlePressBound && this.handleReleaseBound) {
      this.canvas.removeEventListener('mousedown', this.handlePressBound);
      this.canvas.removeEventListener('touchstart', this.handlePressBound);
      this.canvas.removeEventListener('contextmenu', this.handleContextMenuBound);

      document.removeEventListener('mouseup', this.handleReleaseBound);
      document.removeEventListener('touchend', this.handleReleaseBound);
    }

    this.listeners = {};
    this.canvas = null;
    this.handlePressBound = null;
    this.handleReleaseBound = null;
    this.handleContextMenuBound = null;
  }
}

export default InputManager;
