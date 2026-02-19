import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';
import PNG from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Analyze sprite sheet and detect frame boundaries
async function analyzeSpriteSheet(imagePath, expectedFrames, frameWidth = null, frameHeight = null) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const png = PNG.PNG.sync.read(imageData);
    
    console.log(`\n📊 Analyzing: ${path.basename(imagePath)}`);
    console.log(`Image size: ${png.width}x${png.height}`);
    
    if (!frameWidth || !frameHeight) {
      // Try to auto-detect frame dimensions
      const estimatedFrameWidth = Math.round(png.width / Math.ceil(Math.sqrt(expectedFrames)));
      const estimatedFrameHeight = Math.round(png.height / Math.ceil(Math.sqrt(expectedFrames)));
      
      console.log(`Estimated frame size: ${estimatedFrameWidth}x${estimatedFrameHeight}`);
      return {
        imageWidth: png.width,
        imageHeight: png.height,
        estimatedFrameWidth,
        estimatedFrameHeight,
        frames: []
      };
    }
    
    console.log(`Frame size: ${frameWidth}x${frameHeight}`);
    
    // Calculate frames layout
    const cols = Math.floor(png.width / frameWidth);
    const rows = Math.floor(png.height / frameHeight);
    const totalFrames = cols * rows;
    
    console.log(`Layout: ${cols} columns × ${rows} rows = ${totalFrames} frames`);
    console.log(`Expected: ${expectedFrames} frames`);
    
    // Generate metadata
    const frames = {};
    for (let i = 0; i < expectedFrames && i < totalFrames; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * frameWidth;
      const y = row * frameHeight;
      
      const frameName = `sprite_${i}.png`;
      frames[frameName] = {
        frame: { x, y, w: frameWidth, h: frameHeight },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: frameWidth, h: frameHeight },
        sourceSize: { x: frameWidth, y: frameHeight }
      };
    }
    
    return {
      imageWidth: png.width,
      imageHeight: png.height,
      frameWidth,
      frameHeight,
      cols,
      rows,
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
    8,
    96,
    96
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
    3,
    87,
    93
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
    1,
    65,
    85
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
