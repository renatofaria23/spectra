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

export const triggerTypeOptions = [
  { value: 'passive', label: 'Passive' },
  { value: 'active', label: 'Active' },
];

export const activeTriggerOptions = [
  { value: ConditionalTrigger.DECREE, label: 'Decree' },
  { value: ConditionalTrigger.TESTAMENT, label: 'Testament' },
  { value: ConditionalTrigger.START_OF_TURN, label: 'Start of Turn' },
  { value: ConditionalTrigger.END_OF_TURN, label: 'End of Turn' },
  { value: ConditionalTrigger.BEFORE_ATTACK, label: 'Before Attack' },
  { value: ConditionalTrigger.AFTER_ATTACK, label: 'After Attack' },
  { value: ConditionalTrigger.WHEN_ATTACKED, label: 'When Attacked' },
  { value: ConditionalTrigger.WHEN, label: 'When' },
];

export const triggerOptions = [
  { group: 'Passive', items: [
    { value: PassiveTrigger.CHALLENGE, label: 'Challenge' },
    { value: PassiveTrigger.VEILED, label: 'Veiled' },
    { value: PassiveTrigger.CELERITY, label: 'Celerity' },
    { value: PassiveTrigger.STUNNED, label: 'Stunned' },
    { value: PassiveTrigger.NULLIFY, label: 'Nullify' },
    { value: PassiveTrigger.LOCKED, label: 'Locked' },
    { value: PassiveTrigger.RECLUSE, label: 'Recluse' },
    { value: PassiveTrigger.LEGION, label: 'Legion' },
    { value: PassiveTrigger.RELENTLESS, label: 'Relentless' },
  ]},
  { group: 'Conditional', items: [
    { value: ConditionalTrigger.DECREE, label: 'Decree' },
    { value: ConditionalTrigger.TESTAMENT, label: 'Testament' },
    { value: ConditionalTrigger.START_OF_TURN, label: 'Start of Turn' },
    { value: ConditionalTrigger.END_OF_TURN, label: 'End of Turn' },
    { value: ConditionalTrigger.BEFORE_ATTACK, label: 'Before Attack' },
    { value: ConditionalTrigger.AFTER_ATTACK, label: 'After Attack' },
    { value: ConditionalTrigger.WHEN_ATTACKED, label: 'When Attacked' },
    { value: ConditionalTrigger.WHEN, label: 'When' },
  ]},
];

export const attackTargetOptions = [
  { value: 'anything', label: 'Anything' },
  { value: 'player', label: "Opponent's Player" },
  { value: 'numen', label: "Opponent's Numen" },
  { value: 'allied_numen', label: 'Allied Numen (When Attacked)' },
];

export const getAttackTargetOptions = (trigger: ConditionalTrigger | undefined): { value: string; label: string }[] => {
  if (trigger === ConditionalTrigger.WHEN_ATTACKED) {
    return attackTargetOptions.filter(o => o.value !== 'player');
  }
  if (trigger === ConditionalTrigger.BEFORE_ATTACK || trigger === ConditionalTrigger.AFTER_ATTACK) {
    return attackTargetOptions.filter(o => o.value !== 'allied_numen');
  }
  return attackTargetOptions;
};

