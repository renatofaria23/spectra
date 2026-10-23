import { EffectType, type EffectEntry, type ForEachConfig, type InvokeCriteria } from './effects';
import type { PlayerState, Card } from './types';
import { getTargetCards, getCardById } from './effectsExecutor_common';

export const executeOtherEffects2 = (
  entry: EffectEntry,
  player: PlayerState,
  opponent: PlayerState,
  forEachConfig?: ForEachConfig
): string[] => {
  const log: string[] = [];
  const apply = (fn: () => void, msg: string) => { fn(); log.push(msg); };

  switch (entry.effect) {
    case EffectType.COPY: {
      const copyTarget = entry.copyTarget || '';
      const destination = entry.destination || '';
      const count = entry.count || 1;
      const card = getTargetCards(copyTarget, player, opponent, forEachConfig)[0];
      apply(() => {
        if (card) {
          for (let i = 0; i < count; i++) {
            const copy = { ...card, id: `${card.id}_copy_${Date.now()}_${i}` };
            if (destination.includes('field')) { player.fieldNumina.push(copy); player.numenPositions[copy.id] = 'attack'; }
            else if (destination.includes('deck')) player.deck.push(copy);
            else if (destination.includes('hand')) player.hand.push(copy);
            else if (destination.includes('memora')) player.memora.push(copy);
            else if (destination.includes('exile')) player.exiled.push(copy);
          }
        }
      }, `Copy ${count} card(s) to ${destination}`);
      break;
    }
    case EffectType.ADD: {
      const addFrom = entry.addFrom || 'player_field';
      const destination = entry.destination || 'player_deck';
      const count = entry.count || 1;
      const cards = getTargetCards(addFrom, player, opponent, forEachConfig);
      apply(() => {
        cards.forEach((card) => {
          if (destination.includes('deck') && card.type === 'numen') player.deck.push(card);
          else if (destination.includes('memora') && card.type === 'numen') player.memora.push(card);
          else if (destination.includes('hand')) player.hand.push(card);
        });
      }, `Add ${count} card(s) to ${destination}`);
      break;
    }
    case EffectType.RETURN: {
      const count = entry.count || 1;
      const returnDestination = entry.returnDestination || 'hand';
      const returnTarget = entry.returnTarget || 'self';
      const cards = getTargetCards(returnTarget, player, opponent, forEachConfig);
      apply(() => {
        cards.forEach((card) => {
          if (returnDestination === 'hand') player.hand.push(card);
          else if (returnDestination === 'deck') player.deck.push(card);
          else if (returnDestination === 'memora') player.memora.push(card);
          else if (returnDestination === 'exile') player.exiled.push(card);
        });
      }, `Return ${count} card(s) to ${returnDestination}`);
      break;
    }
  }
  return log;
};

