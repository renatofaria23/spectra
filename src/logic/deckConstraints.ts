import { GAME_CONSTANTS, NATURES } from '../types/constants';

export type Nature = typeof NATURES[keyof typeof NATURES];

export interface MythicQuest {
  deckRequirements?: Record<string, number>;
  activationConditions?: Record<string, number>;
  specialConstraints?: string[];
}

export interface Card {
  id: string;
  type: 'numen' | 'rite' | 'ward';
  name: string;
  nature?: Nature;
  numenFamily?: string;
  rarity?: string;
  level?: number;
  baseAttack?: number;
  baseDefense?: number;
  isMythic?: boolean;
  mythicQuest?: MythicQuest;
  [key: string]: unknown;
}

export interface DeckRequirements {
  numenFamilies?: Record<string, number>;
  natures?: Record<string, number>;
  rites: number;
  wards: number;
  totalRequired: number;
}

interface ValidationResult {
  canInvoke: Record<string, boolean>;
  missingRequirements: Record<string, string[]>;
}

export type { NatureScaling } from './natureScaling';

export interface DeckStats {
  numenCount: number;
  riteCount: number;
  wardCount: number;
  typeCounts: Record<string, number>;
  natureCounts: Record<string, number>;
}

export interface BattleResults {
  totalDecrease: number;
  forgetedNumina: { numenId: string; forgetedBy: string }[];
  interactions: CombatInteraction[];
}

export interface CombatInteraction {
  attackerId: string;
  targetId: string | null;
  spentATK: number;
  decreaseDealt: number;
  killedNumen: boolean;
  error?: string;
}

export type PlayerId = 'player1' | 'player2';

export type FieldPosition = 'attack' | 'defense' | 'face_down';

export type Position = (typeof POSITIONS)[keyof typeof POSITIONS];

export const POSITIONS = {
  ATTACK: 'attack' as const,
  DEFENSE: 'defense' as const,
  FACE_DOWN: 'face_down' as const,
} as const;

export const validateDeckComposition = (deck: Card[]): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const { MIN_DECK_SIZE: min, MAX_DECK_SIZE: max } = GAME_CONSTANTS;
  if (deck.length < min) errors.push(`Deck too small: ${deck.length}/${min}`);
  if (deck.length > max) errors.push(`Deck too large: ${deck.length}/${max}`);
  const counts: Record<string, number> = {};
  for (const { id } of deck) counts[id] = (counts[id] || 0) + 1;
  for (const [id, count] of Object.entries(counts)) {
    if (count > 3) errors.push(`Card ${id} appears ${count} times (max 3)`);
  }
  return { isValid: !errors.length, errors };
};

export const calculateDeckRequirements = (deck: Card[]): DeckRequirements => {
  const reqs: DeckRequirements = { numenFamilies: {}, natures: {}, rites: 0, wards: 0, totalRequired: 0 };
  for (const card of deck) {
    if (card.type === 'numen' && card.deckRequirements) {
      for (const [t, c] of Object.entries(card.deckRequirements)) {
        reqs.numenFamilies![t] = (reqs.numenFamilies![t] || 0) + c;
        reqs.totalRequired += c;
      }
    } else if (card.isMythic && card.mythicQuest?.deckRequirements) {
      const { rites, wards } = card.mythicQuest.deckRequirements;
      if (card.type === 'rite' && rites) {
        reqs.rites += rites;
        reqs.totalRequired += rites;
      } else if (card.type === 'ward' && wards) {
        reqs.wards += wards;
        reqs.totalRequired += wards;
      }
    }
  }
  return reqs;
};

export const validateCardRequirements = (deck: Card[], mythicCardIds: string[]): ValidationResult => {
  const canInvoke: Record<string, boolean> = {};
  const missingRequirements: Record<string, string[]> = {};
  const typeCounts: Record<string, number> = {};
  const natureCounts: Record<string, number> = {};
  let rites = 0, wards = 0;

  for (const c of deck) {
    if (c.type === 'numen') {
      if (c.numenFamily) typeCounts[c.numenFamily] = (typeCounts[c.numenFamily] || 0) + 1;
      if (c.nature) natureCounts[c.nature] = (natureCounts[c.nature] || 0) + 1;
    } else if (c.type === 'rite') rites++;
    else if (c.type === 'ward') wards++;
  }

  for (const id of mythicCardIds) {
    const mythic = deck.find((c) => c.id === id && c.isMythic);
    if (!mythic?.mythicQuest) {
      canInvoke[id] = false;
      missingRequirements[id] = ['Card not found or not mythic'];
      continue;
    }

    const { deckRequirements } = mythic.mythicQuest;
    const missing: string[] = [];
    if (deckRequirements) {
      for (const [t, req] of Object.entries(deckRequirements)) {
        const act = typeCounts[t] || natureCounts[t] || 0;
        if (act < req) missing.push(`Need ${req} ${t}, have ${act}`);
      }
      if (deckRequirements.rites && rites < deckRequirements.rites) {
        missing.push(`Need ${deckRequirements.rites} rites, have ${rites}`);
      }
      if (deckRequirements.wards && wards < deckRequirements.wards) {
        missing.push(`Need ${deckRequirements.wards} wards, have ${wards}`);
      }
    }
    canInvoke[id] = !missing.length;
    missingRequirements[id] = missing;
  }

  return { canInvoke, missingRequirements };
};

export const getDeckStats = (deck: Card[]): DeckStats => {
  const stats: DeckStats = { numenCount: 0, riteCount: 0, wardCount: 0, typeCounts: {}, natureCounts: {} };
  for (const c of deck) {
    if (c.type === 'numen') {
      stats.numenCount++;
      if (c.numenFamily) stats.typeCounts[c.numenFamily] = (stats.typeCounts[c.numenFamily] || 0) + 1;
      if (c.nature) stats.natureCounts[c.nature] = (stats.natureCounts[c.nature] || 0) + 1;
    } else if (c.type === 'rite') stats.riteCount++;
    else if (c.type === 'ward') stats.wardCount++;
  }
  return stats;
};