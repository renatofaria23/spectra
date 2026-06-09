import { NUMEN_FAMILIES, GAME_CONSTANTS, NATURES } from '../types/constants';

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
  attribute?: Nature;
  numenFamily?: string;
  rarity?: string;
  level?: number;
  baseAttack?: number;
  baseDefense?: number;
  riteType?: string;
  wardType?: string;
  isMythic?: boolean;
  mythicQuest?: MythicQuest;
  [key: string]: unknown;
}

export interface DeckRequirements {
  numenFamilies?: Record<string, number>;
  attributes?: Record<string, number>;
  rites: number;
  wards: number;
  totalRequired: number;
}

interface ValidationResult {
  canSummon: Record<string, boolean>;
  missingRequirements: Record<string, string[]>;
}

export type { NatureScaling } from './natureScaling';

export interface DeckStats {
  numenCount: number;
  riteCount: number;
  wardCount: number;
  typeCounts: Record<string, number>;
  attributeCounts: Record<string, number>;
}

export interface BattleResults {
  totalDecrease: number;
  destroyedNumina: { numenId: string; destroyedBy: string }[];
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

  if (deck.length < GAME_CONSTANTS.MIN_DECK_SIZE) {
    errors.push(`Deck too small: ${deck.length}/${GAME_CONSTANTS.MIN_DECK_SIZE}`);
  }

  if (deck.length > GAME_CONSTANTS.MAX_DECK_SIZE) {
    errors.push(`Deck too large: ${deck.length}/${GAME_CONSTANTS.MAX_DECK_SIZE}`);
  }

  const cardCounts: Record<string, number> = {};
  deck.forEach((card) => {
    cardCounts[card.id] = (cardCounts[card.id] || 0) + 1;
  });

  Object.entries(cardCounts).forEach(([cardId, count]) => {
    if (count > 3) {
      errors.push(`Card ${cardId} appears ${count} times (max 3)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const calculateDeckRequirements = (deck: Card[]): DeckRequirements => {
  const requirements: DeckRequirements = {
    numenFamilies: {},
    attributes: {},
    rites: 0,
    wards: 0,
    totalRequired: 0,
  };

  deck.forEach((card) => {
    if (card.type === 'numen' && card.deckRequirements) {
      Object.entries(card.deckRequirements).forEach(([type, count]) => {
        requirements.numenFamilies![type] =
          (requirements.numenFamilies![type] || 0) + count;
        requirements.totalRequired += count;
      });
    }

    if (card.type === 'rite') {
      if (card.isMythic && card.mythicQuest?.deckRequirements?.rites) {
        requirements.rites += card.mythicQuest.deckRequirements.rites;
        requirements.totalRequired +=
          card.mythicQuest.deckRequirements.rites;
      }
    }

    if (card.type === 'ward') {
      if (card.isMythic && card.mythicQuest?.deckRequirements?.wards) {
        requirements.wards += card.mythicQuest.deckRequirements.wards;
        requirements.totalRequired +=
          card.mythicQuest.deckRequirements.wards;
      }
    }
  });

  return requirements;
};

export const validateCardRequirements = (deck: Card[], mythicCardIds: string[]): ValidationResult => {
  const canSummon: Record<string, boolean> = {};
  const missingRequirements: Record<string, string[]> = {};

  const typeCounts: Record<string, number> = {};
  const attributeCounts: Record<string, number> = {};
  let riteCount = 0;
  let wardCount = 0;

  deck.forEach((card) => {
    if (card.type === 'numen') {
      if (card.numenFamily) {
        typeCounts[card.numenFamily] = (typeCounts[card.numenFamily] || 0) + 1;
      }
      if (card.attribute) {
        attributeCounts[card.attribute] =
          (attributeCounts[card.attribute] || 0) + 1;
      }
    } else if (card.type === 'rite') {
      riteCount += 1;
    } else if (card.type === 'ward') {
      wardCount += 1;
    }
  });

  mythicCardIds.forEach((mythicId) => {
    const mythic = deck.find((c) => c.id === mythicId && c.isMythic);
    if (!mythic || !mythic.mythicQuest) {
      canSummon[mythicId] = false;
      missingRequirements[mythicId] = ['Card not found or not mythic'];
      return;
    }

    const { deckRequirements } = mythic.mythicQuest;
    const missing: string[] = [];

    if (deckRequirements) {
      Object.entries(deckRequirements).forEach(([type, required]) => {
        const actual = typeCounts[type] || attributeCounts[type] || 0;
        if (actual < required) {
          missing.push(
            `Need ${required} ${type}, have ${actual}`
          );
        }
      });

      if (deckRequirements.rites && riteCount < deckRequirements.rites) {
        missing.push(
          `Need ${deckRequirements.rites} rites, have ${riteCount}`
        );
      }

      if (deckRequirements.wards && wardCount < deckRequirements.wards) {
        missing.push(
          `Need ${deckRequirements.wards} wards, have ${wardCount}`
        );
      }
    }

    canSummon[mythicId] = missing.length === 0;
    missingRequirements[mythicId] = missing;
  });

  return { canSummon, missingRequirements };
};

export const getDeckStats = (deck: Card[]): DeckStats => {
  const stats: DeckStats = {
    numenCount: 0,
    riteCount: 0,
    wardCount: 0,
    typeCounts: {},
    attributeCounts: {},
  };

  deck.forEach((card) => {
    if (card.type === 'numen') {
      stats.numenCount += 1;
      if (card.numenFamily) {
        stats.typeCounts[card.numenFamily] =
          (stats.typeCounts[card.numenFamily] || 0) + 1;
      }
      if (card.attribute) {
        stats.attributeCounts[card.attribute] =
          (stats.attributeCounts[card.attribute] || 0) + 1;
      }
    } else if (card.type === 'rite') {
      stats.riteCount += 1;
    } else if (card.type === 'ward') {
      stats.wardCount += 1;
    }
  });

  return stats;
};