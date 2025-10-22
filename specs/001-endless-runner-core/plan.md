# Implementation Plan: Endless Runner Core Game

**Branch**: `001-endless-runner-core` | **Date**: 2025-10-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-endless-runner-core/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a cross-platform (web + mobile) 2D endless runner game with immediate playability, score-based progression, cosmetic monetization, and daily challenges. Technical approach prioritizes lightweight architecture using HTML5 Canvas/WebGL with cross-platform compatibility through progressive web app (PWA) architecture. Focus on 60 FPS performance, <150MB memory footprint, and <2s load times across all platforms.

## Technical Context

**Language/Version**: JavaScript ES2022 (maximum browser/mobile compatibility)  
**Primary Dependencies**: NEEDS CLARIFICATION - lightweight game engine selection  
**Storage**: IndexedDB (web/PWA) + localStorage fallback; native storage APIs for wrapped mobile apps  
**Testing**: NEEDS CLARIFICATION - JavaScript testing framework selection  
**Target Platform**: Web (Chrome 90+, Safari 14+, Firefox 88+), iOS 14+, Android 8+ via PWA or thin native wrapper  
**Project Type**: Web application with mobile PWA deployment (Option 2 structure with shared game engine)  
**Performance Goals**: 60 FPS sustained gameplay, <2s initial load, <150MB memory, 16ms frame budget  
**Constraints**: Offline-first capable, no backend required for core gameplay, cross-platform asset compatibility  
**Scale/Scope**: Single-player game, ~50 cosmetic items, unlimited procedural gameplay, local-only data storage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Intuitive UX (NON-NEGOTIABLE)
- ✅ **PASS**: Game launches directly into gameplay with tap-to-jump mechanic (5 second rule)
- ✅ **PASS**: Single input control (tap/click only) - maximum simplicity
- ✅ **PASS**: Visual feedback clear (score display, collision detection, celebration animations)

### II. Safe & Appropriate Content
- ✅ **PASS**: Family-friendly art direction specified (colorful, non-violent)
- ✅ **PASS**: Content safety review process defined in constitution
- ⚠️ **VERIFY**: Asset creation pipeline TBD in Phase 1 (placeholder art for prototype)

### III. Performance-First Development
- ✅ **PASS**: 60 FPS target explicit in FR-020
- ✅ **PASS**: <2s load time requirement in FR-021
- ✅ **PASS**: <150MB memory budget established
- ✅ **PASS**: Performance profiling mandatory before merge
- ⚠️ **ACTION REQUIRED**: Must select lightweight game engine in Phase 0 research

### IV. Test-Driven Quality
- ✅ **PASS**: Automated testing for core mechanics required
- ✅ **PASS**: Performance benchmarks mandatory
- ✅ **PASS**: Device testing on minimum spec hardware required
- ⚠️ **ACTION REQUIRED**: Must define testing framework in Phase 0 research

### V. Simplicity & Clarity
- ✅ **PASS**: Single core mechanic (jump)
- ✅ **PASS**: Clear feature prioritization (P1-P4)
- ✅ **PASS**: No unnecessary complexity - cosmetics only, no power-ups
- ✅ **PASS**: Each feature has clear player benefit

**GATE STATUS**: ⚠️ CONDITIONAL PASS - Proceed to Phase 0 with 2 research items required

## Project Structure

### Documentation (this feature)

```text
specs/001-endless-runner-core/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── storage-schema.json
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── engine/              # Core game engine (rendering, physics, input)
│   ├── renderer.js      # Canvas/WebGL rendering system
│   ├── physics.js       # Collision detection, gravity, jump mechanics
│   ├── input.js         # Touch/click input handling
│   └── audio.js         # Sound effects and music playback
├── game/                # Game-specific logic
│   ├── player.js        # Player character controller
│   ├── obstacle.js      # Obstacle generation and management
│   ├── coin.js          # Collectible coin system
│   ├── scoring.js       # Distance-based score calculation
│   └── difficulty.js    # Progressive difficulty curve
├── ui/                  # User interface components
│   ├── menu.js          # Main menu, game over screen
│   ├── shop.js          # Cosmetic shop interface
│   ├── hud.js           # In-game score/coin display
│   └── challenges.js    # Daily challenge UI
├── data/                # Data management and persistence
│   ├── storage.js       # IndexedDB/localStorage wrapper
│   ├── profile.js       # Player profile management
│   ├── cosmetics.js     # Cosmetic item definitions and state
│   └── challenges.js    # Challenge generation and tracking
├── iap/                 # In-app purchase integration
│   ├── apple.js         # Apple IAP wrapper
│   ├── google.js        # Google Play Billing wrapper
│   └── stripe.js        # Stripe web payment wrapper
├── assets/              # Game assets (loaded dynamically)
│   ├── sprites/         # Character and obstacle sprites
│   ├── sounds/          # Sound effects and music
│   └── manifest.json    # Asset manifest for loading
├── main.js              # Application entry point
└── config.js            # Configuration constants

public/                  # Static web assets
├── index.html           # Main HTML entry
├── manifest.json        # PWA manifest
├── service-worker.js    # Offline capability
└── icons/               # PWA icons

tests/
├── unit/                # Unit tests for individual modules
│   ├── engine/
│   ├── game/
│   └── data/
├── integration/         # Integration tests for feature flows
│   ├── gameplay.test.js
│   ├── shop.test.js
│   └── challenges.test.js
└── performance/         # Performance benchmark tests
    ├── fps.test.js
    └── memory.test.js
```

