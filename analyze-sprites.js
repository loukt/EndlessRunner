import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findSegments(flags, { maxGap = 2, minSpan = 2 } = {}) {
  /** @type {{start:number,end:number}[]} */
  const raw = [];
  let start = -1;
  for (let i = 0; i < flags.length; i++) {
    if (flags[i]) {
      if (start === -1) start = i;
    } else if (start !== -1) {
      raw.push({ start, end: i - 1 });
      start = -1;
    }
  }
  if (start !== -1) raw.push({ start, end: flags.length - 1 });

  // Merge segments separated by small gaps
  /** @type {{start:number,end:number}[]} */
  const merged = [];
  for (const seg of raw) {
    const last = merged[merged.length - 1];
    if (last && seg.start - last.end - 1 <= maxGap) {
      last.end = seg.end;
    } else {
      merged.push({ ...seg });
    }
  }

  return merged.filter(s => (s.end - s.start + 1) >= minSpan);
}

function clampRect(rect, width, height) {
  const x = Math.max(0, Math.min(rect.x, width - 1));
  const y = Math.max(0, Math.min(rect.y, height - 1));
  const w = Math.max(1, Math.min(rect.w, width - x));
  const h = Math.max(1, Math.min(rect.h, height - y));
  return { x, y, w, h };
}

function detectFramesFromAlpha(png, expectedFrames, { alphaThreshold = 10, pad = 1 } = {}) {
  const { width, height, data } = png;

  const cornerColors = [
    { x: 0, y: 0 },
    { x: width - 1, y: 0 },
    { x: 0, y: height - 1 },
    { x: width - 1, y: height - 1 }
  ].map(p => {
    const i = (p.y * width + p.x) * 4;
    return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
  });

  // Pick the most frequent corner RGBA as background (helps when PNG has opaque background)
  const keyOf = c => `${c.r},${c.g},${c.b},${c.a}`;
  const counts = new Map();
  for (const c of cornerColors) {
    const k = keyOf(c);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  let bgKey = null;
  let bgCount = -1;
  for (const [k, v] of counts.entries()) {
    if (v > bgCount) {
      bgKey = k;
      bgCount = v;
    }
  }
  const [bgR, bgG, bgB, bgA] = bgKey.split(',').map(n => Number(n));
  const bg = { r: bgR, g: bgG, b: bgB, a: bgA };

  const colorTolerance = 8;
  const isBackground = (r, g, b, a) =>
    Math.abs(r - bg.r) <= colorTolerance &&
    Math.abs(g - bg.g) <= colorTolerance &&
    Math.abs(b - bg.b) <= colorTolerance &&
    Math.abs(a - bg.a) <= colorTolerance;

  const rowHas = new Array(height).fill(false);
  const colHas = new Array(width).fill(false);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const i = rowOffset + x * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const isForeground = a > alphaThreshold && !isBackground(r, g, b, a);
      if (isForeground) {
        rowHas[y] = true;
        colHas[x] = true;
      }
    }
  }

  const yBands = findSegments(rowHas, { maxGap: 2, minSpan: 2 });
  /** @type {{x:number,y:number,w:number,h:number}[]} */
  const rects = [];

  for (const band of yBands) {
    const bandColHas = new Array(width).fill(false);
    for (let y = band.start; y <= band.end; y++) {
      const rowOffset = y * width * 4;
      for (let x = 0; x < width; x++) {
        const i = rowOffset + x * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        const isForeground = a > alphaThreshold && !isBackground(r, g, b, a);
        if (isForeground) {
          bandColHas[x] = true;
        }
      }
    }

    const xSegs = findSegments(bandColHas, { maxGap: 2, minSpan: 2 });
    for (const seg of xSegs) {
      const rect = {
        x: seg.start - pad,
        y: band.start - pad,
        w: (seg.end - seg.start + 1) + pad * 2,
        h: (band.end - band.start + 1) + pad * 2
      };
      rects.push(clampRect(rect, width, height));
    }
  }

  rects.sort((a, b) => (a.y - b.y) || (a.x - b.x));

  if (rects.length < expectedFrames) {
    throw new Error(`Detected only ${rects.length} frames, expected ${expectedFrames}`);
  }

  return rects.slice(0, expectedFrames);
}