export const effectTargetOptions = [
  { group: 'This Card', items: [
    { value: 'self', label: 'Self (this card)' },
  ]},
  { group: 'Attack Target', items: [
    { value: 'attack_target', label: 'Attack Target' },
  ]},
  { group: 'Any Card', items: [
    { value: 'any_card', label: 'Any Card' },
    { value: 'all_cards', label: 'All Cards' },
  ]},
  { group: 'Numina', items: [
    { value: 'any_numen', label: 'Any Numen' },
    { value: 'allied_numen', label: 'An Allied Numen' },
    { value: 'enemy_numen', label: 'An Enemy Numen' },
    { value: 'all_allied_numina', label: 'All Allied Numina' },
    { value: 'all_enemy_numina', label: 'All Enemy Numina' },
    { value: 'global_allied_numina', label: 'Global Allied Numina' },
    { value: 'global_enemy_numina', label: 'Global Enemy Numina' },
    { value: 'allied_non_mythic_numen', label: 'An Allied Non-Mythic Numen' },
    { value: 'enemy_non_mythic_numen', label: 'An Enemy Non-Mythic Numen' },
    { value: 'all_allied_non_mythic_numina', label: 'All Allied Non-Mythic Numina' },
    { value: 'all_enemy_non_mythic_numina', label: 'All Enemy Non-Mythic Numina' },
    { value: 'global_allied_non_mythic_numina', label: 'Global Allied Non-Mythic Numina' },
    { value: 'global_enemy_non_mythic_numina', label: 'Global Enemy Non-Mythic Numina' },
  ]},
  { group: 'Magics', items: [
    { value: 'any_magic', label: 'Any Magic' },
    { value: 'any_rite', label: 'Any Rite' },
    { value: 'any_ward', label: 'Any Ward' },
    { value: 'allied_magic', label: 'An Allied Magic' },
    { value: 'enemy_magic', label: 'An Enemy Magic' },
    { value: 'all_allied_magics', label: 'All Allied Magics' },
    { value: 'all_enemy_magics', label: 'All Enemy Magics' },
    { value: 'allied_rite', label: 'An Allied Rite' },
    { value: 'enemy_rite', label: 'An Enemy Rite' },
    { value: 'all_allied_rites', label: 'All Allied Rites' },
    { value: 'all_enemy_rites', label: 'All Enemy Rites' },
    { value: 'allied_ward', label: 'An Allied Ward' },
    { value: 'enemy_ward', label: 'An Enemy Ward' },
    { value: 'all_allied_wards', label: 'All Allied Wards' },
    { value: 'all_enemy_wards', label: 'All Enemy Wards' },
  ]},
  { group: 'Opponent', items: [
    { value: 'opponent_hp', label: "Opponent's HP" },
    { value: 'opponent_hand', label: "Opponent's Hand" },
    { value: 'opponent_deck', label: "Opponent's Deck" },
    { value: 'opponent_memora', label: "Opponent's Memora" },
    { value: 'opponent_exile', label: "Opponent's Exile" },
    { value: 'opponent_mana', label: "Opponent's Mana" },
  ]},
  { group: 'Player', items: [
    { value: 'player_hp', label: "Player's HP" },
    { value: 'player_hand', label: "Player's Hand" },
    { value: 'player_deck', label: "Player's Deck" },
    { value: 'player_memora', label: "Player's Memora" },
    { value: 'player_exile', label: "Player's Exile" },
    { value: 'player_mana', label: "Player's Mana" },
  ]},
];

const NON_ATTACK_TARGET_EFFECT_TARGETS: EffectTarget[] = [
  'attack_target',
];

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

export const getStatTargetOptions = (target: string | undefined): { value: string; label: string }[] => {
  if (target === 'self' || target === 'numen') {
    return numenStatOptions;
  }
  return playerStatOptions;
};

export const isNumenTarget = (target: string | null | undefined): boolean => {
  return target === 'self' || target === 'numen';
};

export const isPlayerTarget = (target: string | null | undefined): boolean => {
  return target === 'player' || target === 'opponent';
};

const EXILE_EXCLUDED_TARGETS: EffectTarget[] = [
  'player_hp', 'player_mana', 'opponent_hp', 'opponent_mana',
  'global_allied_numina', 'global_enemy_numina',
];

