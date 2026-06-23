import { NATURES, NUMEN_FAMILIES, POSITIONS, RARITY } from './constants';

export const CARD_TYPE = {
  numen: 'numen' as const,
  rite: 'rite' as const,
  ward: 'ward' as const,
} as const;

export type CardType = typeof CARD_TYPE[keyof typeof CARD_TYPE];

export type Nature = typeof NATURES[keyof typeof NATURES];
export type NumenFamily = typeof NUMEN_FAMILIES[keyof typeof NUMEN_FAMILIES];
export type Position = typeof POSITIONS[keyof typeof POSITIONS];
export type Rarity = typeof RARITY[keyof typeof RARITY];

export interface BaseCard {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
};

export interface NumenCard extends BaseCard {
  type: 'numen';
  nature: Nature;
  numenFamily: NumenFamily;
  level: number;
  baseAttack: number;
  baseDefense: number;
  effects?: string[];
  deckRequirements: Record<NumenFamily, number>;
  isMythic?: boolean;
  mythicQuest?: {
    deckRequirements: Record<Nature, number>;
    activationConditions: {
      wardsActivated: number;
    };
    effects: string[];
  };
};

export interface RiteCard extends BaseCard {
  type: 'rite';
  effects: string[];
};

export interface WardCard extends BaseCard {
  type: 'ward';
  effects: string[];
};

export type Card = NumenCard | RiteCard | WardCard;

export interface MythicQuestCondition {
  deckRequirements: Record<Nature, number>;
  activationConditions: {
    wardsActivated: number;
  };
  effects: string[];
};

export interface PlayerState {
  playerId: string;
  currentHP: number;
  fieldNumina: NumenCard[];
  fieldRites: (RiteCard | WardCard)[];
  hand: Card[];
  deck: Card[];
  memora: Card[];
  exiled: Card[];
  numenPositions: Record<string, Position>;
  fatigueDecrease: number;
  natureCount: Record<Nature, number>;
  typeCount: Record<NumenFamily, number>;
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
  attackerNumenId: string;
  targetNumenId: string | null;
  attackValue: number;
  defenseValue: number;
  decreaseDealt: number;
  isKill: boolean;
  timestamp: number;
}