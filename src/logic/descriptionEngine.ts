import {
  PassiveTrigger,
  ConditionalTrigger,
  isPassiveTrigger,
  isCounterTrigger,
  isMentalDebtTrigger,
  isAbsorbTrigger,
  isConditionalTrigger
} from './triggers';
import type { TriggerEntry } from './triggers';
import type { EffectTarget } from './triggers';
import { EffectType, type InvokeCriteria, type ForEachConfig } from './effects';
import { isNumenTarget } from './cardEditorOptions';
import type { EffectEntry } from './effects';
import colors from '../styles/Colors';

const passiveDescriptions: Record<PassiveTrigger, string> = {
  [PassiveTrigger.CHALLENGE]: "This Numen must be attacked before other Numina.",
  [PassiveTrigger.VEILED]: "This Numen cannot be targeted by the opponent, unless it's the only Numen on its owners field.",
  [PassiveTrigger.CELERITY]: "This Numen can attack the turn it is invokeed.",
  [PassiveTrigger.STUNNED]: "This Numen cannot attack or activate effects.",
  [PassiveTrigger.NULLIFY]: "Negates all card effects.",
  [PassiveTrigger.LOCKED]: "This Numen cannot change battle position, unless by the effect of another card.",
  [PassiveTrigger.RECLUSE]: "This Numen cannot attack in groups.",
  [PassiveTrigger.LEGION]: "This Numen can only attack in groups.",
  [PassiveTrigger.RELENTLESS]: "After being attacked, this Numen recoups its stats to full.",
  [PassiveTrigger.SHROUDED]: "Your opponent can't know what Numen this is and can't target it until it attacks or you target it with a card effect."
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
  if (trg === ConditionalTrigger.WHEN_ATTACKED) return t === 'allied_numen' ? ' on an allied Numen' : '';
  return t === 'player' ? ' on the player' : t === 'numen' ? ' on a Numen' : t === 'allied_numen' ? ' on an allied Numen' : '';
};

const getTriggerLabel = (trigger: ConditionalTrigger, attackTarget?: string): string => {
  const base = triggerLabels[trigger];
  return base ? `<b>${base}${getAttackTargetLabel(attackTarget, trigger)}</b>` : '';
};

const effectTargetDescriptions: Record<EffectTarget, string> = {
  'self': 'this Numen',
  'attack_target': 'the attack target',
  'any_card': 'any card',
  'all_cards': 'all cards',
  'any_numen': 'any Numen',
  'any_incantation': 'any Incantation',
  'any_rite': 'any Rite',
  'any_ward': 'any Ward',
  'allied_numen': 'an allied Numen',
  'enemy_numen': 'an enemy Numen',
  'all_allied_numina': 'all allied Numina',
  'all_enemy_numina': 'all enemy Numina',
  'global_allied_numina': 'all allied Numina (including future)',
  'global_enemy_numina': 'all enemy Numina (including future)',
  'allied_non_mythic_numen': 'an allied non-mythic Numen',
  'enemy_non_mythic_numen': 'an enemy non-mythic Numen',
  'all_allied_non_mythic_numina': 'all allied non-mythic Numina',
  'all_enemy_non_mythic_numina': 'all enemy non-mythic Numina',
  'global_allied_non_mythic_numina': 'all allied non-mythic Numina (including future)',
  'global_enemy_non_mythic_numina': 'all enemy non-mythic Numina (including future)',
  'allied_incantation': 'an allied Incantation',
  'enemy_incantation': 'an enemy Incantation',
  'all_allied_incantations': 'all allied Incantations',
  'all_enemy_incantations': 'all enemy Incantations',
  'allied_rite': 'an allied Rite',
  'enemy_rite': 'an enemy Rite',
  'all_allied_rites': 'all allied Rites',
  'all_enemy_rites': 'all enemy Rites',
  'allied_ward': 'an allied Ward',
  'enemy_ward': 'an enemy Ward',
  'all_allied_wards': 'all allied Wards',
  'all_enemy_wards': 'all enemy Wards',
  'opponent_hp': "the opponent's Health",
  'opponent_hand': "the opponent's hand",
  'opponent_deck': "the opponent's deck",
  'opponent_memora': "the opponent's Memora",
  'opponent_exile': "the opponent's Exile",
  'opponent_mana': "the opponent's Mana",
  'player_hp': "your Health",
  'player_hand': "your hand",
  'player_deck': "your deck",
  'player_memora': "your Memora",
  'player_exile': "your Exile",
  'player_mana': "your Mana",
};

