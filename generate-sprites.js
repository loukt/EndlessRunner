import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Generate a sprite sheet with 8 cat running frames
function generateCatSpriteSheet() {
  const frameWidth = 96;
  const frameHeight = 96;
  const cols = 4;
  const rows = 2;
  
  // Create canvas for sprite sheet
  const canvas = createCanvas(frameWidth * cols, frameHeight * rows);
  const ctx = canvas.getContext('2d');
  
  // Fill background white
  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Define 8 cat poses for running animation
  const poses = [
    // Frame 0: stretch - front legs forward, back legs back
    { bodyBob: 0, headBob: 0, tailLift: 1, frontA: 10, frontB: -6, backA: -10, backB: 6 },
    // Frame 1: gather - all legs pulled in
    { bodyBob: 2, headBob: 1, tailLift: 0, frontA: 2, frontB: -2, backA: -2, backB: 2 },
    // Frame 2: stretch - opposite legs forward/back
    { bodyBob: 0, headBob: 0, tailLift: 1, frontA: -6, frontB: 10, backA: 6, backB: -10 },
    // Frame 3: gather - legs pulled in (different side)
    { bodyBob: 2, headBob: 1, tailLift: 0, frontA: -2, frontB: 2, backA: 2, backB: -2 },
    // Frame 4: variation 1
    { bodyBob: 1, headBob: 0, tailLift: 1, frontA: 8, frontB: -4, backA: -8, backB: 4 },
    // Frame 5: mid-stride
    { bodyBob: 1, headBob: 1, tailLift: 0, frontA: 0, frontB: 0, backA: 0, backB: 0 },
    // Frame 6: stretch high
    { bodyBob: -1, headBob: -1, tailLift: 2, frontA: -8, frontB: 8, backA: 8, backB: -8 },
    // Frame 7: landing (crouched)
    { bodyBob: 3, headBob: 2, tailLift: 0, frontA: 4, frontB: -4, backA: -4, backB: 4 }
  ];
  
  // Draw each frame
  poses.forEach((pose, frameIndex) => {
    const col = frameIndex % cols;
    const row = Math.floor(frameIndex / cols);
    const offsetX = col * frameWidth;
    const offsetY = row * frameHeight;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    drawCat(ctx, frameWidth, frameHeight, pose);
    ctx.restore();
  });
  
  // Save to file
  const outputDir = path.join(__dirname, 'public', 'assets', 'sprites');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'cat-spritesheet.png'), buffer);
  console.log('✓ Cat sprite sheet generated: public/assets/sprites/cat-spritesheet.png');
}

function drawCat(ctx, width, height, pose) {
  const centerX = width / 2;
  const centerY = height / 2 + 10;
  
  // Colors
  const fuColor = '#D9A05B';
  const patchColor = '#8B5E3C';
  const bellyColor = '#F5D7B2';
  const collarColor = '#CC3344';
  const eyeColor = '#2E2E2E';
  
  ctx.fillStyle = fuColor;
  ctx.strokeStyle = fuColor;
  
  // Draw body
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + pose.bodyBob, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw tail
  ctx.strokeStyle = fuColor;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(centerX - 16, centerY - 2 + pose.bodyBob);
  ctx.bezierCurveTo(
    centerX - 26,
    centerY - 8 - pose.tailLift * 2 + pose.bodyBob,
    centerX - 34,
    centerY - 4 - pose.tailLift * 3 + pose.bodyBob,
    centerX - 30,
    centerY + 8 - pose.tailLift + pose.bodyBob
  );
  ctx.stroke();
  
  // Draw head
  ctx.fillStyle = fuColor;
  ctx.beginPath();
  ctx.arc(centerX + 18, centerY - 12 + pose.headBob, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw muzzle
  ctx.beginPath();
  ctx.ellipse(centerX + 25, centerY - 10 + pose.headBob, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw ears
  ctx.fillStyle = fuColor;
  ctx.beginPath();
  ctx.moveTo(centerX + 14, centerY - 18 + pose.headBob);
  ctx.lineTo(centerX + 12, centerY - 26 + pose.headBob);
  ctx.lineTo(centerX + 15, centerY - 19 + pose.headBob);
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(centerX + 19, centerY - 18 + pose.headBob);
  ctx.lineTo(centerX + 21, centerY - 26 + pose.headBob);
  ctx.lineTo(centerX + 24, centerY - 19 + pose.headBob);
  ctx.fill();
  
  // Draw eyes
  ctx.fillStyle = eyeColor;
  ctx.beginPath();
  ctx.arc(centerX + 20, centerY - 13 + pose.headBob, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX + 23, centerY - 13 + pose.headBob, 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw collar
  ctx.fillStyle = collarColor;
  ctx.fillRect(centerX + 9, centerY - 6 + pose.headBob, 14, 3);
  
  // Draw front legs
  drawLeg(ctx, centerX + 9, centerY + 4, centerX + 9 + pose.frontA, centerY + 20, patchColor);
  drawLeg(ctx, centerX + 9, centerY + 4, centerX + 9 + pose.frontB, centerY + 20, fuColor);
  
  // Draw back legs
  drawLeg(ctx, centerX - 6, centerY + 4, centerX - 6 + pose.backA, centerY + 20, patchColor);
  drawLeg(ctx, centerX - 6, centerY + 4, centerX - 6 + pose.backB, centerY + 20, fuColor);
  
  // Draw belly
  ctx.fillStyle = bellyColor;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.ellipse(centerX + 3, centerY + 3 + pose.bodyBob, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawLeg(ctx, x1, y1, x2, y2, color) {
  const kneeX = (x1 + x2) / 2;
  const kneeY = y1 + 10;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(kneeX, kneeY);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  
  // Draw paw
  ctx.fillStyle = '#1F1F1F';
  ctx.beginPath();
  ctx.ellipse(x2, y2, 4.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
}

generateCatSpriteSheet();
