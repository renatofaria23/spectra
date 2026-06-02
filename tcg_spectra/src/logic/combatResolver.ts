export interface Monster {
  id: string;
  baseAttack: number;
  baseDefense: number;
  attributeBonus?: number;
  position?: 'attack' | 'defense';
  justSummoned?: boolean;
}

export interface SpentMonster {
  attackerId: string;
  monsterId: string;
  spentATK: number;
  targetId: string | null;
  decreaseDealt: number;
  killedMonster: boolean;
}

export interface Attack {
  attacker: Monster;
  targetMonster: Monster | null;
  spentATK: number;
}

export interface CombatInteraction {
  attackerId: string;
  targetId: string | null;
  spentATK: number;
  decreaseDealt: number;
  killedMonster: boolean;
  error?: string;
}

const calculateDecrease = (attackerSpentATK: number, targetDefense: number): number => {
  if (targetDefense === 0) {
    return attackerSpentATK;
  }

  if (attackerSpentATK > targetDefense) {
    return attackerSpentATK - targetDefense;
  }

  return 0;
};

export const resolveAttack = (
  attacker: Monster,
  target: Monster | null,
  attackValue: number,
  spentMonsters: SpentMonster[] = []
): {
  decreaseDealt: number;
  killedMonster: boolean;
  newSpentMonsters: SpentMonster[];
  error?: string;
} => {
  const maxATK = attacker.baseAttack + (attacker.attributeBonus || 0);

  if (attackValue > maxATK) {
    return {
      decreaseDealt: 0,
      killedMonster: false,
      error: 'Attack value exceeds max ATK',
      newSpentMonsters: spentMonsters,
    };
  }

  const targetDefense = target ? target.baseDefense : 0;
  const decreaseDealt = calculateDecrease(attackValue, targetDefense);

  let killedMonster = false;
  if (target && decreaseDealt > 0) {
    killedMonster = true;
  }

  spentMonsters.push({
    attackerId: attacker.id,
    monsterId: attacker.id,
    spentATK: attackValue,
    targetId: target?.id || null,
    decreaseDealt,
    killedMonster,
  });

  return {
    decreaseDealt,
    killedMonster,
    newSpentMonsters: spentMonsters,
  };
};

export const resolveBattlePhase = (attackSequence: Attack[]): {
  totalDecrease: number;
  destroyedMonsters: { monsterId: string; destroyedBy: string }[];
  interactions: CombatInteraction[];
  validationErrors: string[];
} => {
  const results: ReturnType<typeof resolveBattlePhase> = {
    totalDecrease: 0,
    destroyedMonsters: [],
    interactions: [],
    validationErrors: [],
  };

  const usedAttackers = new Set<string>();

  attackSequence.forEach((attack) => {
    const { attacker, targetMonster, spentATK } = attack;

    if (usedAttackers.has(attacker.id)) {
      results.validationErrors.push(
        `Monster ${attacker.id} already attacked this turn`
      );
      return;
    }

    if (attacker.justSummoned) {
      results.validationErrors.push(
        `Monster ${attacker.id} was just summoned, cannot attack`
      );
      return;
    }

    const attackResult = resolveAttack(
      attacker,
      targetMonster,
      spentATK,
      []
    );

    if (attackResult.error) {
      results.validationErrors.push(attackResult.error!);
      return;
    }

    const interaction: CombatInteraction = {
      attackerId: attacker.id,
      targetId: targetMonster?.id || null,
      spentATK,
      decreaseDealt: attackResult.decreaseDealt,
      killedMonster: attackResult.killedMonster,
    };

    results.totalDecrease += interaction.decreaseDealt;
    results.interactions.push(interaction);

    if (interaction.killedMonster) {
      results.destroyedMonsters.push({
        monsterId: targetMonster?.id || '',
        destroyedBy: attacker.id,
      });
    }

    usedAttackers.add(attacker.id);
  });

  return results;
};

export const resetMonsterStats = (monsters: Monster[]): Monster[] => {
  return monsters.map((monster) => ({
    ...monster,
    currentAttack: monster.baseAttack,
    currentDefense: monster.baseDefense,
    hasAttacked: false,
    justSummoned: false,
  }));
};

export const canMonsterAttack = (
  monster: Monster,
  isFreshlyPlaced: boolean,
  hasAlreadyAttacked: boolean,
  extraActions: number = 0
): { canAttack: boolean; reason: string } => {
  if (monster.position === 'defense') {
    return { canAttack: false, reason: 'Monster in defense position' };
  }

  if (isFreshlyPlaced) {
    return { canAttack: false, reason: 'Freshly summoned, cannot attack this turn' };
  }

  const maxAttacks = 1 + extraActions;
  if (hasAlreadyAttacked && maxAttacks <= 1) {
    return { canAttack: false, reason: 'Monster already attacked this turn' };
  }

  return { canAttack: true, reason: '' };
};

export const calculateAirfury = (airMonsterCount: number): number => {
  return Math.floor(airMonsterCount / 10);
};

export const shouldDestroyDefender = (decreaseOverflow: number): boolean => {
  return decreaseOverflow > 0;
};

export const calculateTotalBattleDecrease = (combatInteractions: CombatInteraction[]): number => {
  return combatInteractions.reduce((total, interaction) => {
    return total + (interaction.decreaseDealt || 0);
  }, 0);
};

export interface BattleResults {
  totalDecrease: number;
  destroyedMonsters: { monsterId: string; destroyedBy: string }[];
  interactions: CombatInteraction[];
}

export const getLegacyBattleResults = (results: ReturnType<typeof resolveBattlePhase>): Partial<BattleResults> => {
  return {
    totalDecrease: results.totalDecrease,
    destroyedMonsters: results.destroyedMonsters,
  };
};