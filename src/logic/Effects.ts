export enum EffectType {
  DRAW = "DRAW",
  SCRY = "SCRY",
  DESTROY = "DESTROY",
  EXILE = "EXILE",
  PETRIFY = "PETRIFY",
  DECREASE = "DECREASE",
  LOCK = "LOCK",
  INCREASE = "INCREASE",
  ETHEREAL = "ETHEREAL",
  FIND = "FIND",
  CHOOSE_ONE = "CHOOSE_ONE",
  ADD_TRIGGER = "ADD_TRIGGER",
  SUMMON = "SUMMON",
  COPY = "COPY",
  ADD = "ADD",
  RETURN = "RETURN"
}

export interface DrawEffect {
  effect: EffectType.DRAW;
  count: number;
  target?: "player" | "opponent" | "both";
}

export interface ScryEffect {
  effect: EffectType.SCRY;
  count: number;
  deck: "player" | "opponent";
}

export interface DestroyEffect {
  effect: EffectType.DESTROY;
  count?: number;
  effectTarget?: string;
}

export interface ExileEffect {
  effect: EffectType.EXILE;
  count?: number;
  effectTarget?: string;
  from?: string;
  criteria?: SummonCriteria;
}

export interface PetrifyEffect {
  effect: EffectType.PETRIFY;
  turns: number;
  effectTarget?: string;
}

export interface DecreaseEffect {
  effect: EffectType.DECREASE;
  target: "atk" | "def" | "hp" | "mana";
  amount: number;
  duration: "temporary" | "permanent" | "while_on_field";
  durationTurns?: number;
  effectTarget?: string;
}

export interface LockEffect {
  effect: EffectType.LOCK;
  count?: number;
  duration: "temporary" | "permanent" | "while_on_field";
  turns?: number;
  effectTarget?: string;
}

export interface IncreaseEffect {
  effect: EffectType.INCREASE;
  target: "atk" | "def" | "hp" | "mana";
  amount: number;
  duration: "temporary" | "permanent" | "while_on_field";
  durationTurns?: number;
  effectTarget?: string;
}


export interface EtherealEffect {
  effect: EffectType.ETHEREAL;
  count: number;
  type: "rite" | "ward" | "both";
  effectTarget?: string;
}

export interface FindEffect {
  effect: EffectType.FIND;
  count: number;
  source: "deck" | "graveyard" | "exile";
  effectTarget?: string;
}

export interface ChooseOneEffect {
  effect: EffectType.CHOOSE_ONE;
  options: string[];
}

export interface AddTriggerEffect {
  effect: EffectType.ADD_TRIGGER;
  trigger_type: string;
  duration: number;
  effectTarget?: string;
}

export interface SummonCriteria {
  name?: string;
  level?: number;
  levelMin?: number;
  levelMax?: number;
  atk?: number;
  atkMin?: number;
  atkMax?: number;
  def?: number;
  defMin?: number;
  defMax?: number;
  families?: string[];
  excludeFamilies?: string[];
  natures?: string[];
  excludeNatures?: string[];
  rarities?: string[];
  excludeRarities?: string[];
}

export interface SummonEffect {
  effect: EffectType.SUMMON;
  from: "player_deck" | "player_hand" | "player_graveyard" | "player_exile" | "opponent_deck" | "opponent_hand" | "opponent_graveyard" | "opponent_exile";
  criteria: SummonCriteria;
  count: number;
  effectTarget?: string;
}

export interface CopyEffect {
  effect: EffectType.COPY;
  copyTarget: string;
  destination: string;
  count: number;
  effectTarget?: string;
}

export interface AddEffect {
  effect: EffectType.ADD;
  destination: "player_deck" | "opponent_deck" | "player_graveyard" | "opponent_graveyard" | "player_exile" | "opponent_exile" | "player_hand" | "opponent_hand";
  count: number;
  effectTarget?: string;
}

