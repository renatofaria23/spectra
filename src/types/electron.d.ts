export interface ElectronAPI {
  readCards: () => Promise<any[]>;
  saveCards: (cards: any[]) => Promise<{ success: boolean }>;
  addCard: (newCard: any) => Promise<{ success: boolean; card: any }>;
  saveArt: ({ filename, data }: { filename: string; data: string }) => Promise<{ success: boolean; filename: string }>;
  listArt: () => Promise<string[]>;
  readDecks: () => Promise<any[]>;
  saveDecks: (decks: any[]) => Promise<{ success: boolean }>;
  setFullscreen: (value: boolean) => Promise<{ success: boolean; fullscreen: boolean }>;
  isFullscreen: () => Promise<boolean>;
  quitApp: () => Promise<{ success: boolean }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
