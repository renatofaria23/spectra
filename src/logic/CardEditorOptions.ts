import { ConditionalTrigger, PassiveTrigger } from './Triggers';
import type { AttackTarget, EffectTarget } from './Triggers';
import { EffectType } from './Effects';
import type { EffectEntry } from './Effects';
import colors from '../styles/Colors';

export type CardTypeOption = 'numen' | 'rite' | 'ward';

export interface OtherwiseEffect {
  attackTarget?: AttackTarget;
  effectTarget?: EffectTarget;
  effects?: EffectEntry[];
  effect?: EffectEntry;
}

export interface OrEffect {
  effectTarget?: EffectTarget;
  effects?: EffectEntry[];
  effect?: EffectEntry;
}

export interface EffectSlot {
  trigger: ConditionalTrigger | PassiveTrigger;
  attackTarget?: AttackTarget;
  effectTarget?: EffectTarget;
  effects?: EffectEntry[];
  effect?: EffectEntry;
  otherwise?: boolean;
  otherwiseEffect?: OtherwiseEffect;
  or?: boolean;
  orEffect?: OrEffect;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const formatTriggerLabel = (s: string) =>
  s.split('_')
    .map(w => w === 'OF' ? 'of' : capitalize(w.toLowerCase()))
    .join(' ');
const formatLabel = (s: string) =>
  s.split('_')
    .map(capitalize)
    .join(' ')
    .replace('Face Up', 'Face-Up')
    .replace('Face Down', 'Face-Down');

const zoneLabels: Record<string, string> = {
  player_deck: "Your Deck",
  opponent_deck: "Opponent's Deck",
  player_memora: "Your Memora",
  opponent_memora: "Opponent's Memora",
  player_exile: "Your Exile",
  opponent_exile: "Opponent's Exile",
  player_hand: "Your Hand",
  opponent_hand: "Opponent's Hand",
  player_field: "Your Field",
  opponent_field: "Opponent's Field",
  any_field: "Any Field",
  any_memora: "Any Memora",
  any_exile: "Any Exile",
  any_deck: "Any Deck",
  any_hand: "Any Hand",
  self: "Self (this card)"
};
const mapZones = (keys: string[]) => keys.map(k => ({ value: k, label: zoneLabels[k] || k }));
const mapSimple = (arr: string[]) => arr.map(v => ({ value: v, label: capitalize(v) }));

export const triggerTypeOptions = [
  { value: 'passive', label: 'Passive' },
  { value: 'active', label: 'Active' },
];

export const activeTriggerOptions = [
  ConditionalTrigger.DECREE,
  ConditionalTrigger.TESTAMENT,
  ConditionalTrigger.START_OF_TURN,
  ConditionalTrigger.END_OF_TURN,
  ConditionalTrigger.BEFORE_ATTACK,
  ConditionalTrigger.AFTER_ATTACK,
  ConditionalTrigger.WHEN_ATTACKED,
  ConditionalTrigger.WHEN,
].map(v => ({ value: v, label: formatTriggerLabel(v) }));

export const passiveTriggerOptions = Object.values(PassiveTrigger)
  .sort((a, b) => a.localeCompare(b))
  .map(v => ({
    value: v,
    label: capitalize(v.toLowerCase())
  }));

export const triggerOptions = [
  { group: 'Passive', items: passiveTriggerOptions.filter(o => o.value !== PassiveTrigger.SHROUDED) },
  { group: 'Conditional', items: activeTriggerOptions },
];

export const attackTargetOptions = [
  { value: 'anything', label: 'Anything' },
  { value: 'player', label: "Opponent's Player" },
  { value: 'numen', label: "Opponent's Numen" },
  { value: 'allied_numen', label: 'Allied Numen (When Attacked)' },
];

export const getAttackTargetOptions = (trigger: ConditionalTrigger | undefined) => {
  if (trigger === ConditionalTrigger.WHEN_ATTACKED) {
    return attackTargetOptions.filter(o => o.value !== 'player');
  }
  if (trigger === ConditionalTrigger.BEFORE_ATTACK || trigger === ConditionalTrigger.AFTER_ATTACK) {
    return attackTargetOptions.filter(o => o.value !== 'allied_numen');
  }
  return attackTargetOptions;
};

export const effectTargetLabels: Record<string, string> = {
  self: 'Self',
  attack_target: 'Attack Target',
  any_card: 'Any Card',
  all_cards: 'All Cards',
  any_numen: 'Any Numen',
  allied_numen: 'An Allied Numen',
  enemy_numen: 'An Enemy Numen',
  all_allied_numina: 'All Allied Numina',
  all_enemy_numina: 'All Enemy Numina',
  global_allied_numina: 'Global Allied Numina',
  global_enemy_numina: 'Global Enemy Numina',
  allied_non_mythic_numen: 'An Allied Non-Mythic Numen',
  enemy_non_mythic_numen: 'An Enemy Non-Mythic Numen',
  all_allied_non_mythic_numina: 'All Allied Non-Mythic Numina',
  all_enemy_non_mythic_numina: 'All Enemy Non-Mythic Numina',
  global_allied_non_mythic_numina: 'Global Allied Non-Mythic Numina',
  global_enemy_non_mythic_numina: 'Global Enemy Non-Mythic Numina',
  any_incantation: 'Any Incantation',
  any_rite: 'Any Rite',
  any_ward: 'Any Ward',
  allied_incantation: 'An Allied Incantation',
  enemy_incantation: 'An Enemy Incantation',
  all_allied_incantations: 'All Allied Incantations',
  all_enemy_incantations: 'All Enemy Incantations',
  allied_rite: 'An Allied Rite',
  enemy_rite: 'An Enemy Rite',
  all_allied_rites: 'All Allied Rites',
  all_enemy_rites: 'All Enemy Rites',
  allied_ward: 'An Allied Ward',
  enemy_ward: 'An Enemy Ward',
  all_allied_wards: 'All Allied Wards',
  all_enemy_wards: 'All Enemy Wards',
  opponent_hp: "Opponent's HP",
  opponent_hand: "Opponent's Hand",
  opponent_deck: "Opponent's Deck",
  opponent_memora: "Opponent's Memora",
  opponent_exile: "Opponent's Exile",
  opponent_mana: "Opponent's Mana",
  player_hp: "Player's HP",
  player_hand: "Player's Hand",
  player_deck: "Player's Deck",
  player_memora: "Player's Memora",
  player_exile: "Player's Exile",
  player_mana: "Player's Mana",
};

const groupsDefinition = [
  { group: 'This Card', items: ['self'] },
  { group: 'Attack Target', items: ['attack_target'] },
  { group: 'Any Card', items: ['any_card', 'all_cards'] },
  { group: 'Numina', items: [
    'any_numen', 'allied_numen', 'enemy_numen', 'all_allied_numina', 'all_enemy_numina',
    'global_allied_numina', 'global_enemy_numina',
    'allied_non_mythic_numen', 'enemy_non_mythic_numen',
    'all_allied_non_mythic_numina', 'all_enemy_non_mythic_numina',
    'global_allied_non_mythic_numina', 'global_enemy_non_mythic_numina'
  ]},
  { group: 'Incantations', items: [
    'any_incantation', 'any_rite', 'any_ward', 'allied_incantation', 'enemy_incantation',
    'all_allied_incantations', 'all_enemy_incantations', 'allied_rite', 'enemy_rite',
    'all_allied_rites', 'all_enemy_rites', 'allied_ward', 'enemy_ward',
    'all_allied_wards', 'all_enemy_wards'
  ]},
  { group: 'Opponent', items: ['opponent_hp', 'opponent_hand', 'opponent_deck', 'opponent_memora', 'opponent_exile', 'opponent_mana'] },
  { group: 'Player', items: ['player_hp', 'player_hand', 'player_deck', 'player_memora', 'player_exile', 'player_mana'] },
];

export const effectTargetOptions = groupsDefinition.map(g => ({
  group: g.group,
  items: g.items.map(val => ({
    value: val,
    label: val === 'self' ? 'Self (this card)' : (effectTargetLabels[val] || val)
  }))
}));

const INCREASE_DECREASE_NUMEN_TARGETS: EffectTarget[] = [
  'self', 'attack_target', 'any_numen', 'allied_numen', 'enemy_numen',
  'all_allied_numina', 'all_enemy_numina', 'global_allied_numina', 'global_enemy_numina',
];

const INCREASE_DECREASE_PLAYER_TARGETS: EffectTarget[] = [
  'opponent_hp', 'opponent_mana', 'player_hp', 'player_mana',
];

export const increaseDecreaseTargetOptions = [
  { value: 'self', label: 'Self (this card)' },
  { value: 'numen', label: 'Numen' },
  { value: 'player', label: 'Player' },
  { value: 'opponent', label: 'Opponent' },
];

export const numenStatOptions = [
  { value: 'atk', label: 'ATK' },
  { value: 'def', label: 'DEF' },
  { value: 'both', label: 'ATK and DEF' },
];

export const playerStatOptions = [
  { value: 'hp', label: 'HP' },
  { value: 'mana', label: 'Mana' },
];

export const getStatTargetOptions = (target: string | undefined) => (target === 'self' || target === 'numen') ? numenStatOptions : playerStatOptions;
export const isNumenTarget = (target: string | null | undefined) => target === 'self' || target === 'numen';
export const isPlayerTarget = (target: string | null | undefined) => target === 'player' || target === 'opponent';

const ALLOWED_EXILE_RETURN = new Set([
  'self', 'attack_target', 'any_card', 'all_cards',
  'any_numen', 'allied_numen', 'enemy_numen', 'all_allied_numina', 'all_enemy_numina',
  'any_incantation', 'any_rite', 'any_ward', 'allied_incantation', 'enemy_incantation', 'all_allied_incantations', 'all_enemy_incantations',
  'allied_rite', 'enemy_rite', 'all_allied_rites', 'all_enemy_rites', 'allied_ward', 'enemy_ward', 'all_allied_wards', 'all_enemy_wards'
]);

export const getEffectTargetOptions = (
  trigger: ConditionalTrigger | undefined,
  effectType: EffectType | undefined,
  cardType: string | undefined,
): typeof effectTargetOptions => {
  const isNonAttack = trigger && NON_ATTACK_TRIGGERS.includes(trigger);
  const isRiteOrWard = cardType === 'rite' || cardType === 'ward';
  const excludeAttackTarget = isNonAttack || isRiteOrWard;
  const isIncreaseDecrease = effectType === EffectType.INCREASE || effectType === EffectType.DECREASE;
  const isExile = effectType === EffectType.EXILE;
  const isForget = effectType === EffectType.FORGET;
  const isReturn = effectType === EffectType.RETURN;
  const isAdd = effectType === EffectType.ADD;

  if (isIncreaseDecrease) {
    let numenTargets = isRiteOrWard
      ? INCREASE_DECREASE_NUMEN_TARGETS.filter(t => t !== 'self')
      : INCREASE_DECREASE_NUMEN_TARGETS;

    if (excludeAttackTarget) {
      numenTargets = numenTargets.filter(t => t !== 'attack_target');
    }

    return [
      { group: 'Numina', items: numenTargets.map(t => ({ value: t, label: effectTargetLabels[t] || t })) },
      { group: 'Opponent', items: [{ value: 'opponent_hp', label: "Opponent's HP" }, { value: 'opponent_mana', label: "Opponent's Mana" }] },
      { group: 'Player', items: [{ value: 'player_hp', label: "Player's HP" }, { value: 'player_mana', label: "Player's Mana" }] },
    ];
  }

  if (isReturn || isAdd || isExile || isForget) {
    let filtered = effectTargetOptions
      .map(g => ({
        ...g,
        items: g.items.filter(i => ALLOWED_EXILE_RETURN.has(i.value))
      }))
      .filter(g => g.items.length > 0);

    if (excludeAttackTarget) {
      filtered = filtered.map(g => {
        if (g.group === 'Attack Target') return { ...g, items: [] };
        if (g.group === 'This Card' && cardType === 'rite' && isReturn) return { ...g, items: [] };
        return g;
      }).filter(g => g.items.length > 0);
    }
    return filtered;
  }

  let filtered = effectTargetOptions.map(group => ({ ...group }));
  if (excludeAttackTarget) {
    filtered = filtered.map(group => {
      if (group.group === 'Attack Target') {
        return { ...group, items: [] };
      }
      return group;
    }).filter(group => group.items.length > 0 || group.group !== 'Attack Target');
  }
  return filtered;
};

export const numenTargetDetailOptions = INCREASE_DECREASE_NUMEN_TARGETS.filter(t => t !== 'self' && t !== 'attack_target').map(t => ({ value: t, label: effectTargetLabels[t] || t }));
export const isNumenEffectTarget = (target: EffectTarget | null | undefined) => !!target && INCREASE_DECREASE_NUMEN_TARGETS.includes(target);
export const isHpManaEffectTarget = (target: EffectTarget | null | undefined) => !!target && INCREASE_DECREASE_PLAYER_TARGETS.includes(target);

export const effectOptions = [
  { group: 'Deck', items: [
    EffectType.DRAW,
    EffectType.FIND,
    EffectType.SCRY,
  ].map(v => ({ value: v, label: formatTriggerLabel(v) })) },
  { group: 'Cards', items: [
    EffectType.EXILE,
    EffectType.FORGET,
  ].map(v => ({ value: v, label: formatTriggerLabel(v) })) },
  { group: 'Summon', items: [
    EffectType.CONVOKE,
    EffectType.EVOKE,
    EffectType.INVOKE,
  ].map(v => ({ value: v, label: formatTriggerLabel(v) })) },
  { group: 'Stats', items: [
    EffectType.COPY,
    EffectType.DECREASE,
    EffectType.INCREASE,
  ].map(v => ({ value: v, label: formatTriggerLabel(v) })) },
  { group: 'Replication', items: [
    EffectType.ADD,
    EffectType.RETURN,
  ].map(v => ({ value: v, label: formatTriggerLabel(v) })) },
  { group: 'Misc', items: [
    EffectType.ADD_TRIGGER,
  ].map(v => ({ value: v, label: formatTriggerLabel(v) })) },
];

export const invokeFromOptions = mapZones(['player_hand', 'opponent_hand']);
export const evokeFromOptions = mapZones(['player_memora', 'opponent_memora']);
export const convokeFromOptions = mapZones(['player_deck', 'opponent_deck']);

export const copyTargetTypeOptions = [
  'numen', 'non_mythic_numen', 'mythic_numen', 'rite', 'ward', 'card', 'atk', 'def', 'hp'
].map(v => {
  if (['atk', 'def', 'hp'].includes(v)) return { value: v, label: v.toUpperCase() };
  return { value: v, label: formatLabel(v).replace('Non Mythic', 'Non-Mythic') };
});

export const addDestinationOptions = mapZones([
  'player_deck', 'opponent_deck', 'player_memora', 'opponent_memora',
  'player_exile', 'opponent_exile', 'player_hand', 'opponent_hand'
]);

export const addFromOptions = mapZones([
  'player_field', 'opponent_field', 'any_field',
  'player_memora', 'opponent_memora', 'any_memora',
  'player_exile', 'opponent_exile', 'any_exile',
  'player_deck', 'opponent_deck', 'any_deck',
  'player_hand', 'opponent_hand', 'any_hand'
]);

export const returnTargetOptions = mapZones([
  'self', 'player_field', 'opponent_field',
  'player_memora', 'opponent_memora', 'player_exile', 'opponent_exile'
]);

const formatReturnFieldLabel = (v: string) => {
  const cap = v.split('_').map(capitalize).join(' ');
  return v.startsWith('all_') ? cap : 'An ' + cap;
};

export const returnFieldTargetOptions = [
  'all_enemy_numina', 'all_allied_numina', 'all_enemy_rites', 'all_allied_rites',
  'all_enemy_wards', 'all_allied_wards', 'enemy_numen', 'allied_numen',
  'enemy_rite', 'allied_rite', 'enemy_ward', 'allied_ward'
].map(v => ({ value: v, label: formatReturnFieldLabel(v) }));

export const returnCardTypeOptions = mapSimple(['numen', 'rite', 'ward', 'any']);
export const returnDestinationOptions = [
  { value: 'hand', label: 'Hand' },
  { value: 'deck', label: 'Deck' },
];

export const isReturnTargetField = (target: string | undefined) => !!target && ['player_field', 'opponent_field'].includes(target);
export const isReturnTargetZone = (target: string | undefined) => !!target && ['player_memora', 'opponent_memora', 'player_exile', 'opponent_exile'].includes(target);
export const isReturnAllTarget = (target: string | undefined) => !!target && target.startsWith('all_');
export const isReturnAllFieldTarget = (target: string | undefined) => !!target && target.startsWith('all_');

export const forgetTargetTypes = [
  'numen', 'another_numen', 'rite', 'ward', 'all', 'all_enemy_numina',
  'all_enemy_face_up_numina', 'all_enemy_face_down_numina', 'all_enemy_incantations',
  'all_enemy_face_up_incantations', 'all_enemy_face_down_incantations', 'attacking_numina', 'defending_numina'
].map(v => ({ value: v, label: formatLabel(v) }));

export const numenStatTargetOptions = numenStatOptions;
export const playerStatTargetOptions = playerStatOptions;
export const scryDeckOptions = ['player', 'opponent'].map(v => ({ value: v, label: `${capitalize(v)} Deck` }));
export const etherealTypeOptions = mapSimple(['rite', 'ward', 'both']);
export const findSourceOptions = mapSimple(['deck', 'memora', 'exile']);
export const familyOptions = mapSimple(['beast', 'bug', 'deity', 'dragon', 'elemental', 'god', 'human', 'larva', 'manes', 'plant', 'undead']);
export const rarityOptions = mapSimple(['common', 'legendary', 'mythic', 'rare']);
export const natureOptions = mapSimple(['air', 'dark', 'earth', 'fire', 'light', 'water']);
export const cardTypeOptions = mapSimple(['rite', 'ward', 'numen']);

export const isAttackTrigger = (trigger: ConditionalTrigger) =>
  [ConditionalTrigger.BEFORE_ATTACK, ConditionalTrigger.AFTER_ATTACK, ConditionalTrigger.WHEN_ATTACKED].includes(trigger);

export const isPassiveValue = (value: string): value is PassiveTrigger =>
  Object.values(PassiveTrigger).includes(value as PassiveTrigger);

export const DIRECT_VALUE_TARGETS: EffectTarget[] = [
  'player_hp', 'player_mana', 'opponent_hp', 'opponent_mana',
];

export const isDirectValueTarget = (target: EffectTarget | null | undefined): boolean =>
  !!target && DIRECT_VALUE_TARGETS.includes(target);

export const NON_ATTACK_TRIGGERS: ConditionalTrigger[] = [
  ConditionalTrigger.DECREE,
  ConditionalTrigger.START_OF_TURN,
  ConditionalTrigger.END_OF_TURN,
];

export const isNonAttackTrigger = (trigger: ConditionalTrigger | null | undefined): boolean =>
  !!trigger && NON_ATTACK_TRIGGERS.includes(trigger);

export const effectsWithOwnTarget = new Set<EffectType>([
  EffectType.PETRIFY,
  EffectType.DECREASE,
  EffectType.LOCK,
  EffectType.INCREASE,
  EffectType.ETHEREAL,
  EffectType.FIND,
  EffectType.ADD_TRIGGER,
]);

export const effectSupportsOwnTarget = (effectType: EffectType | undefined): boolean =>
  !!effectType && effectsWithOwnTarget.has(effectType);

export const getEffectTargetLabel = (target: string | null | undefined) => target ? (effectTargetLabels[target] || target) : '';
export const addTargetTypeOptions = returnCardTypeOptions;

export const inputStyles = {
  input: {
    backgroundColor: colors.White_1,
    color: colors.Black_1,
    '&::placeholder': {
      color: colors.Black_1,
      opacity: 0.7,
    },
  },
  label: {
    color: colors.Black_1,
  },
};