export const GAME_CONSTANTS = {
  MIN_DECK_SIZE: 40, MAX_DECK_SIZE: 40, MAX_HAND_SIZE: 10,
  STARTING_HP: 10000, STARTING_MANA: 0, BASE_MANA_GAIN: 100,
  FIRST_PLAYER_HAND: 4, SECOND_PLAYER_HAND: 6, NORMAL_INVOKES_PER_TURN: 1,
  BASE_HP_REGEN: 100, BASE_MANA_REGEN: 50, MAX_NUMEN_SPOTS: 5, MAX_INCANTATION_SPOTS: 5,
};

export const NATURES = {
  AIR: 'air' as const, DARK: 'dark' as const, EARTH: 'earth' as const,
  FIRE: 'fire' as const, LIGHT: 'light' as const, WATER: 'water' as const,
};

type Nature = (typeof NATURES)[keyof typeof NATURES];

export const NUMEN_FAMILIES = {
  DEITY: 'deity' as const, BEAST: 'beast' as const, BUG: 'bug' as const,
  LARVA: 'larva' as const, DRAGON: 'dragon' as const, ELEMENTAL: 'elemental' as const,
  GOD: 'god' as const, HUMAN: 'human' as const, MANES: 'manes' as const,
  PLANT: 'plant' as const, UNDEAD: 'undead' as const,
};

type NumenFamily = (typeof NUMEN_FAMILIES)[keyof typeof NUMEN_FAMILIES];

export const POSITIONS = {
  ATTACK: 'attack' as const, DEFENSE: 'defense' as const, FACE_DOWN: 'face_down' as const,
} as const;

type Position = (typeof POSITIONS)[keyof typeof POSITIONS];

export const PHASES = {
  START_OF_TURN: 'start_of_turn' as const, PREPARATION: 'preparation' as const,
  COMBAT: 'combat' as const, POST_COMBAT: 'post_combat' as const, END_OF_TURN: 'end_of_turn' as const,
} as const;

type Phase = (typeof PHASES)[keyof typeof PHASES];

export const SACRIFICE_REQUIREMENTS: Record<number, number> = {
  1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 3, 9: 4, 10: 5,
};

export const RARITY = {
  COMMON: 'common' as const, RARE: 'rare' as const,
  LEGENDARY: 'legendary' as const, MYTHIC: 'mythic' as const,
} as const;

type Rarity = (typeof RARITY)[keyof typeof RARITY];

export type { Nature, NumenFamily, Position, Phase, Rarity };
