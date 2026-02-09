/**
 * Background Manager Module
 *
 * Creates layered skyline, day/night cycle, and lamp post lighting.
 */

import * as PIXI from 'pixi.js';
import { CONFIG } from '../config.js';

export class BackgroundManager {
  constructor() {
    this.baseContainer = null;
    this.overlayContainer = null;
    this.layers = [];
    this.buildingLayers = [];
    this.lampPosts = [];
    this.cycleTime = 0;
    this.dayDuration = 30;
    this.nightDuration = 15;
    this.maxNightAlpha = 0.75;
    this.sky = null;
    this.sun = null;
    this.moon = null;
    this.celestialOffset = 0;
  }

  create(stage) {
    this.baseContainer = new PIXI.Container();
    stage.addChild(this.baseContainer);

    this.sky = new PIXI.Graphics();
    this.baseContainer.addChild(this.sky);

    this.sun = this.createCelestialBody(0xFFD54F, 18);
    this.moon = this.createCelestialBody(0xE0E0E0, 14);
    this.baseContainer.addChild(this.sun);
    this.baseContainer.addChild(this.moon);

    this.overlayContainer = new PIXI.Container();
    this.overlayContainer.visible = true;
    const overlay = new PIXI.Graphics();
    overlay.name = 'nightOverlay';
    this.overlayContainer.addChild(overlay);

    this.layers.push(this.createBuildingLayer(140, 6, 0x6C7A89, 0.12, 0.12));
    this.layers.push(this.createBuildingLayer(90, 10, 0x455A64, 0.25, 0.2));
    this.layers.push(this.createLampPostLayer(0.5));

    this.drawGround(this.baseContainer);
  }

  attachOverlay(stage) {
    if (this.overlayContainer) {
      stage.addChild(this.overlayContainer);
    }
  }

  update(deltaTime, scrollSpeed, difficultyLevel = 1) {
    this.cycleTime += deltaTime * (1 + difficultyLevel * 0.03);
    const cycle = this.getCycleState();
    const nightFactor = cycle.nightFactor;

    for (const layer of this.layers) {
      const dx = scrollSpeed * deltaTime * layer.speed;

      layer.container.x -= dx;
      if (layer.container.x <= -layer.width) {
        layer.container.x += layer.width;
      }

      if (layer.overlayContainer) {
        layer.overlayContainer.x -= dx;
        if (layer.overlayContainer.x <= -layer.width) {
          layer.overlayContainer.x += layer.width;
        }
      }
    }

    this.celestialOffset -= scrollSpeed * deltaTime * 0.02;
    if (Math.abs(this.celestialOffset) > CONFIG.CANVAS.WIDTH) {
      this.celestialOffset = 0;
    }

    this.updateSky(cycle);
    this.updateNightOverlay(nightFactor);
  }

  getCycleState() {
    const cycleDuration = this.dayDuration + this.nightDuration;
    const phaseTime = this.cycleTime % cycleDuration;
    const isDay = phaseTime < this.dayDuration;
    const phaseDuration = isDay ? this.dayDuration : this.nightDuration;
    const phaseProgress = (phaseTime % phaseDuration) / phaseDuration;
    const transitionWindow = 0.15;
    let nightFactor = 0;
    if (!isDay) {
      if (phaseProgress < transitionWindow) {
        nightFactor = phaseProgress / transitionWindow;
      } else if (phaseProgress > 1 - transitionWindow) {
        nightFactor = (1 - phaseProgress) / transitionWindow;
      } else {
        nightFactor = 1;
      }
    }
    return {
      isDay,
      phaseProgress,
      nightFactor
    };
  }

  updateSky(cycle) {
    if (!this.sky || !this.sun || !this.moon) return;

    const dayColor = 0x78B5D9;
    const nightColor = 0x1B2A3A;
    const skyColor = this.lerpColor(dayColor, nightColor, cycle.nightFactor);

    this.sky.clear();
    this.sky.beginFill(skyColor);
    this.sky.drawRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.PHYSICS.GROUND_Y);
    this.sky.endFill();

    const trackWidth = CONFIG.CANVAS.WIDTH + 100;
    const baseX = -50 + trackWidth * cycle.phaseProgress + this.celestialOffset;
    const arcHeight = 110;
    const arcCenterY = CONFIG.PHYSICS.GROUND_Y - 180;
    const arcY = arcCenterY - Math.sin(cycle.phaseProgress * Math.PI) * arcHeight;

    this.sun.visible = cycle.isDay;
    this.moon.visible = !cycle.isDay;

