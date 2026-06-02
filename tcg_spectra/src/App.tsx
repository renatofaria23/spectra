import React from 'react';
import { MantineProvider, Box } from '@mantine/core';
import { theme } from './styles/theme';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Board } from './components/Board/Board';
import { CardList } from './pages/CardList';
import { CardCreation } from './pages/CardCreation';
import { CardEdit } from './pages/CardEdit';
import '@mantine/core/styles.css';
import './App.css';
import colors from './styles/Colors';

function App() {
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
            <Route path="/card-creation" element={<CardCreation />} />
            <Route path="/card-edit/:id" element={<CardEdit />} />
          </Routes>
        </HashRouter>
      </Box>
    </MantineProvider>
  );
}

export default App;