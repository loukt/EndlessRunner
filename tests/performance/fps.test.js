/**
 * Performance Test: FPS Monitoring
 * 
 * Validates that the game maintains 60 FPS during gameplay.
 */

import { test, expect } from '@playwright/test';

test.describe('FPS Performance', () => {
  test('should maintain 60 FPS during idle state', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for game to initialize
    await page.waitForSelector('#game-container canvas', { timeout: 10000 });
    await page.waitForTimeout(2000); // Let it stabilize

    // Measure FPS over 5 seconds
    const fpsData = await page.evaluate(async () => {
      const samples = [];
      const duration = 5000; // 5 seconds
      const startTime = performance.now();

      return new Promise((resolve) => {
        let frameCount = 0;
        let lastTime = startTime;

        function measureFrame() {
          const currentTime = performance.now();
          const deltaTime = currentTime - lastTime;
          
          if (deltaTime > 0) {
            const fps = 1000 / deltaTime;
            samples.push(fps);
            frameCount++;
          }

          lastTime = currentTime;

          if (currentTime - startTime < duration) {
            requestAnimationFrame(measureFrame);
          } else {
            const avgFPS = samples.reduce((a, b) => a + b, 0) / samples.length;
            const minFPS = Math.min(...samples);
            const maxFPS = Math.max(...samples);

            resolve({
              avgFPS,
              minFPS,
              maxFPS,
              frameCount,
              samples: samples.length
            });
          }
        }

        requestAnimationFrame(measureFrame);
      });
    });

    // Average FPS should be close to 60
    expect(fpsData.avgFPS).toBeGreaterThan(55);
    expect(fpsData.avgFPS).toBeLessThan(65);

    // Minimum FPS should not drop too low
    expect(fpsData.minFPS).toBeGreaterThan(50);

    // Should have measured at least 250 frames (5s * 50fps minimum)
    expect(fpsData.frameCount).toBeGreaterThan(250);
  });

  test('should maintain FPS during simulated gameplay', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for game to initialize
    await page.waitForSelector('#game-container canvas', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Simulate gameplay with rapid inputs
    const fpsData = await page.evaluate(async () => {
      const samples = [];
      const duration = 5000; // 5 seconds
      const startTime = performance.now();

      // Simulate inputs every 500ms
      const inputInterval = setInterval(() => {
        const canvas = document.querySelector('#game-container canvas');
        if (canvas) {
          const event = new MouseEvent('mousedown', {
            clientX: Math.random() * canvas.width,
            clientY: Math.random() * canvas.height
          });
          canvas.dispatchEvent(event);
        }
      }, 500);

      return new Promise((resolve) => {
        let frameCount = 0;
        let lastTime = startTime;

        function measureFrame() {
          const currentTime = performance.now();
          const deltaTime = currentTime - lastTime;
          
          if (deltaTime > 0) {
            const fps = 1000 / deltaTime;
            samples.push(fps);
            frameCount++;
          }

          lastTime = currentTime;

          if (currentTime - startTime < duration) {
            requestAnimationFrame(measureFrame);
          } else {
            clearInterval(inputInterval);

            const avgFPS = samples.reduce((a, b) => a + b, 0) / samples.length;
            const minFPS = Math.min(...samples);
            const maxFPS = Math.max(...samples);

            resolve({
              avgFPS,
              minFPS,
              maxFPS,
              frameCount,
              samples: samples.length
            });
          }
        }

        requestAnimationFrame(measureFrame);
      });
    });

    // Average FPS should still be close to 60 with inputs
    expect(fpsData.avgFPS).toBeGreaterThan(50);
    
    // Minimum FPS can be slightly lower with inputs
    expect(fpsData.minFPS).toBeGreaterThan(45);
  });

  test('should not have frame time spikes', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for game to initialize
    await page.waitForSelector('#game-container canvas', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Measure frame times
    const frameTimeData = await page.evaluate(async () => {
      const frameTimes = [];
      const duration = 5000; // 5 seconds
      const startTime = performance.now();

      return new Promise((resolve) => {
        let lastTime = startTime;

        function measureFrame() {
          const currentTime = performance.now();
          const frameTime = currentTime - lastTime;
          
          if (frameTime > 0) {
            frameTimes.push(frameTime);
          }

          lastTime = currentTime;

          if (currentTime - startTime < duration) {
            requestAnimationFrame(measureFrame);
          } else {
            const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            const maxFrameTime = Math.max(...frameTimes);
            const spikes = frameTimes.filter(ft => ft > 33).length; // > 33ms = < 30 FPS

            resolve({
              avgFrameTime,
              maxFrameTime,
              spikes,
              totalFrames: frameTimes.length,
              spikePercentage: (spikes / frameTimes.length) * 100
            });
          }
        }

        requestAnimationFrame(measureFrame);
      });
    });

    // Average frame time should be close to 16.67ms (60 FPS)
    expect(frameTimeData.avgFrameTime).toBeGreaterThan(15);
    expect(frameTimeData.avgFrameTime).toBeLessThan(20);

    // Maximum frame time should not exceed 100ms
    expect(frameTimeData.maxFrameTime).toBeLessThan(100);

    // Less than 5% of frames should be spikes
    expect(frameTimeData.spikePercentage).toBeLessThan(5);
  });

  test('should handle window resize without FPS drop', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for game to initialize
    await page.waitForSelector('#game-container canvas', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Measure FPS during resize
    const fpsData = await page.evaluate(async () => {
      const samples = [];
      const duration = 3000;
      const startTime = performance.now();

      // Trigger resize every 500ms
      const resizeInterval = setInterval(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500);

      return new Promise((resolve) => {
        let lastTime = startTime;

        function measureFrame() {
          const currentTime = performance.now();
          const deltaTime = currentTime - lastTime;
          
          if (deltaTime > 0) {
            const fps = 1000 / deltaTime;
            samples.push(fps);
          }

          lastTime = currentTime;

          if (currentTime - startTime < duration) {
            requestAnimationFrame(measureFrame);
          } else {
            clearInterval(resizeInterval);

            const avgFPS = samples.reduce((a, b) => a + b, 0) / samples.length;
            const minFPS = Math.min(...samples);

            resolve({
              avgFPS,
              minFPS,
              samples: samples.length
            });
          }
        }

        requestAnimationFrame(measureFrame);
      });
    });

    // Should maintain reasonable FPS during resize
    expect(fpsData.avgFPS).toBeGreaterThan(45);
    expect(fpsData.minFPS).toBeGreaterThan(30);
  });
});
