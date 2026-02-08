# Tasks: Endless Runner Core Game

**Feature Branch**: `001-endless-runner-core`  
**Created**: 2025-10-22  
**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/storage-schema.json](contracts/storage-schema.json)

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: Always starts with `- [ ]`
- **[ID]**: Sequential task ID (T001, T002, T003...)
- **[P]**: Parallelizable (different files, no blocking dependencies)
- **[Story]**: User story label (US1, US2, US3, US4) - only for story-specific tasks
- **File paths**: Exact locations for each implementation task

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize project structure and install core dependencies

- [X] T001 Create project directory structure with src/, public/, tests/ folders per plan.md
- [X] T002 Initialize Node.js project with package.json
- [X] T003 Install PixiJS v7 core dependency: `npm install pixi.js@7` (configured in package.json - requires npm install)
- [X] T004 [P] Install Vite build tool: `npm install --save-dev vite` (configured in package.json - requires npm install)
- [X] T005 [P] Install Vitest testing framework: `npm install --save-dev vitest` (configured in package.json - requires npm install)
- [X] T006 [P] Install Playwright for E2E/performance tests: `npm install --save-dev @playwright/test` (configured in package.json - requires npm install)
- [X] T007 [P] Install ESLint and Prettier: `npm install --save-dev eslint prettier` (configured in package.json - requires npm install)
- [X] T008 Create vite.config.js with PWA plugin configuration
- [X] T009 Create playwright.config.js for cross-browser testing
- [X] T010 [P] Create public/index.html with canvas container and meta tags
- [X] T011 [P] Create public/manifest.json for PWA configuration
- [X] T012 [P] Create ESLint configuration (.eslintrc.js) for ES2022
- [X] T013 [P] Create Prettier configuration (.prettierrc) for code formatting
- [X] T014 Create src/config.js with game constants (canvas size, FPS target, physics values)
- [X] T015 Add npm scripts to package.json: dev, build, test, test:perf
- [X] T016 Create .gitignore with node_modules/, dist/, coverage/ exclusions
- [X] T017 Create README.md with setup instructions from quickstart.md

**Checkpoint**: Project structure complete, dependencies installed, ready for foundational code

---

## Phase 2: Foundational (Core Engine - Blocking Prerequisites)

**Purpose**: Build core engine components that ALL user stories depend on

**⚠️ CRITICAL**: These tasks MUST be complete before any user story implementation

- [X] T018 Create src/engine/renderer.js - Initialize PixiJS Application with responsive canvas
- [X] T019 Create src/engine/input.js - Unified touch/click input handler with tap detection
- [X] T020 Create src/engine/physics.js - Gravity system and collision detection (AABB)
- [X] T021 Create src/engine/audio.js - Sound effect and music playback manager with Web Audio API
- [X] T022 Create src/data/storage.js - Storage abstraction layer (IndexedDB + localStorage fallback)
- [X] T023 [P] Create tests/unit/engine/renderer.test.js - Test canvas initialization and resize
- [X] T024 [P] Create tests/unit/engine/input.test.js - Test touch/click event handling
- [X] T025 [P] Create tests/unit/engine/physics.test.js - Test gravity and collision detection
- [X] T026 [P] Create tests/unit/data/storage.test.js - Test IndexedDB operations and fallback
- [X] T027 Implement IndexedDB schema in src/data/storage.js per contracts/storage-schema.json
- [X] T028 Create src/data/migrations.js - Database version management and schema migrations
- [X] T029 Create src/main.js - Application entry point with renderer initialization
- [X] T030 [P] Create tests/performance/fps.test.js - Playwright test measuring sustained 60 FPS
- [X] T031 [P] Create tests/performance/memory.test.js - Playwright test verifying <150MB memory usage
- [ ] T032 Verify all foundational tests pass with `npm test`
- [ ] T033 Verify performance benchmarks meet targets: `npm run test:perf`

**Checkpoint**: Core engine ready - user story implementation can proceed in parallel

---

## Phase 3: User Story 1 - Quick Play Session (Priority: P1) 🎯 MVP

**Goal**: Deliver immediately playable endless runner with tap-to-jump, obstacles, collision, and score display

**Independent Test**: Launch game, tap to jump over 3-5 obstacles, hit obstacle to see game over screen with score. Must be playable within 5 seconds of launch.

### Implementation for User Story 1

