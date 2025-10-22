# Endless Runner

A cross-platform 2D endless runner game built with PixiJS and deployed as a Progressive Web App (PWA).

## Features

- ⚡ **Instant Playability**: Launch and play within 5 seconds
- 🎮 **Simple Controls**: Tap or click to jump
- 📱 **Cross-Platform**: Works on web browsers, iOS, and Android
- 🏆 **Score Competition**: Beat your personal best
- 💎 **Customization**: Unlock character skins and themes
- 🎯 **Daily Challenges**: Complete challenges for bonus rewards
- 📴 **Offline Support**: Play without internet connection

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ (comes with Node.js)
- **Modern Browser**: Chrome 90+, Firefox 88+, or Safari 14+

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The game will be available at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:perf` - Run performance tests with Playwright
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
EndlessRunner/
├── src/
│   ├── engine/          # Core game engine (rendering, physics, input)
│   ├── game/            # Game-specific logic (player, obstacles, scoring)
│   ├── ui/              # User interface components
│   ├── data/            # Data management and persistence
│   ├── iap/             # In-app purchase integration
│   ├── assets/          # Game assets (sprites, sounds)
│   ├── main.js          # Application entry point
│   └── config.js        # Configuration constants
├── public/              # Static assets
│   ├── index.html       # Main HTML file
│   └── manifest.json    # PWA manifest
├── tests/               # Test suites
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── performance/     # Performance benchmarks
└── specs/               # Feature specifications
```

## Technology Stack

- **Engine**: PixiJS v7 (~500KB, WebGL-accelerated)
- **Build Tool**: Vite (fast HMR, optimized production builds)
- **Testing**: Vitest (unit tests) + Playwright (E2E/performance)
- **Storage**: IndexedDB + localStorage fallback
- **PWA**: Service Worker for offline support

## Performance Targets

- **FPS**: 60 FPS sustained during gameplay
- **Load Time**: <2 seconds from launch to playable
- **Memory**: <150MB footprint
- **Bundle Size**: <325KB gzipped

## Development Workflow

### First Playable Milestone

Follow the [Quickstart Guide](specs/001-endless-runner-core/quickstart.md) to implement the first playable version:

1. Initialize PixiJS renderer
2. Create player character with jump mechanics
3. Generate scrolling obstacles
4. Implement collision detection
5. Display score and game over screen

### Testing

```bash
# Run all unit tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run performance benchmarks
npm run test:perf
```

### Code Quality

```bash
# Lint code
npm run lint

# Auto-format code
npm run format
```

## Deployment

### Azure Static Web Apps

```bash
# Install SWA CLI globally
npm install -g @azure/static-web-apps-cli

# Initialize SWA project
npx swa init --yes

# Build application
npm run build

# Deploy to production
npx swa deploy --env production
```

See [Azure Deployment Guide](specs/001-endless-runner-core/azure-deployment.md) for detailed instructions.

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **iOS Safari**: 14+
- **Android Chrome**: 90+

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## References

- [Feature Specification](specs/001-endless-runner-core/spec.md)
- [Implementation Plan](specs/001-endless-runner-core/plan.md)
- [Technical Research](specs/001-endless-runner-core/research.md)
- [Data Model](specs/001-endless-runner-core/data-model.md)
- [Quickstart Guide](specs/001-endless-runner-core/quickstart.md)
- [Azure Deployment](specs/001-endless-runner-core/azure-deployment.md)
