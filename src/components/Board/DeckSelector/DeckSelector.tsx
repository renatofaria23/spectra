import { useState, useEffect } from 'react';
import { Box, Text, Button, Modal, ScrollArea } from '@mantine/core';
import colors from '../../../styles/Colors';
import * as styles from './DeckSelector.css';
import { readDecksAsync, type Deck, validateDeck } from '../../../services/decksAPI';
import { readCards } from '../../../services/cardsAPI';
import type { CardData } from '../../Card/CardTemplate/CardTemplate';
import { generateDescription } from '../../../logic/descriptionEngine';
import type { Card } from '../../../logic/deckConstraints';

interface DeckSelectorProps {
  opened: boolean;
  onClose: () => void;
  onStartGame: (p1: Card[], p2: Card[]) => void;
}

const expandToCards = (deck: Deck, pool: CardData[]): Card[] => {
  const result: Card[] = [];
  for (const e of deck.cards) {
    const c = pool.find((x) => x.id === e.cardId);
    if (c) {
      for (let i = 0; i < e.quantity; i++) {
        result.push({
          ...c,
          id: `${c.id}_${i}`,
          description: c.triggers ? generateDescription(c.triggers) : '',
        } as Card);
      }
    }
  }
  return result;
};

export const DeckSelector = ({ opened, onClose, onStartGame }: DeckSelectorProps) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [pool, setPool] = useState<CardData[]>([]);
  const [p1, setP1] = useState<string | null>(null);
  const [p2, setP2] = useState<string | null>(null);

  useEffect(() => {
    if (!opened) return;
    (async () => {
      const d = await readDecksAsync();
      setDecks(d);
      const c = await readCards();
      setPool(c.map((r: any) => ({
        ...r,
        description: r.triggers ? generateDescription(r.triggers) : '',
      })));
    })();
  }, [opened]);

  const cardStyle = (sel: boolean, valid: boolean, col: string) => ({
    ...styles.deckCard,
    ...styles.deckCardBase,
    backgroundColor: sel ? col : colors.Gray_6,
    cursor: valid ? 'pointer' : 'not-allowed',
    opacity: valid ? 1 : 0.5,
    border: `2px solid ${sel ? col : 'transparent'}`,
  });

  const renderDeckList = (selected: string | null, onPick: (id: string) => void, selColor: string) => (
    <ScrollArea mah={250}>
      <Box data-name="deck-list" style={styles.deckList}>
        {decks.map((deck) => {
          const v = validateDeck(deck.cards, pool);
          const isSel = selected === deck.id;
          return (
            <Box
              key={deck.id}
              data-name="deck-option"
              onClick={() => onPick(deck.id)}
              style={cardStyle(isSel, v.isValid, selColor)}
            >
              <Text c={colors.White_1} size="sm" fw={600} style={styles.deckOptionText}>
                {deck.name}
              </Text>
              <Text c={colors.Gray_3} size="xs">
                {deck.cards.reduce((s, c) => s + c.quantity, 0)} cards
              </Text>
            </Box>
          );
        })}
      </Box>
    </ScrollArea>
  );

  const handleStart = () => {
    if (!p1 || !p2) return;
    const d1 = decks.find((d) => d.id === p1);
    const d2 = decks.find((d) => d.id === p2);
    if (!d1 || !d2) return;
    onStartGame(expandToCards(d1, pool), expandToCards(d2, pool));
    onClose();
  };

  const bothSelected = p1 && p2;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Select Decks"
      size="lg"
      centered
      styles={{
        title: styles.modalTitle,
        body: styles.modalBody,
        header: styles.modalHeader,
      }}
    >
      <Box data-name="deck-selector-root" style={styles.deckSelectorRoot}>
        <Text c={colors.White_1} size="md" fw={600}>Player 1 - Select Deck:</Text>
        {renderDeckList(p1, setP1, colors.Blue_5)}
        <Text c={colors.White_1} size="md" fw={600}>Player 2 - Select Deck:</Text>
        {renderDeckList(p2, setP2, colors.Red_8)}
        <Button
          onClick={handleStart}
          disabled={!bothSelected}
          styles={{
            root: {
              backgroundColor: bothSelected ? colors.Green_6 : colors.Gray_5,
              '&:hover': {
                backgroundColor: bothSelected ? colors.Green_5 : colors.Gray_5,
              },
            },
          }}
        >
          Start Game
        </Button>
      </Box>
    </Modal>
  );
};

export default DeckSelector;