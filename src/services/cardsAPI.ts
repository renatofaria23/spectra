import cardsData from '../data/cards.json';
import { regenerateAllDescriptions } from '../logic/DescriptionEngine';

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

function isElectron() {
  return typeof window !== 'undefined' && window.electronAPI != null;
}

export const readCards = async (): Promise<any[]> => {
  if (isElectron()) {
    return window.electronAPI.readCards();
  }
  return cardsData;
};

export const addCard = async (newCard: any): Promise<boolean> => {
  if (isElectron()) {
    const cards = await readCards();
    return saveCards([...cards, newCard]);
  }
  return false;
};

export const saveCards = async (cards: any[]): Promise<boolean> => {
  if (isElectron()) {
    const result = await window.electronAPI.saveCards(cards);
    return result.success;
  }
  return false;
};

export const migrateCardDescriptions = async (): Promise<void> => {
  try {
    const cards = await readCards();
    const migrated = regenerateAllDescriptions(cards);
    const hasChanges = migrated.some((c, i) => c.description !== cards[i]?.description);
    if (hasChanges && isElectron()) {
      await saveCards(migrated);
    }
  } catch { /* ignore migration errors */ }
};

export const saveArt = async (filename: string, data: string): Promise<boolean> => {
  if (isElectron()) {
    const result = await window.electronAPI.saveArt({ filename, data });
    return result.success;
  }
  return false;
};

export const deleteCard = async (cardId: string): Promise<boolean> => {
  if (isElectron()) {
    const cards = await readCards();
    const filtered = cards.filter((c: any) => c.id !== cardId);
    return saveCards(filtered);
  }
  return false;
};

export const readArt = async (filename: string): Promise<string | null> => {
  if (isElectron()) {
    const result = await window.electronAPI.readArt(filename);
    if (result.success && result.data) {
      return `data:image/png;base64,${result.data}`;
    }
    return null;
  }
  try {
    const resp = await fetch(`/src/assets/art/${filename}`);
    if (resp.ok) {
      const blob = await resp.blob();
      return URL.createObjectURL(blob);
    }
  } catch { /* ignore */ }
  return null;
};

export const listArt = async (): Promise<string[]> => {
  if (isElectron()) {
    return window.electronAPI.listArt();
  }
  return ['placeholder.svg'];
};