const RETURN_ADD_FIELD_TARGETS: EffectTarget[] = [
  'self', 'attack_target', 'any_card', 'all_cards',
  'any_numen',
  'allied_numen', 'enemy_numen', 'all_allied_numina', 'all_enemy_numina',
  'any_magic', 'any_rite', 'any_ward',
  'allied_magic', 'enemy_magic', 'all_allied_magics', 'all_enemy_magics',
  'allied_rite', 'enemy_rite', 'all_allied_rites', 'all_enemy_rites',
  'allied_ward', 'enemy_ward', 'all_allied_wards', 'all_enemy_wards',
];

const FORGET_EXILE_FIELD_TARGETS: EffectTarget[] = [
  'self', 'attack_target', 'any_card', 'all_cards',
  'any_numen',
  'allied_numen', 'enemy_numen', 'all_allied_numina', 'all_enemy_numina',
  'any_magic', 'any_rite', 'any_ward',
  'allied_magic', 'enemy_magic', 'all_allied_magics', 'all_enemy_magics',
  'allied_rite', 'enemy_rite', 'all_allied_rites', 'all_enemy_rites',
  'allied_ward', 'enemy_ward', 'all_allied_wards', 'all_enemy_wards',
];

export const getEffectTargetOptions = (
  trigger: ConditionalTrigger | undefined,
  effectType: EffectType | undefined,
  cardType: string | undefined,
): typeof effectTargetOptions => {
  const isNonAttack = trigger && NON_ATTACK_TRIGGERS.includes(trigger);
  const isIncreaseDecrease = effectType === EffectType.INCREASE || effectType === EffectType.DECREASE;
  const isExile = effectType === EffectType.EXILE;
  const isForget = effectType === EffectType.FORGET;
  const isReturn = effectType === EffectType.RETURN;
  const isAdd = effectType === EffectType.ADD;

  let filtered = effectTargetOptions.map(group => ({ ...group }));

  if (isNonAttack) {
    filtered = filtered.map(group => {
      if (group.group === 'Attack Target') {
        return { ...group, items: [] };
      }
      return group;
    }).filter(group => group.items.length > 0 || group.group !== 'Attack Target');
  }

  if (isIncreaseDecrease) {
    let numenTargets = cardType === 'rite' || cardType === 'ward'
      ? INCREASE_DECREASE_NUMEN_TARGETS.filter(t => t !== 'self')
      : INCREASE_DECREASE_NUMEN_TARGETS;

    if (isNonAttack) {
      numenTargets = numenTargets.filter(t => t !== 'attack_target');
    }

    const allLabels = effectTargetOptions.flatMap(g => g.items);
    filtered = [
      { group: 'Numina', items: numenTargets.map(t => ({ value: t, label: allLabels.find(i => i.value === t)?.label || t })) },
      { group: 'Opponent', items: [{ value: 'opponent_hp', label: "Opponent's HP" }, { value: 'opponent_mana', label: "Opponent's Mana" }] },
      { group: 'Player', items: [{ value: 'player_hp', label: "Player's HP" }, { value: 'player_mana', label: "Player's Mana" }] },
    ];

    if (isNonAttack && (cardType === 'rite' || cardType === 'ward')) {
      const numinaGroup = filtered.find(g => g.group === 'Numina');
      if (numinaGroup) {
        numinaGroup.items = numinaGroup.items.filter(i => i.value !== 'self');
      }
    }
  }

  if (isReturn || isAdd) {
    const allLabels = effectTargetOptions.flatMap(g => g.items);
    filtered = [
      { group: 'This Card', items: [{ value: 'self', label: allLabels.find(i => i.value === 'self')?.label || 'Self' }] },
      { group: 'Attack Target', items: [{ value: 'attack_target', label: allLabels.find(i => i.value === 'attack_target')?.label || 'Attack Target' }] },
      { group: 'Any Card', items: [
        { value: 'any_card', label: allLabels.find(i => i.value === 'any_card')?.label || 'Any Card' },
        { value: 'all_cards', label: allLabels.find(i => i.value === 'all_cards')?.label || 'All Cards' },
      ]},
      { group: 'Numina', items: [
        { value: 'any_numen', label: allLabels.find(i => i.value === 'any_numen')?.label || 'Any Numen' },
        { value: 'allied_numen', label: allLabels.find(i => i.value === 'allied_numen')?.label || 'An Allied Numen' },
        { value: 'enemy_numen', label: allLabels.find(i => i.value === 'enemy_numen')?.label || 'An Enemy Numen' },
        { value: 'all_allied_numina', label: allLabels.find(i => i.value === 'all_allied_numina')?.label || 'All Allied Numina' },
        { value: 'all_enemy_numina', label: allLabels.find(i => i.value === 'all_enemy_numina')?.label || 'All Enemy Numina' },
      ]},
      { group: 'Magics', items: [
        { value: 'any_magic', label: allLabels.find(i => i.value === 'any_magic')?.label || 'Any Magic' },
        { value: 'any_rite', label: allLabels.find(i => i.value === 'any_rite')?.label || 'Any Rite' },
        { value: 'any_ward', label: allLabels.find(i => i.value === 'any_ward')?.label || 'Any Ward' },
        { value: 'allied_magic', label: allLabels.find(i => i.value === 'allied_magic')?.label || 'An Allied Magic' },
        { value: 'enemy_magic', label: allLabels.find(i => i.value === 'enemy_magic')?.label || 'An Enemy Magic' },
        { value: 'all_allied_magics', label: allLabels.find(i => i.value === 'all_allied_magics')?.label || 'All Allied Magics' },
        { value: 'all_enemy_magics', label: allLabels.find(i => i.value === 'all_enemy_magics')?.label || 'All Enemy Magics' },
        { value: 'allied_rite', label: allLabels.find(i => i.value === 'allied_rite')?.label || 'An Allied Rite' },
        { value: 'enemy_rite', label: allLabels.find(i => i.value === 'enemy_rite')?.label || 'An Enemy Rite' },
        { value: 'all_allied_rites', label: allLabels.find(i => i.value === 'all_allied_rites')?.label || 'All Allied Rites' },
        { value: 'all_enemy_rites', label: allLabels.find(i => i.value === 'all_enemy_rites')?.label || 'All Enemy Rites' },
        { value: 'allied_ward', label: allLabels.find(i => i.value === 'allied_ward')?.label || 'An Allied Ward' },
        { value: 'enemy_ward', label: allLabels.find(i => i.value === 'enemy_ward')?.label || 'An Enemy Ward' },
        { value: 'all_allied_wards', label: allLabels.find(i => i.value === 'all_allied_wards')?.label || 'All Allied Wards' },
        { value: 'all_enemy_wards', label: allLabels.find(i => i.value === 'all_enemy_wards')?.label || 'All Enemy Wards' },
      ]},
    ];

    if (isNonAttack) {
      filtered = filtered.map(group => {
        if (group.group === 'This Card' && cardType === 'rite' && isReturn) {
          return { ...group, items: [] };
        }
        if (group.group === 'Attack Target') {
          return { ...group, items: [] };
        }
        return group;
      }).filter(group => group.items.length > 0);
    }
  }

  if (isExile || isForget) {
    const allLabels = effectTargetOptions.flatMap(g => g.items);
    filtered = [
      { group: 'This Card', items: [{ value: 'self', label: allLabels.find(i => i.value === 'self')?.label || 'Self' }] },
      { group: 'Attack Target', items: [{ value: 'attack_target', label: allLabels.find(i => i.value === 'attack_target')?.label || 'Attack Target' }] },
      { group: 'Any Card', items: [
        { value: 'any_card', label: allLabels.find(i => i.value === 'any_card')?.label || 'Any Card' },
        { value: 'all_cards', label: allLabels.find(i => i.value === 'all_cards')?.label || 'All Cards' },
      ]},
      { group: 'Numina', items: [
        { value: 'any_numen', label: allLabels.find(i => i.value === 'any_numen')?.label || 'Any Numen' },
        { value: 'allied_numen', label: allLabels.find(i => i.value === 'allied_numen')?.label || 'An Allied Numen' },
        { value: 'enemy_numen', label: allLabels.find(i => i.value === 'enemy_numen')?.label || 'An Enemy Numen' },
        { value: 'all_allied_numina', label: allLabels.find(i => i.value === 'all_allied_numina')?.label || 'All Allied Numina' },
        { value: 'all_enemy_numina', label: allLabels.find(i => i.value === 'all_enemy_numina')?.label || 'All Enemy Numina' },
      ]},
      { group: 'Magics', items: [
        { value: 'any_magic', label: allLabels.find(i => i.value === 'any_magic')?.label || 'Any Magic' },
        { value: 'any_rite', label: allLabels.find(i => i.value === 'any_rite')?.label || 'Any Rite' },
        { value: 'any_ward', label: allLabels.find(i => i.value === 'any_ward')?.label || 'Any Ward' },
        { value: 'allied_magic', label: allLabels.find(i => i.value === 'allied_magic')?.label || 'An Allied Magic' },
        { value: 'enemy_magic', label: allLabels.find(i => i.value === 'enemy_magic')?.label || 'An Enemy Magic' },
        { value: 'all_allied_magics', label: allLabels.find(i => i.value === 'all_allied_magics')?.label || 'All Allied Magics' },
        { value: 'all_enemy_magics', label: allLabels.find(i => i.value === 'all_enemy_magics')?.label || 'All Enemy Magics' },
        { value: 'allied_rite', label: allLabels.find(i => i.value === 'allied_rite')?.label || 'An Allied Rite' },
        { value: 'enemy_rite', label: allLabels.find(i => i.value === 'enemy_rite')?.label || 'An Enemy Rite' },
        { value: 'all_allied_rites', label: allLabels.find(i => i.value === 'all_allied_rites')?.label || 'All Allied Rites' },
        { value: 'all_enemy_rites', label: allLabels.find(i => i.value === 'all_enemy_rites')?.label || 'All Enemy Rites' },
        { value: 'allied_ward', label: allLabels.find(i => i.value === 'allied_ward')?.label || 'An Allied Ward' },
        { value: 'enemy_ward', label: allLabels.find(i => i.value === 'enemy_ward')?.label || 'An Enemy Ward' },
        { value: 'all_allied_wards', label: allLabels.find(i => i.value === 'all_allied_wards')?.label || 'All Allied Wards' },
        { value: 'all_enemy_wards', label: allLabels.find(i => i.value === 'all_enemy_wards')?.label || 'All Enemy Wards' },
      ]},
    ];

    if (isNonAttack) {
      filtered = filtered.map(group => {
        if (group.group === 'Attack Target') {
          return { ...group, items: [] };
        }
        return group;
      }).filter(group => group.items.length > 0);
    }
  }

  return filtered;
};

