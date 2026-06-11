import {
  PassiveTrigger,
  ConditionalTrigger,
  isPassiveTrigger,
  isCounterTrigger,
  isMentalDebtTrigger,
  isAbsorbTrigger,
  isConditionalTrigger
} from './Triggers';
import type { TriggerEntry } from './Triggers';
import type { EffectTarget } from './Triggers';
import { EffectType, type SummonCriteria, type ForEachConfig } from './Effects';
import { isDirectValueTarget } from './CardEditorOptions';
import type { EffectEntry } from './Effects';

const passiveDescriptions: Record<PassiveTrigger, string> = {
  [PassiveTrigger.CHALLENGE]: "This numen must be attacked before other numina.",
  [PassiveTrigger.VEILED]: "This numen cannot be targeted by the opponent, unless it's the only numen on its owners field.",
  [PassiveTrigger.CELERITY]: "This numen can attack the turn it is summoned.",
  [PassiveTrigger.STUNNED]: "This numen cannot attack or activate effects.",
  [PassiveTrigger.NULLIFY]: "Negates all card effects.",
  [PassiveTrigger.LOCKED]: "This numen cannot change battle position, unless by the effect of another card.",
  [PassiveTrigger.RECLUSE]: "This numen cannot attack in groups.",
  [PassiveTrigger.LEGION]: "This numen can only attack in groups.",
  [PassiveTrigger.RELENTLESS]: "After being attacked, this numen recoups its stats to full."
};

const passiveLabels: Record<PassiveTrigger, string> = {
  [PassiveTrigger.CHALLENGE]: "Challenge",
  [PassiveTrigger.VEILED]: "Veiled",
  [PassiveTrigger.CELERITY]: "Celerity",
  [PassiveTrigger.STUNNED]: "Stunned",
  [PassiveTrigger.NULLIFY]: "Nullified",
  [PassiveTrigger.LOCKED]: "Locked",
  [PassiveTrigger.RECLUSE]: "Recluse",
  [PassiveTrigger.LEGION]: "Legion",
  [PassiveTrigger.RELENTLESS]: "Relentless"
};

const triggerLabels: Record<ConditionalTrigger, string> = {
  [ConditionalTrigger.DECREE]: "Decree",
  [ConditionalTrigger.TESTAMENT]: "Testament",
  [ConditionalTrigger.START_OF_TURN]: "Start of Turn",
  [ConditionalTrigger.END_OF_TURN]: "End of Turn",
  [ConditionalTrigger.BEFORE_ATTACK]: "Before Attack",
  [ConditionalTrigger.AFTER_ATTACK]: "After Attack",
  [ConditionalTrigger.WHEN_ATTACKED]: "When Attacked",
  [ConditionalTrigger.WHEN]: "",
};

const getAttackTargetLabel = (attackTarget: string | undefined, trigger: ConditionalTrigger): string => {
  if (!attackTarget || attackTarget === 'anything') return '';
  if (trigger === ConditionalTrigger.WHEN_ATTACKED) {
    if (attackTarget === 'allied_numen') return ' on an allied numen';
    return '';
  }
  if (attackTarget === 'player') return ' on the player';
  if (attackTarget === 'numen') return ' on a numen';
  if (attackTarget === 'allied_numen') return ' on an allied numen';
  return '';
};

const getTriggerLabel = (trigger: ConditionalTrigger, attackTarget?: string): string => {
  const base = triggerLabels[trigger];
  if (!base) return '';
  const suffix = getAttackTargetLabel(attackTarget, trigger);
  return `<b>${base}${suffix}</b>`;
};

