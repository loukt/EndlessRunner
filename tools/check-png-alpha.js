import fs from 'node:fs';
import { PNG } from 'pngjs';

const files = [
  'public/assets/sprites/trashcans.png',
  'public/assets/sprites/trashbag.png',
  'public/assets/sprites/Cat-spritecolorful.png'
];

for (const filePath of files) {
  const buf = fs.readFileSync(filePath);
  const png = PNG.sync.read(buf);

  let transparent = 0;
  let semi = 0;
  let opaque = 0;
  let minA = 255;
  let maxA = 0;

  for (let i = 3; i < png.data.length; i += 4) {
    const a = png.data[i];
    if (a === 0) transparent++;
    else if (a === 255) opaque++;
    else semi++;
    if (a < minA) minA = a;
    if (a > maxA) maxA = a;
  }

  const total = transparent + semi + opaque;
  const pct = (n) => ((n / total) * 100).toFixed(2) + '%';

  console.log(`\n${filePath}`);
  console.log(`size ${png.width}x${png.height}`);
  console.log(`alpha min=${minA} max=${maxA} transparent=${pct(transparent)} semi=${pct(semi)} opaque=${pct(opaque)}`);
}
