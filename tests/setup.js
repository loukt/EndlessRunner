/**
 * Test setup for Vitest
 * 
 * Configures jsdom environment and global mocks
 */

import { vi } from 'vitest';

// Mock IndexedDB for tests
global.indexedDB = {
  open: vi.fn(() => ({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
  })),
};

// Ensure localStorage is available
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
}
