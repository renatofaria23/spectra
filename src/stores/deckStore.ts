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
  natureScaling: NatureScaling | null;
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
  getDeckComposition: () => { name: string; cards: DeckCard[]; stats: DeckStats | null; requirements: ReturnType<typeof calculateDeckRequirements> | null; natureScaling: NatureScaling | null; isValid: boolean; errors: string[] };
};

const emptyState = { currentDeck: [] as DeckCard[], deckStats: null, deckRequirements: null, natureScaling: null, validationErrors: [] as string[] };

const deriveFromDeck = (deck: DeckCard[]) => ({
  currentDeck: deck,
  deckStats: getDeckStats(deck),
  deckRequirements: calculateDeckRequirements(deck),
  natureScaling: calculateNatureScaling(deck.filter(c => c.type === 'numen') as any),
  validationErrors: validateDeckComposition(deck).errors,
});

export const useDeckStore = create<DeckStoreState>((set, get) => ({
  ...emptyState,
  deckName: 'New Deck',

  createDeck: (name = 'New Deck') => set({ ...emptyState, deckName: name }),
  addCardToDeck: (card) => set(s => deriveFromDeck([...s.currentDeck, card])),
  removeCardFromDeck: (_id, idx) => set(s => deriveFromDeck(s.currentDeck.filter((_, i) => i !== idx))),
  replaceDeck: (cards) => set(() => deriveFromDeck(cards)),
  clearDeck: () => set(emptyState),
  setDeckName: (name) => set({ deckName: name }),

  getDeck: () => get().currentDeck,
  isDeckValid: () => get().validationErrors.length === 0,
  getDeckStats: () => get().deckStats,
  getNatureScaling: () => get().natureScaling,
  getValidationErrors: () => get().validationErrors,
  getDeckComposition: () => {
    const { deckName: name, currentDeck: cards, deckStats: stats, deckRequirements: requirements, natureScaling, validationErrors } = get();
    return { name, cards, stats, requirements, natureScaling, isValid: validationErrors.length === 0, errors: validationErrors };
  },
}));