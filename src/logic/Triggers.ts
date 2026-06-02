export enum PassiveTrigger {
  PROVOCATION = "PROVOCATION",
  VEILED = "VEILED",
  HASTE = "HASTE",
  LIFELINK = "LIFELINK",
  STUNNED = "STUNNED",
  NULLIFY = "NULLIFY",
  LOCKED = "LOCKED",
  RECLUSE = "RECLUSE",
  PACKER = "PACKER",
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
  ARRIVAL = "ARRIVAL",
  LAST_BREATH = "LAST_BREATH",
  WOUNDED = "WOUNDED"
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

export type AttackTarget = 'player' | 'monster' | 'self' | 'allied_monster';

export type EffectTarget =
  | 'self'
  | 'attack_target'
  | 'allied_monster'
  | 'enemy_monster'
  | 'all_allied_monsters'
  | 'all_enemy_monsters'
  | 'opponent_hp'
  | 'opponent_hand'
  | 'opponent_deck'
  | 'opponent_graveyard'
  | 'opponent_exile'
  | 'player_hp'
  | 'player_hand'
  | 'player_deck'
  | 'player_graveyard'
  | 'player_exile';

export interface ConditionalTriggerEffect {
  trigger: ConditionalTrigger;
  attackTarget?: AttackTarget;
  effectTarget?: EffectTarget;
  effect: any;
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
  return typeof entry === "object" && "trigger" in entry && "effect" in entry;
}

export function handlePassiveTrigger(trigger: PassiveTrigger) {
  switch (trigger) {
    case PassiveTrigger.PROVOCATION:
      return;
    case PassiveTrigger.VEILED:
      return;
    case PassiveTrigger.HASTE:
      return;
    case PassiveTrigger.LIFELINK:
      return;
    case PassiveTrigger.STUNNED:
      return;
    case PassiveTrigger.NULLIFY:
      return;
    case PassiveTrigger.LOCKED:
      return;
    case PassiveTrigger.RECLUSE:
      return;
    case PassiveTrigger.PACKER:
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
    case ConditionalTrigger.ARRIVAL:
      return;
    case ConditionalTrigger.LAST_BREATH:
      return;
    case ConditionalTrigger.WOUNDED:
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