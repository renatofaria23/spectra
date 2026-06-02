import { validateCardRequirements } from './deckConstraints';

export interface LegendaryQuestTracker {
  legendaryId: string;
  wardsActivated: number;
  monstersDestroyed: number;
  decreaseDealt: number;
  cardsDrawn: number;
  customProgress: Record<string, unknown>;
}

export const initializeLegendaryTracker = (legendaryId: string): LegendaryQuestTracker => {
  return {
    legendaryId,
    wardsActivated: 0,
    monstersDestroyed: 0,
    decreaseDealt: 0,
    cardsDrawn: 0,
    customProgress: {},
  };
};

export const isLegendaryQuestComplete = (legendary: unknown, tracker: LegendaryQuestTracker): boolean => {
  if (!(legendary as any).isLegendary || !(legendary as any).legendaryQuest) {
    return false;
  }

  const legendaryCard = legendary as any;
  const activationConditions = legendaryCard.legendaryQuest?.activationConditions;

  if (!activationConditions) {
    return false;
  }

  for (const [condition, required] of Object.entries(activationConditions)) {
    const numericRequired = typeof required === 'number' ? Number(required) : 0;
    const current = tracker[condition as keyof LegendaryQuestTracker];
    if (current === undefined || Number(current) < numericRequired) {
      return false;
    }
  }

  return true;
};

export const updateQuestProgress = (tracker: LegendaryQuestTracker, eventType: string, amount: number = 1): LegendaryQuestTracker => {
  const updated = { ...tracker };

  switch (eventType) {
    case 'wardActivated':
      updated.wardsActivated += amount;
      break;
    case 'monsterDestroyed':
      updated.monstersDestroyed += amount;
      break;
    case 'decreaseDealt':
      updated.decreaseDealt += amount;
      break;
    case 'cardDrawn':
      updated.cardsDrawn += amount;
      break;
    default:
      break;
  }

  return updated;
};

export const getLegendarySummonEligibility = (deck: unknown[], activeLegendaries: any[] = []): {
  available: any[];
  ineligible: any[];
  reasons: Record<string, string>;
} => {
  const activeIds = new Set<string>(activeLegendaries.map((l) => l.id));

  const available: any[] = [];
  const ineligible: any[] = [];
  const reasons: Record<string, string> = {};

  (deck as Array<any>).forEach((legendaryCard) => {
    if (activeIds.has(legendaryCard.id)) {
      ineligible.push(legendaryCard);
      reasons[legendaryCard.id] = 'Already active on field';
      return;
    }

    const validationResult = validateCardRequirements(
      deck as import('./deckConstraints').Card[],
      [legendaryCard.id]
    );

    if (!validationResult.canSummon[legendaryCard.id]) {
      ineligible.push(legendaryCard);
      const missing = validationResult.missingRequirements[legendaryCard.id];
      reasons[legendaryCard.id] = Array.isArray(missing)
        ? missing.join(', ')
        : 'Unknown requirements';
      return;
    }

    available.push(legendaryCard);
  });

  return { available, ineligible, reasons };
};

export const getKryokScalingBuff = (wardsRemoved: number): { darkBonus: number; demonBonus: number } => {
  return {
    darkBonus: wardsRemoved * 66,
    demonBonus: wardsRemoved * 66,
  };
};

export const checkLegendaryConstraint = (legendary: any, action: string): { allowed: boolean; reason: string } => {
  const constraints = legendary.legendaryQuest?.specialConstraints || [];

  if (action === 'changePosition') {
    if (constraints.includes('cannotChangePosition')) {
      return { allowed: false, reason: 'This legendary cannot change position' };
    }
  }

  if (action === 'destroy') {
    if (constraints.includes('cannotBeDestroyed')) {
      return { allowed: false, reason: 'This legendary cannot be destroyed' };
    }
  }

  if (action === 'banish') {
    if (constraints.includes('cannotBeBanished')) {
      return { allowed: false, reason: 'This legendary cannot be banished' };
    }
  }

  return { allowed: true, reason: '' };
};

export const getLegendaryTributeCost = (legendary: any): number => {
  const tributes: Record<number, number> = {
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

  return tributes[legendary.level || 0] || 0;
};

export const activateLegendary = (tracker: LegendaryQuestTracker): {
  activated: boolean;
  tracker: LegendaryQuestTracker;
} => {
  const isActive = 'isActive' in tracker && !!tracker.isActive;

  const updated = isActive 
    ? { ...tracker, isActive: false }
    : { ...tracker, isActive: true };

  return {
    activated: !isActive,
    tracker: updated,
  };
};

export const deactivateLegendary = (tracker: LegendaryQuestTracker): {
  deactivated: boolean;
  tracker: LegendaryQuestTracker;
} => {
  const updated = { ...tracker, isActive: false };

  return {
    deactivated: true,
    tracker: updated,
  };
};