const isAllyTarget = (t: EffectTarget | undefined) => !!t && (t === 'self' || t.includes('allied'));
const isEnemyTarget = (t: EffectTarget | undefined) => !!t && t.includes('enemy');
const isSelectableNumenTarget = (t: EffectTarget | undefined) => t === 'allied_numen' || t === 'enemy_numen';

const getSelectPrefix = (t: EffectTarget | undefined) =>
  t === 'allied_numen' ? 'Select an allied Numen.' : t === 'enemy_numen' ? 'Select an enemy Numen.' : '';

const isAllyEntity = (t: string | undefined) =>
  !!t && (t === 'self' || t === 'player' || t.includes('allied'));
const isEnemyEntity = (t: string | undefined) =>
  !!t && (t === 'opponent' || t.includes('enemy'));

type Polarity = 'positive' | 'negative' | 'neutral';

const getStatPolarity = (effectType: EffectType, target: string | undefined): Polarity => {
  if (effectType !== EffectType.INCREASE && effectType !== EffectType.DECREASE) return 'neutral';
  const isAlly = isAllyEntity(target);
  const isEnemy = isEnemyEntity(target);
  if (!isAlly && !isEnemy) return 'neutral';
  const isIncrease = effectType === EffectType.INCREASE;
  return isAlly ? (isIncrease ? 'positive' : 'negative') : (isIncrease ? 'negative' : 'positive');
};

const wrapPolarity = (text: string, polarity: Polarity): string => {
  if (polarity === 'positive') return `<span style="color:${colors.Green_2}">${text}</span>`;
  if (polarity === 'negative') return `<span style="color:${colors.Red_4}">${text}</span>`;
  return text;
};

const getEffectTargetDescription = (t: EffectTarget | undefined, sel: EffectTarget | null | undefined, skip = false) =>
  t && effectTargetDescriptions[t] ? (!skip && sel && t === sel ? 'that Numen' : effectTargetDescriptions[t]) : 'the target';

const getEffectTargetDescriptionNoArticle = (t: EffectTarget | undefined): string => {
  if (!t || !effectTargetDescriptions[t]) return 'the target';
  const desc = effectTargetDescriptions[t];
  return desc.replace(/^an? /, '');
};

const isAttackTrigger = (t: ConditionalTrigger) =>
  t === ConditionalTrigger.BEFORE_ATTACK || t === ConditionalTrigger.AFTER_ATTACK || t === ConditionalTrigger.WHEN_ATTACKED;

const getTargetTypeLabel = (t: EffectTarget | undefined) =>
  !t ? 'Numen' : ['incantation', 'rite', 'ward'].find(k => t.includes(k)) || 'Numen';

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

const capitalizeZone = (z: string) => {
  const map: Record<string, string> = {memora: 'Memora', exile: 'Exile', hand: 'hand', deck: 'deck', field: 'field'};
  return map[z] || z;
};
const getZoneLabel = (z: string) => {
  const x = capitalizeZone(z.replace(/^(player|opponent)_/, ''));
  return z.startsWith('player_') ? `your ${x}` : z.startsWith('opponent_') ? `opponent's ${x}` : z;
};

const describeInvokeFrom = getZoneLabel;
const destinationToLabel = getZoneLabel;