**Structure Decision**: Web application with PWA deployment strategy. This provides maximum cross-platform compatibility with a single codebase. Native mobile apps can use thin wrappers (Capacitor/Cordova) around the web version if app store distribution is desired, but core experience runs in browser/PWA. Modular architecture separates engine (reusable), game logic (feature-specific), and platform integration (IAP, storage).

## Complexity Tracking

**No violations detected** - architecture aligns with constitution principles:
- Single codebase (simplicity principle)
- Lightweight PWA approach (performance principle)
- No backend complexity for core features (simplicity principle)
- Clear modular separation (maintainability without excess complexity)

---

## Phase 0: Research Summary ✅

**Status**: COMPLETE  
**Output**: [research.md](research.md)

**Resolved Decisions**:
1. ✅ **Game Engine**: PixiJS v7 (~500KB, WebGL-accelerated, proven 60 FPS performance)
2. ✅ **Testing Framework**: Vitest (unit/integration) + Playwright (performance/E2E)
3. ✅ **Storage Strategy**: IndexedDB + localStorage fallback with abstraction layer
4. ✅ **Difficulty Algorithm**: Distance-based spacing reduction (500px → 200px minimum)
5. ✅ **Asset Loading**: Sprite sheets + progressive loading + service worker caching

**Constitution Re-Check After Research**:
- ✅ **Performance**: PixiJS benchmarks confirm 60 FPS capability with <50MB memory
- ✅ **Simplicity**: Minimal dependencies, no game framework lock-in
- ✅ **Testing**: Fast feedback with Vitest, comprehensive coverage with Playwright

---

## Phase 1: Design Summary ✅

**Status**: COMPLETE  
**Outputs**: 
- [data-model.md](data-model.md) - 6 core entities with validation rules
- [contracts/storage-schema.json](contracts/storage-schema.json) - IndexedDB schema contract
- [quickstart.md](quickstart.md) - Developer onboarding guide

**Data Model Highlights**:
- **PlayerProfile**: Singleton record, tracks progress and coins (~1KB)
- **CosmeticItem**: ~50 predefined items with unlock states (~5KB)
- **DailyChallenge**: Auto-generated daily objectives with streak multipliers
- **Achievement**: Milestone-based rewards (score/games/coins/streak thresholds)
- **PurchaseTransaction**: IAP audit trail for Apple/Google/Stripe
- **Total Storage**: <20KB for all persistent data

**Storage Architecture**:
- Primary: IndexedDB (async, 50MB+ quota, structured data)
- Fallback: localStorage (sync, 5-10MB, JSON serialization)
- Abstraction layer isolates game code from storage implementation

**Constitution Re-Check After Design**:
- ✅ **Performance**: <20KB data footprint, negligible memory impact
- ✅ **Offline-First**: Service worker + IndexedDB enable full offline play
- ✅ **Simplicity**: Clean entity boundaries, no complex relationships
- ✅ **Testable**: JSON schemas enable contract testing

---

## Phase 2: Next Steps

**Ready for `/speckit.tasks`** to generate implementation task breakdown.

**Implementation Priority** (per spec P1-P4):
1. **P1 - Core Gameplay** (User Story 1): Player, obstacles, collision, scoring
2. **P2 - Score Progression** (User Story 2): High scores, achievements, celebrations
3. **P3 - Monetization** (User Story 3): Shop, cosmetics, IAP integration
4. **P4 - Retention** (User Story 4): Daily challenges, streaks, rewards

**Development Milestones**:
- **Week 1-2**: P1 complete (first playable, testable game loop)
- **Week 3**: P2 complete (engagement hook validated)
- **Week 4-5**: P3 complete (monetization functional)
- **Week 6**: P4 complete (retention mechanics active)
- **Week 7**: Polish, performance optimization, device testing
- **Week 8**: Beta release, user feedback, iteration

**Technical Debt Prevention**:
- Performance testing from day 1 (Playwright benchmarks)
- Asset pipeline established before art production
- IAP sandbox testing before production integration
- Accessibility audit before beta release

---

## Final Constitution Compliance Check ✅

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. Intuitive UX** | ✅ PASS | Tap-to-jump, <5s playable, no tutorials |
| **II. Safe Content** | ✅ PASS | Family-friendly art direction, review process |
| **III. Performance-First** | ✅ PASS | PixiJS 60 FPS proven, <150MB budget, <2s load |
| **IV. Test-Driven Quality** | ✅ PASS | Vitest + Playwright, automated benchmarks |
| **V. Simplicity & Clarity** | ✅ PASS | Single mechanic, modular code, clear priorities |

**All gates passed. Ready for implementation phase.**

---

## Artifacts Generated

- ✅ `plan.md` (this file) - Technical architecture and decisions
- ✅ `research.md` - Technology evaluation and selection rationale
- ✅ `data-model.md` - Entity definitions and validation rules
- ✅ `contracts/storage-schema.json` - IndexedDB schema contract
- ✅ `quickstart.md` - Developer setup and workflow guide
- ✅ `.github/copilot-instructions.md` - Updated agent context

**Next Command**: `/speckit.tasks` to generate detailed task breakdown
