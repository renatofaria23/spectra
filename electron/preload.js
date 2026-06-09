const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readCards: () => ipcRenderer.invoke('cards:read'),
  saveCards: (cards) => ipcRenderer.invoke('cards:save', cards),
  addCard: (newCard) => ipcRenderer.invoke('cards:add', newCard),
  saveArt: ({ filename, data }) => ipcRenderer.invoke('art:save', { filename, data }),
  readArt: (filename) => ipcRenderer.invoke('art:read', filename),
  listArt: () => ipcRenderer.invoke('art:list'),
  readDecks: () => ipcRenderer.invoke('decks:read'),
  saveDecks: (decks) => ipcRenderer.invoke('decks:save', decks),
});
