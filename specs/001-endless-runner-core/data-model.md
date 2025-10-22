# Data Model: Endless Runner Core Game

**Date**: 2025-10-22  
**Feature**: 001-endless-runner-core  
**Purpose**: Define all data entities, relationships, and validation rules

## Entity Definitions

### 1. PlayerProfile

**Purpose**: Tracks persistent player progress and preferences across game sessions

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Required, Unique, Primary Key | Unique player identifier |
| `highScore` | Integer | Required, >= 0, Default: 0 | Best distance score achieved |
| `totalCoins` | Integer | Required, >= 0, Default: 0 | Current coin balance |
| `lifetimeCoins` | Integer | Required, >= 0, Default: 0 | Total coins earned (never decreases) |
| `gamesPlayed` | Integer | Required, >= 0, Default: 0 | Total game sessions |
| `totalDistance` | Integer | Required, >= 0, Default: 0 | Cumulative distance across all games |
| `totalJumps` | Integer | Required, >= 0, Default: 0 | Lifetime jump count |
| `selectedSkin` | String | Optional, Foreign Key → CosmeticItem.id | Currently equipped character skin |
| `currentStreak` | Integer | Required, >= 0, Default: 0 | Consecutive days with completed games |
| `lastPlayDate` | DateTime (ISO 8601) | Required | Last calendar day player completed a game |
| `createdAt` | DateTime (ISO 8601) | Required | Account creation timestamp |
| `updatedAt` | DateTime (ISO 8601) | Required | Last profile modification timestamp |

**Validation Rules**:
- `totalCoins` cannot be negative (after purchases, validate sufficient balance)
- `lifetimeCoins` must be >= `totalCoins` (monotonically increasing)
- `highScore` cannot decrease once set
- `lastPlayDate` must be updated when game ends
- `currentStreak` resets to 0 if more than 24 hours elapsed between plays