const effectTargetDescriptions: Record<EffectTarget, string> = {
  'self': 'this numen',
  'attack_target': 'the attack target',
  'any_card': 'any card',
  'all_cards': 'all cards',
  'any_numen': 'any numen',
  'any_magic': 'any magic',
  'any_rite': 'any rite',
  'any_ward': 'any ward',
  'allied_numen': 'an allied numen',
  'enemy_numen': 'an enemy numen',
  'all_allied_numina': 'all allied numina',
  'all_enemy_numina': 'all enemy numina',
  'global_allied_numina': 'all allied numina (including future)',
  'global_enemy_numina': 'all enemy numina (including future)',
  'allied_non_mythic_numen': 'an allied non-mythic numen',
  'enemy_non_mythic_numen': 'an enemy non-mythic numen',
  'all_allied_non_mythic_numina': 'all allied non-mythic numina',
  'all_enemy_non_mythic_numina': 'all enemy non-mythic numina',
  'global_allied_non_mythic_numina': 'all allied non-mythic numina (including future)',
  'global_enemy_non_mythic_numina': 'all enemy non-mythic numina (including future)',
  'allied_magic': 'an allied magic',
  'enemy_magic': 'an enemy magic',
  'all_allied_magics': 'all allied magics',
  'all_enemy_magics': 'all enemy magics',
  'allied_rite': 'an allied rite',
  'enemy_rite': 'an enemy rite',
  'all_allied_rites': 'all allied rites',
  'all_enemy_rites': 'all enemy rites',
  'allied_ward': 'an allied ward',
  'enemy_ward': 'an enemy ward',
  'all_allied_wards': 'all allied wards',
  'all_enemy_wards': 'all enemy wards',
  'opponent_hp': "the opponent's HP",
  'opponent_hand': "the opponent's hand",
  'opponent_deck': "the opponent's deck",
  'opponent_graveyard': "the opponent's graveyard",
  'opponent_exile': "the opponent's exile",
  'opponent_mana': "the opponent's mana",
  'player_hp': "your HP",
  'player_hand': "your hand",
  'player_deck': "your deck",
  'player_graveyard': "your graveyard",
  'player_exile': "your exile",
  'player_mana': "your mana",
};

const ALLY_TARGETS: EffectTarget[] = [
  'self', 'allied_numen', 'all_allied_numina', 'global_allied_numina',
  'allied_non_mythic_numen', 'all_allied_non_mythic_numina', 'global_allied_non_mythic_numina',
  'allied_magic', 'all_allied_magics', 'allied_rite', 'all_allied_rites',
  'allied_ward', 'all_allied_wards',
];

const ENEMY_TARGETS: EffectTarget[] = [
  'enemy_numen', 'all_enemy_numina',
  'enemy_non_mythic_numen', 'all_enemy_non_mythic_numina', 'global_enemy_non_mythic_numina',
  'enemy_magic', 'all_enemy_magics', 'enemy_rite', 'all_enemy_rites',
  'enemy_ward', 'all_enemy_wards',
];

const isAllyTarget = (t: EffectTarget | undefined): boolean => !!t && ALLY_TARGETS.includes(t);
const isEnemyTarget = (t: EffectTarget | undefined): boolean => !!t && ENEMY_TARGETS.includes(t);

const SELECTABLE_NUMEN_TARGETS: EffectTarget[] = ['allied_numen', 'enemy_numen'];

const isSelectableNumenTarget = (target: EffectTarget | undefined): boolean => {
  return target ? SELECTABLE_NUMEN_TARGETS.includes(target) : false;
};

const getSelectPrefix = (effectTarget: EffectTarget | undefined): string => {
  if (effectTarget === 'allied_numen') return 'Select an allied numen.';
  if (effectTarget === 'enemy_numen') return 'Select an enemy numen.';
  return '';
};

const getEffectTargetDescription = (effectTarget: EffectTarget | undefined, selectedTarget: EffectTarget | null | undefined, skipSubstitution: boolean = false): string => {
  if (effectTarget && effectTargetDescriptions[effectTarget]) {
    if (!skipSubstitution && selectedTarget && effectTarget === selectedTarget) {
      return 'that numen';
    }
    return effectTargetDescriptions[effectTarget];
  }
  return 'the target';
};

const DESTROY_TARGET_DESCRIPTIONS: Record<string, string> = {
  'all': 'all cards on the field',
  'all_enemy_numina': 'all enemy numina',
  'all_enemy_face_up_numina': 'all enemy face-up numina',
  'all_enemy_face_down_numina': 'all enemy face-down numina',
  'all_enemy_magics': 'all enemy magics',
  'all_enemy_face_up_magics': 'all enemy face-up magics',
  'all_enemy_face_down_magics': 'all enemy face-down magics',
  'attacking_numina': 'all attacking numina',
  'defending_numina': 'all defending numina',
};

const SELECTIVE_DESTROY_TARGETS = ['numen', 'another_numen', 'rite', 'ward'];

const ATTACK_TRIGGERS = [
  ConditionalTrigger.BEFORE_ATTACK,
  ConditionalTrigger.AFTER_ATTACK,
  ConditionalTrigger.WHEN_ATTACKED
];

const isAttackTrigger = (trigger: ConditionalTrigger): boolean => {
  return ATTACK_TRIGGERS.includes(trigger);
};

function getTargetTypeLabel(target: EffectTarget | undefined): string {
  if (!target) return 'numen';
  if (target.includes('magic')) return 'magic';
  if (target.includes('rite')) return 'rite';
  if (target.includes('ward')) return 'ward';
  return 'numen';
}

