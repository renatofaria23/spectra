import cardsData from '../data/cards.json';
import { regenerateAllDescriptions } from '../logic/descriptionEngine';

declare global {
  interface Window {
    electronAPI: {
      readCards: () => Promise<any[]>;
      saveCards: (cards: any[]) => Promise<{ success: boolean }>;
      addCard: (newCard: any) => Promise<{ success: boolean; card: any }>;
      saveArt: ({ filename, data }: { filename: string; data: string }) => Promise<{ success: boolean; filename?: string }>;
      readArt: (filename: string) => Promise<{ success: boolean; data?: string }>;
      listArt: () => Promise<string[]>;
    };
  }
}

const isElectron = () => typeof window !== 'undefined' && window.electronAPI != null;

export const readCards = async (): Promise<any[]> =>
  isElectron() ? window.electronAPI.readCards() : cardsData;

export const saveCards = async (cards: any[]): Promise<boolean> => {
  if (!isElectron()) return false;
  return (await window.electronAPI.saveCards(cards)).success;
};

export const addCard = async (newCard: any): Promise<boolean> =>
  isElectron() ? saveCards([...await readCards(), newCard]) : false;

export const deleteCard = async (cardId: string): Promise<boolean> =>
  isElectron() ? saveCards((await readCards()).filter((c: any) => c.id !== cardId)) : false;

export const migrateCardDescriptions = async (): Promise<void> => {
  try {
    const cards = await readCards();
    const migrated = regenerateAllDescriptions(cards);
    if (migrated.some((c, i) => c.description !== cards[i]?.description) && isElectron())
      await saveCards(migrated);
  } catch { void 0; }
};

export const saveArt = async (filename: string, data: string): Promise<boolean> => {
  if (!isElectron()) return false;
  return (await window.electronAPI.saveArt({ filename, data })).success;
};

export const readArt = async (filename: string): Promise<string | null> => {
  if (isElectron()) {
    const r = await window.electronAPI.readArt(filename);
    return r.success && r.data ? `data:image/png;base64,${r.data}` : null;
  }
  try {
    const resp = await fetch(`/src/assets/art/${filename}`);
    if (resp.ok) return URL.createObjectURL(await resp.blob());
  } catch { void 0; }
  return null;
};

export const listArt = async (): Promise<string[]> =>
  isElectron() ? window.electronAPI.listArt() : ['placeholder.svg'];
