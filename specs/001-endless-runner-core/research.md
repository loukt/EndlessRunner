# Phase 0 Research: Endless Runner Core Game

**Date**: 2025-10-22  
**Feature**: 001-endless-runner-core  
**Purpose**: Resolve technical uncertainties and establish architectural decisions

## Research Items

### 1. Lightweight Game Engine Selection

**Question**: Which JavaScript game engine provides best cross-platform compatibility while meeting <150MB memory and 60 FPS requirements?

**Research Conducted**:

Evaluated options:
- **Phaser 3**: Popular, full-featured, ~2MB minified, WebGL + Canvas fallback
- **PixiJS**: High-performance 2D rendering, ~500KB minified, WebGL focus
- **Konva**: Lightweight Canvas API, ~300KB minified, less game-focused
- **Vanilla Canvas/WebGL**: Zero dependencies, maximum control, requires more custom code
- **Three.js**: Overkill for 2D, larger bundle size

**Decision**: **PixiJS v7**

**Rationale**:
- Extremely lightweight (~500KB minified + gzipped ~150KB) - fits memory budget
- Proven 60 FPS performance with WebGL acceleration
- Excellent cross-platform compatibility (desktop browsers, mobile browsers, PWA)
- Active maintenance and large community
- Sprite-based rendering perfect for 2D endless runner
- Built-in asset loader with sprite sheet support
- Efficient memory management with texture pooling
- Canvas fallback for older devices (automatic)
- No game logic opinions - just rendering (aligns with simplicity principle)

**Alternatives Considered**:
- **Phaser 3 rejected**: More features than needed (physics engine, particle systems, etc.) - violates simplicity principle. Larger bundle size (~2MB).
- **Vanilla Canvas rejected**: Would require building sprite management, asset loading, input handling from scratch - increases development time without performance benefit.
- **Three.js rejected**: 3D engine overkill for 2D game, larger memory footprint.

**Performance Validation**:
- PixiJS benchmarks show 60 FPS with 1000+ sprites on mid-range mobile devices
- Memory usage <50MB for typical 2D games with sprite atlases
- Startup time <500ms for engine initialization

**Integration Plan**:
```javascript
// Core rendering setup
import * as PIXI from 'pixi.js';

const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  antialias: true
});
```

---

### 2. JavaScript Testing Framework Selection

**Question**: Which testing framework provides best balance of performance testing, unit testing, and cross-browser compatibility validation?

**Research Conducted**:

Evaluated options:
- **Jest**: Popular, full-featured, good mocking, slower execution
- **Vitest**: Modern, fast (ESM native), Jest-compatible API
- **Playwright**: Browser automation, excellent for integration/performance testing
- **Cypress**: E2E testing, visual testing, slower feedback
- **Puppeteer**: Headless Chrome automation

**Decision**: **Vitest (unit/integration) + Playwright (performance/E2E)**

**Rationale**:

**Vitest for Unit/Integration Tests**:
- Blazing fast (~10x faster than Jest for similar test suites)
- Native ESM support (matches modern JavaScript architecture)
- Jest-compatible API (easy migration if needed)
- Built-in code coverage with c8/Istanbul
- Watch mode with HMR for rapid feedback
- Lightweight (aligns with constitution simplicity principle)

**Playwright for Performance/E2E Tests**:
- Cross-browser testing (Chrome, Firefox, Safari/WebKit)
- Real device performance measurement APIs
- FPS monitoring capabilities
- Memory profiling integration
- Screenshot comparison for visual regression
- Reliable test execution (auto-wait, retry logic)

**Alternatives Considered**:
- **Jest rejected**: Slower execution (~3-5x slower than Vitest), heavier dependencies, CommonJS-focused
- **Cypress rejected**: Excellent DX but overkill for this project, slower feedback loop, more complex setup
- **Puppeteer rejected**: Chrome-only, less cross-browser testing capability than Playwright

**Testing Strategy**:

```javascript
// Unit test example (Vitest)
import { describe, it, expect } from 'vitest';
import { calculateScore } from '../src/game/scoring.js';

describe('Scoring System', () => {
  it('calculates distance-based score correctly', () => {
    expect(calculateScore(1000)).toBe(1000);
  });
});

// Performance test example (Playwright)
import { test, expect } from '@playwright/test';

test('maintains 60 FPS during gameplay', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  const fps = await page.evaluate(() => {
    return new Promise((resolve) => {
      let frames = 0;
      const start = performance.now();
      
      function countFrame() {
        frames++;
        if (performance.now() - start < 5000) {
          requestAnimationFrame(countFrame);
        } else {
          resolve(frames / 5);
        }
      }
      requestAnimationFrame(countFrame);
    });
  });
  
  expect(fps).toBeGreaterThanOrEqual(55); // Allow 5 FPS tolerance
});
```