const describeForEachPrefix = (config: ForEachConfig | undefined): string => {
  if (!config) return '';
  const cardTypeLabel = config.cardType === 'any' ? 'card' : config.cardType;
  const ownerLabel = config.owner === 'player' ? 'your' : config.owner === 'opponent' ? "the opponent's" : 'both players\'';
  return `For each ${cardTypeLabel} in ${ownerLabel} ${config.zone}, `;
};

const describeEffect = (
  effect: EffectEntry,
  trigger: ConditionalTrigger | undefined,
  attackTarget: string | undefined,
  effectTarget: EffectTarget | undefined,
  selectedTarget: EffectTarget | null | undefined
): string => {
  const effectOwnTarget = (effect as any).effectTarget;
  const resolvedTarget = effectOwnTarget || effectTarget;
  const skipSub = (effect.effect === EffectType.EXILE || effect.effect === EffectType.DESTROY) && isSelectableNumenTarget(resolvedTarget);
  const targetDesc = getEffectTargetDescription(resolvedTarget, selectedTarget, skipSub);

  let baseText: string;

  switch (effect.effect) {
    case EffectType.DRAW:
      const drawWord = effect.count === 1 ? 'card' : 'cards';
      const drawTarget = (effect as any).target;
      if (drawTarget === 'both') {
        baseText = `you and your opponent draw ${effect.count} ${drawWord}`;
      } else if (drawTarget === 'opponent') {
        baseText = `your opponent draws ${effect.count} ${drawWord}`;
      } else {
        baseText = `draw ${effect.count} ${drawWord}`;
      }
      break;

    case EffectType.SCRY:
      const scryWord = effect.count === 1 ? 'card' : 'cards';
      const deckDesc = effect.deck === 'player' ? 'your' : effect.deck === 'opponent' ? "the opponent's" : `${effect.deck}'s`;
      baseText = `scry ${effect.count} ${scryWord} from ${deckDesc} deck`;
      break;

    case EffectType.DESTROY: {
      const destroyCount = (effect as any).count ?? 1;
      const destroyWord = destroyCount === 1 ? 'card' : 'cards';
      const targetType = getTargetTypeLabel(resolvedTarget);
      const isMagicTarget = resolvedTarget && (resolvedTarget.includes('magic') || resolvedTarget.includes('rite') || resolvedTarget.includes('ward'));
      if (resolvedTarget === 'self') {
        baseText = `destroy this card`;
      } else if (resolvedTarget === 'attack_target') {
        baseText = `destroy the attack target`;
      } else if (!isMagicTarget && trigger === ConditionalTrigger.WHEN_ATTACKED) {
        baseText = `destroy the attacking ${targetType}`;
      } else if (!isMagicTarget && trigger && isAttackTrigger(trigger)) {
        baseText = `destroy the attacked ${targetType}`;
      } else if (isSelectableNumenTarget(resolvedTarget)) {
        baseText = `Select and destroy ${targetDesc}`;
      } else if (isMagicTarget && resolvedTarget) {
        baseText = `Select and destroy ${targetDesc}`;
      } else if (resolvedTarget && resolvedTarget.startsWith('all_')) {
        baseText = `destroy ${targetDesc}`;
      } else if (resolvedTarget) {
        baseText = `destroy ${destroyCount} ${destroyWord} from ${targetDesc}`;
      } else {
        baseText = `destroy ${destroyCount} ${destroyWord}`;
      }
      break;
    }

    case EffectType.EXILE: {
      const exileEffect = effect as any;
      if (exileEffect.from) {
        const fromDesc = describeSummonFrom(exileEffect.from);
        const exileCount = exileEffect.count ?? 1;
        const exileWord = exileCount === 1 ? 'numen' : 'numina';
        if (exileEffect.criteria && exileEffect.criteria.name) {
          baseText = `exile ${exileCount} <i>${exileEffect.criteria.name}</i> from ${fromDesc}`;
        } else {
          const criteriaDesc = exileEffect.criteria ? describeSummonCriteria(exileEffect.criteria, exileCount) : '';
          if (criteriaDesc) {
            baseText = `exile ${exileCount} ${criteriaDesc} from ${fromDesc}`;
          } else {
            baseText = `exile ${exileCount} ${exileWord} from ${fromDesc}`;
          }
        }
      } else {
        const exileCount = exileEffect.count ?? 1;
        const exileWord = exileCount === 1 ? 'card' : 'cards';
        const exileTargetType = getTargetTypeLabel(resolvedTarget);
        const isMagicTarget = resolvedTarget && (resolvedTarget.includes('magic') || resolvedTarget.includes('rite') || resolvedTarget.includes('ward'));
        if (resolvedTarget === 'self') {
          baseText = `exile this card`;
        } else if (resolvedTarget === 'attack_target') {
          baseText = `exile the attack target`;
        } else if (!isMagicTarget && trigger === ConditionalTrigger.WHEN_ATTACKED) {
          baseText = `exile the attacking ${exileTargetType}`;
        } else if (!isMagicTarget && trigger && isAttackTrigger(trigger)) {
          baseText = `exile the attacked ${exileTargetType}`;
        } else if (isSelectableNumenTarget(resolvedTarget)) {
          baseText = `Select and exile ${targetDesc}`;
        } else if (isMagicTarget && resolvedTarget) {
          baseText = `Select and exile ${targetDesc}`;
        } else if (resolvedTarget && resolvedTarget.startsWith('all_')) {
          baseText = `exile ${targetDesc}`;
        } else if (resolvedTarget) {
          baseText = `exile ${exileCount} ${exileWord} from ${targetDesc}`;
        } else {
          baseText = `exile ${exileCount} ${exileWord}`;
        }
      }
      break;
    }

    case EffectType.PETRIFY:
      const petrifyTurns = effect.turns === 1 ? 'turn' : 'turns';
      baseText = `petrify ${targetDesc} for ${effect.turns} ${petrifyTurns}`;
      break;

    case EffectType.LOCK: {
      const lockDuration = (effect as any).duration;
      const lockTurns = effect.turns === 1 ? 'turn' : 'turns';
      if (lockDuration === 'while_on_field') {
        baseText = `While this card is on the field, ${targetDesc} is locked`;
      } else if (lockDuration === 'temporary' && effect.turns) {
        baseText = `lock ${targetDesc} for ${effect.turns} ${lockTurns}`;
      } else {
        baseText = `lock ${targetDesc}`;
      }
      break;
    }

    case EffectType.DECREASE: {
      const decreaseEffect = effect as any;
      const isPerm = decreaseEffect.duration === 'permanent';
      const isTemp = decreaseEffect.duration === 'temporary';
      const isWhileOnField = decreaseEffect.duration === 'while_on_field';
      const durationTurns = decreaseEffect.durationTurns;
      let durationText = '';
      if (isPerm) durationText = ' permanently';
      if (isTemp && durationTurns) durationText = ` for ${durationTurns} turns`;
      const whilePrefix = isWhileOnField ? 'While this card is on the field, ' : '';
      if (isDirectValueTarget(resolvedTarget)) {
        baseText = `${whilePrefix}decrease ${targetDesc} by ${decreaseEffect.amount}${durationText}`;
      } else if (effectOwnTarget === 'self' || effectTarget === 'self') {
        if (decreaseEffect.target === 'hp') baseText = `${whilePrefix}lose ${decreaseEffect.amount} HP${durationText}`;
        else if (decreaseEffect.target === 'atk') baseText = `${whilePrefix}lose ${decreaseEffect.amount} ATK${durationText}`;
        else if (decreaseEffect.target === 'def') baseText = `${whilePrefix}lose ${decreaseEffect.amount} DEF${durationText}`;
        else if (decreaseEffect.target === 'both') baseText = `${whilePrefix}lose ${decreaseEffect.amount} ATK and DEF${durationText}`;
        else baseText = `${whilePrefix}lose ${decreaseEffect.amount}${durationText}`;
      } else if (decreaseEffect.target === 'hp') {
        baseText = `${whilePrefix}decrease ${targetDesc}'s HP by ${decreaseEffect.amount}${durationText}`;
      } else if (decreaseEffect.target === 'atk') {
        baseText = `${whilePrefix}decrease ${targetDesc}'s ATK by ${decreaseEffect.amount}${durationText}`;
      } else if (decreaseEffect.target === 'def') {
        baseText = `${whilePrefix}decrease ${targetDesc}'s DEF by ${decreaseEffect.amount}${durationText}`;
      } else if (decreaseEffect.target === 'both') {
        baseText = `${whilePrefix}decrease ${targetDesc}'s ATK and DEF by ${decreaseEffect.amount}${durationText}`;
      } else if (decreaseEffect.target === 'mana') {
        baseText = `${whilePrefix}decrease ${targetDesc} by ${decreaseEffect.amount}${durationText}`;
      } else {
        baseText = `${whilePrefix}deal ${decreaseEffect.amount} decrease to ${targetDesc}${durationText}`;
      }
      break;
    }

    case EffectType.INCREASE: {
      const increaseEffect = effect as any;
      const isPerm = increaseEffect.duration === 'permanent';
      const isTemp = increaseEffect.duration === 'temporary';
      const isWhileOnField = increaseEffect.duration === 'while_on_field';
      const durationTurns = increaseEffect.durationTurns;
      let durationText = '';
      if (isPerm) durationText = ' permanently';
      if (isTemp && durationTurns) durationText = ` for ${durationTurns} turns`;
      const whilePrefix = isWhileOnField ? 'While this card is on the field, ' : '';
      if (isDirectValueTarget(resolvedTarget)) {
        baseText = `${whilePrefix}increase ${targetDesc} by ${increaseEffect.amount}${durationText}`;
      } else if (effectOwnTarget === 'self' || effectTarget === 'self') {
        if (increaseEffect.target === 'hp') baseText = `${whilePrefix}gain ${increaseEffect.amount} HP${durationText}`;
        else if (increaseEffect.target === 'atk') baseText = `${whilePrefix}gain ${increaseEffect.amount} ATK${durationText}`;
        else if (increaseEffect.target === 'def') baseText = `${whilePrefix}gain ${increaseEffect.amount} DEF${durationText}`;
        else if (increaseEffect.target === 'both') baseText = `${whilePrefix}gain ${increaseEffect.amount} ATK and DEF${durationText}`;
        else baseText = `${whilePrefix}gain ${increaseEffect.amount}${durationText}`;
      } else if (increaseEffect.target === 'hp') {
        baseText = `${whilePrefix}increase ${targetDesc}'s HP by ${increaseEffect.amount}${durationText}`;
      } else if (increaseEffect.target === 'atk') {
        baseText = `${whilePrefix}increase ${targetDesc}'s ATK by ${increaseEffect.amount}${durationText}`;
      } else if (increaseEffect.target === 'def') {
        baseText = `${whilePrefix}increase ${targetDesc}'s DEF by ${increaseEffect.amount}${durationText}`;
      } else if (increaseEffect.target === 'both') {
        baseText = `${whilePrefix}increase ${targetDesc}'s ATK and DEF by ${increaseEffect.amount}${durationText}`;
      } else if (increaseEffect.target === 'mana') {
        baseText = `${whilePrefix}increase ${targetDesc} by ${increaseEffect.amount}${durationText}`;
      } else {
        baseText = `${whilePrefix}increase ${targetDesc}'s stats by ${increaseEffect.amount}${durationText}`;
      }
      break;
    }

    case EffectType.ETHEREAL:
      const etherealTurns = effect.count === 1 ? 'turn' : 'turns';
      baseText = `grant ethereal for ${effect.count} ${etherealTurns} to ${effect.type === 'both' ? 'rites and wards' : effect.type + 's'} on ${targetDesc}`;
      break;

    case EffectType.FIND:
      baseText = `find ${effect.count} cards from ${targetDesc}`;
      break;

    case EffectType.CHOOSE_ONE:
      baseText = `choose one of: ${effect.options.join(', ')}`;
      break;

    case EffectType.ADD_TRIGGER:
      const triggerName = passiveDescriptions[effect.trigger_type as PassiveTrigger]
        ? (effect.trigger_type as string).replace(/_/g, ' ').toLowerCase()
        : effect.trigger_type;
      const triggerDuration = effect.duration === 1 ? 'turn' : 'turns';
      baseText = `grant ${triggerName} for ${effect.duration} ${triggerDuration} to ${targetDesc}`;
      break;

    case EffectType.SUMMON:
      baseText = describeSummonEffect(effect as any, targetDesc);
      break;

    case EffectType.COPY:
      baseText = describeCopyEffect(effect as any, targetDesc);
      break;

    case EffectType.ADD:
      baseText = describeAddEffect(effect as any, targetDesc);
      break;

    case EffectType.RETURN:
      baseText = describeReturnEffect(effect as any, targetDesc, resolvedTarget);
      break;

    default:
      baseText = 'activate an effect';
  }

  const orFlag = (effect as any).or;
  const orEffect = (effect as any).or_effect;
  if (orFlag && orEffect) {
    const orEffectTarget = (orEffect as any).effectTarget || effectTarget;
    const orSelectedTarget = isSelectableNumenTarget(orEffectTarget) ? orEffectTarget : null;
    const orText = describeEffect(orEffect, trigger, attackTarget, orEffectTarget, orSelectedTarget);
    baseText = `${baseText}, or ${orText}`;
  }

  const otherwiseFlag = (effect as any).otherwise;
  const otherwiseEffect = (effect as any).otherwise_effect;
  if (otherwiseFlag && otherwiseEffect) {
    const otherwiseEffectTarget = (otherwiseEffect as any).effectTarget || effectTarget;
    const otherwiseSelectedTarget = isSelectableNumenTarget(otherwiseEffectTarget) ? otherwiseEffectTarget : null;
    const otherwiseText = describeEffect(otherwiseEffect, trigger, attackTarget, otherwiseEffectTarget, otherwiseSelectedTarget);
    return `${baseText}, otherwise ${otherwiseText}`;
  }

  const forEachFlag = (effect as any).forEach;
  const forEachConfig = (effect as any).forEachConfig;
  if (forEachFlag && forEachConfig) {
    const prefix = describeForEachPrefix(forEachConfig);
    return `${prefix}${baseText}`;
  }

  return baseText;
};