const describeAddFrom = (from: string) => {
  const x = capitalizeZone(from.replace(/^(player|opponent|any)_/, ''));
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
  if ((criteria as any).any_numen) parts.push(count === 1 ? 'Numen' : 'Numina');
  if ((criteria as any).any_ward) parts.push('Ward');
  if ((criteria as any).any_rite) parts.push('Rite');
  if ((criteria as any).any_incantation) parts.push('Incantation');
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

const describeCopyEffect = (effect: { copyTarget: string; destination: string; count: number }, _targetDesc: string): string => {
  const countWord = effect.count === 1 ? 'copy' : 'copies';
  const t = effect.copyTarget;
  const copyTargetLabel = t === 'non_mythic_numen' ? 'non-mythic Numen' : t === 'mythic_numen' ? 'mythic Numen' : ['atk', 'def', 'hp'].includes(t) ? t.toUpperCase() : t;
  return `Select a ${copyTargetLabel}. Add ${effect.count} ${countWord} of it into ${destinationToLabel(effect.destination)}`;
};

const describeAddEffect = (effect: { addFrom: string; destination: string; count: number; addTargetType?: string }, _targetDesc: string): string => {
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
    return `Return this to your ${returnDestination === 'hand' ? 'hand' : returnDestination === 'deck' ? 'deck' : returnDestination || 'Memora'}`;
  }

  const count = effect.count ?? 1;
  const countWord = count === 1 ? 'card' : 'cards';

  if (returnTarget === 'player_field' || returnTarget === 'opponent_field') {
    const fieldOwner = returnTarget === 'player_field' ? 'your' : "the opponent's";
    const isAll = returnFieldTarget && returnFieldTarget.startsWith('all_');
    const fLabel = returnFieldTarget ? (returnFieldTarget.startsWith('all_') ? returnFieldTarget.replace(/_/g, ' ') : `an ${returnFieldTarget.replace(/_/g, ' ')}`) : '';
    if (fLabel) {
      return isAll
        ? `Return ${fLabel} from ${fieldOwner} field to ${fieldOwner} ${returnDestination}`
        : `Return ${count} ${countWord} from ${fLabel} on ${fieldOwner} field to ${fieldOwner} ${returnDestination}`;
    }
    return `Return ${count} ${countWord} from ${fieldOwner} field to ${fieldOwner} ${returnDestination}`;
  }

  if (returnTarget === 'player_memora' || returnTarget === 'opponent_memora' || returnTarget === 'player_exile' || returnTarget === 'opponent_exile') {
    const zoneOwner = returnTarget.startsWith('player') ? 'your' : "the opponent's";
    const zoneName = returnTarget.includes('memora') ? 'Memora' : 'Exile';
    let zoneLabel = countWord;
    if (returnCardType && returnCardType !== 'any') {
      zoneLabel = returnCardType === 'numen' ? (count === 1 ? 'Numen' : 'Numina') : (count === 1 ? returnCardType : `${returnCardType}s`);
    }
    return `Return ${count} ${zoneLabel} from ${zoneOwner} ${zoneName} to ${zoneOwner} ${returnDestination}`;
  }

  const dest = returnTarget || effect.destination || 'Memora';
  const destLabel = dest === 'hand' ? 'hand' : dest === 'deck' ? 'deck' : dest.includes('memora') ? 'Memora' : dest.includes('exile') ? 'Exile' : 'Memora';
  const destinationLabel = isAllyTarget(resolvedTarget) ? `your ${destLabel}` : isEnemyTarget(resolvedTarget) ? `the opponent's ${destLabel}` : `its owner's ${destLabel}`;
  return `Return ${count} ${countWord} from ${targetDesc} to ${destinationLabel}`;
};

const describeSemiConfigurableTrigger = (e: TriggerEntry) =>
  isCounterTrigger(e) ? `Counter ${e.count_type} ${e.value} times.` :
  isMentalDebtTrigger(e) ? `Accumulates ${e.mana_amount} Mana debt on ${e.trigger_condition.toLowerCase()}.` :
  isAbsorbTrigger(e) ? `Absorbs ${e.value} ${e.count_type}.` : '';