- [X] T034 [P] [US1] Create src/game/player.js - Player sprite with jump physics and animation states
- [X] T035 [P] [US1] Create src/game/obstacle.js - Obstacle factory with position and collision bounds
- [X] T036 [P] [US1] Create src/game/scoring.js - Distance-based score calculation (game units)
- [X] T037 [P] [US1] Create src/game/difficulty.js - Progressive obstacle spacing algorithm (500px → 200px)
- [X] T038 [P] [US1] Create src/ui/hud.js - In-game HUD displaying current score
- [X] T039 [P] [US1] Create src/ui/menu.js - Game over screen with score and "Play Again" button
- [X] T040 [US1] Create src/data/session.js - GameSession entity management per data-model.md
- [X] T041 [US1] Implement game loop in src/main.js - Update player, obstacles, collision, score
- [X] T042 [US1] Add obstacle generation system ensuring safe zones (guaranteed passable patterns)
- [X] T043 [US1] Implement collision detection between player and obstacles using physics.js
- [X] T044 [US1] Add game over trigger on collision with session finalization
- [X] T045 [US1] Implement "Play Again" functionality with session reset
- [X] T046 [US1] Add placeholder sprites for player and obstacles (colored rectangles)
- [X] T047 [US1] Integrate audio.js for jump sound effect and collision sound
- [ ] T048 [P] [US1] Create tests/unit/game/player.test.js - Test jump mechanics and airborne detection
- [ ] T049 [P] [US1] Create tests/unit/game/obstacle.test.js - Test obstacle generation and safe zones
- [ ] T050 [P] [US1] Create tests/unit/game/difficulty.test.js - Test spacing reduction algorithm
- [ ] T051 [P] [US1] Create tests/integration/gameplay.test.js - Full game loop test (start → play → collision → game over)
- [X] T052 [US1] Prevent double jump by ignoring taps while player airborne (FR-003a)
- [X] T053 [US1] Add pause/resume functionality when app goes to background (FR-022)
- [X] T054 [US1] Implement responsive canvas scaling for different screen sizes (FR-023)
- [ ] T055 [US1] Manual test on Chrome, Firefox, Safari for cross-browser compatibility
- [ ] T056 [US1] Manual test on iOS Safari and Android Chrome for mobile compatibility
- [ ] T057 [US1] Run performance tests - verify 60 FPS sustained during gameplay
- [ ] T058 [US1] Run load time test - verify <2s from launch to playable

**Checkpoint**: P1 MVP complete - core endless runner gameplay fully functional and tested

---

## Phase 4: User Story 2 - Score Competition & Progression (Priority: P2)

**Goal**: Add score persistence, personal best tracking, achievements, and celebration feedback to create engagement hook

**Independent Test**: Play 2 consecutive games, verify second game shows previous best score. Beat previous score and verify celebration appears. Restart app and confirm high score persists.

### Implementation for User Story 2

- [X] T059 [P] [US2] Create src/data/profile.js - PlayerProfile entity with highScore, achievements per data-model.md
- [X] T060 [P] [US2] Create src/game/achievements.js - Achievement definitions and unlock logic
- [X] T061 [P] [US2] Create src/ui/achievements.js - Achievement badge display components
- [X] T062 [P] [US2] Create src/ui/celebration.js - "NEW BEST!" animation and particle effects
- [X] T063 [US2] Implement PlayerProfile persistence in storage.js using IndexedDB
- [X] T064 [US2] Add high score comparison logic in scoring.js
- [X] T065 [US2] Display personal best score on HUD during gameplay
- [X] T066 [US2] Trigger celebration animation when score exceeds personal best
- [X] T067 [US2] Update game over screen to show "New Record!" badge
- [X] T068 [US2] Implement milestone achievements (100, 500, 1000, 5000 points)
- [X] T069 [US2] Display earned achievements on game over screen
- [X] T070 [US2] Add totalDistance, totalJumps, gamesPlayed tracking to PlayerProfile
- [X] T071 [US2] Create statistics screen showing lifetime stats from profile
- [X] T072 [P] [US2] Create tests/unit/data/profile.test.js - Test profile persistence and validation
- [X] T073 [P] [US2] Create tests/unit/game/achievements.test.js - Test milestone unlock logic
- [X] T074 [P] [US2] Create tests/integration/score-progression.test.js - Test high score flow end-to-end
- [ ] T075 [US2] Verify high score persists across app restarts (close and reopen test)
- [ ] T076 [US2] Test achievement unlock notifications appear correctly
- [ ] T077 [US2] Verify celebration animation plays on new record