const describeSummonEffect = (effect: { from: string; criteria: SummonCriteria; count: number }, targetDesc: string): string => {
  const countWord = effect.count === 1 ? 'numen' : 'numina';
  const fromDesc = describeSummonFrom(effect.from);

  if (effect.criteria.name) {
    return `summon ${effect.count} <i>${effect.criteria.name}</i> from ${fromDesc}`;
  }

  const criteriaDesc = describeSummonCriteria(effect.criteria, effect.count);
  if (criteriaDesc) {
    return `summon ${effect.count} ${criteriaDesc} from ${fromDesc}`;
  }
  return `summon ${effect.count} ${countWord} from ${fromDesc}`;
};

const describeSummonFrom = (from: string): string => {
  const fromMap: Record<string, string> = {
    'player_deck': 'your deck',
    'player_hand': 'your hand',
    'player_graveyard': 'your graveyard',
    'player_exile': 'your exile',
    'opponent_deck': "opponent's deck",
    'opponent_hand': "opponent's hand",
    'opponent_graveyard': "opponent's graveyard",
    'opponent_exile': "opponent's exile",
  };
  return fromMap[from] || from;
};

const describeSummonCriteria = (criteria: SummonCriteria, count?: number): string => {
  const parts: string[] = [];

  if ((criteria as any).any_numen) {
    parts.push(count === 1 ? 'numen' : 'numina');
  }
  if ((criteria as any).any_ward) {
    parts.push('ward');
  }
  if ((criteria as any).any_rite) {
    parts.push('spell');
  }
  if ((criteria as any).any_magic) {
    parts.push('magic');
  }

  if (criteria.name) {
    parts.push(`named "${criteria.name}"`);
  }

  if (criteria.level !== undefined) {
    parts.push(`Level ${criteria.level}`);
  } else if (criteria.levelMin !== undefined && criteria.levelMax !== undefined) {
    if (criteria.levelMin === criteria.levelMax) {
      parts.push(`Level ${criteria.levelMin}`);
    } else {
      parts.push(`Level ${criteria.levelMin}-${criteria.levelMax}`);
    }
  } else if (criteria.levelMin !== undefined) {
    parts.push(`Level ${criteria.levelMin} or higher`);
  } else if (criteria.levelMax !== undefined) {
    parts.push(`Level ${criteria.levelMax} or lower`);
  }

  if (criteria.atk !== undefined) {
    parts.push(`${criteria.atk} ATK`);
  } else if (criteria.atkMin !== undefined && criteria.atkMax !== undefined) {
    if (criteria.atkMin === criteria.atkMax) {
      parts.push(`${criteria.atkMin} ATK`);
    } else {
      parts.push(`${criteria.atkMin}-${criteria.atkMax} ATK`);
    }
  } else if (criteria.atkMin !== undefined) {
    parts.push(`${criteria.atkMin}+ ATK`);
  } else if (criteria.atkMax !== undefined) {
    parts.push(`-${criteria.atkMax} ATK`);
  }

  if (criteria.def !== undefined) {
    parts.push(`${criteria.def} DEF`);
  } else if (criteria.defMin !== undefined && criteria.defMax !== undefined) {
    if (criteria.defMin === criteria.defMax) {
      parts.push(`${criteria.defMin} DEF`);
    } else {
      parts.push(`${criteria.defMin}-${criteria.defMax} DEF`);
    }
  } else if (criteria.defMin !== undefined) {
    parts.push(`${criteria.defMin}+ DEF`);
  } else if (criteria.defMax !== undefined) {
    parts.push(`-${criteria.defMax} DEF`);
  }

  if (criteria.families && criteria.families.length > 0) {
    parts.push(criteria.families.map(f => capitalize(f)).join(' or '));
  }

  if (criteria.excludeFamilies && criteria.excludeFamilies.length > 0) {
    parts.push(`non-${criteria.excludeFamilies.map(f => capitalize(f)).join(', ')}`);
  }

  if (criteria.natures && criteria.natures.length > 0) {
    parts.push(criteria.natures.map(n => capitalize(n)).join(' or '));
  }

  if (criteria.excludeNatures && criteria.excludeNatures.length > 0) {
    parts.push(`non-${criteria.excludeNatures.map(n => capitalize(n)).join(', ')}`);
  }

  if (criteria.rarities && criteria.rarities.length > 0) {
    parts.push(criteria.rarities.join(' or '));
  }

  if (criteria.excludeRarities && criteria.excludeRarities.length > 0) {
    parts.push(`non-${criteria.excludeRarities.join(', ')}`);
  }

  return parts.join(' ');
};