export const isNumenEffectTarget = (target: EffectTarget | null | undefined): boolean => {
  if (!target) return false;
  return INCREASE_DECREASE_NUMEN_TARGETS.includes(target);
};

export const isHpManaEffectTarget = (target: EffectTarget | null | undefined): boolean => {
  if (!target) return false;
  return INCREASE_DECREASE_PLAYER_TARGETS.includes(target);
};

export const effectOptions = [
  { value: EffectType.DRAW, label: 'Draw' },
  { value: EffectType.SCRY, label: 'Scry' },
  { value: EffectType.FORGET, label: 'Forget' },
  { value: EffectType.EXILE, label: 'Exile' },
  { value: EffectType.PETRIFY, label: 'Petrify' },
  { value: EffectType.DECREASE, label: 'Decrease' },
  { value: EffectType.LOCK, label: 'Lock' },
  { value: EffectType.INCREASE, label: 'Increase' },
  { value: EffectType.ETHEREAL, label: 'Ethereal' },
  { value: EffectType.FIND, label: 'Find' },
  { value: EffectType.ADD_TRIGGER, label: 'Add Trigger' },
  { value: EffectType.INVOKE, label: 'Invoke' },
  { value: EffectType.EVOKE, label: 'Evoke' },
  { value: EffectType.CONVOKE, label: 'Convoke' },
  { value: EffectType.COPY, label: 'Copy' },
  { value: EffectType.ADD, label: 'Add' },
  { value: EffectType.RETURN, label: 'Return' },
];

