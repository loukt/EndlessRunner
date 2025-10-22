# Quickstart Guide: Endless Runner Development

**Feature**: 001-endless-runner-core  
**Last Updated**: 2025-10-22

## Overview

This guide helps developers set up the Endless Runner development environment and understand the architecture. Target audience: developers implementing the game from [spec.md](spec.md) using the technical decisions from [research.md](research.md).

---

## Prerequisites

### Required Tools

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ (comes with Node.js)
- **Git**: Latest version
- **Modern Browser**: Chrome 90+, Firefox 88+, or Safari 14+

### Optional Tools (Testing)

- **Android Studio**: For testing mobile PWA on Android emulator
- **Xcode**: For testing on iOS Simulator (macOS only)

### Recommended VS Code Extensions

- ESLint (code linting)
- Prettier (code formatting)
- Live Server (local development server)
- Playwright Test for VS Code (test execution)

---

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd EndlessRunner

# Checkout feature branch
git checkout 001-endless-runner-core

# Install dependencies
npm install
```

### 2. Project Structure

```
EndlessRunner/
├── src/                 # Game source code
│   ├── engine/          # Core rendering and physics
│   ├── game/            # Game-specific logic
│   ├── ui/              # User interface components
│   ├── data/            # Data persistence
│   ├── iap/             # In-app purchase integrations
│   ├── assets/          # Game assets (sprites, sounds)
│   ├── main.js          # Application entry point
│   └── config.js        # Configuration constants
├── public/              # Static web assets
│   ├── index.html       # Main HTML entry
│   ├── manifest.json    # PWA manifest
│   └── service-worker.js # Offline support
├── tests/               # Test suites
│   ├── unit/            # Unit tests (Vitest)
│   ├── integration/     # Integration tests
│   └── performance/     # Performance benchmarks (Playwright)
├── specs/               # Feature specifications
├── package.json         # Dependencies and scripts
├── vite.config.js       # Build configuration
└── playwright.config.js # Test configuration
```

### 3. Install Key Dependencies

```bash
# Core game engine
npm install pixi.js@7

# Testing frameworks
npm install --save-dev vitest @playwright/test

# Development tools
npm install --save-dev vite eslint prettier

# Build tools
npm install --save-dev @vitejs/plugin-basic-ssl
```

---

## Development Workflow

### Starting Development Server

```bash
# Start local dev server with hot reload
npm run dev

# Server starts at http://localhost:5173
# Game automatically reloads on file changes
```

**Expected Output**:
```
VITE v4.x.x  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.x:5173/
  ➜  Press h to show help
```

### First Playable Milestone

**Goal**: Display a running character that can jump on tap

**Minimal Implementation Steps**:

1. **Initialize PixiJS renderer** (`src/engine/renderer.js`):
```javascript
import * as PIXI from 'pixi.js';

export class Renderer {
  constructor(width, height) {
    this.app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x87CEEB, // Sky blue
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });
    
    document.body.appendChild(this.app.view);
  }
  
  getStage() {
    return this.app.stage;
  }
  
  getTicker() {
    return this.app.ticker;
  }
}
```

2. **Create player character** (`src/game/player.js`):
```javascript
import * as PIXI from 'pixi.js';

export class Player {
  constructor(x, y) {
    // Placeholder: colored rectangle (replace with sprite later)
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0xFF0000); // Red
    this.sprite.drawRect(0, 0, 50, 50);
    this.sprite.endFill();
    this.sprite.x = x;
    this.sprite.y = y;
    
    this.velocityY = 0;
    this.isJumping = false;
    this.gravity = 0.5;
    this.jumpStrength = -12;
    this.groundY = y;
  }
  
  jump() {
    if (!this.isJumping) {
      this.velocityY = this.jumpStrength;
      this.isJumping = true;
    }
  }
  
  update() {
    // Apply gravity
    this.velocityY += this.gravity;
    this.sprite.y += this.velocityY;
    
    // Ground collision
    if (this.sprite.y >= this.groundY) {
      this.sprite.y = this.groundY;
      this.velocityY = 0;
      this.isJumping = false;
    }
  }
}
```

3. **Input handling** (`src/engine/input.js`):
```javascript
export class InputManager {
  constructor(renderer) {
    this.listeners = [];
    
    // Touch and click unified
    const handleInput = () => {
      this.listeners.forEach(callback => callback());
    };
    
    renderer.app.view.addEventListener('click', handleInput);
    renderer.app.view.addEventListener('touchstart', handleInput);
  }
  
