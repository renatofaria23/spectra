import { PassiveTrigger, hasPassiveTrigger } from './Triggers';
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

const hasTrigger = (numen: Numen, trigger: PassiveTrigger): boolean => {
  return hasPassiveTrigger(numen, trigger);
};

const restoreNumenStats = (numen: Numen): Numen => {
  return {
    ...numen,
    currentAttack: numen.baseAttack,
    currentDefense: numen.baseDefense,
  };
};

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
  const defenderStat = defenderInAttackPos ? defender.currentAttack : defender.currentDefense;

  let remainingDefenderStat = defenderStat;
  let currentDefender = { ...defender };

  for (const attacker of attackers) {
    const attackerATK = attacker.currentAttack;
    const damageBonus = defenderNatureScaling.fire.damageBonus;
    const totalATK = attackerATK + damageBonus;

    if (totalATK > remainingDefenderStat) {
      const overflow = totalATK - remainingDefenderStat;
      currentDefender = { ...currentDefender, currentDefense: 0, currentAttack: 0 };

      result.interactions.push({
        attackerId: attacker.id,
        targetId: defender.id,
        spentATK: attackerATK,
        decreaseDealt: 0,
        killedNumen: true,
        overflowDamage: overflow,
        mutualDestruction: false,
      });

      result.forgetedNumina.push({ numenId: defender.id, forgetedBy: attacker.id });
      result.totalOverflowDamage += overflow;

      if (hasTrigger(currentDefender, PassiveTrigger.RELENTLESS)) {
        currentDefender = restoreNumenStats(currentDefender);
        const newRemaining = defenderInAttackPos ? currentDefender.currentAttack : currentDefender.currentDefense;
        remainingDefenderStat = newRemaining;
      } else {
        remainingDefenderStat = 0;
      }

      attackers.forEach((a) => {
        a.currentAttack = 0;
      });

      break;
    } else if (totalATK === remainingDefenderStat) {
      result.interactions.push({
        attackerId: attacker.id,
        targetId: defender.id,
        spentATK: attackerATK,
        decreaseDealt: 0,
        killedNumen: true,
        overflowDamage: 0,
        mutualDestruction: true,
      });

      result.forgetedNumina.push({ numenId: defender.id, forgetedBy: attacker.id });
      attackers.forEach((aId) => {
        result.forgetedAttackers.push(attacker.id);
      });

      attackers.forEach((a) => {
        a.currentAttack = 0;
      });

      if (hasTrigger(currentDefender, PassiveTrigger.RELENTLESS)) {
        currentDefender = restoreNumenStats(currentDefender);
      }

      remainingDefenderStat = 0;

      break;
    } else {
      remainingDefenderStat -= totalATK;

      result.interactions.push({
        attackerId: attacker.id,
        targetId: defender.id,
        spentATK: attackerATK,
        decreaseDealt: 0,
        killedNumen: false,
        overflowDamage: 0,
        mutualDestruction: false,
      });

      attackers.forEach((a) => {
        a.currentAttack = 0;
      });

      if (hasTrigger(currentDefender, PassiveTrigger.RELENTLESS)) {
        currentDefender = restoreNumenStats(currentDefender);
        const newRemaining = defenderInAttackPos ? currentDefender.currentAttack : currentDefender.currentDefense;
        remainingDefenderStat = newRemaining;
      }
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

  if (!defender) {
    const damageBonus = defenderNatureScaling.fire.damageBonus;
    const totalATK = attacker.currentAttack + damageBonus;

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
    attacker.currentAttack = 0;

    return result;
  }

  const defenderInAttackPos = defender.position === 'attack';
  const defenderStat = defenderInAttackPos ? defender.currentAttack : defender.currentDefense;
  const damageBonus = defenderNatureScaling.fire.damageBonus;
  const totalATK = attacker.currentAttack + damageBonus;

  if (totalATK > defenderStat) {
    const overflow = totalATK - defenderStat;

    result.interactions.push({
      attackerId: attacker.id,
      targetId: defender.id,
      spentATK: attacker.currentAttack,
      decreaseDealt: 0,
      killedNumen: true,
      overflowDamage: overflow,
      mutualDestruction: false,
    });

    result.forgetedNumina.push({ numenId: defender.id, forgetedBy: attacker.id });
    result.totalOverflowDamage = overflow;
    attacker.currentAttack = 0;
  } else if (totalATK === defenderStat) {
    result.interactions.push({
      attackerId: attacker.id,
      targetId: defender.id,
      spentATK: attacker.currentAttack,
      decreaseDealt: 0,
      killedNumen: true,
      overflowDamage: 0,
      mutualDestruction: true,
    });

    result.forgetedNumina.push({ numenId: defender.id, forgetedBy: attacker.id });
    result.forgetedAttackers.push(attacker.id);
    attacker.currentAttack = 0;
  } else {
    result.interactions.push({
      attackerId: attacker.id,
      targetId: defender.id,
      spentATK: attacker.currentAttack,
      decreaseDealt: 0,
      killedNumen: false,
      overflowDamage: 0,
      mutualDestruction: false,
    });

    attacker.currentAttack = 0;
  }

  return result;
};

export const canNumenAttack = (
  numen: Numen,
  maxInvokes: number
): { canAttack: boolean; reason: string } => {
  if (numen.position === 'defense') {
    return { canAttack: false, reason: 'Numen in defense position' };
  }

  if (hasTrigger(numen, PassiveTrigger.STUNNED)) {
    return { canAttack: false, reason: 'Numen is stunned' };
  }

  if (numen.justInvokeed && !hasTrigger(numen, PassiveTrigger.CELERITY)) {
    return { canAttack: false, reason: 'Freshly invokeed, cannot attack this turn' };
  }

  return { canAttack: true, reason: '' };
};

export const canNumenGroupAttack = (numen: Numen): boolean => {
  if (hasTrigger(numen, PassiveTrigger.RECLUSE)) {
    return false;
  }
  return true;
};

export const mustNumenGroupAttack = (numen: Numen): boolean => {
  return hasTrigger(numen, PassiveTrigger.LEGION);
};

export const resetNumenStats = (numina: Numen[]): Numen[] => {
  return numina.map((numen) => ({
    ...numen,
    currentAttack: numen.baseAttack,
    currentDefense: numen.baseDefense,
    hasAttacked: false,
    justInvokeed: false,
  }));
};

export const getTargetableDefenders = (
  allDefenders: Numen[],
  attackers: Numen[]
): Numen[] => {
  const challengeNumen = allDefenders.find((n) => hasTrigger(n, PassiveTrigger.CHALLENGE));
  if (challengeNumen) {
    return [challengeNumen];
  }

  return allDefenders.filter((n) => {
    if (hasTrigger(n, PassiveTrigger.VEILED)) {
      const visibleCount = allDefenders.filter((d) => !hasTrigger(d, PassiveTrigger.VEILED)).length;
      if (visibleCount === 0) {
        return true;
      }
      return false;
    }
    return true;
  });
};

export const resolveBattlePhase = (
  attackSequence: Attack[],
  fieldNumina: Numen[] = []
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

    const { canAttack, reason } = canNumenAttack(attacker, fieldNumina.length);
    if (!canAttack) {
      summary.validationErrors.push(`${attacker.name} cannot attack: ${reason}`);
      continue;
    }

    const defender = attack.targetId ? fieldNumina.find((n) => n.id === attack.targetId) ?? null : null;

    const defaultScaling: NatureScaling = {
      fire: { damageBonus: 0, numinaCount: 0 },
      air: { extraInvokes: 0, numinaCount: 0 },
      earth: { hpBonus: 0, numinaCount: 0 },
      water: { hpRegenBonus: 0, numinaCount: 0 },
      light: { manaGainBonus: 0, numinaCount: 0 },
      dark: { handSizeBonus: 0, numinaCount: 0 },
    };

    const result = resolveSoloAttack(attacker, defender, defaultScaling);
    summary.interactions.push(...result.interactions);
    summary.forgetedNumina.push(...result.forgetedNumina);
    summary.totalDecrease += result.totalOverflowDamage;
    summary.validationErrors.push(...result.validationErrors);
  }

  return summary;
};
