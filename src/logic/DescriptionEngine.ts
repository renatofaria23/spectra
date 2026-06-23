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
import { isNumenTarget } from './CardEditorOptions';
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

const getAttackTargetLabel = (t: string | undefined, trg: ConditionalTrigger) => {
  if (!t || t === 'anything') return '';
  if (trg === ConditionalTrigger.WHEN_ATTACKED) return t === 'allied_numen' ? ' on an allied numen' : '';
  return t === 'player' ? ' on the player' : t === 'numen' ? ' on a numen' : t === 'allied_numen' ? ' on an allied numen' : '';
};

const getTriggerLabel = (trigger: ConditionalTrigger, attackTarget?: string): string => {
  const base = triggerLabels[trigger];
  return base ? `<b>${base}${getAttackTargetLabel(attackTarget, trigger)}</b>` : '';
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

const isAllyTarget = (t: EffectTarget | undefined) => !!t && (t === 'self' || t.includes('allied'));
const isEnemyTarget = (t: EffectTarget | undefined) => !!t && t.includes('enemy');
const isSelectableNumenTarget = (t: EffectTarget | undefined) => t === 'allied_numen' || t === 'enemy_numen';

const getSelectPrefix = (t: EffectTarget | undefined) =>
  t === 'allied_numen' ? 'Select an allied numen.' : t === 'enemy_numen' ? 'Select an enemy numen.' : '';

const getEffectTargetDescription = (t: EffectTarget | undefined, sel: EffectTarget | null | undefined, skip = false) =>
  t && effectTargetDescriptions[t] ? (!skip && sel && t === sel ? 'that numen' : effectTargetDescriptions[t]) : 'the target';

const isAttackTrigger = (t: ConditionalTrigger) =>
  t === ConditionalTrigger.BEFORE_ATTACK || t === ConditionalTrigger.AFTER_ATTACK || t === ConditionalTrigger.WHEN_ATTACKED;

const getTargetTypeLabel = (t: EffectTarget | undefined) =>
  !t ? 'numen' : ['magic', 'rite', 'ward'].find(k => t.includes(k)) || 'numen';

const describeForEachPrefix = (c: ForEachConfig | undefined) =>
  c ? `for each ${c.cardType === 'any' ? 'card' : c.cardType} in ${c.owner === 'player' ? 'your' : c.owner === 'opponent' ? "the opponent's" : "both players'"} ${c.zone}, ` : '';

function getEffectGroupKey(effect: any, triggerEffectTarget: EffectTarget | undefined): string {
  const effTarget = effect.effectTarget || triggerEffectTarget;
  const duration = effect.duration || '';
  const forEachJson = JSON.stringify(effect.forEachConfig || null);
  const amount = effect.amount ?? 0;
  let subTarget = effect.target || '';
  if ((effect.effect === EffectType.INCREASE || effect.effect === EffectType.DECREASE) && (subTarget === 'atk' || subTarget === 'def')) {
    subTarget = 'stat';
  }
  const base = `${effect.effect}|${effTarget}|${duration}|${subTarget}|${amount}|${forEachJson}`;
  return effect.effect === EffectType.RETURN
    ? `${base}|${effect.returnTarget || ''}|${effect.returnDestination || ''}|${effect.returnCardType || ''}|${effect.count ?? 0}`
    : base;
}

const mergeGroupEffects = (effects: any[]) => {
  if (effects.length === 1) return effects[0];
  const base = { ...effects[0] };
  if (effects.some(e => e.target === 'atk') && effects.some(e => e.target === 'def')) base.target = 'both';
  return base;
};

const getZoneLabel = (z: string) => {
  const x = z.replace(/^(player|opponent)_/, '');
  return z.startsWith('player_') ? `your ${x}` : z.startsWith('opponent_') ? `opponent's ${x}` : z;
};

const describeInvokeFrom = getZoneLabel;
const destinationToLabel = getZoneLabel;

const describeAddFrom = (from: string) => {
  const x = from.replace(/^(player|opponent|any)_/, '');
  return from.startsWith('player_') ? `your ${x}` : from.startsWith('opponent_') ? `opponent's ${x}` : from.startsWith('any_') ? `any ${x}` : from;
};

const addRangePart = (parts: string[], val: number | undefined, min: number | undefined, max: number | undefined, name: string, isPrefix: boolean) => {
  const wrap = (s: string) => isPrefix ? `${name} ${s}` : `${s} ${name}`;
  if (val !== undefined) parts.push(wrap(String(val)));
  else if (min !== undefined && max !== undefined) parts.push(wrap(min === max ? String(min) : `${min}-${max}`));
  else if (min !== undefined) parts.push(wrap(isPrefix ? `${min} or higher` : `${min}+`));
  else if (max !== undefined) parts.push(wrap(isPrefix ? `${max} or lower` : `-${max}`));
};

const addListPart = (parts: string[], list: string[] | undefined, isExclude: boolean, cap: boolean) => {
  if (list && list.length > 0) {
    const formatted = list.map(x => cap ? capitalize(x) : x);
    parts.push(isExclude ? `non-${formatted.join(', ')}` : formatted.join(' or '));
  }
};

const describeInvokeCriteria = (criteria: InvokeCriteria, count?: number): string => {
  const parts: string[] = [];
  if ((criteria as any).any_numen) parts.push(count === 1 ? 'numen' : 'numina');
  if ((criteria as any).any_ward) parts.push('ward');
  if ((criteria as any).any_rite) parts.push('spell');
  if ((criteria as any).any_magic) parts.push('magic');
  if (criteria.name) parts.push(`named "${criteria.name}"`);

  addRangePart(parts, criteria.level, criteria.levelMin, criteria.levelMax, 'Level', true);
  addRangePart(parts, criteria.atk, criteria.atkMin, criteria.atkMax, 'ATK', false);
  addRangePart(parts, criteria.def, criteria.defMin, criteria.defMax, 'DEF', false);

  addListPart(parts, criteria.families, false, true);
  addListPart(parts, criteria.excludeFamilies, true, true);
  addListPart(parts, criteria.natures, false, true);
  addListPart(parts, criteria.excludeNatures, true, true);
  addListPart(parts, criteria.rarities, false, false);
  addListPart(parts, criteria.excludeRarities, true, false);

  return parts.join(' ');
};

const describeCopyEffect = (effect: { copyTarget: string; destination: string; count: number }, targetDesc: string): string => {
  const countWord = effect.count === 1 ? 'copy' : 'copies';
  const t = effect.copyTarget;
  const copyTargetLabel = t === 'non_mythic_numen' ? 'non-mythic numen' : t === 'mythic_numen' ? 'mythic numen' : ['atk', 'def', 'hp'].includes(t) ? t.toUpperCase() : t;
  return `Select a ${copyTargetLabel}. Add ${effect.count} ${countWord} of it into ${destinationToLabel(effect.destination)}`;
};

const describeAddEffect = (effect: { addFrom: string; destination: string; count: number; addTargetType?: string }, targetDesc: string): string => {
  const countWord = effect.count === 1 ? 'copy' : 'copies';
  const targetTypeLabel = effect.addTargetType && effect.addTargetType !== 'any' ? effect.addTargetType : 'card';
  return `Select a ${targetTypeLabel} from ${describeAddFrom(effect.addFrom)}. Add ${effect.count} ${countWord} of it into ${destinationToLabel(effect.destination)}`;
};

const describeReturnEffect = (effect: any, targetDesc: string, resolvedTarget: EffectTarget | undefined): string => {
  const returnTarget = effect.returnTarget;
  const returnFieldTarget = effect.returnFieldTarget;
  const returnCardType = effect.returnCardType;
  const returnDestination = effect.returnDestination || 'hand';

  if (resolvedTarget === 'self' || returnTarget === 'self') {
    return `return this to your ${returnDestination === 'hand' ? 'hand' : returnDestination === 'deck' ? 'deck' : returnDestination || 'memora'}`;
  }

  const count = effect.count ?? 1;
  const countWord = count === 1 ? 'card' : 'cards';

  if (returnTarget === 'player_field' || returnTarget === 'opponent_field') {
    const fieldOwner = returnTarget === 'player_field' ? 'your' : "the opponent's";
    const isAll = returnFieldTarget && returnFieldTarget.startsWith('all_');
    const fLabel = returnFieldTarget ? (returnFieldTarget.startsWith('all_') ? returnFieldTarget.replace(/_/g, ' ') : `an ${returnFieldTarget.replace(/_/g, ' ')}`) : '';
    if (fLabel) {
      return isAll
        ? `return ${fLabel} from ${fieldOwner} field to ${fieldOwner} ${returnDestination}`
        : `return ${count} ${countWord} from ${fLabel} on ${fieldOwner} field to ${fieldOwner} ${returnDestination}`;
    }
    return `return ${count} ${countWord} from ${fieldOwner} field to ${fieldOwner} ${returnDestination}`;
  }

  if (returnTarget === 'player_memora' || returnTarget === 'opponent_memora' || returnTarget === 'player_exile' || returnTarget === 'opponent_exile') {
    const zoneOwner = returnTarget.startsWith('player') ? 'your' : "the opponent's";
    const zoneName = returnTarget.includes('memora') ? 'memora' : 'exile';
    let zoneLabel = countWord;
    if (returnCardType && returnCardType !== 'any') {
      zoneLabel = returnCardType === 'numen' ? (count === 1 ? 'numen' : 'numina') : (count === 1 ? returnCardType : `${returnCardType}s`);
    }
    return `return ${count} ${zoneLabel} from ${zoneOwner} ${zoneName} to ${zoneOwner} ${returnDestination}`;
  }

  const dest = returnTarget || effect.destination || 'memora';
  const destLabel = dest === 'hand' ? 'hand' : dest === 'deck' ? 'deck' : dest.includes('memora') ? 'memora' : dest.includes('exile') ? 'exile' : 'memora';
  const destinationLabel = isAllyTarget(resolvedTarget) ? `your ${destLabel}` : isEnemyTarget(resolvedTarget) ? `the opponent's ${destLabel}` : `its owner's ${destLabel}`;
  return `return ${count} ${countWord} from ${targetDesc} to ${destinationLabel}`;
};

const describeSemiConfigurableTrigger = (e: TriggerEntry) =>
  isCounterTrigger(e) ? `Counter ${e.count_type} ${e.value} times.` :
  isMentalDebtTrigger(e) ? `Accumulates ${e.mana_amount} mana debt on ${e.trigger_condition.toLowerCase()}.` :
  isAbsorbTrigger(e) ? `Absorbs ${e.value} ${e.count_type}.` : '';

function capitalize(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function lowercaseFirst(str: string): string {
  return str ? str.charAt(0).toLowerCase() + str.slice(1) : str;
}

const describeChangeEffect = (eff: any, isDec: boolean, targetDesc: string): string => {
  const entity = eff.target;
  const stat = eff.effectTarget || eff.target;
  const durText = eff.duration === 'permanent' ? ' permanently' : (eff.duration === 'temporary' && eff.durationTurns) ? ` for ${eff.durationTurns} turns` : '';
  const whilePrefix = eff.duration === 'while_on_field' ? 'while this card is on the field, ' : '';
  
  if (entity === 'self') {
    const verb = isDec ? 'lose' : 'gain';
    const suffix = stat === 'both' ? 'ATK and DEF' : stat === 'hp' || stat === 'atk' || stat === 'def' || stat === 'mana' ? (stat === 'mana' ? 'mana' : stat.toUpperCase()) : '';
    return `${whilePrefix}${verb} ${eff.amount}${suffix ? ' ' + suffix : ''}${durText}`;
  }
  
  const verb = isDec ? 'decrease' : 'increase';
  if (isNumenTarget(entity)) {
    const suffix = stat === 'both' ? 'ATK and DEF' : stat === 'hp' || stat === 'atk' || stat === 'def' ? stat.toUpperCase() : 'stats';
    return `${whilePrefix}${verb} ${targetDesc}'s ${suffix} by ${eff.amount}${durText}`;
  }
  
  if (entity === 'player' || entity === 'opponent') {
    const who = entity === 'player' ? 'your' : "the opponent's";
    const suffix = stat === 'hp' || stat === 'mana' ? (stat === 'mana' ? 'mana' : stat.toUpperCase()) : 'stats';
    return `${whilePrefix}${verb} ${who} ${suffix} by ${eff.amount}${durText}`;
  }
  
  return `${whilePrefix}${verb} ${targetDesc} by ${eff.amount}${durText}`;
};

const describeInvokeEffect = (effect: { from: string; criteria: InvokeCriteria; count: number }, targetDesc: string, action: string): string => {
  const countWord = effect.count === 1 ? 'numen' : 'numina';
  const isPlayerZone = effect.from.startsWith('player_');
  const fromSuffix = isPlayerZone ? '' : ` from ${describeInvokeFrom(effect.from)}`;

  if (effect.criteria.name) {
    return `${action} ${effect.count} <i>${effect.criteria.name}</i>${fromSuffix}`;
  }

  const criteriaDesc = describeInvokeCriteria(effect.criteria, effect.count);
  return `${action} ${effect.count} ${criteriaDesc || countWord}${fromSuffix}`;
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
  const skipSub = (effect.effect === EffectType.EXILE || effect.effect === EffectType.FORGET) && isSelectableNumenTarget(resolvedTarget);
  const targetDesc = getEffectTargetDescription(resolvedTarget, selectedTarget, skipSub);

  let baseText: string;

  switch (effect.effect) {
    case EffectType.DRAW: {
      const w = effect.count === 1 ? 'card' : 'cards';
      const t = (effect as any).target;
      baseText = t === 'both' ? `you and your opponent draw ${effect.count} ${w}` :
                 t === 'opponent' ? `your opponent draws ${effect.count} ${w}` :
                 `draw ${effect.count} ${w}`;
      break;
    }

    case EffectType.SCRY: {
      const w = effect.count === 1 ? 'card' : 'cards';
      const d = effect.deck === 'player' ? 'your' : effect.deck === 'opponent' ? "the opponent's" : `${effect.deck}'s`;
      baseText = `scry ${effect.count} ${w} from ${d} deck`;
      break;
    }

    case EffectType.FORGET: {
      const c = (effect as any).count ?? 1;
      const w = c === 1 ? 'card' : 'cards';
      const t = getTargetTypeLabel(resolvedTarget);
      const isMag = resolvedTarget && (resolvedTarget.includes('magic') || resolvedTarget.includes('rite') || resolvedTarget.includes('ward'));
      baseText = resolvedTarget === 'self' ? 'forget this card' :
                 resolvedTarget === 'attack_target' ? 'forget the attack target' :
                 (!isMag && trigger === ConditionalTrigger.WHEN_ATTACKED) ? `forget the attacking ${t}` :
                 (!isMag && trigger && isAttackTrigger(trigger)) ? `forget the attacked ${t}` :
                 (resolvedTarget && resolvedTarget.startsWith('all_')) ? `forget ${targetDesc}` :
                 (isSelectableNumenTarget(resolvedTarget) || (isMag && resolvedTarget)) ? `Select and forget ${targetDesc}` :
                 resolvedTarget ? `forget ${c} ${w} from ${targetDesc}` :
                 `forget ${c} ${w}`;
      break;
    }

    case EffectType.EXILE: {
      const ex = effect as any;
      const c = ex.count ?? 1;
      if (ex.from) {
        const fromDesc = describeInvokeFrom(ex.from);
        const w = c === 1 ? 'numen' : 'numina';
        const critDesc = ex.criteria ? (ex.criteria.name ? `<i>${ex.criteria.name}</i>` : describeInvokeCriteria(ex.criteria, c)) : '';
        baseText = `exile ${c} ${critDesc || w} from ${fromDesc}`;
      } else {
        const w = c === 1 ? 'card' : 'cards';
        const t = getTargetTypeLabel(resolvedTarget);
        const isMag = resolvedTarget && (resolvedTarget.includes('magic') || resolvedTarget.includes('rite') || resolvedTarget.includes('ward'));
        baseText = resolvedTarget === 'self' ? 'exile this card' :
                   resolvedTarget === 'attack_target' ? 'exile the attack target' :
                   (!isMag && trigger === ConditionalTrigger.WHEN_ATTACKED) ? `exile the attacking ${t}` :
                   (!isMag && trigger && isAttackTrigger(trigger)) ? `exile the attacked ${t}` :
                   (resolvedTarget && resolvedTarget.startsWith('all_')) ? `exile ${targetDesc}` :
                   (isSelectableNumenTarget(resolvedTarget) || (isMag && resolvedTarget)) ? `Select and exile ${targetDesc}` :
                   resolvedTarget ? `exile ${c} ${w} from ${targetDesc}` :
                   `exile ${c} ${w}`;
      }
      break;
    }

    case EffectType.PETRIFY:
      baseText = `petrify ${targetDesc} for ${effect.turns} ${effect.turns === 1 ? 'turn' : 'turns'}`;
      break;

    case EffectType.LOCK: {
      const d = (effect as any).duration;
      baseText = d === 'while_on_field' ? `while this card is on the field, ${targetDesc} is locked` :
                 (d === 'temporary' && effect.turns) ? `lock ${targetDesc} for ${effect.turns} ${effect.turns === 1 ? 'turn' : 'turns'}` :
                 `lock ${targetDesc}`;
      break;
    }

    case EffectType.DECREASE:
      baseText = describeChangeEffect(effect, true, targetDesc);
      break;

    case EffectType.INCREASE:
      baseText = describeChangeEffect(effect, false, targetDesc);
      break;

    case EffectType.ETHEREAL:
      baseText = `grant ethereal for ${effect.count} ${effect.count === 1 ? 'turn' : 'turns'} to ${effect.type === 'both' ? 'rites and wards' : effect.type + 's'} on ${targetDesc}`;
      break;

    case EffectType.FIND:
      baseText = `find ${effect.count} cards from ${targetDesc}`;
      break;

    case EffectType.CHOOSE_ONE:
      baseText = `choose one of: ${effect.options.join(', ')}`;
      break;

    case EffectType.ADD_TRIGGER: {
      const tName = passiveDescriptions[effect.trigger_type as PassiveTrigger] ? (effect.trigger_type as string).replace(/_/g, ' ').toLowerCase() : effect.trigger_type;
      baseText = `grant ${tName} for ${effect.duration} ${effect.duration === 1 ? 'turn' : 'turns'} to ${targetDesc}`;
      break;
    }

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

  const eff = effect as any;
  if (eff.or && eff.or_effect) {
    const target = eff.or_effect.effectTarget || effectTarget;
    baseText += `, or ${describeEffect(eff.or_effect, trigger, attackTarget, target, isSelectableNumenTarget(target) ? target : null)}`;
  }
  if (eff.otherwise && eff.otherwise_effect) {
    const target = eff.otherwise_effect.effectTarget || effectTarget;
    return `${baseText}, otherwise ${describeEffect(eff.otherwise_effect, trigger, attackTarget, target, isSelectableNumenTarget(target) ? target : null)}`;
  }
  return eff.forEach && eff.forEachConfig ? `${describeForEachPrefix(eff.forEachConfig)}${baseText}` : baseText;
};

export function regenerateAllDescriptions(cards: any[]): any[] {
  return cards.map((card) => {
    if (!card.triggers || card.triggers.length === 0) return card;
    const newDescription = generateDescription(card.triggers, card.type);
    return card.description === newDescription ? card : { ...card, description: newDescription };
  });
}

export function generateDescription(triggers: TriggerEntry[], cardType?: string): string {
  const passiveLabelsList: string[] = [];
  const groupedEffects: Map<string, string[]> = new Map();

  for (const entry of triggers) {
    if (isPassiveTrigger(entry)) {
      passiveLabelsList.push(`<b>${cardType === 'rite' ? (entry as string).replace(/_/g, ' ').toLowerCase() : (passiveLabels[entry] ?? 'Unknown')}</b>`);
    } else if (isConditionalTrigger(entry)) {
      const effectsList: any[] = entry.effects || ((entry as any).effect ? [(entry as any).effect] : []);
      const isWhen = entry.trigger === ConditionalTrigger.WHEN;
      const label = isWhen
        ? `When ${lowercaseFirst([entry.whenTarget, entry.whenCondition].filter(Boolean).join(' '))}`
        : getTriggerLabel(entry.trigger, entry.attackTarget);

      const effectGroups = new Map<string, any[]>();
      for (const eff of effectsList) {
        const key = getEffectGroupKey(eff, entry.effectTarget);
        effectGroups.set(key, [...(effectGroups.get(key) || []), eff]);
      }

      for (const group of effectGroups.values()) {
        const merged = mergeGroupEffects(group);
        const resTarget = entry.effectTarget || merged.effectTarget;
        const selTarget = isSelectableNumenTarget(resTarget) ? resTarget : null;

        const effectText = describeEffect(merged, entry.trigger, entry.attackTarget, entry.effectTarget, selTarget);
        const isSelInc = (merged.effect === EffectType.EXILE || merged.effect === EffectType.FORGET) && isSelectableNumenTarget(resTarget);
        const prefix = (selTarget && !isWhen && !isSelInc) ? getSelectPrefix(selTarget) + ' ' : '';
        const txt = isWhen ? lowercaseFirst(prefix + effectText) : (prefix + effectText);

        groupedEffects.set(label, [...(groupedEffects.get(label) || []), txt]);
      }
    } else {
      const semiDesc = describeSemiConfigurableTrigger(entry);
      if (semiDesc) passiveLabelsList.push(semiDesc);
    }
  }

  const joinWithOr = (items: string[]) =>
    items.length <= 1 ? (items[0] || '') :
    items.length === 2 ? `${items[0]} and ${items[1]}` :
    `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

  const lines: string[] = [];
  if (passiveLabelsList.length > 0) lines.push(passiveLabelsList.join(', '));

  const groupedParts: string[] = [];
  for (const [label, effects] of groupedEffects) {
    const joined = joinWithOr(effects);
    groupedParts.push(label ? `${label}: ${capitalize(joined)}.` : `${capitalize(joined)}.`);
  }

  if (groupedParts.length > 0) lines.push(groupedParts.join(' '));
  return lines.join('\n');
}