  onJump(callback) {
    this.listeners.push(callback);
  }
}
```

4. **Game loop** (`src/main.js`):
```javascript
import { Renderer } from './engine/renderer.js';
import { InputManager } from './engine/input.js';
import { Player } from './game/player.js';

// Initialize
const renderer = new Renderer(800, 600);
const input = new InputManager(renderer);
const player = new Player(100, 450); // x=100, groundY=450

renderer.getStage().addChild(player.sprite);

// Input binding
input.onJump(() => player.jump());

// Game loop
renderer.getTicker().add(() => {
  player.update();
});
```

**Test**: Run `npm run dev`, open browser, click/tap to see character jump.

---

## Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Example Unit Test** (`tests/unit/game/scoring.test.js`):
```javascript
import { describe, it, expect } from 'vitest';
import { calculateScore } from '../../../src/game/scoring.js';

describe('Scoring System', () => {
  it('returns distance as score', () => {
    expect(calculateScore(1000)).toBe(1000);
  });
  
  it('handles zero distance', () => {
    expect(calculateScore(0)).toBe(0);
  });
  
  it('handles negative distance gracefully', () => {
    expect(calculateScore(-100)).toBe(0);
  });
});
```

### Performance Tests (Playwright)

```bash
# Run performance benchmarks
npm run test:perf

# Run specific test file
npx playwright test tests/performance/fps.test.js
```

**Example Performance Test** (`tests/performance/fps.test.js`):
```javascript
import { test, expect } from '@playwright/test';

test('maintains 60 FPS during gameplay', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Start game
  await page.click('canvas');
  
  // Measure FPS over 5 seconds
  const avgFPS = await page.evaluate(() => {
    return new Promise((resolve) => {
      let frames = 0;
      const startTime = performance.now();
      
      function measureFrame() {
        frames++;
        const elapsed = performance.now() - startTime;
        
        if (elapsed < 5000) {
          requestAnimationFrame(measureFrame);
        } else {
          resolve(frames / (elapsed / 1000));
        }
      }
      
      requestAnimationFrame(measureFrame);
    });
  });
  
  console.log(`Average FPS: ${avgFPS.toFixed(2)}`);
  expect(avgFPS).toBeGreaterThanOrEqual(55); // 55-60 FPS acceptable
});
```

### Integration Tests

```bash
# Run integration tests (full user flows)
npm run test:integration
```

---

## Building for Production

### Build Process

```bash
# Create production build
npm run build

# Output directory: dist/
# - Minified JavaScript bundle
# - Optimized assets
# - PWA manifest and service worker
```

### Build Optimization

**Vite Configuration** (`vite.config.js`):
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2015', // Broad browser support
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        dead_code: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'pixi': ['pixi.js'] // Separate vendor chunk for caching
        }
      }
    },
    chunkSizeWarningLimit: 500 // Warn if chunk > 500KB
  },
  server: {
    port: 5173
  }
});
```

**Expected Build Output**:
```
dist/
├── index.html          (~3KB)
├── assets/
│   ├── main-[hash].js  (~50KB gzipped - game code)
│   ├── pixi-[hash].js  (~150KB gzipped - PixiJS)
│   └── critical-atlas-[hash].png (~125KB - sprites)
├── manifest.json
└── service-worker.js
```

**Total Bundle Size**: ~325KB gzipped (meets performance budget)

---

## PWA Deployment

### Testing PWA Locally

```bash
# Build production version
npm run build

# Serve with HTTPS (required for PWA features)
npm run preview:https

# Open https://localhost:4173 in browser
# Use browser DevTools > Application > Service Workers to verify PWA registration
```

### PWA Manifest (`public/manifest.json`)

