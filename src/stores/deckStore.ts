import { create } from 'zustand';
import { validateDeckComposition, calculateDeckRequirements, getDeckStats, type DeckStats, type NatureScaling } from '../logic/deckConstraints';
import { calculateNatureScaling, type Card } from '../logic/natureScaling';

export interface DeckCard extends Card {
  id: string;
  name: string;
  type: 'numen' | 'rite' | 'ward';
}

type DeckStoreState = {
  currentDeck: DeckCard[];
  deckName: string;
  deckStats: DeckStats | null;
  deckRequirements: ReturnType<typeof calculateDeckRequirements> | null;
  attributeScaling: NatureScaling | null;
  validationErrors: string[];

  createDeck: (name?: string) => void;
  addCardToDeck: (card: DeckCard) => void;
  removeCardFromDeck: (cardId: string, cardIndex: number) => void;
  replaceDeck: (cards: DeckCard[]) => void;
  clearDeck: () => void;
  setDeckName: (name: string) => void;

  getDeck: () => DeckCard[];
  isDeckValid: () => boolean;
  getDeckStats: () => DeckStats | null;
  getNatureScaling: () => NatureScaling | null;
  getValidationErrors: () => string[];
  getDeckComposition: () => {
    name: string;
    cards: DeckCard[];
    stats: DeckStats | null;
    requirements: ReturnType<typeof calculateDeckRequirements> | null;
    attributeScaling: NatureScaling | null;
    isValid: boolean;
    errors: string[];
  };
};

export const useDeckStore = create<DeckStoreState>((set, get) => ({
  currentDeck: [],
  deckName: 'New Deck',
  deckStats: null,
  deckRequirements: null,
  attributeScaling: null,
  validationErrors: [],

  createDeck: (name = 'New Deck') =>
    set({
      currentDeck: [],
      deckName: name,
      deckStats: null,
      deckRequirements: null,
      attributeScaling: null,
      validationErrors: [],
    }),

  addCardToDeck: (card: DeckCard) =>
    set((state) => {
      const newDeck = [...state.currentDeck, card];
      const validation = validateDeckComposition(newDeck);
      const stats = getDeckStats(newDeck);
      const requirements = calculateDeckRequirements(newDeck);
      const numina = newDeck.filter((c) => c.type === 'numen');
      const scaling = calculateNatureScaling(numina as any);

      return {
        currentDeck: newDeck,
        deckStats: stats,
        deckRequirements: requirements,
        attributeScaling: scaling,
        validationErrors: validation.errors,
      };
    }),

  removeCardFromDeck: (cardId: string, cardIndex: number) =>
    set((state) => {
      const newDeck = state.currentDeck.filter((_, idx) => idx !== cardIndex);
      const validation = validateDeckComposition(newDeck);
      const stats = getDeckStats(newDeck);
      const requirements = calculateDeckRequirements(newDeck);
      const numina = newDeck.filter((c) => c.type === 'numen');
      const scaling = calculateNatureScaling(numina as any);

      return {
        currentDeck: newDeck,
        deckStats: stats,
        deckRequirements: requirements,
        attributeScaling: scaling,
        validationErrors: validation.errors,
      };
    }),

  replaceDeck: (cards: DeckCard[]) =>
    set((state) => {
      const validation = validateDeckComposition(cards);
      const stats = getDeckStats(cards);
      const requirements = calculateDeckRequirements(cards);
      const numina = cards.filter((c) => c.type === 'numen');
      const scaling = calculateNatureScaling(numina as any);

      return {
        currentDeck: cards,
        deckStats: stats,
        deckRequirements: requirements,
        attributeScaling: scaling,
        validationErrors: validation.errors,
      };
    }),

  clearDeck: () =>
    set({
      currentDeck: [],
      deckStats: null,
      deckRequirements: null,
      attributeScaling: null,
      validationErrors: [],
    }),

  setDeckName: (name: string) => set({ deckName: name }),

  getDeck: () => get().currentDeck,

  isDeckValid: () => {
    const state = get();
    return state.validationErrors.length === 0;
  },

  getDeckStats: () => get().deckStats,

  getNatureScaling: () => get().attributeScaling,

  getValidationErrors: () => get().validationErrors,

  getDeckComposition: () => {
    const state = get();
    return {
      name: state.deckName,
      cards: state.currentDeck,
      stats: state.deckStats,
      requirements: state.deckRequirements,
      attributeScaling: state.attributeScaling,
      isValid: state.validationErrors.length === 0,
      errors: state.validationErrors,
    };
  },
}));