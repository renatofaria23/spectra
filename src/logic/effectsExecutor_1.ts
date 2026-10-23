import { EffectType, type EffectEntry, type ForEachConfig, type InvokeCriteria } from './effects';
import type { PlayerState, Card } from './types';
import { getTargetCards, getCardById } from './effectsExecutor_common';

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
      const target = targetId === 'player' ? player : opponent;
      apply(() => {
        for (let i = 0; i < count; i++) {
          if (target.deck.length > 0) target.hand.push(target.deck.shift() as Card);
        }
      }, `${target.playerId} drew ${count} card(s)`);
      break;
    }
    case EffectType.SCRY: {
      const count = entry.count || 1;
      const deck = entry.deck === 'player' ? player.deck : opponent.deck;
      apply(() => {
        for (let i = 0; i < count; i++) {
          if (deck.length > 0) {
            const card = deck.shift() as Card;
            deck.unshift(card);
          }
        }
      }, `${target.playerId} scried ${count} card(s)`);
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
      const target = entry.target as 'numen' | 'self' | 'player' | 'opponent';
      const effectTarget = entry.effectTarget || 'atk';
      const stat = effectTarget === 'hp' ? 'currentHP' : effectTarget === 'mana' ? 'currentMana' : 'currentAttack';
      const cardId = entry.cardId as string;
      const card = cardId ? getCardById(player.fieldNumina, cardId) || getCardById(opponent.fieldNumina, cardId) : undefined;
      apply(() => {
        if (card) (card as any)[stat] = isDecrease
          ? Math.max(0, (card as any)[stat] - amount)
          : (card as any)[stat] + amount;
        else if (target === 'player') player.currentHP = isDecrease
          ? Math.max(0, player.currentHP - amount)
          : player.currentHP + amount;
        else if (target === 'opponent') opponent.currentHP = isDecrease
          ? Math.max(0, opponent.currentHP - amount)
          : opponent.currentHP + amount;
        else if (target === 'self') (player as any)[stat] = isDecrease
          ? Math.max(0, (player as any)[stat] - amount)
          : (player as any)[stat] + amount;
      }, `${isDecrease ? 'Decrease' : 'Increase'} ${target || 'self'} ${effectTarget} by ${amount}`);
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
      const count = entry.count || 1;
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
          if (!card.triggers.includes(triggerType)) (card as any).triggers.push(triggerType);
        });
      }, `Add trigger ${triggerType}`);
      break;
    }
  }
  return log;
};