export const invokeFromOptions = [
  { value: 'player_hand', label: "Your Hand" },
  { value: 'opponent_hand', label: "Opponent's Hand" },
];

export const evokeFromOptions = [
  { value: 'player_memora', label: "Your Memora" },
  { value: 'opponent_memora', label: "Opponent's Memora" },
];

export const convokeFromOptions = [
  { value: 'player_deck', label: "Your Deck" },
  { value: 'opponent_deck', label: "Opponent's Deck" },
];

export const copyTargetTypeOptions = [
  { value: 'numen', label: 'Numen' },
  { value: 'non_mythic_numen', label: 'Non-Mythic Numen' },
  { value: 'mythic_numen', label: 'Mythic Numen' },
  { value: 'rite', label: 'Rite' },
  { value: 'ward', label: 'Ward' },
  { value: 'card', label: 'Card' },
  { value: 'atk', label: 'ATK' },
  { value: 'def', label: 'DEF' },
  { value: 'hp', label: 'HP' },
];

export const addDestinationOptions = [
  { value: 'player_deck', label: "Your Deck" },
  { value: 'opponent_deck', label: "Opponent's Deck" },
  { value: 'player_memora', label: "Your Memora" },
  { value: 'opponent_memora', label: "Opponent's Memora" },
  { value: 'player_exile', label: "Your Exile" },
  { value: 'opponent_exile', label: "Opponent's Exile" },
  { value: 'player_hand', label: "Your Hand" },
  { value: 'opponent_hand', label: "Opponent's Hand" },
];

