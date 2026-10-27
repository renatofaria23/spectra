import { EffectType, type EffectEntry, type ForEachConfig } from './effects';
import type { PlayerState, Card } from './types';
import { getTargetCards, getCardById, findCardIndex } from './effectsExecutor_common';

export const executeEffect = (
  entry: EffectEntry,
  player: PlayerState,
  opponent: PlayerState,
  target?: string,
  forEachConfig?: ForEachConfig
): string[] => {
  const log: string[] = [];
  const apply = (fn: () => void, msg: string) => { fn(); log.push(msg); };

  switch (entry.effect) {
    case EffectType.DRAW: {
      const count = entry.count || 1;
      const targetId = entry.target || 'player';
      const t = targetId === 'player' ? player : opponent;
      apply(() => {
        for (let i = 0; i < count; i++) {
          if (t.deck.length > 0) t.hand.push(t.deck.shift() as Card);
        }
      }, `${t.playerId} drew ${count} card(s)`);
      break;
    }
    case EffectType.SCRY: {
      const count = entry.count || 1;
      const targetId = entry.deck || 'player';
      const targetPlayer = targetId === 'player' ? player : opponent;
      const deck = targetPlayer.deck;
      apply(() => {
        for (let i = 0; i < count; i++) {
          if (deck.length > 0) {
            const card = deck.shift() as Card;
            deck.unshift(card);
          }
        }
      }, `${targetPlayer.playerId} scried ${count} card(s)`);
      break;
    }
    case EffectType.FORGET: {
      const count = entry.count || 1;
      const effectTarget = entry.effectTarget || 'self';
      const cards = getTargetCards(effectTarget, player, opponent, forEachConfig);
      apply(() => { cards.splice(0, count); }, `Forget ${count} card(s) targeting ${effectTarget}`);
      break;
    }
    case EffectType.EXILE: {
      const count = entry.count || 1;
      const effectTarget = entry.effectTarget || 'self';
      const source = entry.from || effectTarget;
      const cards = getTargetCards(effectTarget, player, opponent, forEachConfig);
      apply(() => { cards.splice(0, count); }, `Exile ${count} card(s) from ${source}`);
      break;
    }
    case EffectType.PETRIFY: {
      const turns = entry.turns || 1;
      const effectTarget = entry.effectTarget || 'self';
      const cards = getTargetCards(effectTarget, player, opponent, forEachConfig);
      apply(() => {
        cards.forEach((card) => {
          (card as any).petrified = true;
          (card as any).petrifyDuration = (card as any).petrifyDuration || 0;
          (card as any).petrifyDuration += turns;
        });
      }, `Petrify ${cards.length} card(s) for ${turns} turn(s)`);
      break;
    }
    case EffectType.DECREASE:
    case EffectType.INCREASE: {
      const amount = entry.amount || 0;
      const isDecrease = entry.effect === EffectType.DECREASE;
      const t = entry.target as 'numen' | 'self' | 'player' | 'opponent';
      const effectTarget = entry.effectTarget || 'atk';
      const stat = effectTarget === 'hp' ? 'currentHP' : effectTarget === 'mana' ? 'currentMana' : 'currentAttack';
      const cardId = (entry as any).cardId as string;
      const card = cardId ? getCardById(player.fieldNumina, cardId) || getCardById(opponent.fieldNumina, cardId) : undefined;
      apply(() => {
        if (card) (card as any)[stat] = isDecrease
          ? Math.max(0, (card as any)[stat] - amount)
          : (card as any)[stat] + amount;
        else if (t === 'player') player.currentHP = isDecrease
          ? Math.max(0, player.currentHP - amount)
          : player.currentHP + amount;
        else if (t === 'opponent') opponent.currentHP = isDecrease
          ? Math.max(0, opponent.currentHP - amount)
          : opponent.currentHP + amount;
        else if (t === 'self') (player as any)[stat] = isDecrease
          ? Math.max(0, (player as any)[stat] - amount)
          : (player as any)[stat] + amount;
      }, `${isDecrease ? 'Decrease' : 'Increase'} ${t || 'self'} ${effectTarget} by ${amount}`);
      break;
    }
    case EffectType.LOCK: {
      const turns = entry.turns || 1;
      const effectTarget = entry.effectTarget || 'self';
      const cards = getTargetCards(effectTarget, player, opponent, forEachConfig);
      apply(() => {
        cards.forEach((card) => {
          (card as any).locked = true;
          (card as any).lockDuration = (card as any).lockDuration || 0;
          (card as any).lockDuration += turns;
        });
      }, `Lock ${cards.length} card(s) for ${turns} turn(s)`);
      break;
    }
    case EffectType.ETHEREAL: {
      const effectTarget = entry.effectTarget || 'self';
      const cards = getTargetCards(effectTarget, player, opponent, forEachConfig);
      apply(() => {
        cards.forEach((card) => {
          (card as any).ethereal = true;
          (card as any).etherealDuration = (card as any).etherealDuration || 0;
          (card as any).etherealDuration += 1;
        });
      }, `Etherealize ${cards.length} card(s)`);
      break;
    }
    case EffectType.FIND:
      apply(() => {}, `Find card(s) from ${entry.source || 'deck'}`);
      break;
    case EffectType.CHOOSE_ONE:
      apply(() => {}, 'Choose one option');
      break;
    case EffectType.ADD_TRIGGER: {
      const triggerType = entry.trigger_type as string;
      const effectTarget = entry.effectTarget || 'self';
      const cards = getTargetCards(effectTarget, player, opponent, forEachConfig);
      apply(() => {
        cards.forEach((card) => {
          if (!card.triggers) (card as any).triggers = [];
          if (!Array.isArray(card.triggers)) (card as any).triggers = [card.triggers];
          if (!(card as any).triggers?.includes(triggerType)) (card as any).triggers.push(triggerType);
        });
      }, `Add trigger ${triggerType}`);
      break;
    }
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
    default:
      break;
  }

  return log;
};

export { getTargetCards, getCardById, findCardIndex } from './effectsExecutor_common';
