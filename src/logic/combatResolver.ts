import { PassiveTrigger, hasPassiveTrigger } from './triggers';
import type { NatureScaling } from './natureScaling';

export interface Numen {
  id: string;
  name: string;
  baseAttack: number;
  baseDefense: number;
  currentAttack: number;
  currentDefense: number;
  position: 'attack' | 'defense' | 'face_down';
  justInvokeed?: boolean;
  hasAttacked?: boolean;
  triggers?: string[];
  [key: string]: unknown;
}

export interface CombatInteraction {
  attackerId: string;
  targetId: string | null;
  spentATK: number;
  decreaseDealt: number;
  killedNumen: boolean;
  overflowDamage: number;
  mutualDestruction: boolean;
  error?: string;
}

export interface BattleResult {
  totalOverflowDamage: number;
  forgetedNumina: { numenId: string; forgetedBy: string }[];
  forgetedAttackers: string[];
  interactions: CombatInteraction[];
  validationErrors: string[];
}

export interface Attack {
  attackerId: string;
  targetId: string | null;
}

export interface BattleResultSummary {
  totalDecrease: number;
  forgetedNumina: { numenId: string; forgetedBy: string }[];
  interactions: CombatInteraction[];
  validationErrors: string[];
}

const hasTrigger = (numen: Numen, trigger: PassiveTrigger): boolean => hasPassiveTrigger(numen, trigger);

const restoreNumenStats = (numen: Numen): Numen => ({
  ...numen,
  currentAttack: numen.baseAttack,
  currentDefense: numen.baseDefense,
});

export const resolveGroupAttack = (
  attackers: Numen[],
  defender: Numen,
  defenderNatureScaling: NatureScaling
): BattleResult => {
  const result: BattleResult = {
    totalOverflowDamage: 0,
    forgetedNumina: [],
    forgetedAttackers: [],
    interactions: [],
    validationErrors: [],
  };

  const defenderInAttackPos = defender.position === 'attack';
  let remainingDefenderStat = defenderInAttackPos ? defender.currentAttack : defender.currentDefense;
  let currentDefender = { ...defender };

  for (const attacker of attackers) {
    const attackerATK = attacker.currentAttack;
    const totalATK = attackerATK + defenderNatureScaling.fire.numenAttackBonus;
    const killed = totalATK >= remainingDefenderStat;
    const mutual = totalATK === remainingDefenderStat;
    const overflow = totalATK > remainingDefenderStat ? totalATK - remainingDefenderStat : 0;

    result.interactions.push({
      attackerId: attacker.id,
      targetId: defender.id,
      spentATK: attackerATK,
      decreaseDealt: 0,
      killedNumen: killed,
      overflowDamage: overflow,
      mutualDestruction: mutual,
    });

    if (killed) {
      result.forgetedNumina.push({ numenId: defender.id, forgetedBy: attacker.id });
    }

    if (totalATK > remainingDefenderStat) {
      currentDefender = { ...currentDefender, currentDefense: 0, currentAttack: 0 };
      result.totalOverflowDamage += overflow;
    } else if (!mutual) {
      remainingDefenderStat -= totalATK;
    }

    if (hasTrigger(currentDefender, PassiveTrigger.RELENTLESS)) {
      currentDefender = restoreNumenStats(currentDefender);
      if (!mutual) {
        remainingDefenderStat = defenderInAttackPos ? currentDefender.currentAttack : currentDefender.currentDefense;
      }
    } else if (killed) {
      remainingDefenderStat = 0;
    }

    if (mutual) {
      attackers.forEach(() => result.forgetedAttackers.push(attacker.id));
      remainingDefenderStat = 0;
    }

    attackers.forEach((a) => (a.currentAttack = 0));
    if (killed) {
      break;
    }
  }

  return result;
};