export const addFromOptions = [
  { value: 'player_field', label: "Your Field" },
  { value: 'opponent_field', label: "Opponent's Field" },
  { value: 'any_field', label: "Any Field" },
  { value: 'player_memora', label: "Your Memora" },
  { value: 'opponent_memora', label: "Opponent's Memora" },
  { value: 'any_memora', label: "Any Memora" },
  { value: 'player_exile', label: "Your Exile" },
  { value: 'opponent_exile', label: "Opponent's Exile" },
  { value: 'any_exile', label: "Any Exile" },
  { value: 'player_deck', label: "Your Deck" },
  { value: 'opponent_deck', label: "Opponent's Deck" },
  { value: 'any_deck', label: "Any Deck" },
  { value: 'player_hand', label: "Your Hand" },
  { value: 'opponent_hand', label: "Opponent's Hand" },
  { value: 'any_hand', label: "Any Hand" },
];

export const returnTargetOptions = [
  { value: 'self', label: "Self (this card)" },
  { value: 'player_field', label: "Your Field" },
  { value: 'opponent_field', label: "Opponent's Field" },
  { value: 'player_memora', label: "Your Memora" },
  { value: 'opponent_memora', label: "Opponent's Memora" },
  { value: 'player_exile', label: "Your Exile" },
  { value: 'opponent_exile', label: "Opponent's Exile" },
];