// Analyze sprite sheet and detect frame boundaries via transparency
async function analyzeSpriteSheet(imagePath, expectedFrames) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const png = PNG.sync.read(imageData);

    console.log(`\n📊 Analyzing: ${path.basename(imagePath)}`);
    console.log(`Image size: ${png.width}x${png.height}`);

    const rects = detectFramesFromAlpha(png, expectedFrames, { alphaThreshold: 10, pad: 1 });
    console.log(`Detected frames: ${rects.length} (expected ${expectedFrames})`);

    const frames = {};
    for (let i = 0; i < rects.length; i++) {
      const frameName = `sprite_${i}.png`;
      const r = rects[i];
      frames[frameName] = {
        frame: { x: r.x, y: r.y, w: r.w, h: r.h },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: r.w, h: r.h },
        sourceSize: { x: r.w, y: r.h }
      };
    }

    return {
      imageWidth: png.width,
      imageHeight: png.height,
      frames
    };
  } catch (error) {
    console.error(`Error analyzing ${imagePath}:`, error.message);
    return null;
  }
}

async function main() {
  const baseDir = path.join(__dirname, 'public', 'assets', 'sprites');
  
  // Analyze cat sprite
  const catResult = await analyzeSpriteSheet(
    path.join(baseDir, 'Cat-spritecolorful.png'),
    8
  );
  if (catResult) {
    const catMetadata = {
      frames: catResult.frames,
      meta: {
        app: 'EndlessRunner',
        version: '1.0.0',
        image: 'Cat-spritecolorful.png',
        format: 'RGBA8888',
        size: { w: catResult.imageWidth, h: catResult.imageHeight },
        scale: '1'
      }
    };
    fs.writeFileSync(
      path.join(baseDir, 'cat-spritecolorful-spritesheet.json'),
      JSON.stringify(catMetadata, null, 2)
    );
    console.log('✓ Generated cat-spritecolorful-spritesheet.json');
  }
  
  // Analyze trash cans - actual dimensions
  const trashcanResult = await analyzeSpriteSheet(
    path.join(baseDir, 'trashcans.png'),
    3
  );
  if (trashcanResult) {
    const trashcanMetadata = {
      frames: trashcanResult.frames,
      meta: {
        app: 'EndlessRunner',
        version: '1.0.0',
        image: 'trashcans.png',
        format: 'RGBA8888',
        size: { w: trashcanResult.imageWidth, h: trashcanResult.imageHeight },
        scale: '1'
      }
    };
    fs.writeFileSync(
      path.join(baseDir, 'trashcans-spritesheet.json'),
      JSON.stringify(trashcanMetadata, null, 2)
    );
    console.log('✓ Updated trashcans-spritesheet.json');
  }
  
  // Analyze trash bag - actual dimensions
  const trashbagResult = await analyzeSpriteSheet(
    path.join(baseDir, 'trashbag.png'),
    1
  );
  if (trashbagResult) {
    const trashbagMetadata = {
      frames: trashbagResult.frames,
      meta: {
        app: 'EndlessRunner',
        version: '1.0.0',
        image: 'trashbag.png',
        format: 'RGBA8888',
        size: { w: trashbagResult.imageWidth, h: trashbagResult.imageHeight },
        scale: '1'
      }
    };
    fs.writeFileSync(
      path.join(baseDir, 'trashbag-spritesheet.json'),
      JSON.stringify(trashbagMetadata, null, 2)
    );
    console.log('✓ Updated trashbag-spritesheet.json');
  }
  
  console.log('\n✅ All sprite metadata generated!\n');
}

main().catch(console.error);
