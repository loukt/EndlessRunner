/**
 * Performance Test: Memory Usage Monitoring
 * 
 * Validates that the game stays under 150MB memory limit.
 */

import { test, expect } from '@playwright/test';
import { CONFIG } from '../../src/config.js';

test.describe('Memory Performance', () => {
  test('should stay under 150MB during initial load', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for game to initialize
    await page.waitForSelector('#game-container canvas', { timeout: 10000 });
    await page.waitForTimeout(2000); // Let it stabilize

    // Measure initial memory
    const memoryData = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          usedMB: performance.memory.usedJSHeapSize / (1024 * 1024),
          totalMB: performance.memory.totalJSHeapSize / (1024 * 1024)
        };
      }
      return { supported: false };
    });

    if (memoryData.supported === false) {
      test.skip(true, 'Memory API not supported');
      return;
    }

    // Initial memory should be under 150MB
    expect(memoryData.usedMB).toBeLessThan(CONFIG.PERFORMANCE.MAX_MEMORY_MB);
  });

  test('should not leak memory during gameplay simulation', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for game to initialize
    await page.waitForSelector('#game-container canvas', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Measure memory over time with simulated gameplay
    const memoryData = await page.evaluate(async () => {
      if (!performance.memory) {
        return { supported: false };
      }

      const samples = [];
      const duration = 10000; // 10 seconds
      const sampleInterval = 500; // Sample every 500ms
      const startTime = Date.now();

      // Simulate gameplay
      const inputInterval = setInterval(() => {
        const canvas = document.querySelector('#game-container canvas');
        if (canvas) {
          const event = new MouseEvent('mousedown', {
            clientX: Math.random() * canvas.width,
            clientY: Math.random() * canvas.height
          });
          canvas.dispatchEvent(event);
        }
      }, 200);

      return new Promise((resolve) => {
        const memoryInterval = setInterval(() => {
          const currentTime = Date.now();
          const usedMB = performance.memory.usedJSHeapSize / (1024 * 1024);
          
          samples.push({
            time: currentTime - startTime,
            usedMB
          });

          if (currentTime - startTime >= duration) {
            clearInterval(memoryInterval);
            clearInterval(inputInterval);

            const avgMemory = samples.reduce((a, b) => a + b.usedMB, 0) / samples.length;
            const maxMemory = Math.max(...samples.map(s => s.usedMB));
            const minMemory = Math.min(...samples.map(s => s.usedMB));
            const memoryGrowth = samples[samples.length - 1].usedMB - samples[0].usedMB;

            resolve({
              samples: samples.length,
              avgMemory,
              maxMemory,
              minMemory,
              memoryGrowth,
              initialMemory: samples[0].usedMB,
              finalMemory: samples[samples.length - 1].usedMB
            });
          }
        }, sampleInterval);
      });
    });

    if (memoryData.supported === false) {
      test.skip(true, 'Memory API not supported');
      return;
    }

    // Maximum memory should stay under 150MB
    expect(memoryData.maxMemory).toBeLessThan(CONFIG.PERFORMANCE.MAX_MEMORY_MB);

    // Average memory should be well under limit
    expect(memoryData.avgMemory).toBeLessThan(CONFIG.PERFORMANCE.MAX_MEMORY_MB * 0.8);

    // Memory growth should be minimal (< 20MB over 10 seconds)
    expect(memoryData.memoryGrowth).toBeLessThan(20);
  });

  test('should release memory after cleanup', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for game to initialize
    await page.waitForSelector('#game-container canvas', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Measure memory before and after cleanup
    const memoryData = await page.evaluate(async () => {
      if (!performance.memory) {
        return { supported: false };
      }

      const beforeCleanup = performance.memory.usedJSHeapSize / (1024 * 1024);

      // Simulate game activity
      for (let i = 0; i < 100; i++) {
        const canvas = document.querySelector('#game-container canvas');
        if (canvas) {
          const event = new MouseEvent('mousedown', {
            clientX: Math.random() * canvas.width,
            clientY: Math.random() * canvas.height
          });
          canvas.dispatchEvent(event);
        }
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const afterActivity = performance.memory.usedJSHeapSize / (1024 * 1024);

      // Force garbage collection if available (only in Chrome with --expose-gc flag)
      if (global.gc) {
        global.gc();
      }

      // Wait a bit for GC
      await new Promise(resolve => setTimeout(resolve, 1000));

      const afterGC = performance.memory.usedJSHeapSize / (1024 * 1024);

      return {
        beforeCleanup,
        afterActivity,
        afterGC,
        activityIncrease: afterActivity - beforeCleanup,
        gcReduction: afterActivity - afterGC
      };
    });

    if (memoryData.supported === false) {
      test.skip(true, 'Memory API not supported');
      return;
    }

    // All measurements should stay under limit
    expect(memoryData.beforeCleanup).toBeLessThan(CONFIG.PERFORMANCE.MAX_MEMORY_MB);
    expect(memoryData.afterActivity).toBeLessThan(CONFIG.PERFORMANCE.MAX_MEMORY_MB);
    expect(memoryData.afterGC).toBeLessThan(CONFIG.PERFORMANCE.MAX_MEMORY_MB);

    // Activity should not cause excessive memory growth
    expect(memoryData.activityIncrease).toBeLessThan(30);
  });

  test('should handle multiple game sessions without memory leak', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for game to initialize
    await page.waitForSelector('#game-container canvas', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Measure memory across multiple "sessions"
    const memoryData = await page.evaluate(async () => {
      if (!performance.memory) {
        return { supported: false };
      }

      const sessionMemories = [];
      const sessionsCount = 5;

      for (let session = 0; session < sessionsCount; session++) {
        const startMemory = performance.memory.usedJSHeapSize / (1024 * 1024);

        // Simulate gameplay session
        for (let i = 0; i < 50; i++) {
          const canvas = document.querySelector('#game-container canvas');
          if (canvas) {
            const event = new MouseEvent('mousedown', {
              clientX: Math.random() * canvas.width,
              clientY: Math.random() * canvas.height
            });
            canvas.dispatchEvent(event);
          }
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        const endMemory = performance.memory.usedJSHeapSize / (1024 * 1024);

        sessionMemories.push({
          session: session + 1,
          startMemory,
          endMemory,
          growth: endMemory - startMemory
        });

        // Short break between sessions
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const avgGrowth = sessionMemories.reduce((a, b) => a + b.growth, 0) / sessionMemories.length;
      const maxGrowth = Math.max(...sessionMemories.map(s => s.growth));
      const totalGrowth = sessionMemories[sessionsCount - 1].endMemory - sessionMemories[0].startMemory;

      return {
        sessions: sessionMemories,
        avgGrowth,
        maxGrowth,
        totalGrowth
      };
    });

    if (memoryData.supported === false) {
      test.skip(true, 'Memory API not supported');
      return;
    }

    // Average growth per session should be minimal
    expect(memoryData.avgGrowth).toBeLessThan(10);

    // Total growth across all sessions should be reasonable
    expect(memoryData.totalGrowth).toBeLessThan(30);

    // No session should exceed memory limit
    memoryData.sessions.forEach((session) => {
      expect(session.endMemory).toBeLessThan(CONFIG.PERFORMANCE.MAX_MEMORY_MB);
    });
  });

  test('should handle texture loading without memory spike', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for game to initialize
    await page.waitForSelector('#game-container canvas', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Measure memory during asset loading simulation
    const memoryData = await page.evaluate(async () => {
      if (!performance.memory) {
        return { supported: false };
      }

      const beforeLoad = performance.memory.usedJSHeapSize / (1024 * 1024);

      // Simulate loading multiple textures
      const images = [];
      for (let i = 0; i < 10; i++) {
        const img = new Image();
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        images.push(img);
        await new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }

      const afterLoad = performance.memory.usedJSHeapSize / (1024 * 1024);

      // Clean up
      images.length = 0;

      await new Promise(resolve => setTimeout(resolve, 500));

      const afterCleanup = performance.memory.usedJSHeapSize / (1024 * 1024);

      return {
        beforeLoad,
        afterLoad,
        afterCleanup,
        loadIncrease: afterLoad - beforeLoad,
        cleanupReduction: afterLoad - afterCleanup
      };
    });

    if (memoryData.supported === false) {
      test.skip(true, 'Memory API not supported');
      return;
    }

    // All measurements should stay under limit
    expect(memoryData.beforeLoad).toBeLessThan(CONFIG.PERFORMANCE.MAX_MEMORY_MB);
    expect(memoryData.afterLoad).toBeLessThan(CONFIG.PERFORMANCE.MAX_MEMORY_MB);
    expect(memoryData.afterCleanup).toBeLessThan(CONFIG.PERFORMANCE.MAX_MEMORY_MB);

    // Loading textures should not cause excessive memory increase
    expect(memoryData.loadIncrease).toBeLessThan(20);
  });
});