export const returnFieldTargetOptions = [
  { value: 'all_enemy_numina', label: 'All Enemy Numina' },
  { value: 'all_allied_numina', label: 'All Allied Numina' },
  { value: 'all_enemy_rites', label: 'All Enemy Rites' },
  { value: 'all_allied_rites', label: 'All Allied Rites' },
  { value: 'all_enemy_wards', label: 'All Enemy Wards' },
  { value: 'all_allied_wards', label: 'All Allied Wards' },
  { value: 'enemy_numen', label: 'An Enemy Numen' },
  { value: 'allied_numen', label: 'An Allied Numen' },
  { value: 'enemy_rite', label: 'An Enemy Rite' },
  { value: 'allied_rite', label: 'An Allied Rite' },
  { value: 'enemy_ward', label: 'An Enemy Ward' },
  { value: 'allied_ward', label: 'An Allied Ward' },
];

export const returnCardTypeOptions = [
  { value: 'numen', label: 'Numen' },
  { value: 'rite', label: 'Rite' },
  { value: 'ward', label: 'Ward' },
  { value: 'any', label: 'Any' },
];

export const returnDestinationOptions = [
  { value: 'hand', label: 'Hand' },
  { value: 'deck', label: 'Deck' },
];

export const isReturnTargetField = (target: string | undefined): boolean => {
  if (!target) return false;
  return target === 'player_field' || target === 'opponent_field';
};

export const isReturnTargetZone = (target: string | undefined): boolean => {
  if (!target) return false;
  return target === 'player_memora' || target === 'opponent_memora' || target === 'player_exile' || target === 'opponent_exile';
};

export const isReturnAllTarget = (target: string | undefined): boolean => {
  if (!target) return false;
  return target.startsWith('all_');
};

export const isReturnAllFieldTarget = (target: string | undefined): boolean => {
  if (!target) return false;
  return target.startsWith('all_');
};

export const passiveTriggerOptions = [
  { value: PassiveTrigger.CHALLENGE, label: 'Challenge' },
  { value: PassiveTrigger.VEILED, label: 'Veiled' },
  { value: PassiveTrigger.CELERITY, label: 'Celerity' },
  { value: PassiveTrigger.STUNNED, label: 'Stunned' },
  { value: PassiveTrigger.NULLIFY, label: 'Nullify' },
  { value: PassiveTrigger.LOCKED, label: 'Locked' },
  { value: PassiveTrigger.RECLUSE, label: 'Recluse' },
  { value: PassiveTrigger.LEGION, label: 'Legion' },
  { value: PassiveTrigger.RELENTLESS, label: 'Relentless' },
  { value: PassiveTrigger.SHROUDED, label: 'Shrouded' },
];

export const forgetTargetTypes = [
  { value: 'numen', label: 'Numen' },
  { value: 'another_numen', label: 'Another Numen' },
  { value: 'rite', label: 'Rite' },
  { value: 'ward', label: 'Ward' },
  { value: 'all', label: 'All' },
  { value: 'all_enemy_numina', label: 'All Enemy Numina' },
  { value: 'all_enemy_face_up_numina', label: 'All Enemy Face-Up Numina' },
  { value: 'all_enemy_face_down_numina', label: 'All Enemy Face-Down Numina' },
  { value: 'all_enemy_magics', label: 'All Enemy Magics' },
  { value: 'all_enemy_face_up_magics', label: 'All Enemy Face-Up Magics' },
  { value: 'all_enemy_face_down_magics', label: 'All Enemy Face-Down Magics' },
  { value: 'attacking_numina', label: 'Attacking Numina' },
  { value: 'defending_numina', label: 'Defending Numina' },
];

export const numenStatTargetOptions = [
  { value: 'atk', label: 'ATK' },
  { value: 'def', label: 'DEF' },
  { value: 'both', label: 'ATK and DEF' },
];

export const playerStatTargetOptions = [
  { value: 'hp', label: 'HP' },
  { value: 'mana', label: 'Mana' },
];

export const scryDeckOptions = [
  { value: 'player', label: 'Player Deck' },
  { value: 'opponent', label: 'Opponent Deck' },
];

export const etherealTypeOptions = [
  { value: 'rite', label: 'Rite' },
  { value: 'ward', label: 'Ward' },
  { value: 'both', label: 'Both' },
];