```json
{
  "name": "Endless Runner",
  "short_name": "Runner",
  "description": "Fast-paced 2D endless runner game",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#87CEEB",
  "theme_color": "#1099BB",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker Basics (`public/service-worker.js`)

```javascript
const CACHE_NAME = 'endless-runner-v1';
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/assets/main.js',
  '/assets/pixi.js',
  '/assets/critical-atlas.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

## Performance Monitoring

### Built-in Performance Tracking

Add to `src/engine/renderer.js`:

```javascript
export class Renderer {
  constructor(width, height) {
    // ... existing setup ...
    
    this.fpsHistory = [];
    this.lastFrameTime = performance.now();
    
    this.app.ticker.add(() => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      const fps = 1000 / delta;
      
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift(); // Keep last 60 frames
      }
      
      this.lastFrameTime = now;
    });
  }
  
  getAverageFPS() {
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this.fpsHistory.length;
  }
  
  getMinFPS() {
    return Math.min(...this.fpsHistory);
  }
}
```

### Memory Profiling

Use browser DevTools:
- Chrome: DevTools > Performance > Memory profiler
- Firefox: DevTools > Memory
- Safari: Develop > Show Web Inspector > Timelines > Memory

**Key Metrics to Monitor**:
- **Heap Size**: Should stay < 150MB on mobile
- **Detached DOM Nodes**: Should be near zero (check for leaks)
- **Event Listeners**: Clean up on scene transitions

---

## Debugging Tips

### Common Issues

**Issue**: Game doesn't start / black screen
- **Check**: Browser console for errors
- **Solution**: Verify PixiJS loaded correctly (`console.log(PIXI.VERSION)`)

**Issue**: Low FPS (< 55)
- **Check**: Too many sprites on screen
- **Solution**: Use sprite pooling, texture atlases, reduce particle effects

**Issue**: Touch input not working on mobile
- **Check**: `touchstart` listener attached
- **Solution**: Add `preventDefault()` to prevent scrolling

**Issue**: Assets not loading
- **Check**: Network tab in DevTools
- **Solution**: Verify asset paths, check CORS headers

### Debug Mode

Enable verbose logging:

```javascript
// src/config.js
export const DEBUG = {
  enabled: import.meta.env.DEV, // Only in development
  showFPS: true,
  showColliders: true,
  logInput: false
};
```

---

## Performance Checklist

Before submitting a pull request, verify:

- [ ] FPS ≥ 55 during active gameplay (run `npm run test:perf`)
- [ ] Memory usage < 150MB after 5 minutes play
- [ ] Load time < 2 seconds on throttled 3G network
- [ ] Game playable offline (test in DevTools > Network > Offline)
- [ ] No console errors or warnings
- [ ] All unit tests pass (`npm run test`)
- [ ] Constitution compliance checked (see [constitution.md](../../.specify/memory/constitution.md))

---

## Next Steps

1. **Implement P1 User Story (Core Gameplay)**:
   - Complete obstacle generation system
   - Add collision detection
   - Implement score display
   - Create game over screen

2. **Add Assets**:
   - Replace placeholder graphics with sprite sheets
   - Add sound effects and music
   - Create UI mockups

3. **Implement P2 User Story (Score Progression)**:
   - High score persistence
   - Achievement badges
   - Celebration animations

4. **Ready for `/speckit.tasks`**:
   - Generate detailed task breakdown
   - Assign implementation priorities
   - Begin sprint planning

---

## Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:perf        # Run performance benchmarks
npm run test:integration # Run integration tests

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run validate         # Lint + Test + Build

# PWA
npm run preview:https    # Test PWA with HTTPS locally
```

---

## Support and Resources

- **Technical Decisions**: See [research.md](research.md)
- **Data Schemas**: See [data-model.md](data-model.md) and [contracts/](contracts/)
- **Constitution**: See [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)
- **PixiJS Docs**: https://pixijs.download/release/docs/index.html
- **Vitest Docs**: https://vitest.dev/
- **Playwright Docs**: https://playwright.dev/

---

**Happy Coding! 🎮**
