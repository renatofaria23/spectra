import { ConditionalTrigger, PassiveTrigger } from './Triggers';
import type { AttackTarget, EffectTarget } from './Triggers';
import { EffectType } from './Effects';
import type { EffectEntry } from './Effects';
import colors from '../styles/Colors';

export type CardTypeOption = 'monster' | 'spell' | 'ward';

export interface EffectSlot {
  trigger: ConditionalTrigger | PassiveTrigger;
  attackTarget?: AttackTarget;
  effectTarget?: EffectTarget;
  effect?: EffectEntry;
}

export const triggerTypeOptions = [
  { value: 'passive', label: 'Passive' },
  { value: 'active', label: 'Active' },
];

export const activeTriggerOptions = [
  { value: ConditionalTrigger.ARRIVAL, label: 'Arrival' },
  { value: ConditionalTrigger.LAST_BREATH, label: 'Last Breath' },
  { value: ConditionalTrigger.START_OF_TURN, label: 'Start of Turn' },
  { value: ConditionalTrigger.END_OF_TURN, label: 'End of Turn' },
  { value: ConditionalTrigger.BEFORE_ATTACK, label: 'Before Attack' },
  { value: ConditionalTrigger.AFTER_ATTACK, label: 'After Attack' },
  { value: ConditionalTrigger.WHEN_ATTACKED, label: 'When Attacked' },
  { value: ConditionalTrigger.WOUNDED, label: 'Wounded' },
];

export const triggerOptions = [
  { group: 'Passive', items: [
    { value: PassiveTrigger.PROVOCATION, label: 'Provocation' },
    { value: PassiveTrigger.VEILED, label: 'Veiled' },
    { value: PassiveTrigger.HASTE, label: 'Haste' },
    { value: PassiveTrigger.LIFELINK, label: 'Lifelink' },
    { value: PassiveTrigger.STUNNED, label: 'Stunned' },
    { value: PassiveTrigger.NULLIFY, label: 'Nullify' },
    { value: PassiveTrigger.LOCKED, label: 'Locked' },
    { value: PassiveTrigger.RECLUSE, label: 'Recluse' },
    { value: PassiveTrigger.PACKER, label: 'Packer' },
    { value: PassiveTrigger.RELENTLESS, label: 'Relentless' },
  ]},
  { group: 'Conditional', items: [
    { value: ConditionalTrigger.ARRIVAL, label: 'Arrival' },
    { value: ConditionalTrigger.LAST_BREATH, label: 'Last Breath' },
    { value: ConditionalTrigger.START_OF_TURN, label: 'Start of Turn' },
    { value: ConditionalTrigger.END_OF_TURN, label: 'End of Turn' },
    { value: ConditionalTrigger.BEFORE_ATTACK, label: 'Before Attack' },
    { value: ConditionalTrigger.AFTER_ATTACK, label: 'After Attack' },
    { value: ConditionalTrigger.WHEN_ATTACKED, label: 'When Attacked' },
    { value: ConditionalTrigger.WOUNDED, label: 'Wounded' },
  ]},
];

export const attackTargetOptions = [
  { value: 'player', label: "Opponent's Player" },
  { value: 'monster', label: "Opponent's Monster" },
  { value: 'self', label: 'Self (When Attacked)' },
  { value: 'allied_monster', label: 'Allied Monster (When Attacked)' },
];

export const effectTargetOptions = [
  { group: 'This Card', items: [
    { value: 'self', label: 'Self (this card)' },
  ]},
  { group: 'Attack Target', items: [
    { value: 'attack_target', label: 'Attack Target' },
  ]},
  { group: 'Monsters', items: [
    { value: 'allied_monster', label: 'An Allied Monster' },
    { value: 'enemy_monster', label: 'An Enemy Monster' },
    { value: 'all_allied_monsters', label: 'All Allied Monsters' },
    { value: 'all_enemy_monsters', label: 'All Enemy Monsters' },
  ]},
  { group: 'Opponent', items: [
    { value: 'opponent_hp', label: "Opponent's HP" },
    { value: 'opponent_hand', label: "Opponent's Hand" },
    { value: 'opponent_deck', label: "Opponent's Deck" },
    { value: 'opponent_graveyard', label: "Opponent's Graveyard" },
    { value: 'opponent_exile', label: "Opponent's Exile" },
  ]},
  { group: 'Player', items: [
    { value: 'player_hp', label: "Player's HP" },
    { value: 'player_hand', label: "Player's Hand" },
    { value: 'player_deck', label: "Player's Deck" },
    { value: 'player_graveyard', label: "Player's Graveyard" },
    { value: 'player_exile', label: "Player's Exile" },
  ]},
];