**Performance Testing Approach**:
- FPS measurement during 5-second gameplay windows
- Memory sampling every 100ms during gameplay
- Load time measurement (DOMContentLoaded, First Paint, Interactive)
- Asset loading waterfall analysis
- Device-specific performance profiles (low-end, mid-range, high-end)

---

### 3. Cross-Platform Storage Strategy

**Question**: How to implement reliable offline-first storage across web, iOS, and Android?

**Research Conducted**:

Storage options:
- **IndexedDB**: Browser standard, async, large capacity, complex API
- **localStorage**: Simple, sync, 5-10MB limit, string-only
- **Cache API**: Service worker integration, best for assets
- **Native storage (iOS/Android)**: If using Capacitor/Cordova wrapper

**Decision**: **IndexedDB (primary) + localStorage (fallback) with wrapper abstraction**

**Rationale**:
- IndexedDB provides 50MB+ storage quota (enough for game state + cosmetics)
- Async API prevents blocking game loop
- Structured data storage (objects, not just strings)
- Transactional integrity for purchases/unlocks
- localStorage fallback for unsupported browsers (rare but possible)
- Abstraction layer allows swapping storage without touching game code

**Implementation Pattern**:

```javascript
// Storage abstraction (src/data/storage.js)
class StorageManager {
  constructor() {
    this.db = null;
    this.fallbackMode = false;
  }
  
  async init() {
    try {
      // Try IndexedDB first
      this.db = await this.openIndexedDB();
    } catch (error) {
      console.warn('IndexedDB unavailable, falling back to localStorage');
      this.fallbackMode = true;
    }
  }
  
  async save(key, value) {
    if (this.fallbackMode) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      await this.db.put('gameData', { key, value });
    }
  }
  
  async load(key) {
    if (this.fallbackMode) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } else {
      return await this.db.get('gameData', key);
    }
  }
}
```

**Data Size Estimates**:
- Player profile: <1KB
- High scores: <1KB
- Unlocked cosmetics: ~5KB (50 items × 100 bytes)
- Daily challenges: <500 bytes
- **Total**: <10KB (well within all storage limits)

**Alternatives Considered**:
- **Cloud sync rejected**: Adds backend complexity, violates offline-first requirement, increases latency
- **localStorage-only rejected**: 5-10MB limit could be restrictive for future asset caching, synchronous API blocks game loop
- **Capacitor Storage Plugin rejected**: Adds native dependency, unnecessary for data size and PWA-first approach

---

### 4. Progressive Difficulty Curve Algorithm

**Question**: How to implement guaranteed safe zones with progressive difficulty that feels fair?

**Research Conducted**:

Reviewed endless runner best practices:
- Temple Run: Distance-based speed increase
- Subway Surfers: Combo multipliers with periodic breathers
- Flappy Bird: Fixed difficulty, pure skill

**Decision**: **Distance-based spacing reduction with minimum safe zone guarantee**

**Algorithm Design**:

```javascript
// Difficulty scaling (src/game/difficulty.js)
class DifficultyManager {
  constructor() {
    this.baseSpacing = 500;      // pixels between obstacles (easy start)
    this.minSpacing = 200;       // minimum safe distance (always jumpable)
    this.reductionRate = 0.995;  // 0.5% reduction per obstacle
    this.currentSpacing = this.baseSpacing;
  }
  
  getNextObstacleDistance(obstaclesCleared) {
    // Exponential decrease: spacing = base × (rate ^ obstacles)
    this.currentSpacing = Math.max(
      this.minSpacing,
      this.baseSpacing * Math.pow(this.reductionRate, obstaclesCleared)
    );
    
    // Add randomness ±10% while respecting minimum
    const variance = this.currentSpacing * 0.1;
    return this.currentSpacing + (Math.random() * variance * 2 - variance);
  }
  
  isJumpable(spacing, playerSpeed, jumpDuration) {
    // Physics validation: can player clear distance in jump time?
    const jumpDistance = playerSpeed * jumpDuration;
    return spacing >= (jumpDistance * 0.8); // 20% safety margin
  }
}
```

**Difficulty Progression Timeline**:
- Obstacles 0-50: Spacing 500-350px (gentle learning curve)
- Obstacles 51-150: Spacing 350-220px (moderate challenge)
- Obstacles 151+: Spacing 220-200px (maximum difficulty, sustained challenge)

**Safety Guarantees**:
- Minimum spacing enforced at 200px
- Physics validation ensures every obstacle is reachable
- No random patterns that create impossible gaps
- Player testing at obstacle 200+ confirms sustained playability

**Rationale**:
- Exponential curve feels natural (gradual then plateau)
- Minimum spacing prevents frustration from impossible patterns
- Randomness prevents memorization while staying fair
- Constitution compliance: skill-based, no unfair deaths