export const resolveSoloAttack = (
  attacker: Numen,
  defender: Numen | null,
  defenderNatureScaling: NatureScaling
): BattleResult => {
  const result: BattleResult = {
    totalOverflowDamage: 0,
    forgetedNumina: [],
    forgetedAttackers: [],
    interactions: [],
    validationErrors: [],
  };

  const totalATK = attacker.currentAttack + defenderNatureScaling.fire.numenAttackBonus;

  if (!defender) {
    result.interactions.push({
      attackerId: attacker.id,
      targetId: null,
      spentATK: attacker.currentAttack,
      decreaseDealt: 0,
      killedNumen: false,
      overflowDamage: totalATK,
      mutualDestruction: false,
    });
    result.totalOverflowDamage = totalATK;
  } else {
    const defenderStat = defender.position === 'attack' ? defender.currentAttack : defender.currentDefense;
    const killed = totalATK >= defenderStat;
    const mutual = totalATK === defenderStat;
    const overflow = totalATK > defenderStat ? totalATK - defenderStat : 0;

    result.interactions.push({
      attackerId: attacker.id,
      targetId: defender.id,
      spentATK: attacker.currentAttack,
      decreaseDealt: 0,
      killedNumen: killed,
      overflowDamage: overflow,
      mutualDestruction: mutual,
    });

    if (killed) {
      result.forgetedNumina.push({ numenId: defender.id, forgetedBy: attacker.id });
    }
    if (mutual) {
      result.forgetedAttackers.push(attacker.id);
    }
    result.totalOverflowDamage = overflow;
  }

  attacker.currentAttack = 0;
  return result;
};

export const canNumenAttack = (
  numen: Numen
): { canAttack: boolean; reason: string } => {
  if (numen.position === 'defense') return { canAttack: false, reason: 'Numen in defense position' };
  if (hasTrigger(numen, PassiveTrigger.STUNNED)) return { canAttack: false, reason: 'Numen is stunned' };
  if (numen.justInvokeed && !hasTrigger(numen, PassiveTrigger.CELERITY)) {
    return { canAttack: false, reason: 'Freshly invokeed, cannot attack this turn' };
  }
  return { canAttack: true, reason: '' };
};

export const canNumenGroupAttack = (numen: Numen): boolean => !hasTrigger(numen, PassiveTrigger.RECLUSE);

export const mustNumenGroupAttack = (numen: Numen): boolean => hasTrigger(numen, PassiveTrigger.LEGION);

export const resetNumenStats = (numina: Numen[]): Numen[] =>
  numina.map((n) => ({
    ...n,
    currentAttack: n.baseAttack,
    currentDefense: n.baseDefense,
    hasAttacked: false,
    justInvokeed: false,
  }));

export const getTargetableDefenders = (allDefenders: Numen[]): Numen[] => {
  const chal = allDefenders.find((n) => hasTrigger(n, PassiveTrigger.CHALLENGE));
  if (chal) return [chal];
  const hasUnveiled = allDefenders.some((d) => !hasTrigger(d, PassiveTrigger.VEILED));
  return allDefenders.filter((n) => !hasTrigger(n, PassiveTrigger.VEILED) || !hasUnveiled);
};

const DEFAULT_SCALING: NatureScaling = {
  fire: { numenAttackBonus: 0, numinaCount: 0 },
  air: { manaRegenBonus: 0, numinaCount: 0 },
  earth: { numenDefenseBonus: 0, numinaCount: 0 },
  water: { hpRegenBonus: 0, numinaCount: 0 },
  light: { riteCostReduction: 0, numinaCount: 0 },
  dark: { wardCostReduction: 0, numinaCount: 0 },
};

export const resolveBattlePhase = (
  attackSequence: Attack[],
  fieldNumina: Numen[] = [],
  defenderNatureScaling: NatureScaling = DEFAULT_SCALING
): BattleResultSummary => {
  const summary: BattleResultSummary = {
    totalDecrease: 0,
    forgetedNumina: [],
    interactions: [],
    validationErrors: [],
  };

  for (const attack of attackSequence) {
    const attacker = fieldNumina.find((n) => n.id === attack.attackerId);
    if (!attacker) {
      summary.validationErrors.push(`Attacker ${attack.attackerId} not found`);
      continue;
    }

    const { canAttack, reason } = canNumenAttack(attacker);
    if (!canAttack) {
      summary.validationErrors.push(`${attacker.name} cannot attack: ${reason}`);
      continue;
    }

    const defender = attack.targetId ? fieldNumina.find((n) => n.id === attack.targetId) ?? null : null;
    const result = resolveSoloAttack(attacker, defender, defenderNatureScaling);
    summary.interactions.push(...result.interactions);
    summary.forgetedNumina.push(...result.forgetedNumina);
    summary.totalDecrease += result.totalOverflowDamage;
    summary.validationErrors.push(...result.validationErrors);
  }

  return summary;
};
