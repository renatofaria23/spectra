export interface ElectronAPI {
  readCards: () => Promise<any[]>;
  saveCards: (cards: any[]) => Promise<{ success: boolean }>;
  addCard: (newCard: any) => Promise<{ success: boolean; card: any }>;
  saveArt: ({ filename, data }: { filename: string; data: string }) => Promise<{ success: boolean; filename: string }>;
  listArt: () => Promise<string[]>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
