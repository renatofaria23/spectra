import type { PlayerState, Card } from './types';

export const getCardById = (cards: Card[], id: string): Card | undefined =>
  cards.find((c) => c.id === id);

export const getTargetCards = (
  target: string,
  player: PlayerState,
  opponent: PlayerState,
  forEachConfig?: any
): Card[] => {
  if (forEachConfig) {
    const { cardType, zone, owner } = forEachConfig;
    const isPlayer = owner === 'player' || owner === 'both';
    const src = isPlayer ? player : opponent;
    const srcCards = zone === 'field' ? src.fieldNumina : zone === 'memora' ? src.memora :
      zone === 'exile' ? src.exiled : zone === 'deck' ? src.deck : zone === 'hand' ? src.hand : [];
    return cardsFilter(cardType, srcCards, player);
  }

  switch (target) {
    case 'self':
      return player.fieldNumina.concat(player.fieldRites, player.fieldWards);
    case 'player':
      return player.fieldNumina.concat(player.fieldRites, player.fieldWards, player.hand, player.deck, player.memora, player.exiled);
    case 'opponent':
      return opponent.fieldNumina.concat(opponent.fieldRites, opponent.fieldWards, opponent.hand, opponent.deck, opponent.memora, opponent.exiled);
    case 'any_numen':
      return player.fieldNumina.concat(opponent.fieldNumina);
    case 'any_rite':
      return player.fieldRites.concat(opponent.fieldRites);
    case 'any_ward':
      return player.fieldWards.concat(opponent.fieldWards);
    case 'all_cards':
      return player.fieldNumina.concat(player.fieldRites, player.fieldWards, player.hand, player.deck, player.memora, player.exiled)
        .concat(opponent.fieldNumina.concat(opponent.fieldRites, opponent.fieldWards, opponent.hand, opponent.deck, opponent.memora, opponent.exiled));
    case 'enemy_numen':
    case 'all_enemy_numina':
      return opponent.fieldNumina;
    case 'allied_numen':
    case 'all_allied_numina':
      return player.fieldNumina;
    case 'allied_non_mythic_numen':
      return player.fieldNumina.filter((c) => !c.isMythic);
    case 'enemy_non_mythic_numen':
      return opponent.fieldNumina.filter((c) => !c.isMythic);
    case 'all_allied_non_mythic_numina':
      return player.fieldNumina.filter((c) => !c.isMythic);
    case 'all_enemy_non_mythic_numina':
      return opponent.fieldNumina.filter((c) => !c.isMythic);
    case 'allied_rite':
      return player.fieldRites;
    case 'enemy_rite':
      return opponent.fieldRites;
    case 'all_allied_rites':
      return player.fieldRites;
    case 'all_enemy_rites':
      return opponent.fieldRites;
    case 'allied_ward':
      return player.fieldWards;
    case 'enemy_ward':
      return opponent.fieldWards;
    case 'all_allied_wards':
      return player.fieldWards;
    case 'all_enemy_wards':
      return opponent.fieldWards;
    case 'opponent_hand':
      return opponent.hand;
    case 'opponent_deck':
      return opponent.deck;
    case 'opponent_memora':
      return opponent.memora;
    case 'opponent_exile':
      return opponent.exiled;
    case 'player_hand':
      return player.hand;
    case 'player_deck':
      return player.deck;
    case 'player_memora':
      return player.memora;
    case 'player_exile':
      return player.exiled;
    default:
      return [];
  }
};

export const findCardIndex = (cards: Card[], criteria: any, player: PlayerState): number => {
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (criteria.name && card.name !== criteria.name) continue;
    if (criteria.level && (card.level as number) !== criteria.level) continue;
    if (criteria.levelMin !== undefined && (card.level as number) < criteria.levelMin) continue;
    if (criteria.levelMax !== undefined && (card.level as number) > criteria.levelMax) continue;
    if (criteria.atkMin !== undefined && (card.baseAttack as number) < criteria.atkMin) continue;
    if (criteria.atkMax !== undefined && (card.baseAttack as number) > criteria.atkMax) continue;
    if (criteria.defMin !== undefined && (card.baseDefense as number) < criteria.defMin) continue;
    if (criteria.defMax !== undefined && (card.baseDefense as number) > criteria.defMax) continue;
    if (criteria.families && criteria.families.length > 0 && !criteria.families.includes(card.numenFamily as string)) continue;
    if (criteria.excludeFamilies && criteria.excludeFamilies.length > 0 && criteria.excludeFamilies.includes(card.numenFamily as string)) continue;
    if (criteria.natures && criteria.natures.length > 0 && !criteria.natures.includes(card.nature as string)) continue;
    if (criteria.excludeNatures && criteria.excludeNatures.length > 0 && criteria.excludeNatures.includes(card.nature as string)) continue;
    if (criteria.rarities && criteria.rarities.length > 0 && !criteria.rarities.includes(card.rarity as string)) continue;
    if (criteria.excludeRarities && criteria.excludeRarities.length > 0 && criteria.excludeRarities.includes(card.rarity as string)) continue;
    return i;
  }
  return -1;
};

const cardsFilter = (cardType: string, cards: Card[], player: PlayerState): Card[] => {
  if (cardType === 'numen') return cards.filter((c) => c.type === 'numen');
  if (cardType === 'rite') return cards.filter((c) => c.type === 'rite');
  if (cardType === 'ward') return cards.filter((c) => c.type === 'ward');
  if (cardType === 'incantation') return cards.filter((c) => c.type === 'numen');
  if (cardType === 'any') return cards;
  return cards;
};