**Checkpoint**: P2 complete - engagement mechanics functional, players motivated to beat scores

---

## Phase 5: User Story 3 - Character Customization Shop (Priority: P3)

**Goal**: Enable coin collection, cosmetic shop, and in-app purchase integration for monetization

**Independent Test**: Play game and collect 50+ coins, open shop, purchase character skin with coins, verify skin applied. Test IAP coin bundle purchase flow (sandbox/test mode).

### Implementation for User Story 3

- [X] T078 [P] [US3] Create src/game/coin.js - Collectible coin sprite with collection detection
- [X] T079 [P] [US3] Create src/data/cosmetics.js - CosmeticItem catalog per data-model.md
- [X] T080 [P] [US3] Create src/ui/shop.js - Shop interface with item grid and purchase buttons
- [ ] T081 [P] [US3] Create src/iap/provider.js - Payment provider abstraction interface
- [ ] T082 [P] [US3] Create src/iap/stripe.js - Stripe web payment integration
- [ ] T083 [P] [US3] Create src/iap/apple.js - Apple IAP wrapper (StoreKit)
- [ ] T084 [P] [US3] Create src/iap/google.js - Google Play Billing wrapper
- [X] T085 [US3] Add coin spawning system in obstacle generation (random positions between obstacles)
- [X] T086 [US3] Implement coin collection detection in game loop
- [X] T087 [US3] Add coin counter to HUD showing current run collection
- [X] T088 [US3] Update PlayerProfile with totalCoins and lifetimeCoins fields
- [X] T089 [US3] Display total coins on game over screen
- [X] T090 [US3] Create shop screen accessible from main menu
- [X] T091 [US3] Load cosmetic items from cosmetics.js and display with prices
- [X] T092 [US3] Implement coin-based purchase logic with balance validation
- [X] T093 [US3] Add selectedSkin field to PlayerProfile and skin selection UI
- [X] T094 [US3] Apply selected skin sprite to player character
- [X] T095 [US3] Persist cosmetic unlock states in IndexedDB
- [ ] T096 [US3] Create coin bundle definitions (Small $0.99, Medium $4.99, Large $9.99)
- [ ] T097 [US3] Implement "Buy Coins" interface with bundle selection
- [ ] T098 [US3] Add IAP transaction flow with provider selection (web/iOS/Android)
- [ ] T099 [US3] Implement transaction rollback on failure per FR-012a
- [ ] T100 [US3] Add user notification for IAP success/failure
- [ ] T101 [US3] Create PurchaseTransaction entity for audit trail per data-model.md
- [ ] T102 [US3] Add one-tap retry button for failed IAP transactions
- [ ] T103 [P] [US3] Create tests/unit/game/coin.test.js - Test coin collection and scoring
- [ ] T104 [P] [US3] Create tests/unit/data/cosmetics.test.js - Test unlock state management
- [ ] T105 [P] [US3] Create tests/integration/shop.test.js - Test coin purchase and skin application
- [ ] T106 [P] [US3] Create tests/integration/iap.test.js - Test IAP flow with test/sandbox mode
- [ ] T107 [US3] Test Stripe integration in development mode
- [ ] T108 [US3] Test Apple IAP in sandbox mode (requires TestFlight or Xcode)
- [ ] T109 [US3] Test Google Play Billing in test mode (requires test track)
- [ ] T110 [US3] Verify coin balance updates correctly after purchases
- [ ] T111 [US3] Verify transaction rollback works on simulated failure
- [ ] T112 [US3] Create placeholder cosmetic sprites (5-10 color variants)

**Checkpoint**: P3 complete - monetization system functional with cosmetic customization

---

## Phase 6: User Story 4 - Daily Challenges & Rewards (Priority: P4)

**Goal**: Implement daily challenges, streak tracking, and reward multipliers for long-term retention

**Independent Test**: Log in to see today's challenge, complete challenge requirement, verify reward granted. Log in on consecutive days to verify streak counter increases and multiplier applies.

### Implementation for User Story 4

