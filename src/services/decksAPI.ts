import type { CardData } from "../components/Card/CardTemplate/CardTemplate";
import decksData from "../data/decks.json";

function isElectron() {
  return typeof window !== "undefined" && (window as any).electronAPI != null;
}

export interface Deck {
  id: string;
  name: string;
  cards: { cardId: string; quantity: number }[];
}

export const readDecksAsync = async (): Promise<Deck[]> => {
  if (isElectron()) {
    return (window as any).electronAPI.readDecks();
  }
  return decksData;
};

export const saveDecksAll = async (decks: Deck[]): Promise<boolean> => {
  if (isElectron()) {
    const result = await (window as any).electronAPI.saveDecks(decks);
    return result.success;
  }
  return false;
};

export async function saveDeck(deck: Deck): Promise<void> {
  const decks = await readDecksAsync();
  const index = decks.findIndex((d) => d.id === deck.id);
  if (index >= 0) {
    decks[index] = deck;
  } else {
    decks.push(deck);
  }
  await saveDecksAll(decks);
}

export async function deleteDeck(id: string): Promise<void> {
  const decks = await readDecksAsync();
  await saveDecksAll(decks.filter((d) => d.id !== id));
}

export function validateDeck(
  deckCards: { cardId: string; quantity: number }[],
  allCards: CardData[],
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const totalCards = deckCards.reduce((sum, c) => sum + c.quantity, 0);

  if (totalCards < 40) {
    errors.push(`Deck has ${totalCards} cards. Minimum is 40.`);
  }

  if (totalCards > 40) {
    errors.push(`Deck has ${totalCards} cards. Maximum is 40.`);
  }

  const mythicCount = deckCards.reduce((sum, entry) => {
    const card = allCards.find((c) => c.id === entry.cardId);
    if (card && card.rarity === "mythic") {
      return sum + entry.quantity;
    }
    return sum;
  }, 0);

  if (mythicCount > 1) {
    errors.push("Deck can only contain 1 Mythic card total.");
  }

  for (const entry of deckCards) {
    const card = allCards.find((c) => c.id === entry.cardId);
    if (!card) continue;

    const rarity = card.rarity || "common";

    if (rarity === "common" && entry.quantity > 3) {
      errors.push(
        `${card.name} (Common) has ${entry.quantity} copies. Max is 3.`,
      );
    }

    if (rarity === "rare" && entry.quantity > 2) {
      errors.push(
        `${card.name} (Rare) has ${entry.quantity} copies. Max is 2.`,
      );
    }

    if (rarity === "legendary" && entry.quantity > 1) {
      errors.push(
        `${card.name} (Legendary) has ${entry.quantity} copies. Max is 1.`,
      );
    }

    if (rarity === "mythic" && entry.quantity > 1) {
      errors.push(
        `${card.name} (Mythic) has ${entry.quantity} copies. Max is 1.`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