const describeCopyEffect = (effect: { copyTarget: string; destination: string; count: number }, targetDesc: string): string => {
  const copyTargetLabel = copyTargetToLabel(effect.copyTarget);
  const destinationLabel = destinationToLabel(effect.destination);
  const countWord = effect.count === 1 ? 'copy' : 'copies';
  return `Select a ${copyTargetLabel}. Add ${effect.count} ${countWord} of it into ${destinationLabel}`;
};

const copyTargetToLabel = (copyTarget: string): string => {
  const map: Record<string, string> = {
    'numen': 'numen',
    'non_mythic_numen': 'non-mythic numen',
    'mythic_numen': 'mythic numen',
    'rite': 'rite',
    'ward': 'ward',
    'card': 'card',
    'atk': 'ATK',
    'def': 'DEF',
    'hp': 'HP',
  };
  return map[copyTarget] || copyTarget;
};

const destinationToLabel = (destination: string): string => {
  const map: Record<string, string> = {
    'player_deck': 'your deck',
    'opponent_deck': "opponent's deck",
    'player_graveyard': 'your graveyard',
    'opponent_graveyard': "opponent's graveyard",
    'player_exile': 'your exile',
    'opponent_exile': "opponent's exile",
    'player_hand': 'your hand',
    'opponent_hand': "opponent's hand",
  };
  return map[destination] || destination;
};

