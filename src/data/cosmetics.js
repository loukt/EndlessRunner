/**
 * Cosmetics Module
 * 
 * Manages cosmetic items (character skins) that can be purchased with coins.
 */

/**
 * Cosmetic item definition
 * @typedef {Object} Cosmetic
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} description - Item description
 * @property {number} price - Cost in coins (0 = default/free)
 * @property {string} type - Cosmetic type (e.g., 'skin')
 * @property {Object} colors - Color scheme for the cosmetic
 */

/**
 * Available cosmetic items
 */
export const COSMETICS = [
  // Default skin (free)
  {
    id: 'cat-tabby',
    name: 'Alley Tabby',
    description: 'Streetwise stripes for every run',
    price: 0,
    type: 'skin',
    colors: {
      fur: 0xD9A05B,
      patch: 0x8B5E3C,
      belly: 0xF5D7B2,
      collar: 0xCC3344,
      eyes: 0x2E2E2E
    }
  },
  
  // Tier 1 - Affordable skins (100 coins)
  {
    id: 'cat-tuxedo',
    name: 'Tuxedo Mischief',
    description: 'Formal paws, playful attitude',
    price: 100,
    type: 'skin',
    colors: {
      fur: 0x2B2B2B,
      patch: 0xFFFFFF,
      belly: 0xFFFFFF,
      collar: 0xE53935,
      eyes: 0xF5F5F5
    }
  },
  {
    id: 'cat-ginger',
    name: 'Ginger Dash',
    description: 'Bright fur with a bold collar',
    price: 100,
    type: 'skin',
    colors: {
      fur: 0xF4A259,
      patch: 0xC97C3C,
      belly: 0xF9E0C7,
      collar: 0x2E7D32,
      eyes: 0x2E2E2E
    }
  },
  
  // Tier 2 - Mid-tier skins (250 coins)
  {
    id: 'cat-smoke',
    name: 'Smoke Shadow',
    description: 'Cool gray for silent rooftops',
    price: 250,
    type: 'skin',
    colors: {
      fur: 0x8C8C8C,
      patch: 0x5C5C5C,
      belly: 0xD6D6D6,
      collar: 0x3949AB,
      eyes: 0x1C1C1C
    }
  },
  {
    id: 'cat-calico',
    name: 'Calico Chaos',
    description: 'Patchwork style with wild energy',
    price: 250,
    type: 'skin',
    colors: {
      fur: 0xF2C46D,
      patch: 0x8C3B2A,
      belly: 0xFFF1D6,
      collar: 0xFF7043,
      eyes: 0x2E2E2E
    }
  },
  {
    id: 'cat-forest',
    name: 'Forest Prowler',
    description: 'Earthy tones for quiet escapes',
    price: 250,
    type: 'skin',
    colors: {
      fur: 0x6D4C41,
      patch: 0x4E342E,
      belly: 0xD7CCC8,
      collar: 0x8BC34A,
      eyes: 0x1B1B1B
    }
  },
  
  // Tier 3 - Premium skins (500 coins)
  {
    id: 'cat-snow',
    name: 'Snow Drifter',
    description: 'Bright fur with icy accents',
    price: 500,
    type: 'skin',
    colors: {
      fur: 0xF7F7F7,
      patch: 0xC9D6FF,
      belly: 0xFFFFFF,
      collar: 0x00ACC1,
      eyes: 0x1B1B1B
    }
  },
  {
    id: 'cat-midnight',
    name: 'Midnight Sprint',
    description: 'Dark fur with neon collar',
    price: 500,
    type: 'skin',
    colors: {
      fur: 0x1B1B1B,
      patch: 0x3A3A3A,
      belly: 0x6E6E6E,
      collar: 0x8E24AA,
      eyes: 0xE0E0E0
    }
  },
  
  // Tier 4 - Exclusive skins (1000 coins)
  {
    id: 'cat-golden',
    name: 'Golden Purr',
    description: 'Shimmering fur for legendary runs',
    price: 1000,
    type: 'skin',
    colors: {
      fur: 0xFFD54F,
      patch: 0xFBC02D,
      belly: 0xFFF8E1,
      collar: 0x6A1B9A,
      eyes: 0x4E342E
    }
  },
  {
    id: 'cat-galaxy',
    name: 'Galaxy Stray',
    description: 'Cosmic coat with starlight shimmer',
    price: 1000,
    type: 'skin',
    colors: {
      fur: 0x4A148C,
      patch: 0x1A237E,
      belly: 0x9FA8DA,
      collar: 0x00BCD4,
      eyes: 0xFFFFFF
    }
  },
  
  // Tier 5 - Ultimate skin (2000 coins)
  {
    id: 'cat-rainbow',
    name: 'Rainbow Roofer',
    description: 'Legendary shimmer across every leap',
    price: 2000,
    type: 'skin',
    colors: {
      fur: 0xFF5252,
      patch: 0xFF9800,
      belly: 0xFFF9C4,
      collar: 0x00C853,
      eyes: 0x212121,
      special: 'rainbow'
    }
  }
];

/**
 * Get cosmetic by ID
 * @param {string} id - Cosmetic identifier
 * @returns {Cosmetic|null} Cosmetic item or null if not found
 */
export function getCosmeticById(id) {
  return COSMETICS.find(c => c.id === id) || null;
}

/**
 * Get all cosmetics of a specific type
 * @param {string} type - Cosmetic type
 * @returns {Cosmetic[]} Array of cosmetics
 */
export function getCosmeticsByType(type) {
  return COSMETICS.filter(c => c.type === type);
}

/**
 * Get cosmetics sorted by price
 * @returns {Cosmetic[]} Array of cosmetics sorted by price
 */
export function getCosmeticsByPrice() {
  return [...COSMETICS].sort((a, b) => a.price - b.price);
}

/**
 * Get cosmetics the player can afford
 * @param {number} coins - Player's coin balance
 * @returns {Cosmetic[]} Array of affordable cosmetics
 */
export function getAffordableCosmetics(coins) {
  return COSMETICS.filter(c => c.price <= coins);
}

/**
 * Get default cosmetic
 * @returns {Cosmetic} Default cosmetic item
 */
export function getDefaultCosmetic() {
  return COSMETICS[0];
}
