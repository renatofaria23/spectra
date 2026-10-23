import { EffectType, type EffectEntry, type ForEachConfig, type InvokeCriteria } from './effects';
import type { PlayerState, Card } from './types';
import { getTargetCards, getCardById, findCardIndex } from './effectsExecutor_common';
import { executeEffect as handleSimpleEffects } from './effectsExecutor_1';
import { executeOtherEffects } from './effectsExecutor_other_1';
import { executeOtherEffects2 } from './effectsExecutor_other_2';

export const executeEffect = (
  entry: EffectEntry,
  player: PlayerState,
  opponent: PlayerState,
  target?: string,
  forEachConfig?: ForEachConfig
): string[] => {
  const log: string[] = [];
  const apply = (fn: () => void, msg: string) => { fn(); log.push(msg); };
  const merge = (subLog: string[]) => { if (subLog) log.push(...subLog); };

  switch (entry.effect) {
    case EffectType.DRAW:
    case EffectType.SCRY:
    case EffectType.FORGET:
    case EffectType.EXILE:
    case EffectType.PETRIFY:
    case EffectType.DECREASE:
    case EffectType.INCREASE:
    case EffectType.LOCK:
    case EffectType.ETHEREAL:
    case EffectType.FIND:
    case EffectType.CHOOSE_ONE:
    case EffectType.ADD_TRIGGER:
      merge(handleSimpleEffects(entry, player, opponent, target, forEachConfig));
      break;
    case EffectType.INVOKE:
    case EffectType.EVOKE:
    case EffectType.CONVOKE:
      merge(executeOtherEffects(entry, player, opponent, forEachConfig));
      break;
    case EffectType.COPY:
    case EffectType.ADD:
    case EffectType.RETURN:
      merge(executeOtherEffects2(entry, player, opponent, forEachConfig));
      break;
    default:
      break;
  }

  return log;
};

export { getTargetCards, getCardById, findCardIndex } from './effectsExecutor_common';