**Storage**: IndexedDB object store `playerProfile`, single record (singleton pattern)

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "highScore": 1547,
  "totalCoins": 2340,
  "lifetimeCoins": 8560,
  "gamesPlayed": 89,
  "totalDistance": 67834,
  "totalJumps": 2456,
  "selectedSkin": "skin_space_cat",
  "currentStreak": 7,
  "lastPlayDate": "2025-10-22T14:30:00Z",
  "createdAt": "2025-10-15T08:00:00Z",
  "updatedAt": "2025-10-22T14:30:00Z"
}
```

---

### 2. GameSession

**Purpose**: Tracks state and statistics for a single game run (ephemeral, not persisted long-term)

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `sessionId` | String (UUID) | Required, Unique | Session identifier |
| `startTime` | DateTime (ISO 8601) | Required | Game start timestamp |
| `endTime` | DateTime (ISO 8601) | Optional | Game end timestamp (null while playing) |
| `currentScore` | Integer | Required, >= 0 | Distance traveled this run |
| `coinsCollected` | Integer | Required, >= 0 | Coins collected this run |
| `obstaclesCleared` | Integer | Required, >= 0 | Obstacles successfully jumped |
| `jumpsPerformed` | Integer | Required, >= 0 | Total jumps this run |
| `challengeProgress` | Object | Optional | Challenge objective tracking |
| `isNewHighScore` | Boolean | Required, Default: false | Whether run beat previous best |
| `difficultyCurve` | Object | Required | Current difficulty state (spacing, speed) |

**Lifecycle**:
- Created when player starts game (tap to jump)
- Updated every frame during gameplay
- Finalized when collision occurs
- Persisted to PlayerProfile aggregates on session end
- Session data discarded after stats transferred

**Not Persisted**: GameSession is runtime-only (in-memory). Only aggregates (highScore, totalCoins) persist.

**Example (Runtime)**:
```json
{
  "sessionId": "7f3d9e8c-4b2a-11ed-8912-0242ac120002",
  "startTime": "2025-10-22T14:25:00Z",
  "endTime": null,
  "currentScore": 834,
  "coinsCollected": 23,
  "obstaclesCleared": 47,
  "jumpsPerformed": 51,
  "challengeProgress": {
    "type": "jump_count",
    "target": 50,
    "current": 51
  },
  "isNewHighScore": false,
  "difficultyCurve": {
    "obstacleSpacing": 285,
    "playerSpeed": 5.0
  }
}
```

---

### 3. CosmeticItem

**Purpose**: Defines purchasable customization options (skins, trails, themes)

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | Required, Unique, Primary Key | Item identifier (e.g., "skin_ninja_cat") |
| `name` | String | Required | Display name (e.g., "Ninja Cat") |
| `description` | String | Optional | Flavor text |
| `category` | Enum | Required: ["skin", "trail", "theme"] | Item type |
| `rarity` | Enum | Required: ["common", "rare", "epic", "legendary"] | Visual rarity indicator |
| `coinPrice` | Integer | Required, >= 0 | Cost in coins (0 = starter item) |
| `assetPath` | String | Required | Path to sprite/texture file |
| `unlockRequirement` | String | Optional | Special unlock condition (e.g., "streak_7") |
| `isUnlocked` | Boolean | Required, Default: false | Player ownership status |
| `unlockedAt` | DateTime (ISO 8601) | Optional | Unlock timestamp |

**Validation Rules**:
- Starter items (coinPrice = 0) are unlocked by default
- Items with `unlockRequirement` must validate condition before purchase
- `assetPath` must exist in asset manifest

**Storage**: IndexedDB object store `cosmetics`, indexed by `id` and `category`

**Predefined Catalog** (loaded from config, not user-modifiable):
```json
[
  {
    "id": "skin_default",
    "name": "Classic Runner",
    "category": "skin",
    "rarity": "common",
    "coinPrice": 0,
    "assetPath": "sprites/player_default.png",
    "isUnlocked": true
  },
  {
    "id": "skin_space_cat",
    "name": "Space Cat",
    "category": "skin",
    "rarity": "rare",
    "coinPrice": 500,
    "assetPath": "sprites/player_spacecat.png",
    "isUnlocked": false
  },
  {
    "id": "skin_ninja_cat",
    "name": "Ninja Cat",
    "category": "skin",
    "rarity": "epic",
    "coinPrice": 1200,
    "assetPath": "sprites/player_ninja.png",
    "isUnlocked": false
  },
  {
    "id": "trail_rainbow",
    "name": "Rainbow Trail",
    "category": "trail",
    "rarity": "common",
    "coinPrice": 200,
    "assetPath": "sprites/trail_rainbow.png",
    "isUnlocked": false
  }
]
```

---

### 4. DailyChallenge

**Purpose**: Defines time-limited objectives for player engagement

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | Required, Unique | Challenge identifier (date-based: "challenge_2025-10-22") |
| `date` | Date (ISO 8601) | Required | Challenge valid date (local timezone) |
| `type` | Enum | Required: ["jump_count", "coin_collect", "distance", "perfect_run"] | Objective type |
| `targetValue` | Integer | Required, > 0 | Goal to achieve (e.g., 50 jumps) |
| `currentValue` | Integer | Required, >= 0, Default: 0 | Player progress |
| `rewardCoins` | Integer | Required, > 0 | Coin reward for completion |
| `isCompleted` | Boolean | Required, Default: false | Completion status |
| `completedAt` | DateTime (ISO 8601) | Optional | Completion timestamp |
| `expiresAt` | DateTime (ISO 8601) | Required | Challenge expiration (midnight local time) |

**Generation Rules**:
- New challenge generated daily at midnight (local timezone)
- Difficulty scales with player's current streak (higher streak = harder challenges)
- Reward multiplier based on streak: baseReward × (1 + streak × 0.1)
- Challenge types rotate to maintain variety

**Validation Rules**:
- Challenge must be for current calendar day (expired challenges auto-delete)
- Progress only counts during valid challenge period
- Cannot complete same challenge twice

**Storage**: IndexedDB object store `challenges`, auto-purge expired entries

**Example**:
```json
{
  "id": "challenge_2025-10-22",
  "date": "2025-10-22",
  "type": "jump_count",
  "targetValue": 50,
  "currentValue": 34,
  "rewardCoins": 100,
  "isCompleted": false,
  "completedAt": null,
  "expiresAt": "2025-10-23T00:00:00Z"
}
```

---

### 5. Achievement

**Purpose**: Milestone rewards for reaching score thresholds

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | Required, Unique | Achievement identifier |
| `name` | String | Required | Display name (e.g., "Century Club") |
| `description` | String | Required | Achievement criteria |
| `threshold` | Integer | Required | Score/stat requirement |
| `type` | Enum | Required: ["score", "games", "coins", "streak"] | Metric type |
| `isUnlocked` | Boolean | Required, Default: false | Unlock status |
| `unlockedAt` | DateTime (ISO 8601) | Optional | Unlock timestamp |
| `iconPath` | String | Required | Badge sprite path |

**Predefined Milestones**:
```json
[
  { "id": "score_100", "name": "First Steps", "threshold": 100, "type": "score" },
  { "id": "score_500", "name": "Getting Good", "threshold": 500, "type": "score" },
  { "id": "score_1000", "name": "Kilometer Club", "threshold": 1000, "type": "score" },
  { "id": "score_5000", "name": "Marathon Runner", "threshold": 5000, "type": "score" },
  { "id": "streak_3", "name": "Hat Trick", "threshold": 3, "type": "streak" },
  { "id": "streak_7", "name": "Weekly Warrior", "threshold": 7, "type": "streak" }
]
```

**Storage**: IndexedDB object store `achievements`, checked after each game

---

### 6. PurchaseTransaction

**Purpose**: Audit log for in-app purchases (IAP)

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `transactionId` | String | Required, Unique, Primary Key | Platform transaction ID |
| `platform` | Enum | Required: ["apple", "google", "stripe"] | Payment provider |
| `bundleId` | String | Required | Product identifier (e.g., "coins_500") |
| `coinAmount` | Integer | Required, > 0 | Coins purchased |
| `priceUSD` | Float | Required, > 0 | Price in USD |
| `status` | Enum | Required: ["pending", "completed", "failed", "refunded"] | Transaction state |
| `createdAt` | DateTime (ISO 8601) | Required | Purchase initiation time |
| `completedAt` | DateTime (ISO 8601) | Optional | Fulfillment timestamp |
| `receipt` | String | Optional | Platform receipt data (for validation) |

**Transaction Flow**:
1. User initiates purchase → Status: "pending"
2. Platform processes payment → Status: "completed" or "failed"
3. Coins credited to PlayerProfile.totalCoins
4. Receipt stored for audit/refund handling

**Validation Rules**:
- `transactionId` must be unique (prevent double-crediting)
- Failed transactions do not credit coins
- Refunds decrement coins if balance sufficient, otherwise flag account

**Storage**: IndexedDB object store `transactions`, indexed by `transactionId` and `status`

**Example**:
```json
{
  "transactionId": "APPLE_12345_67890",
  "platform": "apple",
  "bundleId": "coins_500",
  "coinAmount": 500,
  "priceUSD": 0.99,
  "status": "completed",
  "createdAt": "2025-10-22T14:20:00Z",
  "completedAt": "2025-10-22T14:20:05Z",
  "receipt": "base64encodedreceipt=="
}
```

---

## Entity Relationships

```
PlayerProfile (1) ─────────────────────────────────────────┐
    │                                                       │
    │ selectedSkin (FK)                                     │
    │                                                       │
    ├─> CosmeticItem (Many)                                │
    │   - Unlocked items filtered by isUnlocked            │
    │                                                       │
    └─> Achievement (Many)                                  │
        - Progress tracked against thresholds               │
                                                            │
