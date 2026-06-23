import { validateCardRequirements, type Card } from './deckConstraints';

export interface MythicQuestTracker {
  mythicId: string;
  wardsActivated: number;
  numinaForgeted: number;
  decreaseDealt: number;
  cardsDrawn: number;
  customProgress: Record<string, unknown>;
}

export const initializeMythicTracker = (mythicId: string): MythicQuestTracker => ({
  mythicId,
  wardsActivated: 0,
  numinaForgeted: 0,
  decreaseDealt: 0,
  cardsDrawn: 0,
  customProgress: {},
});

export const isMythicQuestComplete = (mythic: unknown, tracker: MythicQuestTracker): boolean => {
  const conds = (mythic as any)?.isMythic && (mythic as any)?.mythicQuest?.activationConditions;
  return !!conds && Object.entries(conds).every(([k, v]) => {
    const curr = tracker[k as keyof MythicQuestTracker];
    return curr !== undefined && Number(curr) >= (typeof v === 'number' ? v : 0);
  });
};

export const updateQuestProgress = (tracker: MythicQuestTracker, eventType: string, amount = 1): MythicQuestTracker => {
  const key = ({
    wardActivated: 'wardsActivated',
    numenForgeted: 'numinaForgeted',
    decreaseDealt: 'decreaseDealt',
    cardDrawn: 'cardsDrawn',
  } as Record<string, keyof MythicQuestTracker>)[eventType];
  return key ? { ...tracker, [key]: (tracker[key] as number) + amount } : { ...tracker };
};

export const getMythicInvokeEligibility = (deck: unknown[], activeMythics: any[] = []): {
  available: any[];
  ineligible: any[];
  reasons: Record<string, string>;
} => {
  const activeIds = new Set(activeMythics.map((l) => l.id));
  const available: any[] = [];
  const ineligible: any[] = [];
  const reasons: Record<string, string> = {};

  for (const card of deck as Card[]) {
    if (activeIds.has(card.id)) {
      ineligible.push(card);
      reasons[card.id] = 'Already active on field';
      continue;
    }
    const val = validateCardRequirements(deck as Card[], [card.id]);
    if (val.canInvoke[card.id]) {
      available.push(card);
    } else {
      ineligible.push(card);
      const miss = val.missingRequirements[card.id];
      reasons[card.id] = Array.isArray(miss) ? miss.join(', ') : 'Unknown requirements';
    }
  }
  return { available, ineligible, reasons };
};

export const getKryokScalingBuff = (wardsRemoved: number) => ({
  darkBonus: wardsRemoved * 66,
  larvaBonus: wardsRemoved * 66,
});

export const checkMythicConstraint = (mythic: any, action: string): { allowed: boolean; reason: string } => {
  const constraints = mythic.mythicQuest?.specialConstraints || [];
  const rules: Record<string, [string, string]> = {
    changePosition: ['cannotChangePosition', 'This mythic cannot change position'],
    forget: ['cannotBeForgeted', 'This mythic cannot be forgeted'],
    exile: ['cannotBeExiled', 'This mythic cannot be exiled'],
  };
  const rule = rules[action];
  return rule && constraints.includes(rule[0])
    ? { allowed: false, reason: rule[1] }
    : { allowed: true, reason: '' };
};

export const getMythicSacrificeCost = (mythic: any): number =>
  [0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 5][mythic.level || 0] || 0;

export const activateMythic = (tracker: MythicQuestTracker): {
  activated: boolean;
  tracker: MythicQuestTracker;
} => {
  const active = !(tracker as any).isActive;
  return {
    activated: active,
    tracker: { ...tracker, isActive: active } as any,
  };
};

export const deactivateMythic = (tracker: MythicQuestTracker): {
  deactivated: boolean;
  tracker: MythicQuestTracker;
} => ({
  deactivated: true,
  tracker: { ...tracker, isActive: false } as any,
});