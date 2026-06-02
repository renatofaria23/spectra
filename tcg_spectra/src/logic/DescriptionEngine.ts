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
import { EffectType } from './Effects';
import type { EffectEntry } from './Effects';

const passiveDescriptions: Record<PassiveTrigger, string> = {
  [PassiveTrigger.PROVOCATION]: "This monster must be attacked before other monsters.",
  [PassiveTrigger.VEILED]: "This monster cannot be targeted by the opponent, unless it's the only monster on its owners field.",
  [PassiveTrigger.HASTE]: "This monster can attack the turn it is summoned.",
  [PassiveTrigger.LIFELINK]: "Decrease dealt by this monster increases its owners HP.",
  [PassiveTrigger.STUNNED]: "This monster cannot attack or activate effects.",
  [PassiveTrigger.NULLIFY]: "Negates all card effects.",
  [PassiveTrigger.LOCKED]: "This monster cannot change battle position, unless by the effect of another card.",
  [PassiveTrigger.RECLUSE]: "This monster cannot attack in groups.",
  [PassiveTrigger.PACKER]: "This monster can only attack in groups.",
  [PassiveTrigger.RELENTLESS]: "After being attacked, this monster recoups its stats to full."
};

const triggerConditionDescriptions: Partial<Record<ConditionalTrigger, string>> = {
  [ConditionalTrigger.ARRIVAL]: "When this card enters the field",
  [ConditionalTrigger.LAST_BREATH]: "When this card is sent to the graveyard",
  [ConditionalTrigger.WOUNDED]: "While this card's ATK or DEF is reduced",
  [ConditionalTrigger.START_OF_TURN]: "At the start of your turn",
  [ConditionalTrigger.END_OF_TURN]: "At the end of your turn"
};

const getBeforeAttackPrefix = (attackTarget: string | undefined) => {
  if (attackTarget === 'player') return "Before attacking the opponent's player";
  if (attackTarget === 'monster') return "Before attacking an opponent's monster";
  return "Before attacking";
};

const getAfterAttackPrefix = (attackTarget: string | undefined) => {
  if (attackTarget === 'player') return "After attacking the opponent's player";
  if (attackTarget === 'monster') return "After attacking an opponent's monster";
  return "After attacking";
};

const getWhenAttackedPrefix = (attackTarget: string | undefined) => {
  if (attackTarget === 'self') return "When this monster is attacked";
  if (attackTarget === 'allied_monster') return "When an allied monster is attacked";
  return "When attacked by a monster";
};

const getAttackTriggerPrefix = (trigger: ConditionalTrigger, attackTarget: string | undefined) => {
  switch (trigger) {
    case ConditionalTrigger.BEFORE_ATTACK:
      return getBeforeAttackPrefix(attackTarget);
    case ConditionalTrigger.AFTER_ATTACK:
      return getAfterAttackPrefix(attackTarget);
    case ConditionalTrigger.WHEN_ATTACKED:
      return getWhenAttackedPrefix(attackTarget);
    default:
      return '';
  }
};

const effectTargetDescriptions: Record<EffectTarget, string> = {
  'self': 'this monster',
  'attack_target': 'the attack target',
  'allied_monster': 'an allied monster',
  'enemy_monster': 'an enemy monster',
  'all_allied_monsters': 'all allied monsters',
  'all_enemy_monsters': 'all enemy monsters',
  'opponent_hp': "the opponent's HP",
  'opponent_hand': "the opponent's hand",
  'opponent_deck': "the opponent's deck",
  'opponent_graveyard': "the opponent's graveyard",
  'opponent_exile': "the opponent's exile",
  'player_hp': "your HP",
  'player_hand': "your hand",
  'player_deck': "your deck",
  'player_graveyard': "your graveyard",
  'player_exile': "your exile",
};

const getEffectTargetDescription = (effectTarget: EffectTarget | undefined): string => {
  if (effectTarget && effectTargetDescriptions[effectTarget]) {
    return effectTargetDescriptions[effectTarget];
  }
  return 'the target';
};

const DESTROY_TARGET_DESCRIPTIONS: Record<string, string> = {
  'all': 'all cards on the field',
  'all_opponent_monsters': 'all opponent monsters',
  'all_opponent_face_up_monsters': 'all opponent face-up monsters',
  'all_opponent_face_down_monsters': 'all opponent face-down monsters',
  'all_opponent_face_up_magics': 'all opponent face-up magics',
  'all_opponent_face_down_magics': 'all opponent face-down magics',
  'attacking_monsters': 'all attacking monsters',
  'defending_monsters': 'all defending monsters',
};

const getDestroyTargetDescription = (targetType: string, trigger: ConditionalTrigger, attackTarget: string | undefined): string => {
  if (DESTROY_TARGET_DESCRIPTIONS[targetType]) {
    return DESTROY_TARGET_DESCRIPTIONS[targetType];
  }

  if (targetType === 'another_monster') {
    return 'select and destroy another monster';
  }

  if (trigger === ConditionalTrigger.WHEN_ATTACKED) {
    return 'the attacking monster';
  }

  if (trigger === ConditionalTrigger.BEFORE_ATTACK || trigger === ConditionalTrigger.AFTER_ATTACK) {
    if (attackTarget === 'self') return 'the monster it attacked';
    if (attackTarget === 'player') return "the opponent's player";
    return 'the attacked monster';
  }

  return targetType;
};