- [X] T113 [P] [US4] Create src/data/challenges.js - DailyChallenge entity and generation logic per data-model.md
- [X] T114 [P] [US4] Create src/game/challenge-tracker.js - Progress tracking during gameplay
- [X] T115 [P] [US4] Create src/ui/challenges.js - Challenge display and progress UI
- [X] T116 [US4] Implement daily challenge generation algorithm (3 types: jumps, coins, distance)
- [X] T117 [US4] Add challenge expiration logic (midnight in local timezone)
- [X] T118 [US4] Display active challenge on main menu with progress bar
- [X] T119 [US4] Track challenge progress during gameplay (increment counters)
- [X] T120 [US4] Detect challenge completion in game loop
- [X] T121 [US4] Add "Challenge Complete!" notification overlay
- [X] T122 [US4] Award bonus coins on challenge completion
- [X] T123 [US4] Update PlayerProfile with currentStreak and lastPlayDate
- [X] T124 [US4] Implement streak calculation (consecutive calendar days in local timezone)
- [X] T125 [US4] Add streak counter display on main menu
- [X] T126 [US4] Implement streak multiplier logic (2x at 3 days, 3x at 7 days, 5x at 30 days)
- [X] T127 [US4] Apply multiplier to challenge rewards
- [X] T128 [US4] Add streak reset logic when day missed (>24 hours since last play)
- [X] T129 [US4] Display streak milestone notifications (3, 7, 30 days)
- [X] T130 [US4] Persist challenge completion state in IndexedDB
- [X] T131 [P] [US4] Create tests/unit/data/challenges.test.js - Test challenge generation and expiration
- [X] T132 [P] [US4] Create tests/unit/game/challenge-tracker.test.js - Test progress tracking accuracy
- [X] T133 [P] [US4] Create tests/integration/challenges.test.js - Test full challenge flow
- [ ] T134 [US4] Test streak calculation with simulated date changes
- [ ] T135 [US4] Verify multiplier applies correctly at each streak milestone
- [ ] T136 [US4] Test challenge expiration at midnight in multiple timezones

**Checkpoint**: P4 complete - retention mechanics active, daily engagement incentivized

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Asset creation, performance optimization, deployment preparation, and final QA

### Asset Creation

- [ ] T137 [P] Create sprite sheet for player character (idle, run, jump animations) - 8 frames each
- [ ] T138 [P] Create sprite sheets for 5 obstacle types (cactus, rock, barrel, crate, spike)
- [ ] T139 [P] Create sprite sheet for coin with rotation animation (4 frames)
- [ ] T140 [P] Create sprite sheets for 10 character skin variations
- [ ] T141 [P] Create particle effect sprites (sparkles, dust, celebration confetti)
- [ ] T142 [P] Create UI button assets (play, shop, settings, close)
- [ ] T143 [P] Optimize all sprites with pngquant/tinypng to minimize bundle size
- [ ] T144 Create texture atlas manifest.json for all sprite sheets
- [ ] T145 Implement progressive asset loading in src/engine/asset-loader.js
- [ ] T146 [P] Record jump sound effect (~20KB)
- [ ] T147 [P] Record coin collection sound effect (~15KB)
- [ ] T148 [P] Record collision sound effect (~18KB)
- [ ] T149 [P] Record celebration sound effect (~25KB)
- [ ] T150 [P] Create background music loop (~138KB, optional)
- [ ] T151 Compress all audio files to Opus/AAC format for web
- [ ] T152 Integrate asset loading with preload progress bar

### Service Worker & PWA

- [ ] T153 Create public/service-worker.js with cache-first strategy for assets
- [ ] T154 Implement asset precaching for critical resources (~140KB)
- [ ] T155 Add offline fallback page for network errors
- [ ] T156 Configure manifest.json with app icons (192x192, 512x512)
- [ ] T157 Add "Add to Home Screen" prompt logic
- [ ] T158 Test offline gameplay functionality
- [ ] T159 Test PWA installation on iOS Safari
- [ ] T160 Test PWA installation on Android Chrome

### Performance Optimization

- [ ] T161 Profile rendering performance with Chrome DevTools Performance tab
- [ ] T162 Optimize sprite batch rendering in renderer.js
- [ ] T163 Implement object pooling for obstacles and coins (reuse sprites)
- [ ] T164 Add texture atlas to reduce draw calls
- [ ] T165 Optimize collision detection with spatial partitioning if needed
- [ ] T166 Minimize JavaScript bundle with Vite tree-shaking
- [ ] T167 Enable Brotli compression for production build
- [ ] T168 Run Lighthouse audit - target 90+ performance score
- [ ] T169 Verify <2s load time on 3G network (Chrome DevTools throttling)
- [ ] T170 Verify 60 FPS sustained on mid-range Android device (5 min gameplay)
- [ ] T171 Verify <150MB memory usage (Chrome Task Manager)
- [ ] T172 Test memory leaks with extended gameplay session (30 min)