export const findSourceOptions = [
  { value: 'deck', label: 'Deck' },
  { value: 'memora', label: 'Memora' },
  { value: 'exile', label: 'Exile' },
];

export const familyOptions = [
  { value: 'deity', label: 'Deity' },
  { value: 'beast', label: 'Beast' },
  { value: 'bug', label: 'Bug' },
  { value: 'larva', label: 'Larva' },
  { value: 'dragon', label: 'Dragon' },
  { value: 'elemental', label: 'Elemental' },
  { value: 'god', label: 'God' },
  { value: 'human', label: 'Human' },
  { value: 'lemur', label: 'Lemur' },
  { value: 'plant', label: 'Plant' },
  { value: 'undead', label: 'Undead' },
];

export const rarityOptions = [
  { value: 'common', label: 'Common' },
  { value: 'rare', label: 'Rare' },
  { value: 'legendary', label: 'Legendary' },
  { value: 'mythic', label: 'Mythic' },
];

export const natureOptions = [
  { value: 'air', label: 'Air' },
  { value: 'dark', label: 'Dark' },
  { value: 'earth', label: 'Earth' },
  { value: 'fire', label: 'Fire' },
  { value: 'light', label: 'Light' },
  { value: 'water', label: 'Water' },
];

export const cardTypeOptions = [
  { value: 'rite', label: 'Rite' },
  { value: 'ward', label: 'Ward' },
  { value: 'numen', label: 'Numen' },
];

export const isAttackTrigger = (trigger: ConditionalTrigger) => {
  return [ConditionalTrigger.BEFORE_ATTACK, ConditionalTrigger.AFTER_ATTACK, ConditionalTrigger.WHEN_ATTACKED].includes(trigger);
};

export const isPassiveValue = (value: string): value is PassiveTrigger => {
  return Object.values(PassiveTrigger).includes(value as PassiveTrigger);
};

export const DIRECT_VALUE_TARGETS: EffectTarget[] = [
  'player_hp', 'player_mana', 'opponent_hp', 'opponent_mana',
];

export const isDirectValueTarget = (target: EffectTarget | null | undefined): boolean => {
  if (!target) return false;
  return DIRECT_VALUE_TARGETS.includes(target);
};

export const NON_ATTACK_TRIGGERS: ConditionalTrigger[] = [
  ConditionalTrigger.DECREE,
  ConditionalTrigger.START_OF_TURN,
  ConditionalTrigger.END_OF_TURN,
];

export const isNonAttackTrigger = (trigger: ConditionalTrigger | null | undefined): boolean => {
  if (!trigger) return false;
  return NON_ATTACK_TRIGGERS.includes(trigger);
};

export const effectsWithOwnTarget = new Set<EffectType>([
  EffectType.PETRIFY,
  EffectType.DECREASE,
  EffectType.LOCK,
  EffectType.INCREASE,
  EffectType.ETHEREAL,
  EffectType.FIND,
  EffectType.ADD_TRIGGER,
]);

export const effectSupportsOwnTarget = (effectType: EffectType | undefined): boolean => {
  if (!effectType) return false;
  return effectsWithOwnTarget.has(effectType);
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
  any_magic: 'Any Magic',
  any_rite: 'Any Rite',
  any_ward: 'Any Ward',
  allied_magic: 'An Allied Magic',
  enemy_magic: 'An Enemy Magic',
  all_allied_magics: 'All Allied Magics',
  all_enemy_magics: 'All Enemy Magics',
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

export const getEffectTargetLabel = (target: string | null | undefined): string => {
  if (!target) return '';
  return effectTargetLabels[target] || target;
};

export const addTargetTypeOptions = [
  { value: 'numen', label: 'Numen' },
  { value: 'rite', label: 'Rite' },
  { value: 'ward', label: 'Ward' },
  { value: 'any', label: 'Any' },
];

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