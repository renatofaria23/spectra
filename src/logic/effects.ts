export enum EffectType {
  DRAW = "DRAW", SCRY = "SCRY", FORGET = "FORGET", EXILE = "EXILE", PETRIFY = "PETRIFY",
  DECREASE = "DECREASE", LOCK = "LOCK", INCREASE = "INCREASE", ETHEREAL = "ETHEREAL",
  FIND = "FIND", CHOOSE_ONE = "CHOOSE_ONE", ADD_TRIGGER = "ADD_TRIGGER", INVOKE = "INVOKE",
  EVOKE = "EVOKE", CONVOKE = "CONVOKE", COPY = "COPY", ADD = "ADD", RETURN = "RETURN"
}

export interface DrawEffect { effect: EffectType.DRAW; count: number; target?: "player" | "opponent" | "both"; }
export interface ScryEffect { effect: EffectType.SCRY; count: number; deck: "player" | "opponent"; }
export interface ForgetEffect { effect: EffectType.FORGET; count?: number; effectTarget?: string; }
export interface ExileEffect { effect: EffectType.EXILE; count?: number; effectTarget?: string; from?: string; criteria?: InvokeCriteria; }
export interface PetrifyEffect { effect: EffectType.PETRIFY; turns: number; effectTarget?: string; }

interface StatAdjustment {
  target: "numen" | "self" | "player" | "opponent";
  effectTarget: "atk" | "def" | "hp" | "mana";
  amount: number;
  duration?: "temporary" | "permanent" | "while_on_field";
  durationTurns?: number;
}
export interface DecreaseEffect extends StatAdjustment { effect: EffectType.DECREASE; }
export interface IncreaseEffect extends StatAdjustment { effect: EffectType.INCREASE; }

export interface LockEffect { effect: EffectType.LOCK; count?: number; duration: "temporary" | "permanent" | "while_on_field"; turns?: number; effectTarget?: string; }
export interface EtherealEffect { effect: EffectType.ETHEREAL; count: number; type: "rite" | "ward" | "both"; effectTarget?: string; }
export interface FindEffect { effect: EffectType.FIND; count: number; source: "deck" | "memora" | "exile"; effectTarget?: string; }
export interface ChooseOneEffect { effect: EffectType.CHOOSE_ONE; options: string[]; }
export interface AddTriggerEffect { effect: EffectType.ADD_TRIGGER; trigger_type: string; duration: number; effectTarget?: string; }

export interface InvokeCriteria { name?: string; level?: number; levelMin?: number; levelMax?: number; atk?: number; atkMin?: number; atkMax?: number; def?: number; defMin?: number; defMax?: number; families?: string[]; excludeFamilies?: string[]; natures?: string[]; excludeNatures?: string[]; rarities?: string[]; excludeRarities?: string[]; }

interface SummonEffect {
  criteria: InvokeCriteria;
  count: number;
  effectTarget?: string;
}
export interface InvokeEffect extends SummonEffect { effect: EffectType.INVOKE; from: "player_hand" | "opponent_hand"; }
export interface EvokeEffect extends SummonEffect { effect: EffectType.EVOKE; from: "player_memora" | "opponent_memora"; }
export interface ConvokeEffect extends SummonEffect { effect: EffectType.CONVOKE; from: "player_deck" | "opponent_deck"; }

export interface CopyEffect { effect: EffectType.COPY; copyTarget: string; destination: string; count: number; effectTarget?: string; }
export interface AddEffect { effect: EffectType.ADD; addFrom: "player_field" | "opponent_field" | "any_field" | "player_memora" | "opponent_memora" | "any_memora" | "player_exile" | "opponent_exile" | "any_exile" | "player_deck" | "opponent_deck" | "any_deck" | "player_hand" | "opponent_hand" | "any_hand"; addTargetType: "numen" | "rite" | "ward" | "any"; destination: "player_deck" | "opponent_deck" | "player_memora" | "opponent_memora" | "player_exile" | "opponent_exile" | "player_hand" | "opponent_hand"; count: number; effectTarget?: string; }
export interface ReturnEffect { effect: EffectType.RETURN; destination?: string; returnDestination?: string; returnTarget?: string; returnFieldTarget?: string; returnCardType?: string; count?: number; effectTarget?: string; }
export interface ForEachConfig { cardType: "numen" | "ward" | "rite" | "incantation" | "any"; zone: "memora" | "field" | "exile" | "deck" | "hand"; owner: "player" | "opponent" | "both"; }

export type EffectEntry = (
  | DrawEffect
  | ScryEffect
  | ForgetEffect
  | ExileEffect
  | PetrifyEffect
  | DecreaseEffect
  | LockEffect
  | IncreaseEffect
  | EtherealEffect
  | FindEffect
  | ChooseOneEffect
  | AddTriggerEffect
  | InvokeEffect
  | EvokeEffect
  | ConvokeEffect
  | CopyEffect
  | AddEffect
  | ReturnEffect
) & {
  otherwise?: boolean;
  otherwise_effect?: EffectEntry;
  or?: boolean;
  or_effect?: EffectEntry;
  forEach?: boolean;
  forEachConfig?: ForEachConfig;
};

export const isDrawEffect = (e: EffectEntry): e is DrawEffect => e.effect === EffectType.DRAW;
export const isScryEffect = (e: EffectEntry): e is ScryEffect => e.effect === EffectType.SCRY;
export const isForgetEffect = (e: EffectEntry): e is ForgetEffect => e.effect === EffectType.FORGET;
export const isExileEffect = (e: EffectEntry): e is ExileEffect => e.effect === EffectType.EXILE;
export const isPetrifyEffect = (e: EffectEntry): e is PetrifyEffect => e.effect === EffectType.PETRIFY;
export const isDecreaseEffect = (e: EffectEntry): e is DecreaseEffect => e.effect === EffectType.DECREASE;
export const isLockEffect = (e: EffectEntry): e is LockEffect => e.effect === EffectType.LOCK;
export const isIncreaseEffect = (e: EffectEntry): e is IncreaseEffect => e.effect === EffectType.INCREASE;
export const isEtherealEffect = (e: EffectEntry): e is EtherealEffect => e.effect === EffectType.ETHEREAL;
export const isFindEffect = (e: EffectEntry): e is FindEffect => e.effect === EffectType.FIND;
export const isChooseOneEffect = (e: EffectEntry): e is ChooseOneEffect => e.effect === EffectType.CHOOSE_ONE;
export const isAddTriggerEffect = (e: EffectEntry): e is AddTriggerEffect => e.effect === EffectType.ADD_TRIGGER;
export const isInvokeEffect = (e: EffectEntry): e is InvokeEffect => e.effect === EffectType.INVOKE;
export const isEvokeEffect = (e: EffectEntry): e is EvokeEffect => e.effect === EffectType.EVOKE;
export const isConvokeEffect = (e: EffectEntry): e is ConvokeEffect => e.effect === EffectType.CONVOKE;
export const isCopyEffect = (e: EffectEntry): e is CopyEffect => e.effect === EffectType.COPY;
export const isAddEffect = (e: EffectEntry): e is AddEffect => e.effect === EffectType.ADD;
export const isReturnEffect = (e: EffectEntry): e is ReturnEffect => e.effect === EffectType.RETURN;