    if (cycle.isDay) {
      this.sun.x = baseX;
      this.sun.y = arcY;
    } else {
      this.moon.x = baseX;
      this.moon.y = arcY;
    }
  }

  lerpColor(startColor, endColor, t) {
    const clampT = Math.max(0, Math.min(1, t));
    const sr = (startColor >> 16) & 0xff;
    const sg = (startColor >> 8) & 0xff;
    const sb = startColor & 0xff;
    const er = (endColor >> 16) & 0xff;
    const eg = (endColor >> 8) & 0xff;
    const eb = endColor & 0xff;
    const rr = Math.round(sr + (er - sr) * clampT);
    const rg = Math.round(sg + (eg - sg) * clampT);
    const rb = Math.round(sb + (eb - sb) * clampT);
    return (rr << 16) | (rg << 8) | rb;
  }

  updateNightOverlay(nightFactor) {
    if (!this.overlayContainer) return;

    const overlay = this.overlayContainer.getChildByName('nightOverlay');
    if (overlay) {
      overlay.clear();
      overlay.beginFill(0x0B1B2B, this.maxNightAlpha * nightFactor);
      overlay.drawRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
      overlay.endFill();
    }

    for (const lamp of this.lampPosts) {
      const light = lamp.light;
      const intensity = Math.max(0, nightFactor - 0.1) / 0.9;
      light.alpha = intensity;
    }

    for (const layer of this.buildingLayers) {
      layer.container.alpha = 1 - nightFactor * 0.35;
    }
  }

  drawGround(container) {
    const ground = new PIXI.Graphics();
    ground.beginFill(0x8B7355);
    ground.drawRect(0, CONFIG.PHYSICS.GROUND_Y, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT - CONFIG.PHYSICS.GROUND_Y);
    ground.endFill();
    ground.lineStyle(3, 0x654321, 1);
    ground.moveTo(0, CONFIG.PHYSICS.GROUND_Y);
    ground.lineTo(CONFIG.CANVAS.WIDTH, CONFIG.PHYSICS.GROUND_Y);
    container.addChild(ground);
  }

  createBuildingLayer(baseHeight, count, color, windowChance, speed) {
    const container = new PIXI.Container();
    this.baseContainer.addChild(container);

    const layerWidth = CONFIG.CANVAS.WIDTH * 2;
    let x = 0;
    while (x < layerWidth) {
      const width = 60 + Math.floor(Math.random() * 80);
      const height = baseHeight + Math.floor(Math.random() * 120);
      const y = CONFIG.PHYSICS.GROUND_Y - height;

      const building = new PIXI.Graphics();
      building.beginFill(color);
      building.drawRect(x, y, width, height);
      building.endFill();

      for (let wy = y + 12; wy < y + height - 10; wy += 16) {
        for (let wx = x + 10; wx < x + width - 10; wx += 18) {
          if (Math.random() < windowChance) {
            building.beginFill(0xFFD54F, 0.8);
            building.drawRect(wx, wy, 8, 10);
            building.endFill();
          }
        }
      }

      container.addChild(building);
      x += width - 8;
    }

    const layer = { container, width: layerWidth, speed };
    this.buildingLayers.push(layer);
    return layer;
  }

  createLampPostLayer(speed) {
    const container = new PIXI.Container();
    this.baseContainer.addChild(container);
    const overlayLights = new PIXI.Container();
    overlayLights.blendMode = PIXI.BLEND_MODES.SCREEN;
    if (this.overlayContainer) {
      this.overlayContainer.addChild(overlayLights);
    }

    const spacing = 220;
    const layerWidth = CONFIG.CANVAS.WIDTH * 2;

    for (let x = 80; x < layerWidth; x += spacing) {
      const pole = new PIXI.Graphics();
      pole.beginFill(0x37474F);
      pole.drawRect(x, CONFIG.PHYSICS.GROUND_Y - 90, 6, 90);
      pole.endFill();
      pole.beginFill(0x455A64);
      pole.drawRect(x - 6, CONFIG.PHYSICS.GROUND_Y - 90, 18, 6);
      pole.endFill();
      container.addChild(pole);

      const lamp = new PIXI.Graphics();
      lamp.beginFill(0xFFECB3);
      lamp.drawCircle(x + 3, CONFIG.PHYSICS.GROUND_Y - 86, 6);
      lamp.endFill();
      container.addChild(lamp);

      const light = new PIXI.Graphics();
      light.beginFill(0xFFE082, 0.6);
      light.drawCircle(x + 3, CONFIG.PHYSICS.GROUND_Y - 70, 50);
      light.endFill();
      overlayLights.addChild(light);
      this.lampPosts.push({ light });
    }

    return { container, overlayContainer: overlayLights, width: layerWidth, speed };
  }

  createCelestialBody(color, radius) {
    const body = new PIXI.Graphics();
    body.beginFill(color);
    body.drawCircle(0, 0, radius);
    body.endFill();
    return body;
  }
}

export default BackgroundManager;
