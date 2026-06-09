export enum PassiveTrigger {
  CHALLENGE = "CHALLENGE",
  VEILED = "VEILED",
  CELERITY = "CELERITY",
  STUNNED = "STUNNED",
  NULLIFY = "NULLIFY",
  LOCKED = "LOCKED",
  RECLUSE = "RECLUSE",
  LEGION = "LEGION",
  RELENTLESS = "RELENTLESS"
}

export enum SemiConfigurableTrigger {
  COUNTER = "COUNTER",
  MENTAL_DEBT = "MENTAL_DEBT",
  ABSORB = "ABSORB"
}

export enum ConditionalTrigger {
  END_OF_TURN = "END_OF_TURN",
  START_OF_TURN = "START_OF_TURN",
  AFTER_ATTACK = "AFTER_ATTACK",
  BEFORE_ATTACK = "BEFORE_ATTACK",
  WHEN_ATTACKED = "WHEN_ATTACKED",
  DECREE = "DECREE",
  TESTAMENT = "TESTAMENT",
  WHEN = "WHEN"
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
  | 'self'
  | 'attack_target'
  | 'any_card'
  | 'all_cards'
  | 'any_numen'
  | 'any_magic'
  | 'any_rite'
  | 'any_ward'
  | 'allied_numen'
  | 'enemy_numen'
  | 'all_allied_numina'
  | 'all_enemy_numina'
  | 'global_allied_numina'
  | 'global_enemy_numina'
  | 'allied_non_mythic_numen'
  | 'enemy_non_mythic_numen'
  | 'all_allied_non_mythic_numina'
  | 'all_enemy_non_mythic_numina'
  | 'global_allied_non_mythic_numina'
  | 'global_enemy_non_mythic_numina'
  | 'allied_magic'
  | 'enemy_magic'
  | 'all_allied_magics'
  | 'all_enemy_magics'
  | 'allied_rite'
  | 'enemy_rite'
  | 'all_allied_rites'
  | 'all_enemy_rites'
  | 'allied_ward'
  | 'enemy_ward'
  | 'all_allied_wards'
  | 'all_enemy_wards'
  | 'opponent_hp'
  | 'opponent_hand'
  | 'opponent_deck'
  | 'opponent_graveyard'
  | 'opponent_exile'
  | 'opponent_mana'
  | 'player_hp'
  | 'player_hand'
  | 'player_deck'
  | 'player_graveyard'
  | 'player_exile'
  | 'player_mana';

export interface ConditionalTriggerEffect {
  trigger: ConditionalTrigger;
  attackTarget?: AttackTarget;
  effectTarget?: EffectTarget;
  effects: any[];
  whenTarget?: string;
  whenCondition?: string;
}

export type TriggerEntry =
  | PassiveTrigger
  | CounterTrigger
  | MentalDebtTrigger
  | AbsorbTrigger
  | ConditionalTriggerEffect;

export function isPassiveTrigger(entry: TriggerEntry): entry is PassiveTrigger {
  return typeof entry === "string";
}

export function hasPassiveTrigger(card: { triggers?: string[] }, trigger: PassiveTrigger): boolean {
  if (!card.triggers) return false;
  return card.triggers.includes(trigger);
}

export function isCounterTrigger(entry: TriggerEntry): entry is CounterTrigger {
  return typeof entry === "object" && "trigger" in entry && entry.trigger === SemiConfigurableTrigger.COUNTER;
}

export function isMentalDebtTrigger(entry: TriggerEntry): entry is MentalDebtTrigger {
  return typeof entry === "object" && "trigger" in entry && entry.trigger === SemiConfigurableTrigger.MENTAL_DEBT;
}

export function isAbsorbTrigger(entry: TriggerEntry): entry is AbsorbTrigger {
  return typeof entry === "object" && "trigger" in entry && entry.trigger === SemiConfigurableTrigger.ABSORB;
}

export function isConditionalTrigger(entry: TriggerEntry): entry is ConditionalTriggerEffect {
  return typeof entry === "object" && "trigger" in entry && ("effects" in entry || "effect" in entry);
}

export function handlePassiveTrigger(trigger: PassiveTrigger) {
  switch (trigger) {
    case PassiveTrigger.CHALLENGE:
      return;
    case PassiveTrigger.VEILED:
      return;
    case PassiveTrigger.CELERITY:
      return;
    case PassiveTrigger.STUNNED:
      return;
    case PassiveTrigger.NULLIFY:
      return;
    case PassiveTrigger.LOCKED:
      return;
    case PassiveTrigger.RECLUSE:
      return;
    case PassiveTrigger.LEGION:
      return;
    case PassiveTrigger.RELENTLESS:
      return;
  }
}

export function handleCounterTrigger(trigger: CounterTrigger) {
}

export function handleMentalDebtTrigger(trigger: MentalDebtTrigger) {
}

export function handleAbsorbTrigger(trigger: AbsorbTrigger) {
}

export function handleConditionalTrigger(trigger: ConditionalTriggerEffect) {
  switch (trigger.trigger) {
    case ConditionalTrigger.END_OF_TURN:
      return;
    case ConditionalTrigger.START_OF_TURN:
      return;
    case ConditionalTrigger.AFTER_ATTACK:
      return;
    case ConditionalTrigger.BEFORE_ATTACK:
      return;
    case ConditionalTrigger.WHEN_ATTACKED:
      return;
    case ConditionalTrigger.DECREE:
      return;
    case ConditionalTrigger.TESTAMENT:
      return;
    case ConditionalTrigger.WHEN:
      return;
  }
}

export function processTrigger(entry: TriggerEntry) {
  if (isPassiveTrigger(entry)) {
    handlePassiveTrigger(entry);
  } else if (isCounterTrigger(entry)) {
    handleCounterTrigger(entry);
  } else if (isMentalDebtTrigger(entry)) {
    handleMentalDebtTrigger(entry);
  } else if (isAbsorbTrigger(entry)) {
    handleAbsorbTrigger(entry);
  } else if (isConditionalTrigger(entry)) {
    handleConditionalTrigger(entry);
  }
}