const describeEffect = (effect: EffectEntry, trigger?: ConditionalTrigger, attackTarget?: string, effectTarget?: EffectTarget): string => {
  const targetDesc = getEffectTargetDescription(effectTarget);

  switch (effect.effect) {
    case EffectType.DRAW:
      return `draw ${effect.count} cards`;

    case EffectType.SCRY:
      return `scry ${effect.count} cards from the ${effect.deck}'s deck`;

    case EffectType.DESTROY:
      if (trigger) {
        return `destroy ${getDestroyTargetDescription(effect.targetType, trigger, attackTarget)}`;
      }
      return `destroy ${effect.targetType === 'all' ? 'all cards on the field' : effect.targetType}`;

    case EffectType.EXILE:
      if (trigger) {
        return `exile ${getDestroyTargetDescription(effect.targetType, trigger, attackTarget)}`;
      }
      return `exile ${effect.targetType === 'all' ? 'all cards on the field' : effect.targetType}`;

    case EffectType.STUN:
      return `stun ${targetDesc} for ${effect.turns} turns`;

    case EffectType.DECREASE:
      if (effectTarget === 'self') {
        if (effect.target === 'hp') return `lose ${effect.amount} HP`;
        if (effect.target === 'atk') return `lose ${effect.amount} ATK`;
        if (effect.target === 'def') return `lose ${effect.amount} DEF`;
        return `lose ${effect.amount}`;
      }
      if (effect.target === 'hp') return `decrease ${targetDesc}'s HP by ${effect.amount}`;
      if (effect.target === 'atk') return `decrease ${targetDesc}'s ATK by ${effect.amount}`;
      if (effect.target === 'def') return `decrease ${targetDesc}'s DEF by ${effect.amount}`;
      return `deal ${effect.amount} decrease to ${targetDesc}`;

    case EffectType.LOCK:
      return `lock ${targetDesc} for ${effect.turns} turns`;

    case EffectType.INCREASE:
      if (effectTarget === 'self') {
        if (effect.target === 'hp') return `gain ${effect.amount} HP`;
        if (effect.target === 'atk') return `gain ${effect.amount} ATK`;
        if (effect.target === 'def') return `gain ${effect.amount} DEF`;
        return `gain ${effect.amount}`;
      }
      if (effect.target === 'hp') return `increase ${targetDesc}'s HP by ${effect.amount}`;
      if (effect.target === 'atk') return `increase ${targetDesc}'s ATK by ${effect.amount}`;
      if (effect.target === 'def') return `increase ${targetDesc}'s DEF by ${effect.amount}`;
      return `increase ${targetDesc}'s stats by ${effect.amount}`;

    case EffectType.SHIELD:
      return `grant ${targetDesc} a shield for ${effect.attacks} attacks`;

    case EffectType.ETHEREAL:
      return `grant ethereal for ${effect.count} turns to ${effect.type === 'both' ? 'spells and wards' : effect.type + 's'} on ${targetDesc}`;

    case EffectType.FIND:
      return `find ${effect.count} cards from ${targetDesc}`;

    case EffectType.CHOOSE_ONE:
      return `choose one of: ${effect.options.join(', ')}`;

    case EffectType.ADD_TRIGGER:
      const triggerName = passiveDescriptions[effect.trigger_type as PassiveTrigger]
        ? (effect.trigger_type as string).replace(/_/g, ' ').toLowerCase()
        : effect.trigger_type;
      return `grant ${triggerName} for ${effect.duration} turns to ${targetDesc}`;

    default:
      return 'activate an effect';
  }
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

export function generateDescription(triggers: TriggerEntry[]): string {
  const parts: string[] = [];
  const groupedEffects: Map<string, string[]> = new Map();

  for (const entry of triggers) {
    if (isPassiveTrigger(entry)) {
      parts.push(passiveDescriptions[entry] ?? 'Unknown passive effect.');
    } else if (isConditionalTrigger(entry)) {
      const isAttackTrigger = [
        ConditionalTrigger.BEFORE_ATTACK,
        ConditionalTrigger.AFTER_ATTACK,
        ConditionalTrigger.WHEN_ATTACKED
      ].includes(entry.trigger);

      let prefix = '';
      if (isAttackTrigger) {
        prefix = getAttackTriggerPrefix(entry.trigger, entry.attackTarget);
      } else {
        prefix = triggerConditionDescriptions[entry.trigger] ?? 'At some point';
      }

      const effectText = describeEffect(entry.effect, entry.trigger, entry.attackTarget, entry.effectTarget);

      const existing = groupedEffects.get(prefix);
      if (existing) {
        existing.push(effectText);
      } else {
        groupedEffects.set(prefix, [effectText]);
      }
    } else {
      const semiDesc = describeSemiConfigurableTrigger(entry);
      if (semiDesc) parts.push(semiDesc);
    }
  }

  function joinWithOr(items: string[]): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0]!;
    if (items.length === 2) return `${items[0]} or ${items[1]}`;
    return `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}`;
  }

  const groupedParts: string[] = [];
  for (const [prefix, effects] of groupedEffects) {
    groupedParts.push(`${prefix}, ${joinWithOr(effects)}.`);
  }

  return [...parts, ...groupedParts].join(' ');
}