const describeAddEffect = (effect: { destination: string; count: number }, targetDesc: string): string => {
  const destinationLabel = destinationToLabel(effect.destination);
  const countWord = effect.count === 1 ? 'copy' : 'copies';
  return `Add ${effect.count} ${countWord} of it into ${destinationLabel}`;
};

const describeReturnEffect = (effect: { destination: string; count?: number }, targetDesc: string, resolvedTarget: EffectTarget | undefined): string => {
  const dest = effect.destination || '';
  const destLabel = dest.includes('hand') ? 'hand' : 'deck';

  if (resolvedTarget === 'self') {
    return `return this to your ${destLabel}`;
  }

  const count = effect.count ?? 1;
  const countWord = count === 1 ? 'card' : 'cards';
  let destinationLabel: string;
  if (isAllyTarget(resolvedTarget)) {
    destinationLabel = `your ${destLabel}`;
  } else if (isEnemyTarget(resolvedTarget)) {
    destinationLabel = `the opponent's ${destLabel}`;
  } else {
    destinationLabel = `its owner's ${destLabel}`;
  }
  return `return ${count} ${countWord} from ${targetDesc} to ${destinationLabel}`;
};

const describeSemiConfigurableTrigger = (entry: TriggerEntry): string => {
  if (isCounterTrigger(entry)) {
    return `Counter ${entry.count_type} ${entry.value} times.`;
  }
  if (isMentalDebtTrigger(entry)) {
    return `Accumulates ${entry.mana_amount} mana debt on ${entry.trigger_condition.toLowerCase()}.`;
  }
  if (isAbsorbTrigger(entry)) {
    return `Absorbs ${entry.value} ${entry.count_type}.`;
  }
  return '';
};

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function lowercaseFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function mergeStatEffects(effectsList: any[], entry: any, trigger: ConditionalTrigger | undefined, attackTarget: string | undefined, effectTarget: EffectTarget | undefined): any[] {
  const merged: any[] = [];
  const skipIndices = new Set<number>();

  for (let i = 0; i < effectsList.length; i++) {
    if (skipIndices.has(i)) continue;

    const eff = effectsList[i];
    if (eff.effect !== EffectType.INCREASE && eff.effect !== EffectType.DECREASE) {
      merged.push(eff);
      continue;
    }

    const effTarget = eff.effectTarget || effectTarget;
    const effDuration = eff.duration;
    const effAmount = eff.amount;
    const effSubTarget = eff.target;
    const effDurationTurns = eff.durationTurns;

    if (effSubTarget !== 'atk' && effSubTarget !== 'def') {
      merged.push(eff);
      continue;
    }

    let foundPair = false;
    for (let j = i + 1; j < effectsList.length; j++) {
      if (skipIndices.has(j)) continue;
      const other = effectsList[j];
      if (other.effect !== eff.effect) continue;
      if (other.effectTarget !== eff.effectTarget) continue;
      if (other.duration !== effDuration) continue;
      if (other.amount !== effAmount) continue;
      if (effDurationTurns !== undefined && other.durationTurns !== effDurationTurns) continue;
      if (other.target !== 'atk' && other.target !== 'def') continue;
      if (effSubTarget === other.target) continue;

      const combined = {
        ...eff,
        target: 'both',
      };
      merged.push(combined);
      skipIndices.add(j);
      foundPair = true;
      break;
    }

    if (!foundPair) {
      merged.push(eff);
    }
  }

  return merged;
}

