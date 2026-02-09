/**
 * Shop UI Module
 * 
 * Displays cosmetic items for purchase with coins.
 */

import * as PIXI from 'pixi.js';
import { CONFIG } from '../config.js';
import { getCosmeticsByPrice } from '../data/cosmetics.js';

export class Shop {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.itemsContainer = null;
    this.coinBalanceText = null;
    this.scrollOffset = 0;
    this.onPurchase = null; // Callback when item purchased
    this.onSelect = null;   // Callback when item selected
    this.onClose = null;    // Callback when shop closed
  }

  /**
   * Create shop UI
   * @param {PIXI.Container} stage - Stage to add shop to
   */
  create(stage) {
    this.container = new PIXI.Container();
    this.container.visible = false;
    stage.addChild(this.container);

    // Semi-transparent background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.9);
    bg.drawRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    bg.endFill();
    bg.interactive = true; // Block clicks
    bg.on('pointerdown', (e) => this.stopNativeEvent(e));
    this.container.addChild(bg);

    // Title
    const title = new PIXI.Text('COSMETICS SHOP', {
      fontFamily: 'Arial',
      fontSize: 42,
      fontWeight: 'bold',
      fill: 0xFFD700,
      stroke: 0x000000,
      strokeThickness: 4,
    });
    title.anchor.set(0.5, 0);
    title.x = CONFIG.CANVAS.WIDTH / 2;
    title.y = 20;
    this.container.addChild(title);

    // Coin balance display
    this.coinBalanceText = new PIXI.Text('🐟 Fish: 0', {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: 0xFFD700,
      stroke: 0x000000,
      strokeThickness: 3,
    });
    this.coinBalanceText.anchor.set(0.5, 0);
    this.coinBalanceText.x = CONFIG.CANVAS.WIDTH / 2;
    this.coinBalanceText.y = 75;
    this.container.addChild(this.coinBalanceText);

    // Items container (scrollable area)
    this.itemsContainer = new PIXI.Container();
    this.itemsContainer.x = 20;
    this.itemsContainer.y = 120;
    this.container.addChild(this.itemsContainer);

    // Close button
    const closeBtn = this.createButton('BACK', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 50, 0x666666);
    closeBtn.interactive = true;
    closeBtn.buttonMode = true;
    closeBtn.on('pointerdown', (e) => {
      this.stopNativeEvent(e);
      this.hide();
      if (this.onClose) this.onClose();
    });
    this.addButtonFeedback(closeBtn);
    this.container.addChild(closeBtn);
  }

  /**
   * Show shop with current profile data
   * @param {Object} profile - Player profile
   */
  show(profile) {
    this.container.visible = true;
    this.isVisible = true;

    // Update coin balance
    this.coinBalanceText.text = `🐟 Fish: ${profile.totalCoins}`;

    // Clear previous items
    this.itemsContainer.removeChildren();

    // Get cosmetics sorted by price
    const cosmetics = getCosmeticsByPrice();
    
    // Display items in grid (2 columns)
    const itemWidth = 360;
    const itemHeight = 110;
    const padding = 10;
    const columns = 2;

    cosmetics.forEach((cosmetic, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = col * (itemWidth + padding);
      const y = row * (itemHeight + padding);

      const itemCard = this.createItemCard(cosmetic, profile, itemWidth, itemHeight);
      itemCard.x = x;
      itemCard.y = y;
      this.itemsContainer.addChild(itemCard);
    });
  }

  /**
   * Create an item card
   * @param {Object} cosmetic - Cosmetic item data
   * @param {Object} profile - Player profile
   * @param {number} width - Card width
   * @param {number} height - Card height
   * @returns {PIXI.Container} Item card container
   */
  createItemCard(cosmetic, profile, width, height) {
    const card = new PIXI.Container();

    const isOwned = profile.ownsCosmetic(cosmetic.id);
    const isSelected = profile.selectedCosmetic === cosmetic.id;
    const canAfford = profile.totalCoins >= cosmetic.price;

    // Background
    const bg = new PIXI.Graphics();
    let bgColor = 0x2C3E50; // Default gray
    if (isSelected) {
      bgColor = 0x27AE60; // Green if selected
    } else if (isOwned) {
      bgColor = 0x34495E; // Lighter gray if owned
    }
    bg.beginFill(bgColor, 0.8);
    bg.drawRoundedRect(0, 0, width, height, 10);
    bg.endFill();
    
    // Border
    bg.lineStyle(2, isSelected ? 0x2ECC71 : 0x7F8C8D, 1);
    bg.drawRoundedRect(0, 0, width, height, 10);
    card.addChild(bg);

    // Color preview (small box showing fur color)
    const preview = new PIXI.Graphics();
    preview.beginFill(cosmetic.colors.fur);
    preview.drawRoundedRect(10, 10, 40, 40, 5);
    preview.endFill();
    preview.lineStyle(2, 0xFFFFFF, 1);
    preview.drawRoundedRect(10, 10, 40, 40, 5);
    card.addChild(preview);

    // Name
    const nameText = new PIXI.Text(cosmetic.name, {
      fontFamily: 'Arial',
      fontSize: 18,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
    });
    nameText.x = 60;
    nameText.y = 10;
    card.addChild(nameText);

    // Description
    const descText = new PIXI.Text(cosmetic.description, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xCCCCCC,
      wordWrap: true,
      wordWrapWidth: width - 70,
    });
    descText.x = 60;
    descText.y = 35;
    card.addChild(descText);

    // Price / Status
    let buttonText = '';
    let buttonColor = 0x3498DB; // Blue

    if (cosmetic.price === 0) {
      buttonText = 'FREE';
      buttonColor = 0x95A5A6;
    } else if (isSelected) {
      buttonText = 'EQUIPPED';
      buttonColor = 0x27AE60; // Green
    } else if (isOwned) {
      buttonText = 'SELECT';
      buttonColor = 0x2ECC71; // Light green
    } else if (canAfford) {
      buttonText = `${cosmetic.price} 🐟`;
      buttonColor = 0xE67E22; // Orange
    } else {
      buttonText = `${cosmetic.price} 🐟`;
      buttonColor = 0x95A5A6; // Gray (can't afford)
    }

    // Action button
    const button = this.createButton(buttonText, width - 90, height - 25, buttonColor, 160, 40);
    
    // Only make interactive if can purchase or select
    if ((isOwned && !isSelected) || (!isOwned && canAfford && cosmetic.price > 0)) {
      button.interactive = true;
      button.buttonMode = true;
      button.on('pointerdown', async (e) => {
        this.stopNativeEvent(e);
        if (isOwned && !isSelected) {
          // Select this cosmetic
          const success = await profile.selectCosmetic(cosmetic.id);
          if (success && this.onSelect) {
            this.onSelect(cosmetic);
          }
          this.show(profile); // Refresh display
        } else if (!isOwned && canAfford) {
          // Purchase this cosmetic
          const success = await profile.purchaseCosmetic(cosmetic.id, cosmetic.price);
          if (success) {
            if (this.onPurchase) {
              this.onPurchase(cosmetic);
            }
            // Auto-select after purchase
            await profile.selectCosmetic(cosmetic.id);
            if (this.onSelect) {
              this.onSelect(cosmetic);
            }
          }
          this.show(profile); // Refresh display
        }
      });
    }
    
    card.addChild(button);

    // "SELECTED" badge if equipped
    if (isSelected) {
      const badge = new PIXI.Text('✓', {
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xFFFFFF,
      });
      badge.x = width - 30;
      badge.y = 10;
      card.addChild(badge);
    }

    return card;
  }

  /**
   * Create a button
   * @param {string} text - Button text
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} color - Button color
   * @param {number} width - Button width
   * @param {number} height - Button height
   * @returns {PIXI.Container} Button container
   */
  createButton(text, x, y, color, width = 140, height = 50) {
    const button = new PIXI.Container();
    button.x = x;
    button.y = y;

    const bg = new PIXI.Graphics();
    bg.beginFill(color);
    bg.drawRoundedRect(-width / 2, -height / 2, width, height, 8);
    bg.endFill();
    button.addChild(bg);

    const label = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: width > 150 ? 18 : 16,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
    });
    label.anchor.set(0.5);
    button.addChild(label);

    return button;
  }

  stopNativeEvent(e) {
    if (!e) return;
    if (typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    const nativeEvent = e.nativeEvent;
    if (nativeEvent && typeof nativeEvent.preventDefault === 'function') {
      nativeEvent.preventDefault();
    }
    if (nativeEvent && typeof nativeEvent.stopImmediatePropagation === 'function') {
      nativeEvent.stopImmediatePropagation();
    }
    if (nativeEvent && typeof nativeEvent.stopPropagation === 'function') {
      nativeEvent.stopPropagation();
    }
  }

  addButtonFeedback(button) {
    if (!button || typeof button.on !== 'function') return;
    const setScale = (s) => button.scale.set(s);
    button.on('pointerover', () => setScale(1.03));
    button.on('pointerout', () => setScale(1.0));
    button.on('pointerdown', () => setScale(0.97));
    button.on('pointerup', () => setScale(1.03));
    button.on('pointerupoutside', () => setScale(1.0));
  }

  /**
   * Hide shop
   */
  hide() {
    this.container.visible = false;
    this.isVisible = false;
  }

  /**
   * Toggle shop visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      // Can't show without profile data
      console.warn('Shop.show() requires profile data');
    }
  }

  /**
   * Destroy shop
   */
  destroy() {
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
  }
}
