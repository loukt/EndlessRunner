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
    id: 'businessman-default',
    name: 'Classic Businessman',
    description: 'The original look - professional and timeless',
    price: 0,
    type: 'skin',
    colors: {
      suit: 0x2C3E50,      // Dark blue-gray suit
      tie: 0xE74C3C,       // Red tie
      shirt: 0xFFFFFF,     // White shirt
      skin: 0xFFDBAC,      // Light skin tone
      briefcase: 0x8B4513  // Brown briefcase
    }
  },
  
  // Tier 1 - Affordable skins (100 coins)
  {
    id: 'businessman-navy',
    name: 'Navy Executive',
    description: 'Commanding presence in navy blue',
    price: 100,
    type: 'skin',
    colors: {
      suit: 0x001F3F,      // Navy blue suit
      tie: 0xFFD700,       // Gold tie
      shirt: 0xF0F8FF,     // Light blue shirt
      skin: 0xFFDBAC,
      briefcase: 0x4A4A4A  // Dark gray briefcase
    }
  },
  {
    id: 'businessman-charcoal',
    name: 'Charcoal Suit',
    description: 'Sophisticated gray tones',
    price: 100,
    type: 'skin',
    colors: {
      suit: 0x36454F,      // Charcoal suit
      tie: 0xFF6B6B,       // Coral red tie
      shirt: 0xFFFFFF,
      skin: 0xFFDBAC,
      briefcase: 0x2C2C2C  // Black briefcase
    }
  },
  
  // Tier 2 - Mid-tier skins (250 coins)
  {
    id: 'businessman-brown',
    name: 'Earth Tones',
    description: 'Warm and approachable style',
    price: 250,
    type: 'skin',
    colors: {
      suit: 0x6B4423,      // Brown suit
      tie: 0xFF8C00,       // Dark orange tie
      shirt: 0xFFF8DC,     // Cream shirt
      skin: 0xC68642,      // Medium skin tone
      briefcase: 0x654321  // Medium brown briefcase
    }
  },
  {
    id: 'businessman-midnight',
    name: 'Midnight Runner',
    description: 'Sleek and mysterious',
    price: 250,
    type: 'skin',
    colors: {
      suit: 0x191970,      // Midnight blue suit
      tie: 0x9370DB,       // Purple tie
      shirt: 0xE6E6FA,     // Lavender shirt
      skin: 0xFFDBAC,
      briefcase: 0x000080  // Navy briefcase
    }
  },
  {
    id: 'businessman-olive',
    name: 'Olive Professional',
    description: 'Military-inspired fashion',
    price: 250,
    type: 'skin',
    colors: {
      suit: 0x556B2F,      // Olive suit
      tie: 0x8B4513,       // Saddle brown tie
      shirt: 0xF5F5DC,     // Beige shirt
      skin: 0xD2B48C,      // Tan skin tone
      briefcase: 0x3D3D2B  // Dark olive briefcase
    }
  },
  
  // Tier 3 - Premium skins (500 coins)
  {
    id: 'businessman-royal',
    name: 'Royal Purple',
    description: 'For those who lead with distinction',
    price: 500,
    type: 'skin',
    colors: {
      suit: 0x4B0082,      // Indigo suit
      tie: 0xFFD700,       // Gold tie
      shirt: 0xFFFAF0,     // Floral white shirt
      skin: 0xFFDBAC,
      briefcase: 0x8B008B  // Dark magenta briefcase
    }
  },
  {
    id: 'businessman-emerald',
    name: 'Emerald Elite',
    description: 'Stand out in stunning emerald',
    price: 500,
    type: 'skin',
    colors: {
      suit: 0x046307,      // Emerald green suit
      tie: 0xFFD700,       // Gold tie
      shirt: 0xF0FFF0,     // Honeydew shirt
      skin: 0xC68642,
      briefcase: 0x2F4F2F  // Dark green briefcase
    }
  },
  
  // Tier 4 - Exclusive skins (1000 coins)
  {
    id: 'businessman-gold',
    name: 'Golden Tycoon',
    description: 'Ultimate success, ultimate style',
    price: 1000,
    type: 'skin',
    colors: {
      suit: 0xFFD700,      // Gold suit
      tie: 0x000000,       // Black tie
      shirt: 0xFFFFFF,
      skin: 0xFFDBAC,
      briefcase: 0xDAA520  // Goldenrod briefcase
    }
  },
  {
    id: 'businessman-platinum',
    name: 'Platinum Executive',
    description: 'Rare and prestigious',
    price: 1000,
    type: 'skin',
    colors: {
      suit: 0xE5E4E2,      // Platinum suit
      tie: 0x000080,       // Navy tie
      shirt: 0xFFFAFA,     // Snow white shirt
      skin: 0xFFDBAC,
      briefcase: 0xC0C0C0  // Silver briefcase
    }
  },
  
  // Tier 5 - Ultimate skin (2000 coins)
  {
    id: 'businessman-rainbow',
    name: 'Rainbow Mogul',
    description: 'Legendary status - shift through all colors!',
    price: 2000,
    type: 'skin',
    colors: {
      suit: 0xFF0000,      // Will animate through rainbow
      tie: 0xFFFFFF,
      shirt: 0xFFFFFF,
      skin: 0xFFDBAC,
      briefcase: 0x000000,
      special: 'rainbow'   // Special effect flag
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
