/**
 * Input Module
 * 
 * Unified input handler for touch and mouse events.
 * Provides a simple tap/click interface for game controls.
 */

export class InputManager {
  constructor() {
    this.listeners = new Map();
    this.isPressed = false;
    this.lastTapTime = 0;
    this.doubleTapThreshold = 300; // ms
  }

  /**
   * Initialize input event listeners
   * @param {HTMLElement} element - Element to attach listeners to (usually canvas)
   */
  init(element) {
    if (!element) {
      throw new Error('Element is required for InputManager initialization');
    }

    this.element = element;

    // Mouse events
    this.element.addEventListener('mousedown', this.handlePress.bind(this));
    this.element.addEventListener('mouseup', this.handleRelease.bind(this));
    
    // Touch events
    this.element.addEventListener('touchstart', this.handlePress.bind(this), { passive: true });
    this.element.addEventListener('touchend', this.handleRelease.bind(this), { passive: true });
    
    // Prevent context menu on long press
    this.element.addEventListener('contextmenu', e => e.preventDefault());
  }

  /**
   * Handle press/touch start
   * @param {Event} event
   */
  handlePress(event) {
    event.preventDefault();
    
    if (this.isPressed) return; // Prevent multiple simultaneous presses
    
    this.isPressed = true;
    const now = Date.now();
    
    // Check for double tap
    const isDoubleTap = (now - this.lastTapTime) < this.doubleTapThreshold;
    this.lastTapTime = now;

    // Get tap position
    const position = this.getInputPosition(event);

    // Emit tap event
    this.emit('tap', { position, isDoubleTap });
    this.emit('press', { position });
  }

  /**
   * Handle release/touch end
   * @param {Event} event
   */
  handleRelease(event) {
    if (!this.isPressed) return;
    
    this.isPressed = false;
    
    const position = this.getInputPosition(event);
    this.emit('release', { position });
  }

  /**
   * Get input position from mouse or touch event
   * @param {Event} event
   * @returns {{x: number, y: number}}
   */
  getInputPosition(event) {
    const rect = this.element.getBoundingClientRect();
    
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
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  /**
   * Unregister event listener
   * @param {string} eventType
   * @param {Function} callback
   */
  off(eventType, callback) {
    if (!this.listeners.has(eventType)) return;
    
    const callbacks = this.listeners.get(eventType);
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
    if (!this.listeners.has(eventType)) return;
    
    const callbacks = this.listeners.get(eventType);
    callbacks.forEach(callback => callback(data));
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    if (this.element) {
      this.element.removeEventListener('mousedown', this.handlePress);
      this.element.removeEventListener('mouseup', this.handleRelease);
      this.element.removeEventListener('touchstart', this.handlePress);
      this.element.removeEventListener('touchend', this.handleRelease);
      this.element.removeEventListener('contextmenu', e => e.preventDefault());
    }
    
    this.listeners.clear();
    this.element = null;
  }
}

export default InputManager;