export function regenerateAllDescriptions(cards: any[]): any[] {
  return cards.map((card) => {
    if (!card.triggers || card.triggers.length === 0) return card;
    const newDescription = generateDescription(card.triggers, card.type);
    if (card.description === newDescription) return card;
    return { ...card, description: newDescription };
  });
}

export function generateDescription(triggers: TriggerEntry[], cardType?: string): string {
  const passiveLabelsList: string[] = [];
  const groupedEffects: Map<string, string[]> = new Map();

  for (const entry of triggers) {
    if (isPassiveTrigger(entry)) {
      if (cardType === 'rite') {
        const triggerName = (entry as string).replace(/_/g, ' ').toLowerCase();
        passiveLabelsList.push(`<b>${triggerName}</b>`);
      } else {
        const label = passiveLabels[entry] ?? 'Unknown';
        passiveLabelsList.push(`<b>${label}</b>`);
      }
    } else if (isConditionalTrigger(entry)) {
      const effectsList: any[] = entry.effects || ((entry as any).effect ? [(entry as any).effect] : []);
      const isWhen = entry.trigger === ConditionalTrigger.WHEN;
      const isAttack = isAttackTrigger(entry.trigger);

      let label = '';
      if (isWhen) {
        const conditionParts: string[] = [];
        if (entry.whenTarget) conditionParts.push(entry.whenTarget);
        if (entry.whenCondition) conditionParts.push(entry.whenCondition);
        const conditionText = conditionParts.join(' ').trim();
        label = `When ${lowercaseFirst(conditionText)}`;
      } else {
        label = getTriggerLabel(entry.trigger, entry.attackTarget);
      }

      const effectTexts: string[] = [];
      for (const singleEffect of effectsList) {
        const resolvedEffectTarget = entry.effectTarget || (singleEffect as any).effectTarget;
        const selectableTarget = isSelectableNumenTarget(resolvedEffectTarget) ? resolvedEffectTarget : null;

        const effectText = describeEffect(
          singleEffect,
          entry.trigger,
          entry.attackTarget,
          entry.effectTarget,
          selectableTarget
        );

        let selectPrefix = '';
        const isSelectIncorporated = (singleEffect.effect === EffectType.EXILE || singleEffect.effect === EffectType.DESTROY) && isSelectableNumenTarget(resolvedEffectTarget);
        if (selectableTarget && !isWhen && !isSelectIncorporated) {
          selectPrefix = getSelectPrefix(selectableTarget) + ' ';
        }

        let fullEffectText = selectPrefix + effectText;

        if (isWhen) {
          fullEffectText = lowercaseFirst(fullEffectText);
        }

        effectTexts.push(fullEffectText);
      }

      for (const txt of effectTexts) {
        const existing = groupedEffects.get(label);
        if (existing) {
          existing.push(txt);
        } else {
          groupedEffects.set(label, [txt]);
        }
      }
    } else {
      const semiDesc = describeSemiConfigurableTrigger(entry);
      if (semiDesc) passiveLabelsList.push(semiDesc);
    }
  }

  function joinWithOr(items: string[]): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0]!;
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
  }

  const lines: string[] = [];

  if (passiveLabelsList.length > 0) {
    lines.push(passiveLabelsList.join(', '));
  }

  const groupedParts: string[] = [];
  for (const [label, effects] of groupedEffects) {
    const joinedEffects = joinWithOr(effects);
    if (label) {
      groupedParts.push(`${label}: ${capitalize(joinedEffects)}.`);
    } else {
      groupedParts.push(`${capitalize(joinedEffects)}.`);
    }
  }

  if (groupedParts.length > 0) {
    lines.push(groupedParts.join(' '));
  }

  return lines.join('\n');
}
