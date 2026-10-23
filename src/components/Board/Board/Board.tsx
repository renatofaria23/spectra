import React, { useState, useEffect } from 'react';
import { Box, Text, Button, Menu } from '@mantine/core';
import colors from '../../../styles/Colors';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../../../stores/gameStore';
import type { Card } from '../../../logic/deckConstraints';
import DeckSelector from '../DeckSelector/DeckSelector';
import GameBoard from '../GameBoard/GameBoard';
import { boardRoot, playButton, menuButton, optionsButton, exitButton } from './Board.css';

export const Board = () => {
  const gameActive = useGameStore((s) => s.gameState.gameActive);
  const initializeGame = useGameStore((s) => s.initializeGame);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('fullscreen');
    if (stored === 'true') {
      requestFullscreen(true);
    }
    syncFullscreenState();
  }, []);

  const syncFullscreenState = async () => {
    if ((window as any).electronAPI) {
      const current = await (window as any).electronAPI.isFullscreen();
      setIsFullscreen(current);
    } else {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
  };

  const requestFullscreen = async (value: boolean) => {
    if ((window as any).electronAPI) {
      const result = await (window as any).electronAPI.setFullscreen(value);
      setIsFullscreen(result.fullscreen);
    } else if (value) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
    localStorage.setItem('fullscreen', String(value));
  };

  const toggleFullscreen = () => {
    requestFullscreen(!isFullscreen);
  };

  const exitGame = async () => {
    if ((window as any).electronAPI) {
      await (window as any).electronAPI.quitApp();
    } else {
      window.close();
    }
  };

  if (gameActive) return <GameBoard />;

  return (
    <Box style={boardRoot}>
      <Text c={colors.Gray_2} size='xl' fw={700}>Game Board</Text>
      <Button onClick={() => setSelectorOpen(true)} size='lg' style={playButton}>Play Game</Button>
      <Button onClick={() => navigate('/card-list')} size='lg' style={menuButton}>View Card List</Button>
      <Button onClick={() => navigate('/deck-list')} size='lg' style={menuButton}>View Deck List</Button>
      <Menu opened={optionsOpen} onChange={setOptionsOpen}>
        <Menu.Target>
          <Button size='lg' style={optionsButton}>Options</Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={toggleFullscreen}>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <Button onClick={exitGame} size='lg' style={exitButton}>Exit Game</Button>
      <DeckSelector opened={selectorOpen} onClose={() => setSelectorOpen(false)} onStartGame={(p1Deck: Card[], p2Deck: Card[]) => initializeGame(p1Deck, p2Deck)} />
    </Box>
  );
};

export default Board;