export interface ReturnEffect {
  effect: EffectType.RETURN;
  destination: string;
  count?: number;
  effectTarget?: string;
}

export interface ForEachConfig {
  cardType: "numen" | "ward" | "rite" | "magic" | "any";
  zone: "graveyard" | "field" | "exile" | "deck" | "hand";
  owner: "player" | "opponent" | "both";
}

export type EffectEntry =
  | (DrawEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (ScryEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (DestroyEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (ExileEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (PetrifyEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (DecreaseEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (LockEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (IncreaseEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (EtherealEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (FindEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (ChooseOneEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (AddTriggerEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (SummonEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (CopyEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (AddEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig })
  | (ReturnEffect & { otherwise?: boolean; otherwise_effect?: EffectEntry; or?: boolean; or_effect?: EffectEntry; forEach?: boolean; forEachConfig?: ForEachConfig });

export function isDrawEffect(entry: EffectEntry): entry is DrawEffect {
  return entry.effect === EffectType.DRAW;
}

export function isScryEffect(entry: EffectEntry): entry is ScryEffect {
  return entry.effect === EffectType.SCRY;
}

export function isDestroyEffect(entry: EffectEntry): entry is DestroyEffect {
  return entry.effect === EffectType.DESTROY;
}

export function isExileEffect(entry: EffectEntry): entry is ExileEffect {
  return entry.effect === EffectType.EXILE;
}

export function isPetrifyEffect(entry: EffectEntry): entry is PetrifyEffect {
  return entry.effect === EffectType.PETRIFY;
}

export function isDecreaseEffect(entry: EffectEntry): entry is DecreaseEffect {
  return entry.effect === EffectType.DECREASE;
}

export function isLockEffect(entry: EffectEntry): entry is LockEffect {
  return entry.effect === EffectType.LOCK;
}

export function isIncreaseEffect(entry: EffectEntry): entry is IncreaseEffect {
  return entry.effect === EffectType.INCREASE;
}

export function isEtherealEffect(entry: EffectEntry): entry is EtherealEffect {
  return entry.effect === EffectType.ETHEREAL;
}

export function isFindEffect(entry: EffectEntry): entry is FindEffect {
  return entry.effect === EffectType.FIND;
}

export function isChooseOneEffect(entry: EffectEntry): entry is ChooseOneEffect {
  return entry.effect === EffectType.CHOOSE_ONE;
}

export function isAddTriggerEffect(entry: EffectEntry): entry is AddTriggerEffect {
  return entry.effect === EffectType.ADD_TRIGGER;
}

export function isSummonEffect(entry: EffectEntry): entry is SummonEffect {
  return entry.effect === EffectType.SUMMON;
}

export function isCopyEffect(entry: EffectEntry): entry is CopyEffect {
  return entry.effect === EffectType.COPY;
}

export function isAddEffect(entry: EffectEntry): entry is AddEffect {
  return entry.effect === EffectType.ADD;
}

export function isReturnEffect(entry: EffectEntry): entry is ReturnEffect {
  return entry.effect === EffectType.RETURN;
}

export function handleEffect(entry: EffectEntry) {
  switch (entry.effect) {
    case EffectType.DRAW:
      return;
    case EffectType.SCRY:
      return;
    case EffectType.DESTROY:
      return;
    case EffectType.EXILE:
      return;
    case EffectType.PETRIFY:
      return;
    case EffectType.DECREASE:
      return;
    case EffectType.LOCK:
      return;
    case EffectType.INCREASE:
      return;
    case EffectType.ETHEREAL:
      return;
    case EffectType.FIND:
      return;
    case EffectType.CHOOSE_ONE:
      return;
    case EffectType.ADD_TRIGGER:
      return;
    case EffectType.SUMMON:
      return;
    case EffectType.COPY:
      return;
    case EffectType.ADD:
      return;
    case EffectType.RETURN:
      return;
  }
}