GameSession (Ephemeral, not persisted)                      │
    │                                                       │
    └─> challengeProgress (references DailyChallenge)      │
                                                            │
DailyChallenge (1 per day)                                  │
    │                                                       │
    └─> Affects PlayerProfile.currentStreak                │
                                                            │
PurchaseTransaction (Many) ─────────────────────────────────┘
    │
    └─> Credits PlayerProfile.totalCoins on completion
```

---

## Data Access Patterns

### High-Frequency Operations (During Gameplay):
- **Read**: PlayerProfile (highScore, selectedSkin) - Once at game start
- **Write**: GameSession (score, coins, obstacles) - Every frame (in-memory only)
- **Read**: CosmeticItem (assetPath) - Once at game start
- **Update**: DailyChallenge (currentValue) - On relevant game events

### Low-Frequency Operations (Between Games):
- **Update**: PlayerProfile (all fields) - On game end
- **Read**: CosmeticItem (shop display) - On shop open
- **Write**: PurchaseTransaction - On IAP completion
- **Read**: Achievement (milestone check) - On game end

### Batch Operations:
- **Expired Challenge Cleanup**: Daily at midnight
- **Streak Validation**: On app open (check lastPlayDate)

---

## IndexedDB Schema

```javascript
// Database name: "EndlessRunnerDB"
// Version: 1

