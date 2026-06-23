import React, { useState } from 'react';
import { Box, Text, Button } from '@mantine/core';
import colors from '../../../styles/Colors';
import { Link } from 'react-router-dom';
import useGameStore from '../../../stores/gameStore';
import type { Card } from '../../../logic/deckConstraints';
import DeckSelector from '../DeckSelector/DeckSelector';
import GameBoard from '../GameBoard/GameBoard';

export const Board = () => {
  const gameActive = useGameStore((s) => s.gameState.gameActive);
  const initializeGame = useGameStore((s) => s.initializeGame);
  const [selectorOpen, setSelectorOpen] = useState(false);

  if (gameActive) {
    return <GameBoard />;
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: colors.White_1,
        padding: '2rem',
        boxSizing: 'border-box',
      }}
    >
      <Text c={colors.Gray_2} size="xl" fw={700}>
        Game Board
      </Text>
      <Button
        onClick={() => setSelectorOpen(true)}
        size="lg"
        styles={{ root: { backgroundColor: colors.Green_6, '&:hover': { backgroundColor: colors.Green_5 } } }}
      >
        Play Game
      </Button>
      <Link to="/card-list" style={{ textDecoration: 'none' }}>
        <Text c={colors.Blue_3} size="lg" fw={600}>
          View Card List
        </Text>
      </Link>
      <Link to="/deck-list" style={{ textDecoration: 'none' }}>
        <Text c={colors.Blue_3} size="lg" fw={600}>
          View Deck List
        </Text>
      </Link>

      <DeckSelector
        opened={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onStartGame={(p1Deck: Card[], p2Deck: Card[]) => {
          initializeGame(p1Deck, p2Deck);
        }}
      />
    </Box>
  );
};

export default Board;