### Azure Deployment Setup

- [ ] T173 Install Azure Static Web Apps CLI: `npm install -g @azure/static-web-apps-cli`
- [ ] T174 Initialize SWA project: `npx swa init --yes`
- [ ] T175 Configure swa-cli.config.json with correct appLocation and outputLocation
- [ ] T176 Create .github/workflows/azure-static-web-apps.yml for CI/CD
- [ ] T177 Configure Azure Front Door for CDN (see azure-deployment.md)
- [ ] T178 Set up Application Insights for telemetry tracking
- [ ] T179 Configure custom domain and SSL certificate
- [ ] T180 Enable Azure WAF policies for security
- [ ] T181 Test deployment to staging environment
- [ ] T182 Configure performance alerts in Azure Monitor
- [ ] T183 Set up Azure Dashboard for real-time metrics

### Cross-Browser & Device Testing

- [ ] T184 Test on Chrome 90+ (Windows, macOS, Android)
- [ ] T185 Test on Safari 14+ (macOS, iOS 14+)
- [ ] T186 Test on Firefox 88+ (Windows, macOS, Android)
- [ ] T187 Test on Edge (Windows)
- [ ] T188 Test on mobile portrait orientation (iPhone, Android)
- [ ] T189 Test on tablet landscape orientation (iPad, Android tablet)
- [ ] T190 Test on desktop wide screen (1920x1080, 2560x1440)
- [ ] T191 Test touch input on actual mobile devices (not just emulator)
- [ ] T192 Test mouse/trackpad input on desktop
- [ ] T193 Verify responsive scaling on all screen sizes
- [ ] T194 Test IAP flow on actual iOS device with TestFlight
- [ ] T195 Test IAP flow on actual Android device with test track

### Accessibility & Content Safety

- [ ] T196 Add ARIA labels to all interactive UI elements
- [ ] T197 Ensure keyboard navigation works (Tab, Enter, Space)
- [ ] T198 Test with screen reader (VoiceOver on iOS, TalkBack on Android)
- [ ] T199 Verify color contrast meets WCAG AA standards
- [ ] T200 Add reduced motion option in settings for accessibility
- [ ] T201 Review all art assets for family-friendly content (no violence)
- [ ] T202 Add content rating metadata to manifest.json (ESRB: Everyone)
- [ ] T203 Test parental controls compatibility (IAP restrictions)

### Documentation

- [ ] T204 Update README.md with deployment instructions
- [ ] T205 Document IAP setup process for Apple/Google/Stripe
- [ ] T206 Create PRIVACY.md with data collection disclosure
- [ ] T207 Create CHANGELOG.md documenting all features
- [ ] T208 Add inline code comments for complex algorithms
- [ ] T209 Generate API documentation with JSDoc
- [ ] T210 Create troubleshooting guide for common issues

### Final QA & Release

- [ ] T211 Run full test suite: `npm test` - verify 100% pass rate
- [ ] T212 Run performance benchmarks: `npm run test:perf` - verify all targets met
- [ ] T213 Check code coverage report - target 80%+ coverage
- [ ] T214 Run ESLint: `npm run lint` - verify no warnings
- [ ] T215 Build production bundle: `npm run build` - verify <325KB gzipped
- [ ] T216 Deploy to Azure staging environment: `npx swa deploy --env staging`
- [ ] T217 Conduct beta test with 10-20 external users
- [ ] T218 Collect and analyze beta feedback
- [ ] T219 Fix critical bugs identified in beta
- [ ] T220 Deploy to Azure production: `npx swa deploy --env production`
- [ ] T221 Verify production deployment health checks pass
- [ ] T222 Monitor Application Insights for first 48 hours
- [ ] T223 Announce launch and begin user acquisition

### CI Quality Gates

- [ ] T224 Add CI workflow to run unit/integration tests on pull requests
- [ ] T225 Add CI workflow to run performance benchmarks on pull requests (fps/memory/load)
- [ ] T226 Enforce performance regression threshold (fail PR if <55 FPS or >150MB)
- [ ] T227 Add QA/UAT checklist gate for UI/UX changes before merge

### Telemetry & Analytics

- [ ] T228 Define analytics events for SC-003 through SC-010 (sessions, retention, streaks, IAP conversion)
- [ ] T229 Implement client-side telemetry logging with opt-in toggle
- [ ] T230 Create analytics dashboard queries/notes to measure SC-003 through SC-010
- [ ] T231 Validate analytics event coverage in test plan

