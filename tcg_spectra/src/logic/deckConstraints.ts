import { MONSTER_FAMILIES, GAME_CONSTANTS, NATURES } from '../types/constants';

export type Nature = typeof NATURES[keyof typeof NATURES];

export interface LegendaryQuest {
  deckRequirements?: Record<string, number>;
  activationConditions?: Record<string, number>;
  specialConstraints?: string[];
}

export interface Card {
  id: string;
  type: 'monster' | 'spell' | 'ward';
  name: string;
  attribute?: Nature;
  monsterFamily?: string;
  rarity?: string;
  level?: number;
  baseAttack?: number;
  baseDefense?: number;
  spellType?: string;
  wardType?: string;
  isLegendary?: boolean;
  legendaryQuest?: LegendaryQuest;
  [key: string]: unknown;
}

export interface DeckRequirements {
  monsterFamilies?: Record<string, number>;
  attributes?: Record<string, number>;
  spells: number;
  wards: number;
  totalRequired: number;
}

interface ValidationResult {
  canSummon: Record<string, boolean>;
  missingRequirements: Record<string, string[]>;
}

export interface NatureScaling {
  fire: { atkBonus: number; monstersCount: number };
  earth: { hpBonus: number; monstersCount: number };
  water: { hpRegenBonus: number; monstersCount: number };
  air: { extraActions: number; monstersCount: number };
  light: { drawBonus: number; monstersCount: number };
  dark: { wardBonus: number; monstersCount: number };
}

export interface DeckStats {
  monsterCount: number;
  spellCount: number;
  wardCount: number;
  typeCounts: Record<string, number>;
  attributeCounts: Record<string, number>;
}

export interface BattleResults {
  totalDecrease: number;
  destroyedMonsters: { monsterId: string; destroyedBy: string }[];
  interactions: CombatInteraction[];
}

export interface CombatInteraction {
  attackerId: string;
  targetId: string | null;
  spentATK: number;
  decreaseDealt: number;
  killedMonster: boolean;
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
    monsterFamilies: {},
    attributes: {},
    spells: 0,
    wards: 0,
    totalRequired: 0,
  };

  deck.forEach((card) => {
    if (card.type === 'monster' && card.deckRequirements) {
      Object.entries(card.deckRequirements).forEach(([type, count]) => {
        requirements.monsterFamilies![type] =
          (requirements.monsterFamilies![type] || 0) + count;
        requirements.totalRequired += count;
      });
    }

    if (card.type === 'spell') {
      if (card.isLegendary && card.legendaryQuest?.deckRequirements?.spells) {
        requirements.spells += card.legendaryQuest.deckRequirements.spells;
        requirements.totalRequired +=
          card.legendaryQuest.deckRequirements.spells;
      }
    }

    if (card.type === 'ward') {
      if (card.isLegendary && card.legendaryQuest?.deckRequirements?.wards) {
        requirements.wards += card.legendaryQuest.deckRequirements.wards;
        requirements.totalRequired +=
          card.legendaryQuest.deckRequirements.wards;
      }
    }
  });

  return requirements;
};

export const validateCardRequirements = (deck: Card[], legendaryCardIds: string[]): ValidationResult => {
  const canSummon: Record<string, boolean> = {};
  const missingRequirements: Record<string, string[]> = {};

  const typeCounts: Record<string, number> = {};
  const attributeCounts: Record<string, number> = {};
  let spellCount = 0;
  let wardCount = 0;

  deck.forEach((card) => {
    if (card.type === 'monster') {
      if (card.monsterFamily) {
        typeCounts[card.monsterFamily] = (typeCounts[card.monsterFamily] || 0) + 1;
      }
      if (card.attribute) {
        attributeCounts[card.attribute] =
          (attributeCounts[card.attribute] || 0) + 1;
      }
    } else if (card.type === 'spell') {
      spellCount += 1;
    } else if (card.type === 'ward') {
      wardCount += 1;
    }
  });

  legendaryCardIds.forEach((legendaryId) => {
    const legendary = deck.find((c) => c.id === legendaryId && c.isLegendary);
    if (!legendary || !legendary.legendaryQuest) {
      canSummon[legendaryId] = false;
      missingRequirements[legendaryId] = ['Card not found or not legendary'];
      return;
    }

    const { deckRequirements } = legendary.legendaryQuest;
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

      if (deckRequirements.spells && spellCount < deckRequirements.spells) {
        missing.push(
          `Need ${deckRequirements.spells} spells, have ${spellCount}`
        );
      }

      if (deckRequirements.wards && wardCount < deckRequirements.wards) {
        missing.push(
          `Need ${deckRequirements.wards} wards, have ${wardCount}`
        );
      }
    }

    canSummon[legendaryId] = missing.length === 0;
    missingRequirements[legendaryId] = missing;
  });

  return { canSummon, missingRequirements };
};

export const getDeckStats = (deck: Card[]): DeckStats => {
  const stats: DeckStats = {
    monsterCount: 0,
    spellCount: 0,
    wardCount: 0,
    typeCounts: {},
    attributeCounts: {},
  };

  deck.forEach((card) => {
    if (card.type === 'monster') {
      stats.monsterCount += 1;
      if (card.monsterFamily) {
        stats.typeCounts[card.monsterFamily] =
          (stats.typeCounts[card.monsterFamily] || 0) + 1;
      }
      if (card.attribute) {
        stats.attributeCounts[card.attribute] =
          (stats.attributeCounts[card.attribute] || 0) + 1;
      }
    } else if (card.type === 'spell') {
      stats.spellCount += 1;
    } else if (card.type === 'ward') {
      stats.wardCount += 1;
    }
  });

  return stats;
};