function capitalize(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function lowercaseFirst(str: string): string {
  return str ? str.charAt(0).toLowerCase() + str.slice(1) : str;
}

function formatKeywords(text: string): string {
  text = text.replace(/<\/?i>/g, '');
  const r: [RegExp, string][] = [
    [/\bnumina\b/gi, '<i>Numina</i>'],
    [/\bnumen\b/gi, '<i>Numen</i>'],
    [/\bincantations\b/gi, '<i>Incantations</i>'],
    [/\bincantation\b/gi, '<i>Incantation</i>'],
    [/\brites\b/gi, '<i>Rites</i>'],
    [/\brite\b/gi, '<i>Rite</i>'],
    [/\bwards\b/gi, '<i>Wards</i>'],
    [/\bward\b/gi, '<i>Ward</i>'],
    [/\bmemora\b/gi, '<i>Memora</i>'],
    [/\bexile\b/gi, '<i>Exile</i>'],
    [/\bhealth\b/gi, '<i>Health</i>'],
    [/\bmana\b/gi, '<i>Mana</i>'],
    [/\bdraws\b/gi, '<i>Draws</i>'],
    [/\bdraw\b/gi, '<i>Draw</i>'],
    [/\binvoke\b/gi, '<i>Invoke</i>'],
    [/\bevok(?:e|es)\b/gi, '<i>Evoke</i>'],
    [/\bconvoke\b/gi, '<i>Convoke</i>'],
    [/\bforget\b/gi, '<i>Forget</i>'],
    [/\breturn\b/gi, '<i>Return</i>'],
    [/\bgain\b/gi, '<i>Gain</i>'],
    [/\blog\b/gi, '<i>Lose</i>'],
    [/\bincrease\b/gi, '<i>Increase</i>'],
    [/\bdecrease\b/gi, '<i>Decrease</i>'],
    [/\bpetrify\b/gi, '<i>Petrify</i>'],
    [/\block\b/gi, '<i>Lock</i>'],
    [/\bgrant\b/gi, '<i>Grant</i>'],
    [/\bfind\b/gi, '<i>Find</i>'],
    [/\bscry\b/gi, '<i>Scry</i>'],
    [/\bethereal\b/gi, '<i>Ethereal</i>'],
    [/\bchoose\b/gi, '<i>Choose</i>'],
  ];
  for (const [p, s] of r) text = text.replace(p, s);
  return text;
}

const describeChangeEffect = (eff: any, isDec: boolean, targetDesc: string): string => {
  const entity = eff.target;
  const stat = eff.stat || eff.effectTarget || eff.target;
  const durText = eff.duration === 'permanent' ? ' permanently' : (eff.duration === 'temporary' && eff.durationTurns) ? ` for ${eff.durationTurns} turns` : '';
  const whilePrefix = eff.duration === 'while_on_field' ? 'while this card is on the field, ' : '';

  if (entity === 'self') {
    const verb = isDec ? 'Lose' : 'Gain';
    const suffix = stat === 'both' ? 'ATK and DEF' : stat === 'hp' ? 'Health' : stat === 'mana' ? 'Mana' : stat === 'atk' || stat === 'def' ? stat.toUpperCase() : '';
    return `${whilePrefix}${verb} ${eff.amount}${suffix ? ' ' + suffix : ''}${durText}`;
  }

  const verb = isDec ? 'Decrease' : 'Increase';
  if (isNumenTarget(entity)) {
    const suffix = stat === 'both' ? 'ATK and DEF' : stat === 'hp' ? 'Health' : stat === 'mana' ? 'Mana' : stat === 'atk' || stat === 'def' ? stat.toUpperCase() : 'stats';
    return `${whilePrefix}${verb} ${targetDesc}'s ${suffix} by ${eff.amount}${durText}`;
  }

  if (entity === 'player' || entity === 'opponent') {
    const who = entity === 'player' ? 'your' : "the opponent's";
    const suffix = stat === 'hp' ? 'Health' : stat === 'mana' ? 'Mana' : 'stats';
    return `${whilePrefix}${verb} ${who} ${suffix} by ${eff.amount}${durText}`;
  }

  const suffix = stat === 'both' ? 'ATK and DEF' : stat === 'hp' ? 'Health' : stat === 'mana' ? 'Mana' : stat === 'atk' || stat === 'def' ? stat.toUpperCase() : 'stats';
  return `${whilePrefix}${verb} ${targetDesc}'s ${suffix} by ${eff.amount}${durText}`;
};

const describeInvokeEffect = (effect: { from: string; criteria: InvokeCriteria; count: number }, targetDesc: string, action: string): string => {
  const countWord = effect.count === 1 ? 'Numen' : 'Numina';
  const isPlayerZone = effect.from.startsWith('player_');
  const fromSuffix = isPlayerZone ? '' : ` from ${describeInvokeFrom(effect.from)}`;

  if (effect.criteria.name) {
    return `${action} ${effect.count} ${effect.criteria.name}${fromSuffix}`;
  }

  const criteriaDesc = describeInvokeCriteria(effect.criteria, effect.count);
  return `${action} ${effect.count} ${criteriaDesc ? criteriaDesc + ' ' + countWord : countWord}${fromSuffix}`;
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
      baseText = t === 'both' ? `you and your opponent Draw ${effect.count} ${w}` :
                 t === 'opponent' ? `your opponent Draws ${effect.count} ${w}` :
                 `Draw ${effect.count} ${w}`;
      break;
    }
    case EffectType.SCRY: {
      const w = effect.count === 1 ? 'card' : 'cards';
      const d = effect.deck === 'player' ? 'your' : effect.deck === 'opponent' ? "the opponent's" : `${effect.deck}'s`;
      baseText = `Scry ${effect.count} ${w} from ${d} deck`;
      break;
    }
    case EffectType.FORGET: {
      const c = (effect as any).count ?? 1;
      const w = c === 1 ? 'card' : 'cards';
      const t = getTargetTypeLabel(resolvedTarget);
      const isMag = resolvedTarget && (resolvedTarget.includes('incantation') || resolvedTarget.includes('rite') || resolvedTarget.includes('ward'));
      const isRandom = (effect as any).random;
      const isAllTarget = resolvedTarget && (resolvedTarget.startsWith('all_') || resolvedTarget.startsWith('global_'));
      baseText = resolvedTarget === 'self' ? 'Forget this card' :
                  resolvedTarget === 'attack_target' ? 'Forget the attack target' :
                  (!isMag && trigger === ConditionalTrigger.WHEN_ATTACKED) ? `Forget the attacking ${t}` :
                  (!isMag && trigger && isAttackTrigger(trigger)) ? `Forget the attacked ${t}` :
                  isAllTarget ? `Forget ${targetDesc}` :
                   isSelectableNumenTarget(resolvedTarget) ? (isRandom ? `Forget ${c} random ${getEffectTargetDescriptionNoArticle(resolvedTarget)}` : `Select and Forget ${targetDesc}`) :
                   (isMag && resolvedTarget) ? (isRandom ? `Forget ${c} random ${getEffectTargetDescriptionNoArticle(resolvedTarget)}` : `Select and Forget ${targetDesc}`) :
                  resolvedTarget ? `Forget ${c} ${w} from ${targetDesc}` :
                  `Forget ${c} ${w}`;
      break;
    }
    case EffectType.EXILE: {
      const ex = effect as any;
      const c = ex.count ?? 1;
      if (ex.from) {
        const fromDesc = describeInvokeFrom(ex.from);
        const w = c === 1 ? 'Numen' : 'Numina';
        const critDesc = ex.criteria ? (ex.criteria.name ? ex.criteria.name : describeInvokeCriteria(ex.criteria, c)) : '';
        baseText = `Exile ${c} ${critDesc || w} from ${fromDesc}`;
      } else {
        const w = c === 1 ? 'card' : 'cards';
        const t = getTargetTypeLabel(resolvedTarget);
        const isMag = resolvedTarget && (resolvedTarget.includes('incantation') || resolvedTarget.includes('rite') || resolvedTarget.includes('ward'));
        const isRandom = (effect as any).random;
        const isAllTarget = resolvedTarget && (resolvedTarget.startsWith('all_') || resolvedTarget.startsWith('global_'));
        baseText = resolvedTarget === 'self' ? 'Exile this card' :
                   resolvedTarget === 'attack_target' ? 'Exile the attack target' :
                   (!isMag && trigger === ConditionalTrigger.WHEN_ATTACKED) ? `Exile the attacking ${t}` :
                   (!isMag && trigger && isAttackTrigger(trigger)) ? `Exile the attacked ${t}` :
                   isAllTarget ? `Exile ${targetDesc}` :
                    isSelectableNumenTarget(resolvedTarget) ? (isRandom ? `Exile ${c} random ${getEffectTargetDescriptionNoArticle(resolvedTarget)}` : `Select and Exile ${targetDesc}`) :
                    (isMag && resolvedTarget) ? (isRandom ? `Exile ${c} random ${getEffectTargetDescriptionNoArticle(resolvedTarget)}` : `Select and Exile ${targetDesc}`) :
                   resolvedTarget ? `Exile ${c} ${w} from ${targetDesc}` :
                   `Exile ${c} ${w}`;
      }
      break;
    }
    case EffectType.PETRIFY:
      baseText = `Petrify ${targetDesc} for ${effect.turns} ${effect.turns === 1 ? 'turn' : 'turns'}`;
      break;
    case EffectType.LOCK: {
      const d = (effect as any).duration;
      baseText = d === 'while_on_field' ? `while this card is on the field, ${targetDesc} is locked` :
                 (d === 'temporary' && effect.turns) ? `Lock ${targetDesc} for ${effect.turns} ${effect.turns === 1 ? 'turn' : 'turns'}` :
                 `Lock ${targetDesc}`;
      break;
    }
    case EffectType.DECREASE: {
      baseText = describeChangeEffect(effect, true, targetDesc);
      baseText = wrapPolarity(baseText, getStatPolarity(EffectType.DECREASE, effect.target));
      break;
    }
    case EffectType.INCREASE: {
      baseText = describeChangeEffect(effect, false, targetDesc);
      baseText = wrapPolarity(baseText, getStatPolarity(EffectType.INCREASE, effect.target));
      break;
    }
    case EffectType.ETHEREAL:
      baseText = `Grant Ethereal for ${effect.count} ${effect.count === 1 ? 'turn' : 'turns'} to ${effect.type === 'both' ? 'Rites and Wards' : effect.type + 's'} on ${targetDesc}`;
      break;
    case EffectType.FIND:
      baseText = `Find ${effect.count} cards from ${targetDesc}`;
      break;
    case EffectType.CHOOSE_ONE:
      baseText = `Choose one of: ${effect.options.join(', ')}`;
      break;
    case EffectType.ADD_TRIGGER: {
      const tName = passiveDescriptions[effect.trigger_type as PassiveTrigger] ? (effect.trigger_type as string).replace(/_/g, ' ').toLowerCase() : effect.trigger_type;
      baseText = `Grant ${tName} for ${effect.duration} ${effect.duration === 1 ? 'turn' : 'turns'} to ${targetDesc}`;
      break;
    }
    case EffectType.INVOKE:
      baseText = describeInvokeEffect(effect as any, targetDesc, 'Invoke');
      break;
    case EffectType.EVOKE:
      baseText = describeInvokeEffect(effect as any, targetDesc, 'Evoke');
      break;
    case EffectType.CONVOKE:
      baseText = describeInvokeEffect(effect as any, targetDesc, 'Convoke');
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
        const isSelInc = (merged.effect === EffectType.EXILE || merged.effect === EffectType.FORGET) && (isSelectableNumenTarget(resTarget) || (merged as any).random);
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
  return formatKeywords(lines.join('\n'));
}
