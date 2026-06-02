import { NATURES, MONSTER_FAMILIES, POSITIONS, SPELL_TYPES, WARD_TYPES, RARITY } from './constants';

export const CARD_TYPE = {
  monster: 'monster' as const,
  spell: 'spell' as const,
  ward: 'ward' as const,
} as const;

export type CardType = typeof CARD_TYPE[keyof typeof CARD_TYPE];

export type Nature = typeof NATURES[keyof typeof NATURES];
export type MonsterFamily = typeof MONSTER_FAMILIES[keyof typeof MONSTER_FAMILIES];
export type Position = typeof POSITIONS[keyof typeof POSITIONS];
export type SpellType = typeof SPELL_TYPES[keyof typeof SPELL_TYPES];
export type WardType = typeof WARD_TYPES[keyof typeof WARD_TYPES];
export type Rarity = typeof RARITY[keyof typeof RARITY];

export interface BaseCard {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
};

export interface MonsterCard extends BaseCard {
  type: 'monster';
  attribute: Nature;
  monsterFamily: MonsterFamily;
  level: number;
  baseAttack: number;
  baseDefense: number;
  effects?: string[];
  deckRequirements: Record<MonsterFamily, number>;
  isLegendary?: boolean;
  legendaryQuest?: {
    deckRequirements: Record<Nature, number>;
    activationConditions: {
      wardsActivated: number;
    };
    effects: string[];
  };
};

export interface SpellCard extends BaseCard {
  type: 'spell';
  spellType: 'normal' | 'continuous' | 'equip' | 'quick_play';
  effects: string[];
};

export interface WardCard extends BaseCard {
  type: 'ward';
  wardType: 'normal' | 'continuous' | 'counter';
  effects: string[];
};

export type Card = MonsterCard | SpellCard | WardCard;

export interface LegendaryQuestCondition {
  deckRequirements: Record<Nature, number>;
  activationConditions: {
    wardsActivated: number;
  };
  effects: string[];
};

export interface PlayerState {
  playerId: string;
  currentHP: number;
  maxHP: number;
  fieldMonsters: MonsterCard[];
  fieldSpells: (SpellCard | WardCard)[];
  hand: Card[];
  deck: Card[];
  graveyard: Card[];
  banished: Card[];
  monsterPositions: Record<string, Position>;
  fatigueDecrease: number;
  attributeCount: Record<Nature, number>;
  typeCount: Record<MonsterFamily, number>;
};

export interface BoardState {
  player1: PlayerState;
  player2: PlayerState;
  currentPlayer: 'player1' | 'player2';
  currentPhase: string;
  turnNumber: number;
  isFirstTurn: boolean;
  combatLog: CombatInteraction[];
};

export interface CombatInteraction {
  attackerMonsterId: string;
  targetMonsterId: string | null;
  attackValue: number;
  defenseValue: number;
  decreaseDealt: number;
  isKill: boolean;
  timestamp: number;
}