export const GAME_CONSTANTS = {
  MIN_DECK_SIZE: 40,
  MAX_DECK_SIZE: 40,
  MAX_HAND_SIZE: 10,
  STARTING_HP: 10000,
  STARTING_MANA: 0,
  MAX_MANA: 500,
  FIRST_PLAYER_HAND: 4,
  SECOND_PLAYER_HAND: 6,
  NORMAL_SUMMONS_PER_TURN: 1,
  BASE_HP_REGEN: 100,
  BASE_MANA_REGEN: 50,
};

export const NATURES = {
  FIRE: 'fire' as const,
  EARTH: 'earth' as const,
  WATER: 'water' as const,
  AIR: 'air' as const,
  LIGHT: 'light' as const,
  DARK: 'dark' as const,
};

type Nature = (typeof NATURES)[keyof typeof NATURES];

export const MONSTER_FAMILIES = {
  DEMON: 'demon' as const,
  DRAGON: 'dragon' as const,
  ANGEL: 'angel' as const,
  ANDROID: 'android' as const,
  ELEMENTAL: 'elemental' as const,
  UNDEAD: 'undead' as const,
  BUG: 'bug' as const,
  PLANT: 'plant' as const,
  BEAST: 'beast' as const,
};

type MonsterFamily = (typeof MONSTER_FAMILIES)[keyof typeof MONSTER_FAMILIES];

export const POSITIONS = {
  ATTACK: 'attack' as const,
  DEFENSE: 'defense' as const,
  FACE_DOWN: 'face_down' as const,
} as const;

type Position = (typeof POSITIONS)[keyof typeof POSITIONS];

export const PHASES = {
  DRAW: 'draw' as const,
  STANDBY: 'standby' as const,
  MAIN1: 'main1' as const,
  BATTLE: 'battle' as const,
  MAIN2: 'main2' as const,
  END: 'end' as const,
} as const;

type Phase = (typeof PHASES)[keyof typeof PHASES];

export const TRIBUTE_REQUIREMENTS: Record<number, number> = {
  1: 0,
  2: 0,
  3: 1,
  4: 1,
  5: 2,
  6: 2,
  7: 3,
  8: 3,
  9: 4,
  10: 5,
};

export const SPELL_TYPES = {
  NORMAL: 'normal' as const,
  CONTINUOUS: 'continuous' as const,
  EQUIP: 'equip' as const,
  QUICK_PLAY: 'quick_play' as const,
} as const;

type SpellType = (typeof SPELL_TYPES)[keyof typeof SPELL_TYPES];

export const WARD_TYPES = {
  NORMAL: 'normal' as const,
  CONTINUOUS: 'continuous' as const,
  COUNTER: 'counter' as const,
} as const;

type WardType = (typeof WARD_TYPES)[keyof typeof WARD_TYPES];

export const RARITY = {
  COMMON: 'common' as const,
  UNCOMMON: 'uncommon' as const,
  RARE: 'rare' as const,
  EPIC: 'epic' as const,
  LEGENDARY: 'legendary' as const,
} as const;

type Rarity = (typeof RARITY)[keyof typeof RARITY];

export type { Nature, MonsterFamily, Position, Phase, SpellType, WardType, Rarity };
