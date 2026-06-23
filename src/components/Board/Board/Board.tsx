import React, { useState } from 'react';
import { Box, Text, Button } from '@mantine/core';
import colors from '../../../styles/Colors';
import { Link } from 'react-router-dom';
import useGameStore from '../../../stores/gameStore';
import type { Card } from '../../../logic/deckConstraints';
import DeckSelector from '../DeckSelector/DeckSelector';
import GameBoard from '../GameBoard/GameBoard';
import { boardRoot, linkStyle } from './Board.css';

export const Board = () => {
  const gameActive = useGameStore((s) => s.gameState.gameActive);
  const initializeGame = useGameStore((s) => s.initializeGame);
  const [selectorOpen, setSelectorOpen] = useState(false);

  if (gameActive) return <GameBoard />;

  return (
    <Box style={boardRoot}>
      <Text c={colors.Gray_2} size="xl" fw={700}>Game Board</Text>
      <Button onClick={() => setSelectorOpen(true)} size="lg" styles={{ root: { backgroundColor: colors.Green_6, '&:hover': { backgroundColor: colors.Green_5 } } }}>Play Game</Button>
      <Link to="/card-list" style={linkStyle}><Text c={colors.Blue_3} size="lg" fw={600}>View Card List</Text></Link>
      <Link to="/deck-list" style={linkStyle}><Text c={colors.Blue_3} size="lg" fw={600}>View Deck List</Text></Link>
      <DeckSelector opened={selectorOpen} onClose={() => setSelectorOpen(false)} onStartGame={(p1Deck: Card[], p2Deck: Card[]) => initializeGame(p1Deck, p2Deck)} />
    </Box>
  );
};

export default Board;
