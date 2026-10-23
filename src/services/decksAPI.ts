import type { CardData } from "../components/Card/CardTemplate/CardTemplate";
import decksData from "../data/decks.json";

const isElectron = () => typeof window !== "undefined" && (window as any).electronAPI != null;

export interface Deck {
  id: string;
  name: string;
  cards: { cardId: string; quantity: number }[];
}

export const readDecksAsync = async (): Promise<Deck[]> =>
  isElectron() ? (window as any).electronAPI.readDecks() : decksData;

export const saveDecksAll = async (decks: Deck[]): Promise<boolean> => {
  if (!isElectron()) return false;
  return (await (window as any).electronAPI.saveDecks(decks)).success;
};

export async function saveDeck(deck: Deck): Promise<void> {
  const decks = await readDecksAsync();
  const i = decks.findIndex((d) => d.id === deck.id);
  if (i >= 0) decks[i] = deck; else decks.push(deck);
  await saveDecksAll(decks);
}

export async function deleteDeck(id: string): Promise<void> {
  await saveDecksAll((await readDecksAsync()).filter((d) => d.id !== id));
}

export function validateDeck(
  deckCards: { cardId: string; quantity: number }[],
  allCards: CardData[],
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const total = deckCards.reduce((s, c) => s + c.quantity, 0);

  if (total !== 40) errors.push(`Deck has ${total} cards. ${total < 40 ? "Minimum" : "Maximum"} is 40.`);

  const mythicCount = deckCards.reduce((s, e) => {
    const card = allCards.find((c) => c.id === e.cardId);
    return card?.rarity === "mythic" ? s + e.quantity : s;
  }, 0);

  if (mythicCount > 1) errors.push("Deck can only contain 1 Mythic card total.");

  const limits: Record<string, [number, string]> = {
    common: [3, "Common"],
    rare: [2, "Rare"],
    legendary: [1, "Legendary"],
    mythic: [1, "Mythic"],
  };

  for (const entry of deckCards) {
    const card = allCards.find((c) => c.id === entry.cardId);
    if (!card) continue;
    const rarity = card.rarity || "common";
    const limit = limits[rarity];
    if (limit && entry.quantity > limit[0])
      errors.push(`${card.name} (${limit[1]}) has ${entry.quantity} copies. Max is ${limit[0]}.`);
  }

  return { isValid: errors.length === 0, errors };
}
