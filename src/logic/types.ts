import type { NatureScaling } from './natureScaling';

export interface Card {
  id: string;
  type: 'numen' | 'rite' | 'ward';
  name: string;
  nature?: string;
  numenFamily?: string;
  rarity?: string;
  level?: number;
  baseAttack?: number;
  baseDefense?: number;
  isMythic?: boolean;
  mythicQuest?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PlayerState {
  playerId: 'player1' | 'player2';
  currentHP: number;
  currentMana: number;
  fieldNumina: Card[];
  fieldRites: Card[];
  fieldWards: Card[];
  hand: Card[];
  deck: Card[];
  memora: Card[];
  exiled: Card[];
  numenPositions: Record<string, string>;
  fatigueCount: number;
  natureScaling: NatureScaling;
  normalInvokesUsed: number;
  maxHandSize: number;
}
