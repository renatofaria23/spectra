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
import { EffectType, type InvokeCriteria, type ForEachConfig } from './Effects';
import { isDirectValueTarget, isNumenTarget } from './CardEditorOptions';
import type { EffectEntry } from './Effects';

const passiveDescriptions: Record<PassiveTrigger, string> = {
  [PassiveTrigger.CHALLENGE]: "This numen must be attacked before other numina.",
  [PassiveTrigger.VEILED]: "This numen cannot be targeted by the opponent, unless it's the only numen on its owners field.",
  [PassiveTrigger.CELERITY]: "This numen can attack the turn it is invokeed.",
  [PassiveTrigger.STUNNED]: "This numen cannot attack or activate effects.",
  [PassiveTrigger.NULLIFY]: "Negates all card effects.",
  [PassiveTrigger.LOCKED]: "This numen cannot change battle position, unless by the effect of another card.",
  [PassiveTrigger.RECLUSE]: "This numen cannot attack in groups.",
  [PassiveTrigger.LEGION]: "This numen can only attack in groups.",
  [PassiveTrigger.RELENTLESS]: "After being attacked, this numen recoups its stats to full.",
  [PassiveTrigger.SHROUDED]: "Your opponent can't know what numen this is and can't target it until it attacks or you target it with a card effect."
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
  [PassiveTrigger.RELENTLESS]: "Relentless",
  [PassiveTrigger.SHROUDED]: "Shrouded"
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
  'opponent_memora': "the opponent's memora",
  'opponent_exile': "the opponent's exile",
  'opponent_mana': "the opponent's mana",
  'player_hp': "your HP",
  'player_hand': "your hand",
  'player_deck': "your deck",
  'player_memora': "your memora",
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

const FORGET_TARGET_DESCRIPTIONS: Record<string, string> = {
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

const SELECTIVE_FORGET_TARGETS = ['numen', 'another_numen', 'rite', 'ward'];

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
  return `for each ${cardTypeLabel} in ${ownerLabel} ${config.zone}, `;
};

function getEffectGroupKey(effect: any, triggerEffectTarget: EffectTarget | undefined): string {
  const effTarget = effect.effectTarget || triggerEffectTarget;
  const duration = effect.duration || '';
  const forEachJson = JSON.stringify((effect as any).forEachConfig || null);
  const amount = effect.amount ?? 0;

  let subTarget = effect.target || '';
  if ((effect.effect === EffectType.INCREASE || effect.effect === EffectType.DECREASE) && (subTarget === 'atk' || subTarget === 'def')) {
    subTarget = 'stat';
  }

  if (effect.effect === EffectType.RETURN) {
    const returnTarget = effect.returnTarget || '';
    const returnDestination = effect.returnDestination || '';
    const returnCardType = effect.returnCardType || '';
    const count = effect.count ?? 0;
    return `${effect.effect}|${effTarget}|${duration}|${subTarget}|${amount}|${forEachJson}|${returnTarget}|${returnDestination}|${returnCardType}|${count}`;
  }

  return `${effect.effect}|${effTarget}|${duration}|${subTarget}|${amount}|${forEachJson}`;
}

function mergeGroupEffects(effects: any[]): any {
  if (effects.length === 1) return effects[0];

  const base = { ...effects[0] };
  const targets = effects.map(e => e.target).filter(Boolean);

  if (targets.includes('atk') && targets.includes('def')) {
    base.target = 'both';
  }

  return base;
}

const describeEffect = (
  effect: EffectEntry,
  trigger: ConditionalTrigger | undefined,
  attackTarget: string | undefined,
  effectTarget: EffectTarget | undefined,
  selectedTarget: EffectTarget | null | undefined
): string => {
  const effectOwnTarget = (effect as any).effectTarget;
  const resolvedTarget = effectOwnTarget || effectTarget;
  const skipSub = (effect.effect === EffectType.EXILE || effect.effect === EffectType.FORGET) && isSelectableNumenTarget(resolvedTarget);
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

    case EffectType.FORGET: {
      const forgetCount = (effect as any).count ?? 1;
      const forgetWord = forgetCount === 1 ? 'card' : 'cards';
      const targetType = getTargetTypeLabel(resolvedTarget);
      const isMagicTarget = resolvedTarget && (resolvedTarget.includes('magic') || resolvedTarget.includes('rite') || resolvedTarget.includes('ward'));
      if (resolvedTarget === 'self') {
        baseText = `forget this card`;
      } else if (resolvedTarget === 'attack_target') {
        baseText = `forget the attack target`;
      } else if (!isMagicTarget && trigger === ConditionalTrigger.WHEN_ATTACKED) {
        baseText = `forget the attacking ${targetType}`;
      } else if (!isMagicTarget && trigger && isAttackTrigger(trigger)) {
        baseText = `forget the attacked ${targetType}`;
      } else if (resolvedTarget && resolvedTarget.startsWith('all_')) {
        baseText = `forget ${targetDesc}`;
      } else if (isSelectableNumenTarget(resolvedTarget)) {
        baseText = `Select and forget ${targetDesc}`;
      } else if (isMagicTarget && resolvedTarget) {
        baseText = `Select and forget ${targetDesc}`;
      } else if (resolvedTarget) {
        baseText = `forget ${forgetCount} ${forgetWord} from ${targetDesc}`;
      } else {
        baseText = `forget ${forgetCount} ${forgetWord}`;
      }
      break;
    }

    case EffectType.EXILE: {
      const exileEffect = effect as any;
      if (exileEffect.from) {
        const fromDesc = describeInvokeFrom(exileEffect.from);
        const exileCount = exileEffect.count ?? 1;
        const exileWord = exileCount === 1 ? 'numen' : 'numina';
        if (exileEffect.criteria && exileEffect.criteria.name) {
          baseText = `exile ${exileCount} <i>${exileEffect.criteria.name}</i> from ${fromDesc}`;
        } else {
          const criteriaDesc = exileEffect.criteria ? describeInvokeCriteria(exileEffect.criteria, exileCount) : '';
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
        } else if (resolvedTarget && resolvedTarget.startsWith('all_')) {
          baseText = `exile ${targetDesc}`;
        } else if (isSelectableNumenTarget(resolvedTarget)) {
          baseText = `Select and exile ${targetDesc}`;
        } else if (isMagicTarget && resolvedTarget) {
          baseText = `Select and exile ${targetDesc}`;
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
        baseText = `while this card is on the field, ${targetDesc} is locked`;
      } else if (lockDuration === 'temporary' && effect.turns) {
        baseText = `lock ${targetDesc} for ${effect.turns} ${lockTurns}`;
      } else {
        baseText = `lock ${targetDesc}`;
      }
      break;
    }

    case EffectType.DECREASE: {
      const decreaseEffect = effect as any;
      const decEntity = decreaseEffect.target;
      const decStat = decreaseEffect.effectTarget || decreaseEffect.target;
      const decIsNumen = isNumenTarget(decEntity);
      const isPerm = decreaseEffect.duration === 'permanent';
      const isTemp = decreaseEffect.duration === 'temporary';
      const isWhileOnField = decreaseEffect.duration === 'while_on_field';
      const durationTurns = decreaseEffect.durationTurns;
      let durationText = '';
      if (isPerm) durationText = ' permanently';
      if (isTemp && durationTurns) durationText = ` for ${durationTurns} turns`;
      const whilePrefix = isWhileOnField ? 'while this card is on the field, ' : '';
      if (decEntity === 'self') {
        if (decStat === 'hp') baseText = `${whilePrefix}lose ${decreaseEffect.amount} HP${durationText}`;
        else if (decStat === 'atk') baseText = `${whilePrefix}lose ${decreaseEffect.amount} ATK${durationText}`;
        else if (decStat === 'def') baseText = `${whilePrefix}lose ${decreaseEffect.amount} DEF${durationText}`;
        else if (decStat === 'both') baseText = `${whilePrefix}lose ${decreaseEffect.amount} ATK and DEF${durationText}`;
        else if (decStat === 'mana') baseText = `${whilePrefix}lose ${decreaseEffect.amount} mana${durationText}`;
        else baseText = `${whilePrefix}lose ${decreaseEffect.amount}${durationText}`;
      } else if (decIsNumen) {
        const numenDesc = decEntity === 'numen' ? targetDesc : targetDesc;
        if (decStat === 'hp') baseText = `${whilePrefix}decrease ${numenDesc}'s HP by ${decreaseEffect.amount}${durationText}`;
        else if (decStat === 'atk') baseText = `${whilePrefix}decrease ${numenDesc}'s ATK by ${decreaseEffect.amount}${durationText}`;
        else if (decStat === 'def') baseText = `${whilePrefix}decrease ${numenDesc}'s DEF by ${decreaseEffect.amount}${durationText}`;
        else if (decStat === 'both') baseText = `${whilePrefix}decrease ${numenDesc}'s ATK and DEF by ${decreaseEffect.amount}${durationText}`;
        else baseText = `${whilePrefix}decrease ${numenDesc}'s stats by ${decreaseEffect.amount}${durationText}`;
      } else if (decEntity === 'player') {
        if (decStat === 'hp') baseText = `${whilePrefix}decrease your HP by ${decreaseEffect.amount}${durationText}`;
        else if (decStat === 'mana') baseText = `${whilePrefix}decrease your mana by ${decreaseEffect.amount}${durationText}`;
        else baseText = `${whilePrefix}decrease your stats by ${decreaseEffect.amount}${durationText}`;
      } else if (decEntity === 'opponent') {
        if (decStat === 'hp') baseText = `${whilePrefix}decrease the opponent's HP by ${decreaseEffect.amount}${durationText}`;
        else if (decStat === 'mana') baseText = `${whilePrefix}decrease the opponent's mana by ${decreaseEffect.amount}${durationText}`;
        else baseText = `${whilePrefix}decrease the opponent's stats by ${decreaseEffect.amount}${durationText}`;
      } else {
        baseText = `${whilePrefix}decrease ${targetDesc} by ${decreaseEffect.amount}${durationText}`;
      }
      break;
    }

    case EffectType.INCREASE: {
      const increaseEffect = effect as any;
      const incEntity = increaseEffect.target;
      const incStat = increaseEffect.effectTarget || increaseEffect.target;
      const incIsNumen = isNumenTarget(incEntity);
      const isPerm = increaseEffect.duration === 'permanent';
      const isTemp = increaseEffect.duration === 'temporary';
      const isWhileOnField = increaseEffect.duration === 'while_on_field';
      const durationTurns = increaseEffect.durationTurns;
      let durationText = '';
      if (isPerm) durationText = ' permanently';
      if (isTemp && durationTurns) durationText = ` for ${durationTurns} turns`;
      const whilePrefix = isWhileOnField ? 'while this card is on the field, ' : '';
      if (incEntity === 'self') {
        if (incStat === 'hp') baseText = `${whilePrefix}gain ${increaseEffect.amount} HP${durationText}`;
        else if (incStat === 'atk') baseText = `${whilePrefix}gain ${increaseEffect.amount} ATK${durationText}`;
        else if (incStat === 'def') baseText = `${whilePrefix}gain ${increaseEffect.amount} DEF${durationText}`;
        else if (incStat === 'both') baseText = `${whilePrefix}gain ${increaseEffect.amount} ATK and DEF${durationText}`;
        else if (incStat === 'mana') baseText = `${whilePrefix}gain ${increaseEffect.amount} mana${durationText}`;
        else baseText = `${whilePrefix}gain ${increaseEffect.amount}${durationText}`;
      } else if (incIsNumen) {
        const numenDesc = incEntity === 'numen' ? targetDesc : targetDesc;
        if (incStat === 'hp') baseText = `${whilePrefix}increase ${numenDesc}'s HP by ${increaseEffect.amount}${durationText}`;
        else if (incStat === 'atk') baseText = `${whilePrefix}increase ${numenDesc}'s ATK by ${increaseEffect.amount}${durationText}`;
        else if (incStat === 'def') baseText = `${whilePrefix}increase ${numenDesc}'s DEF by ${increaseEffect.amount}${durationText}`;
        else if (incStat === 'both') baseText = `${whilePrefix}increase ${numenDesc}'s ATK and DEF by ${increaseEffect.amount}${durationText}`;
        else baseText = `${whilePrefix}increase ${numenDesc}'s stats by ${increaseEffect.amount}${durationText}`;
      } else if (incEntity === 'player') {
        if (incStat === 'hp') baseText = `${whilePrefix}increase your HP by ${increaseEffect.amount}${durationText}`;
        else if (incStat === 'mana') baseText = `${whilePrefix}increase your mana by ${increaseEffect.amount}${durationText}`;
        else baseText = `${whilePrefix}increase your stats by ${increaseEffect.amount}${durationText}`;
      } else if (incEntity === 'opponent') {
        if (incStat === 'hp') baseText = `${whilePrefix}increase the opponent's HP by ${increaseEffect.amount}${durationText}`;
        else if (incStat === 'mana') baseText = `${whilePrefix}increase the opponent's mana by ${increaseEffect.amount}${durationText}`;
        else baseText = `${whilePrefix}increase the opponent's stats by ${increaseEffect.amount}${durationText}`;
      } else {
        baseText = `${whilePrefix}increase ${targetDesc} by ${increaseEffect.amount}${durationText}`;
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

    case EffectType.INVOKE:
      baseText = describeInvokeEffect(effect as any, targetDesc, 'invoke');
      break;

    case EffectType.EVOKE:
      baseText = describeInvokeEffect(effect as any, targetDesc, 'evoke');
      break;

    case EffectType.CONVOKE:
      baseText = describeInvokeEffect(effect as any, targetDesc, 'convoke');
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

const describeInvokeEffect = (effect: { from: string; criteria: InvokeCriteria; count: number }, targetDesc: string, action: string): string => {
  const countWord = effect.count === 1 ? 'numen' : 'numina';
  const isPlayerZone = effect.from.startsWith('player_');
  const fromDesc = describeInvokeFrom(effect.from);
  const fromSuffix = isPlayerZone ? '' : ` from ${fromDesc}`;

  if (effect.criteria.name) {
    return `${action} ${effect.count} <i>${effect.criteria.name}</i>${fromSuffix}`;
  }

  const criteriaDesc = describeInvokeCriteria(effect.criteria, effect.count);
  if (criteriaDesc) {
    return `${action} ${effect.count} ${criteriaDesc}${fromSuffix}`;
  }
  return `${action} ${effect.count} ${countWord}${fromSuffix}`;
};

const describeInvokeFrom = (from: string): string => {
  const fromMap: Record<string, string> = {
    'player_deck': 'your deck',
    'player_hand': 'your hand',
    'player_memora': 'your memora',
    'player_exile': 'your exile',
    'opponent_deck': "opponent's deck",
    'opponent_hand': "opponent's hand",
    'opponent_memora': "opponent's memora",
    'opponent_exile': "opponent's exile",
  };
  return fromMap[from] || from;
};

const describeInvokeCriteria = (criteria: InvokeCriteria, count?: number): string => {
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
    'player_memora': 'your memora',
    'opponent_memora': "opponent's memora",
    'player_exile': 'your exile',
    'opponent_exile': "opponent's exile",
    'player_hand': 'your hand',
    'opponent_hand': "opponent's hand",
  };
  return map[destination] || destination;
};

const describeAddFrom = (addFrom: string): string => {
  const map: Record<string, string> = {
    'player_field': 'your field',
    'opponent_field': "opponent's field",
    'any_field': 'any field',
    'player_memora': 'your memora',
    'opponent_memora': "opponent's memora",
    'any_memora': 'any memora',
    'player_exile': 'your exile',
    'opponent_exile': "opponent's exile",
    'any_exile': 'any exile',
    'player_deck': 'your deck',
    'opponent_deck': "opponent's deck",
    'any_deck': 'any deck',
    'player_hand': 'your hand',
    'opponent_hand': "opponent's hand",
    'any_hand': 'any hand',
  };
  return map[addFrom] || addFrom;
};

const describeAddEffect = (effect: { addFrom: string; destination: string; count: number; addTargetType?: string }, targetDesc: string): string => {
  const fromLabel = describeAddFrom(effect.addFrom);
  const destinationLabel = destinationToLabel(effect.destination);
  const countWord = effect.count === 1 ? 'copy' : 'copies';
  const targetTypeLabel = effect.addTargetType && effect.addTargetType !== 'any' ? effect.addTargetType : 'card';
  return `Select a ${targetTypeLabel} from ${fromLabel}. Add ${effect.count} ${countWord} of it into ${destinationLabel}`;
};

const describeReturnEffect = (effect: any, targetDesc: string, resolvedTarget: EffectTarget | undefined): string => {
  const returnTarget = effect.returnTarget;
  const returnFieldTarget = effect.returnFieldTarget;
  const returnCardType = effect.returnCardType;
  const returnDestination = effect.returnDestination || 'hand';

  if (resolvedTarget === 'self' || returnTarget === 'self') {
    const destLabel = returnDestination === 'hand' ? 'hand' : returnDestination === 'deck' ? 'deck' : returnDestination || 'memora';
    return `return this to your ${destLabel}`;
  }

  const count = effect.count ?? 1;
  const countWord = count === 1 ? 'card' : 'cards';

  if (returnTarget === 'player_field' || returnTarget === 'opponent_field') {
    const fieldOwner = returnTarget === 'player_field' ? 'your' : "the opponent's";
    const isAll = returnFieldTarget && returnFieldTarget.startsWith('all_');
    const fieldTargetLabels: Record<string, string> = {
      'all_enemy_numina': 'all enemy numina',
      'all_allied_numina': 'all allied numina',
      'all_enemy_rites': 'all enemy rites',
      'all_allied_rites': 'all allied rites',
      'all_enemy_wards': 'all enemy wards',
      'all_allied_wards': 'all allied wards',
      'all_enemy_magics': 'all enemy magics',
      'all_allied_magics': 'all allied magics',
      'enemy_numen': 'an enemy numen',
      'allied_numen': 'an allied numen',
      'enemy_rite': 'an enemy rite',
      'allied_rite': 'an allied rite',
      'enemy_ward': 'an enemy ward',
      'allied_ward': 'an allied ward',
      'enemy_magic': 'an enemy magic',
      'allied_magic': 'an allied magic',
    };
    if (returnFieldTarget && fieldTargetLabels[returnFieldTarget]) {
      if (isAll) {
        return `return ${fieldTargetLabels[returnFieldTarget]} from ${fieldOwner} field to ${fieldOwner} ${returnDestination}`;
      }
      return `return ${count} ${countWord} from ${fieldTargetLabels[returnFieldTarget]} on ${fieldOwner} field to ${fieldOwner} ${returnDestination}`;
    }
    return `return ${count} ${countWord} from ${fieldOwner} field to ${fieldOwner} ${returnDestination}`;
  }

  if (returnTarget === 'player_memora' || returnTarget === 'opponent_memora' || returnTarget === 'player_exile' || returnTarget === 'opponent_exile') {
    const zoneOwner = returnTarget.startsWith('player') ? 'your' : "the opponent's";
    const zoneName = returnTarget.includes('memora') ? 'memora' : 'exile';
    const zoneTargetLabels: Record<string, string> = {
      'numen': count === 1 ? 'numen' : 'numina',
      'rite': count === 1 ? 'rite' : 'rites',
      'ward': count === 1 ? 'ward' : 'wards',
      'magic': count === 1 ? 'magic' : 'magics',
      'any': countWord,
    };
    const zoneLabel = returnCardType && zoneTargetLabels[returnCardType] ? zoneTargetLabels[returnCardType] : countWord;
    return `return ${count} ${zoneLabel} from ${zoneOwner} ${zoneName} to ${zoneOwner} ${returnDestination}`;
  }

  const dest = returnTarget || effect.destination || 'memora';
  const destLabel = dest === 'hand' ? 'hand' : dest === 'deck' ? 'deck' : dest.includes('memora') ? 'memora' : dest.includes('exile') ? 'exile' : 'memora';
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

      const effectGroups = new Map<string, any[]>();
      for (const singleEffect of effectsList) {
        const key = getEffectGroupKey(singleEffect, entry.effectTarget);
        const group = effectGroups.get(key) || [];
        group.push(singleEffect);
        effectGroups.set(key, group);
      }

      for (const group of effectGroups.values()) {
        const merged = mergeGroupEffects(group);
        const resolvedEffectTarget = entry.effectTarget || (merged as any).effectTarget;
        const selectableTarget = isSelectableNumenTarget(resolvedEffectTarget) ? resolvedEffectTarget : null;

        const effectText = describeEffect(
          merged,
          entry.trigger,
          entry.attackTarget,
          entry.effectTarget,
          selectableTarget
        );

        let selectPrefix = '';
        const isSelectIncorporated = (merged.effect === EffectType.EXILE || merged.effect === EffectType.FORGET) && isSelectableNumenTarget(resolvedEffectTarget);
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
