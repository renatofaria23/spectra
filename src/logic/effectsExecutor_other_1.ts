import { EffectType, type EffectEntry, type ForEachConfig, type InvokeCriteria } from './effects';
import type { PlayerState, Card } from './types';
import { getTargetCards, getCardById, findCardIndex } from './effectsExecutor_common';

export const executeOtherEffects = (
  entry: EffectEntry,
  player: PlayerState,
  opponent: PlayerState,
  forEachConfig?: ForEachConfig
): string[] => {
  const log: string[] = [];
  const apply = (fn: () => void, msg: string) => { fn(); log.push(msg); };

  switch (entry.effect) {
    case EffectType.INVOKE: {
      const count = entry.count || 1;
      const criteria = entry.criteria || {};
      const hand = player.hand;
      apply(() => {
        for (let i = 0; i < count; i++) {
          const idx = findCardIndex(hand, criteria, player);
          if (idx === -1) break;
          const card = hand[idx] as Card;
          player.hand.splice(idx, 1);
          player.fieldNumina.push(card);
          player.numenPositions[card.id] = 'attack';
        }
      }, `Invoke ${count} numen(s) from player hand`);
      break;
    }
    case EffectType.EVOKE: {
      const count = entry.count || 1;
      const criteria = entry.criteria || {};
      const memora = player.memora;
      apply(() => {
        for (let i = 0; i < count; i++) {
          const idx = findCardIndex(memora, criteria, player);
          if (idx === -1) break;
          const card = memora[idx] as Card;
          player.memora.splice(idx, 1);
          player.fieldNumina.push(card);
          player.numenPositions[card.id] = 'attack';
        }
      }, `Evoke ${count} numen(s) from player memora`);
      break;
    }
    case EffectType.CONVOKE: {
      const count = entry.count || 1;
      const criteria = entry.criteria || {};
      const deck = player.deck;
      apply(() => {
        for (let i = 0; i < count; i++) {
          const idx = findCardIndex(deck, criteria, player);
          if (idx === -1) break;
          const card = deck[idx] as Card;
          player.deck.splice(idx, 1);
          player.fieldNumina.push(card);
          player.numenPositions[card.id] = 'attack';
        }
      }, `Convoke ${count} numen(s) from player deck`);
      break;
    }
  }
  return log;
};

