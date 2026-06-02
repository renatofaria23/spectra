import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile, readdir } from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;

const getCardsPath = () => {
  return path.join(process.resourcesPath, 'src', 'data', 'cards.json');
};

const getCwdCardsPath = () => {
  return path.join(process.cwd(), 'src', 'data', 'cards.json');
};

const readCards = async () => {
  try {
    const devPath = getCwdCardsPath();
    const data = await readFile(devPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeCards = async (cards) => {
  const devPath = getCwdCardsPath();
  await writeFile(devPath, JSON.stringify(cards, null, 2), 'utf-8');
};

ipcMain.handle('cards:read', async () => {
  return await readCards();
});

ipcMain.handle('cards:save', async (_event, cards) => {
  await writeCards(cards);
  return { success: true };
});

ipcMain.handle('cards:add', async (_event, newCard) => {
  const cards = await readCards();
  cards.push(newCard);
  await writeCards(cards);
  return { success: true, card: newCard };
});

ipcMain.handle('art:save', async (_event, { filename, data }) => {
  const devPath = path.join(process.cwd(), 'src', 'assets', 'art', filename);
  const base64Data = data.split(',')[0].includes('base64') ? data.split(',')[1] : data;
  const buffer = Buffer.from(base64Data, 'base64');
  await writeFile(devPath, buffer);
  return { success: true, filename };
});

ipcMain.handle('art:read', async (_event, filename) => {
  const artPath = path.join(process.cwd(), 'src', 'assets', 'art', filename);
  try {
    const data = await readFile(artPath);
    return { success: true, data: data.toString('base64') };
  } catch {
    return { success: false };
  }
});

ipcMain.handle('art:list', async () => {
  const artPath = path.join(process.cwd(), 'src', 'assets', 'art');
  try {
    const files = await readdir(artPath);
    return files.filter(f => /\.(png|jpe?g|gif|webp|svg)$/i.test(f));
  } catch {
    return ['placeholder.svg'];
  }
});

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
       preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

  mainWindow.loadURL(VITE_DEV_SERVER_URL);
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});