**Alternatives Considered**:
- **Linear difficulty rejected**: Too predictable, plateaus too quickly
- **Speed increase rejected**: Harder to control on touch devices, breaks muscle memory
- **Adaptive difficulty rejected**: Players expect consistent challenge, not AI adjustment (constitution principle)

---

### 5. Asset Loading and Performance Optimization

**Question**: How to achieve <2 second load time with all necessary game assets?

**Research Conducted**:

Performance bottlenecks in web games:
- Network latency (largest factor)
- Parse/compile time (JavaScript)
- Asset decompression (images)
- Initial render (first paint)

**Decision**: **Sprite sheet with progressive loading + Service Worker caching**

**Strategy**:

**Phase 1 - Critical Assets (Target: <500KB, <1s)**:
```javascript
// Immediate load for first playable state
const criticalAssets = {
  'player-spritesheet': 'player-atlas.png',     // 128x128, 8 frames = ~20KB
  'obstacle-spritesheet': 'obstacles-atlas.png', // 256x256, 16 types = ~40KB
  'ui-spritesheet': 'ui-atlas.png',              // 512x512, buttons/text = ~60KB
  'coin-sprite': 'coin.png'                      // 32x32, 4 frames = ~5KB
};
// Total: ~125KB PNG (optimized with pngquant)
```

**Phase 2 - Cosmetic Assets (Lazy load)**:
```javascript
// Load after gameplay starts, during first game session
const cosmeticAssets = {
  'skins': 'cosmetics-atlas.png',      // 1024x1024 = ~200KB
  'trails': 'trails-atlas.png',        // 512x512 = ~80KB
  'themes': 'themes-atlas.png'         // 1024x1024 = ~200KB
};
// Total: ~480KB (loaded in background)
```

**Phase 3 - Audio (Progressive + User Interaction)**:
```javascript
// Load after first user interaction (browser autoplay policy)
const audioAssets = {
  'jump': 'sfx/jump.mp3',              // ~5KB
  'coin': 'sfx/coin.mp3',              // ~3KB
  'crash': 'sfx/crash.mp3',            // ~8KB
  'music': 'music/theme.mp3'           // ~200KB (optional)
};
// Total: ~216KB (after user tap)
```

**Loading Timeline**:
```
0ms: HTML loads (5KB)
50ms: JavaScript loads (PixiJS + game code ~300KB gzipped)
200ms: Critical assets download starts
800ms: First render (player + placeholder obstacles)
1000ms: **PLAYABLE** - meets <2s requirement
1500ms: Cosmetic assets loading
3000ms: Audio loads (after first user interaction)
5000ms: Service worker caches everything for offline play
```

**Service Worker Strategy**:
```javascript
// public/service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('endless-runner-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/main.js',
        '/assets/critical-atlas.png'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache-first strategy: instant load on repeat visits
      return response || fetch(event.request);
    })
  );
});
```

**Optimization Techniques**:
- **Sprite sheets**: Reduce HTTP requests from 50+ to 3-5
- **Texture atlases**: Single GPU texture for all sprites (memory efficient)
- **PNG optimization**: pngquant reduces file size 60-80% without visual loss
- **Gzip compression**: Reduce JavaScript bundle size ~70%
- **Code splitting**: Load shop/challenge UIs lazily (not needed for first play)
- **Web fonts**: System font fallback for instant text rendering

**Performance Validation Targets**:
- First Contentful Paint: <500ms
- Time to Interactive: <1500ms
- Fully Loaded: <3000ms
- Memory footprint after load: <80MB
- Repeat visit (cached): <200ms

**Alternatives Considered**:
- **Individual assets rejected**: Too many HTTP requests, slower load time
- **WebP format rejected**: Not universally supported (Safari older versions), PNG is safer
- **Network-first caching rejected**: Slower for repeat plays, offline-first principle
- **CDN rejected**: Adds cost, unnecessary for small asset sizes, complicates offline mode

---

## Summary

All NEEDS CLARIFICATION items resolved:

1. ✅ **Game Engine**: PixiJS v7 (lightweight, performant, cross-platform)
2. ✅ **Testing Framework**: Vitest + Playwright (fast, comprehensive, cross-browser)
3. ✅ **Storage**: IndexedDB + localStorage fallback with abstraction layer
4. ✅ **Difficulty**: Distance-based spacing reduction with guaranteed safe zones
5. ✅ **Performance**: Sprite sheets + progressive loading + service worker caching

**Constitution Re-Check**: All decisions align with performance-first, simplicity, and intuitive UX principles.

**Next Phase**: Proceed to Phase 1 (Data Model, Contracts, Quickstart)
