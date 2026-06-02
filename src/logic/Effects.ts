export enum EffectType {
  DRAW = "DRAW",
  SCRY = "SCRY",
  DESTROY = "DESTROY",
  EXILE = "EXILE",
  STUN = "STUN",
  DECREASE = "DECREASE",
  LOCK = "LOCK",
  INCREASE = "INCREASE",
  SHIELD = "SHIELD",
  ETHEREAL = "ETHEREAL",
  FIND = "FIND",
  CHOOSE_ONE = "CHOOSE_ONE",
  ADD_TRIGGER = "ADD_TRIGGER"
}

export interface DrawEffect {
  effect: EffectType.DRAW;
  count: number;
}

export interface ScryEffect {
  effect: EffectType.SCRY;
  count: number;
  deck: "player" | "opponent";
}

export interface DestroyEffect {
  effect: EffectType.DESTROY;
  targetType: "monster" | "another_monster" | "spell" | "ward" | "all" | "all_opponent_monsters" | "all_opponent_face_up_monsters" | "all_opponent_face_down_monsters" | "all_opponent_face_up_magics" | "all_opponent_face_down_magics" | "attacking_monsters" | "defending_monsters";
}

export interface ExileEffect {
  effect: EffectType.EXILE;
  targetType: "monster" | "another_monster" | "spell" | "ward" | "all" | "all_opponent_monsters" | "all_opponent_face_up_monsters" | "all_opponent_face_down_monsters" | "all_opponent_face_up_magics" | "all_opponent_face_down_magics" | "attacking_monsters" | "defending_monsters";
}

export interface StunEffect {
  effect: EffectType.STUN;
  turns: number;
}

export interface DecreaseEffect {
  effect: EffectType.DECREASE;
  target: "atk" | "def" | "hp";
  amount: number;
}

export interface LockEffect {
  effect: EffectType.LOCK;
  count?: number;
  turns: number;
}

export interface IncreaseEffect {
  effect: EffectType.INCREASE;
  target: "atk" | "def" | "hp";
  amount: number;
}

export interface ShieldEffect {
  effect: EffectType.SHIELD;
  attacks: number;
}

export interface EtherealEffect {
  effect: EffectType.ETHEREAL;
  count: number;
  type: "spell" | "ward" | "both";
}

export interface FindEffect {
  effect: EffectType.FIND;
  count: number;
  source: "deck" | "graveyard" | "exile";
}

export interface ChooseOneEffect {
  effect: EffectType.CHOOSE_ONE;
  options: string[];
}

export interface AddTriggerEffect {
  effect: EffectType.ADD_TRIGGER;
  trigger_type: string;
  duration: number;
}

export type EffectEntry =
  | DrawEffect
  | ScryEffect
  | DestroyEffect
  | ExileEffect
  | StunEffect
  | DecreaseEffect
  | LockEffect
  | IncreaseEffect
  | ShieldEffect
  | EtherealEffect
  | FindEffect
  | ChooseOneEffect
  | AddTriggerEffect;

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

export function isStunEffect(entry: EffectEntry): entry is StunEffect {
  return entry.effect === EffectType.STUN;
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

export function isShieldEffect(entry: EffectEntry): entry is ShieldEffect {
  return entry.effect === EffectType.SHIELD;
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
    case EffectType.STUN:
      return;
    case EffectType.DECREASE:
      return;
    case EffectType.LOCK:
      return;
    case EffectType.INCREASE:
      return;
    case EffectType.SHIELD:
      return;
    case EffectType.ETHEREAL:
      return;
    case EffectType.FIND:
      return;
    case EffectType.CHOOSE_ONE:
      return;
    case EffectType.ADD_TRIGGER:
      return;
  }
}
