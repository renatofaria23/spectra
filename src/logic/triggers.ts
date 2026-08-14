export enum PassiveTrigger {
  CHALLENGE = "CHALLENGE", VEILED = "VEILED", CELERITY = "CELERITY",
  STUNNED = "STUNNED", NULLIFY = "NULLIFY", LOCKED = "LOCKED",
  RECLUSE = "RECLUSE", LEGION = "LEGION", RELENTLESS = "RELENTLESS",
  SHROUDED = "SHROUDED"
}

export enum SemiConfigurableTrigger {
  COUNTER = "COUNTER", MENTAL_DEBT = "MENTAL_DEBT", ABSORB = "ABSORB"
}

export enum ConditionalTrigger {
  END_OF_TURN = "END_OF_TURN", START_OF_TURN = "START_OF_TURN",
  AFTER_ATTACK = "AFTER_ATTACK", BEFORE_ATTACK = "BEFORE_ATTACK",
  WHEN_ATTACKED = "WHEN_ATTACKED", DECREE = "DECREE",
  TESTAMENT = "TESTAMENT", WHEN = "WHEN"
}

export interface CounterTrigger {
  trigger: SemiConfigurableTrigger.COUNTER;
  count_type: string;
  value: number;
}

export interface MentalDebtTrigger {
  trigger: SemiConfigurableTrigger.MENTAL_DEBT;
  mana_amount: number;
  trigger_condition: string;
}

export interface AbsorbTrigger {
  trigger: SemiConfigurableTrigger.ABSORB;
  count_type: string;
  value: number;
}

export type AttackTarget = 'player' | 'numen' | 'allied_numen' | 'anything';

export type EffectTarget =
  | 'self' | 'attack_target' | 'any_card' | 'all_cards'
  | 'any_numen' | 'any_incantation' | 'any_rite' | 'any_ward'
  | 'allied_numen' | 'enemy_numen' | 'all_allied_numina' | 'all_enemy_numina'
  | 'global_allied_numina' | 'global_enemy_numina'
  | 'allied_non_mythic_numen' | 'enemy_non_mythic_numen'
  | 'all_allied_non_mythic_numina' | 'all_enemy_non_mythic_numina'
  | 'global_allied_non_mythic_numina' | 'global_enemy_non_mythic_numina'
  | 'allied_incantation' | 'enemy_incantation' | 'all_allied_incantations' | 'all_enemy_incantations'
  | 'allied_rite' | 'enemy_rite' | 'all_allied_rites' | 'all_enemy_rites'
  | 'allied_ward' | 'enemy_ward' | 'all_allied_wards' | 'all_enemy_wards'
  | 'opponent_hp' | 'opponent_hand' | 'opponent_deck'
  | 'opponent_memora' | 'opponent_exile' | 'opponent_mana'
  | 'player_hp' | 'player_hand' | 'player_deck'
  | 'player_memora' | 'player_exile' | 'player_mana';

export interface ConditionalTriggerEffect {
  trigger: ConditionalTrigger;
  attackTarget?: AttackTarget;
  effectTarget?: EffectTarget;
  effects: any[];
  whenTarget?: string;
  whenCondition?: string;
}

export type TriggerEntry =
  | PassiveTrigger | CounterTrigger | MentalDebtTrigger
  | AbsorbTrigger | ConditionalTriggerEffect;

export const isPassiveTrigger = (entry: TriggerEntry): entry is PassiveTrigger => typeof entry === "string";

export const hasPassiveTrigger = (card: { triggers?: string[] }, trigger: PassiveTrigger): boolean =>
  !!card.triggers && card.triggers.includes(trigger);

const isSemiTrigger = (entry: TriggerEntry, t: SemiConfigurableTrigger) =>
  typeof entry === "object" && "trigger" in entry && entry.trigger === t;

export const isCounterTrigger = (entry: TriggerEntry): entry is CounterTrigger =>
  isSemiTrigger(entry, SemiConfigurableTrigger.COUNTER);

export const isMentalDebtTrigger = (entry: TriggerEntry): entry is MentalDebtTrigger =>
  isSemiTrigger(entry, SemiConfigurableTrigger.MENTAL_DEBT);

export const isAbsorbTrigger = (entry: TriggerEntry): entry is AbsorbTrigger =>
  isSemiTrigger(entry, SemiConfigurableTrigger.ABSORB);

export const isConditionalTrigger = (entry: TriggerEntry): entry is ConditionalTriggerEffect =>
  typeof entry === "object" && "trigger" in entry && ("effects" in entry || "effect" in entry);

export function handlePassiveTrigger(_trigger: PassiveTrigger) {}
export function handleCounterTrigger(_trigger: CounterTrigger) {}
export function handleMentalDebtTrigger(_trigger: MentalDebtTrigger) {}
export function handleAbsorbTrigger(_trigger: AbsorbTrigger) {}
export function handleConditionalTrigger(_trigger: ConditionalTriggerEffect) {}

export function processTrigger(entry: TriggerEntry) {
  if (isPassiveTrigger(entry)) handlePassiveTrigger(entry);
  else if (isCounterTrigger(entry)) handleCounterTrigger(entry);
  else if (isMentalDebtTrigger(entry)) handleMentalDebtTrigger(entry);
  else if (isAbsorbTrigger(entry)) handleAbsorbTrigger(entry);
  else if (isConditionalTrigger(entry)) handleConditionalTrigger(entry);
}