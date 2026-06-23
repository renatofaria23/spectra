import React, { useEffect } from 'react';
import { MantineProvider, Box } from '@mantine/core';
import { theme } from './styles/theme';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Board } from './components/Board/Board/Board';
import { CardList } from './pages/CardList/CardList';
import { CardEditor } from './pages/CardEditor/CardEditor';
import { DeckList } from './pages/DeckList/DeckList';
import { DeckEditor } from './pages/DeckEditor/DeckEditor';
import { migrateCardDescriptions } from './services/cardsAPI';
import '@mantine/core/styles.css';
import './App.css';

function App() {
  useEffect(() => {
    migrateCardDescriptions();
  }, []);

  return (
    <MantineProvider theme={theme}>
      <Box
        style={{
          width: '100%',
          minHeight: '100vh',
        }}
      >
        <HashRouter>
          <Routes>
            <Route path="/" element={<Board />} />
            <Route path="/card-list" element={<CardList />} />
            <Route path="/card-creation" element={<CardEditor />} />
            <Route path="/card-edit/:id" element={<CardEditor />} />
            <Route path="/deck-list" element={<DeckList />} />
            <Route path="/deck-creation" element={<DeckEditor />} />
            <Route path="/deck-edit/:id" element={<DeckEditor />} />
          </Routes>
        </HashRouter>
      </Box>
    </MantineProvider>
  );
}

export default App;