export const effectOptions = [
  { value: EffectType.DRAW, label: 'Draw' },
  { value: EffectType.SCRY, label: 'Scry' },
  { value: EffectType.DESTROY, label: 'Destroy' },
  { value: EffectType.EXILE, label: 'Exile' },
  { value: EffectType.STUN, label: 'Stun' },
  { value: EffectType.DECREASE, label: 'Decrease' },
  { value: EffectType.LOCK, label: 'Lock' },
  { value: EffectType.INCREASE, label: 'Increase' },
  { value: EffectType.SHIELD, label: 'Shield' },
  { value: EffectType.ETHEREAL, label: 'Ethereal' },
  { value: EffectType.FIND, label: 'Find' },
  { value: EffectType.ADD_TRIGGER, label: 'Add Trigger' },
];

export const passiveTriggerOptions = [
  { value: PassiveTrigger.PROVOCATION, label: 'Provocation' },
  { value: PassiveTrigger.VEILED, label: 'Veiled' },
  { value: PassiveTrigger.HASTE, label: 'Haste' },
  { value: PassiveTrigger.LIFELINK, label: 'Lifelink' },
  { value: PassiveTrigger.STUNNED, label: 'Stunned' },
  { value: PassiveTrigger.NULLIFY, label: 'Nullify' },
  { value: PassiveTrigger.LOCKED, label: 'Locked' },
  { value: PassiveTrigger.RECLUSE, label: 'Recluse' },
  { value: PassiveTrigger.PACKER, label: 'Packer' },
  { value: PassiveTrigger.RELENTLESS, label: 'Relentless' },
];

export const destroyTargetTypes = [
  { value: 'monster', label: 'Monster' },
  { value: 'another_monster', label: 'Another Monster' },
  { value: 'spell', label: 'Spell' },
  { value: 'ward', label: 'Ward' },
  { value: 'all', label: 'All' },
  { value: 'all_opponent_monsters', label: 'All Opponent Monsters' },
  { value: 'all_opponent_face_up_monsters', label: 'All Opponent Face-Up Monsters' },
  { value: 'all_opponent_face_down_monsters', label: 'All Opponent Face-Down Monsters' },
  { value: 'all_opponent_face_up_magics', label: 'All Opponent Face-Up Magics' },
  { value: 'all_opponent_face_down_magics', label: 'All Opponent Face-Down Magics' },
  { value: 'attacking_monsters', label: 'Attacking Monsters' },
  { value: 'defending_monsters', label: 'Defending Monsters' },
];

export const statTargetOptions = [
  { value: 'atk', label: 'ATK' },
  { value: 'def', label: 'DEF' },
  { value: 'hp', label: 'HP' },
];

export const scryDeckOptions = [
  { value: 'player', label: 'Player Deck' },
  { value: 'opponent', label: 'Opponent Deck' },
];

export const etherealTypeOptions = [
  { value: 'spell', label: 'Spell' },
  { value: 'ward', label: 'Ward' },
  { value: 'both', label: 'Both' },
];

export const findSourceOptions = [
  { value: 'deck', label: 'Deck' },
  { value: 'graveyard', label: 'Graveyard' },
  { value: 'exile', label: 'Exile' },
];

export const familyOptions = [
  { value: 'android', label: 'Android' },
  { value: 'angel', label: 'Angel' },
  { value: 'beast', label: 'Beast' },
  { value: 'bug', label: 'Bug' },
  { value: 'demon', label: 'Demon' },
  { value: 'dragon', label: 'Dragon' },
  { value: 'elemental', label: 'Elemental' },
  { value: 'plant', label: 'Plant' },
  { value: 'undead', label: 'Undead' },
];

export const rarityOptions = [
  { value: 'common', label: 'Common' },
  { value: 'uncommon', label: 'Uncommon' },
  { value: 'rare', label: 'Rare' },
  { value: 'epic', label: 'Epic' },
  { value: 'legendary', label: 'Legendary' },
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
  { value: 'spell', label: 'Spell' },
  { value: 'ward', label: 'Ward' },
  { value: 'monster', label: 'Monster' },
];

export const isAttackTrigger = (trigger: ConditionalTrigger) => {
  return [ConditionalTrigger.BEFORE_ATTACK, ConditionalTrigger.AFTER_ATTACK, ConditionalTrigger.WHEN_ATTACKED].includes(trigger);
};

export const isPassiveValue = (value: string): value is PassiveTrigger => {
  return Object.values(PassiveTrigger).includes(value as PassiveTrigger);
};

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