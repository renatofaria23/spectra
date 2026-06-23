import { validateCardRequirements } from './deckConstraints';

export interface MythicQuestTracker {
  mythicId: string;
  wardsActivated: number;
  numinaForgeted: number;
  decreaseDealt: number;
  cardsDrawn: number;
  customProgress: Record<string, unknown>;
}

export const initializeMythicTracker = (mythicId: string): MythicQuestTracker => {
  return {
    mythicId,
    wardsActivated: 0,
    numinaForgeted: 0,
    decreaseDealt: 0,
    cardsDrawn: 0,
    customProgress: {},
  };
};

export const isMythicQuestComplete = (mythic: unknown, tracker: MythicQuestTracker): boolean => {
  if (!(mythic as any).isMythic || !(mythic as any).mythicQuest) {
    return false;
  }

  const mythicCard = mythic as any;
  const activationConditions = mythicCard.mythicQuest?.activationConditions;

  if (!activationConditions) {
    return false;
  }

  for (const [condition, required] of Object.entries(activationConditions)) {
    const numericRequired = typeof required === 'number' ? Number(required) : 0;
    const current = tracker[condition as keyof MythicQuestTracker];
    if (current === undefined || Number(current) < numericRequired) {
      return false;
    }
  }

  return true;
};

export const updateQuestProgress = (tracker: MythicQuestTracker, eventType: string, amount: number = 1): MythicQuestTracker => {
  const updated = { ...tracker };

  switch (eventType) {
    case 'wardActivated':
      updated.wardsActivated += amount;
      break;
    case 'numenForgeted':
      updated.numinaForgeted += amount;
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

export const getMythicInvokeEligibility = (deck: unknown[], activeMythics: any[] = []): {
  available: any[];
  ineligible: any[];
  reasons: Record<string, string>;
} => {
  const activeIds = new Set<string>(activeMythics.map((l) => l.id));

  const available: any[] = [];
  const ineligible: any[] = [];
  const reasons: Record<string, string> = {};

  (deck as Array<any>).forEach((mythicCard) => {
    if (activeIds.has(mythicCard.id)) {
      ineligible.push(mythicCard);
      reasons[mythicCard.id] = 'Already active on field';
      return;
    }

    const validationResult = validateCardRequirements(
      deck as import('./deckConstraints').Card[],
      [mythicCard.id]
    );

    if (!validationResult.canInvoke[mythicCard.id]) {
      ineligible.push(mythicCard);
      const missing = validationResult.missingRequirements[mythicCard.id];
      reasons[mythicCard.id] = Array.isArray(missing)
        ? missing.join(', ')
        : 'Unknown requirements';
      return;
    }

    available.push(mythicCard);
  });

  return { available, ineligible, reasons };
};

export const getKryokScalingBuff = (wardsRemoved: number): { darkBonus: number; larvaBonus: number } => {
  return {
    darkBonus: wardsRemoved * 66,
    larvaBonus: wardsRemoved * 66,
  };
};

export const checkMythicConstraint = (mythic: any, action: string): { allowed: boolean; reason: string } => {
  const constraints = mythic.mythicQuest?.specialConstraints || [];

  if (action === 'changePosition') {
    if (constraints.includes('cannotChangePosition')) {
      return { allowed: false, reason: 'This mythic cannot change position' };
    }
  }

  if (action === 'forget') {
    if (constraints.includes('cannotBeForgeted')) {
      return { allowed: false, reason: 'This mythic cannot be forgeted' };
    }
  }

  if (action === 'exile') {
    if (constraints.includes('cannotBeExiled')) {
      return { allowed: false, reason: 'This mythic cannot be exiled' };
    }
  }

  return { allowed: true, reason: '' };
};

export const getMythicSacrificeCost = (mythic: any): number => {
  const sacrifices: Record<number, number> = {
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

  return sacrifices[mythic.level || 0] || 0;
};

export const activateMythic = (tracker: MythicQuestTracker): {
  activated: boolean;
  tracker: MythicQuestTracker;
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

export const deactivateMythic = (tracker: MythicQuestTracker): {
  deactivated: boolean;
  tracker: MythicQuestTracker;
} => {
  const updated = { ...tracker, isActive: false };

  return {
    deactivated: true,
    tracker: updated,
  };
};