const dbSchema = {
  stores: [
    {
      name: 'playerProfile',
      keyPath: 'id',
      indexes: []
    },
    {
      name: 'cosmetics',
      keyPath: 'id',
      indexes: [
        { name: 'category', keyPath: 'category', unique: false },
        { name: 'isUnlocked', keyPath: 'isUnlocked', unique: false }
      ]
    },
    {
      name: 'challenges',
      keyPath: 'id',
      indexes: [
        { name: 'date', keyPath: 'date', unique: true },
        { name: 'expiresAt', keyPath: 'expiresAt', unique: false }
      ]
    },
    {
      name: 'achievements',
      keyPath: 'id',
      indexes: [
        { name: 'type', keyPath: 'type', unique: false },
        { name: 'isUnlocked', keyPath: 'isUnlocked', unique: false }
      ]
    },
    {
      name: 'transactions',
      keyPath: 'transactionId',
      indexes: [
        { name: 'platform', keyPath: 'platform', unique: false },
        { name: 'status', keyPath: 'status', unique: false },
        { name: 'createdAt', keyPath: 'createdAt', unique: false }
      ]
    }
  ]
};
```

---

## Data Migration Strategy

**Version 1.0.0** (Initial):
- Create all stores and indexes
- Seed default cosmetics catalog
- Create starter player profile

**Future Versions** (Hypothetical):
- **1.1.0**: Add new cosmetic item types → Update cosmetics catalog, no migration needed
- **1.2.0**: Add leaderboard support → New `leaderboard` store, no existing data affected
- **2.0.0**: Change score calculation → Requires recalculating all highScores (breaking change)

**Migration Pattern**:
```javascript
db.onupgradeneeded = (event) => {
  const db = event.target.result;
  const oldVersion = event.oldVersion;
  
  if (oldVersion < 1) {
    // Initial setup
    createAllStores(db);
  }
  
  if (oldVersion < 2) {
    // Example future migration
    // db.createObjectStore('leaderboard', { keyPath: 'id' });
  }
};
```

---

## Performance Considerations

**Memory Budget Allocation**:
- PlayerProfile: ~1KB
- CosmeticItems (50 items): ~5KB
- Achievements (20 items): ~2KB
- DailyChallenge: ~500 bytes
- Transactions (100 recent): ~10KB
- **Total Persistent Data**: ~20KB (negligible)

**Query Optimization**:
- PlayerProfile cached in memory (single read at startup)
- CosmeticItems loaded once, filtered client-side
- Challenges checked only on game end
- Indexes on high-query fields (category, isUnlocked, date)

**Offline Resilience**:
- All writes use transactions (atomic commits)
- Failed writes retry 3 times before fallback to localStorage
- Service worker ensures data survives app crashes

---

## Data Validation Summary

| Entity | Critical Validations |
|--------|---------------------|
| PlayerProfile | totalCoins >= 0, lifetimeCoins >= totalCoins, highScore monotonic |
| GameSession | All counters >= 0, session runtime capped at 1 hour (detect stuck sessions) |
| CosmeticItem | assetPath exists, price >= 0, unlock requirements valid |
| DailyChallenge | Date within current day, targetValue > 0, not expired |
| Achievement | Threshold > 0, type matches stat being tracked |
| PurchaseTransaction | transactionId unique, status in valid enum, coinAmount > 0 |

All validations enforced in `src/data/*.js` modules before database writes.
