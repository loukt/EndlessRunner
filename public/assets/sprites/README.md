# Cat Sprite Sheet Setup

The player cat character now uses sprite-based animation instead of procedural graphics.

## Required File

To use the sprite sheet, place your cat sprite sheet image in this directory:

```
public/assets/sprites/cat-spritesheet.png
```

The sprite sheet should contain 8 frames arranged in a 2x4 grid (4 columns, 2 rows):
- Total size: 384x192 pixels
- Each frame: 96x96 pixels
- Arranged as:
  - Row 1 (y=0): cat_0, cat_1, cat_2, cat_3
  - Row 2 (y=96): cat_4, cat_5, cat_6, cat_7

The metadata file `cat-spritesheet.json` is already configured with the correct frame definitions.

## Fallback

If the sprite sheet image is not found, the game will use a simple procedural fallback shape to keep the game playable during development.

## Usage

Once the sprite sheet image is in place:
1. The player will load 8 animation frames sequentially
2. Frames 0-7 will cycle continuously while running
3. Frame 0 will show when jumping
4. Frame 7 will show briefly when landing
