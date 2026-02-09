/**
 * Audio Module
 * 
 * Sound effect and music playback manager using Web Audio API.
 * Provides volume control and audio state management.
 */

import { CONFIG } from '../config.js';

export class AudioManager {
  constructor() {
    this.context = null;
    this.sounds = new Map();
    this.music = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.initialized = false;
    this.soundEnabled = true;
    this.musicEnabled = true;
  }

  /**
   * Initialize Web Audio API
   * Note: Must be called after user interaction due to browser autoplay policies
   */
  async init() {
    if (this.initialized) {
      console.warn('AudioManager already initialized');
      return;
    }

    try {
      // Create Audio Context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();

      // Create gain nodes for volume control
      this.masterGain = this.context.createGain();
      this.sfxGain = this.context.createGain();
      this.musicGain = this.context.createGain();

      // Set initial volumes
      this.masterGain.gain.value = CONFIG.AUDIO.VOLUME.MASTER;
      this.sfxGain.gain.value = CONFIG.AUDIO.VOLUME.SFX;
      this.musicGain.gain.value = CONFIG.AUDIO.VOLUME.MUSIC;

      // Connect gain nodes
      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error);
      throw error;
    }
  }

  /**
   * Resume audio context (required for browsers with autoplay policy)
   */
  async resume() {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  /**
   * Load a sound effect from URL
   * @param {string} name - Sound identifier
   * @param {string} url - URL to audio file
   * @returns {Promise<void>}
   */
  async loadSound(name, url) {
    if (!this.initialized) {
      throw new Error('AudioManager not initialized');
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      
      this.sounds.set(name, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound ${name}:`, error);
      throw error;
    }
  }

  /**
   * Play a sound effect
   * @param {string} name - Sound identifier
   * @param {Object} options - Playback options
   * @returns {AudioBufferSourceNode|null}
   */
  playSound(name, options = {}) {
    if (!this.initialized || !this.soundEnabled) {
      return null;
    }

    if (!this.sounds.has(name)) {
      return this.playSynth(name, options);
    }

    try {
      const buffer = this.sounds.get(name);
      const source = this.context.createBufferSource();
      
      source.buffer = buffer;
      source.loop = options.loop || false;
      
      // Apply volume if specified
      if (typeof options.volume === 'number') {
        const gainNode = this.context.createGain();
        gainNode.gain.value = options.volume;
        source.connect(gainNode);
        gainNode.connect(this.sfxGain);
      } else {
        source.connect(this.sfxGain);
      }
      
      source.start(0);
      return source;
    } catch (error) {
      console.error(`Failed to play sound ${name}:`, error);
      return null;
    }
  }

  playSynth(name, options = {}) {
    if (!this.context || !this.sfxGain) return null;

    const presets = {
      jump: { frequency: 520, duration: 0.12, type: 'square', volume: 0.25 },
      coin: { frequency: 880, duration: 0.08, type: 'triangle', volume: 0.2 },
      collision: { frequency: 180, duration: 0.2, type: 'sawtooth', volume: 0.35 }
    };

    const preset = presets[name] || { frequency: 440, duration: 0.08, type: 'sine', volume: 0.2 };
    const duration = options.duration || preset.duration;
    const frequency = options.frequency || preset.frequency;
    const type = options.type || preset.type;
    const volume = typeof options.volume === 'number' ? options.volume : preset.volume;

    try {
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

      const now = this.context.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGain);

      oscillator.start(now);
      oscillator.stop(now + duration);

      return oscillator;
    } catch (error) {
      console.error(`Failed to play synth sound ${name}:`, error);
      return null;
    }
  }

  /**
   * Set master volume
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setMasterVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Set sound effects volume
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setSFXVolume(volume) {
    if (this.sfxGain) {
      this.sfxGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Set music volume
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setMusicVolume(volume) {
    if (this.musicGain) {
      this.musicGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Mute all audio
   */
  mute() {
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
  }

  /**
   * Unmute audio (restore to previous volume)
   */
  unmute() {
    if (this.masterGain) {
      this.masterGain.gain.value = CONFIG.AUDIO.VOLUME.MASTER;
    }
  }

  /**
   * Check if audio is supported
   * @returns {boolean}
   */
  static isSupported() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Stop all playing sounds
    this.sounds.clear();
    
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.initialized = false;
  }
}

export default AudioManager;