**Checkpoint**: Game complete, tested, deployed, and live!

---

## Task Dependencies & Execution Strategy

### Dependency Graph (User Story Completion Order)

```
Setup (Phase 1)
    ↓
Foundational (Phase 2) ← BLOCKS ALL USER STORIES
    ↓
    ├─→ US1 (P1) ← MVP - MUST complete first
    │       ↓
    ├─→ US2 (P2) ← Depends on US1 (needs scoring system)
    │       ↓
    ├─→ US3 (P3) ← Can start after US1 (independent of US2)
    │       ↓
    └─→ US4 (P4) ← Can start after US1 (independent of US2/US3)
            ↓
    Polish (Phase 7) ← After all user stories complete
```

### Parallelization Opportunities

**Within Phase 2 (Foundational)**:
- T023-T026 (unit tests) can run in parallel
- T030-T031 (performance tests) can run in parallel after T018-T022

**Within Phase 3 (US1)**:
- T034-T039 (all game/ui modules) can be developed in parallel
- T048-T051 (all tests) can be written in parallel

**Within Phase 4 (US2)**:
- T059-T062 (data/game/ui modules) can be developed in parallel
- T072-T074 (tests) can be written in parallel

**Within Phase 5 (US3)**:
- T078-T084 (all modules) can be developed in parallel
- T103-T106 (tests) can be written in parallel

**Within Phase 6 (US4)**:
- T113-T115 (data/game/ui modules) can be developed in parallel
- T131-T133 (tests) can be written in parallel

**Within Phase 7 (Polish)**:
- T137-T143 (all asset creation) can happen in parallel
- T146-T151 (all audio creation) can happen in parallel
- T184-T195 (all device testing) can happen in parallel

### Recommended MVP Scope (Fastest Path to Validation)

**Minimum Viable Product = Phase 1 + Phase 2 + Phase 3 (US1 only)**

This delivers:
- ✅ Core endless runner gameplay
- ✅ Tap-to-jump mechanics
- ✅ Obstacle generation with collision
- ✅ Score display
- ✅ Game over and restart
- ✅ 60 FPS performance
- ✅ Cross-platform compatibility

**Rationale**: US1 alone provides complete game loop to validate core mechanics and player enjoyment before investing in progression (US2), monetization (US3), and retention (US4).

**Time Estimate**: 1-2 weeks for MVP with 1-2 developers

---

## Task Metrics

**Total Tasks**: 231
- Phase 1 (Setup): 17 tasks
- Phase 2 (Foundational): 16 tasks
- Phase 3 (US1 - Core Gameplay): 25 tasks 🎯 MVP
- Phase 4 (US2 - Score Progression): 19 tasks
- Phase 5 (US3 - Monetization): 35 tasks
- Phase 6 (US4 - Retention): 24 tasks
- Phase 7 (Polish): 95 tasks

**Parallel Tasks Identified**: 89 tasks marked with [P] flag

**User Story Breakdown**:
- US1 (P1): 25 tasks - Core gameplay
- US2 (P2): 19 tasks - Engagement hook
- US3 (P3): 35 tasks - Monetization (IAP adds complexity)
- US4 (P4): 24 tasks - Retention mechanics

**Independent Test Criteria**:
- ✅ US1: Launch → jump 5 times → hit obstacle → see score
- ✅ US2: Play twice → beat high score → see celebration → restart app
- ✅ US3: Collect coins → open shop → buy skin → see applied
- ✅ US4: Complete challenge → log in next day → verify streak

**Estimated Timeline**:
- Week 1: Setup + Foundational (T001-T033)
- Week 2: US1 MVP complete (T034-T058)
- Week 3: US2 complete (T059-T077)
- Week 4-5: US3 complete (T078-T112)
- Week 6: US4 complete (T113-T136)
- Week 7-8: Polish + Deployment (T137-T223)

**Format Validation**: ✅ All 231 tasks follow required checklist format with checkboxes, task IDs, [P] markers where appropriate, [Story] labels for user story phases, and file paths in descriptions.

---

## Next Steps

1. **Review tasks with team** - Validate scope and estimates
2. **Assign Phase 1 & 2** - Get foundation in place
3. **Sprint planning** - Break into 2-week sprints by user story
4. **Begin implementation** - Start with T001 (setup)
5. **Track progress** - Check off tasks as completed
6. **Adjust as needed** - Add/modify tasks based on learnings

**Ready to begin implementation!** 🚀
