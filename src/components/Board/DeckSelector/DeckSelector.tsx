import { useState, useEffect } from 'react';
import { Box, Text, Button, Modal, ScrollArea } from '@mantine/core';
import colors from '../../../styles/Colors';
import * as styles from './DeckSelector.css';
import { readDecksAsync, type Deck, validateDeck } from '../../../services/decksAPI';
import { readCards } from '../../../services/cardsAPI';
import type { CardData } from '../Card/CardTemplate';
import { generateDescription } from '../../../logic/DescriptionEngine';
import type { Card } from '../../../logic/deckConstraints';

interface DeckSelectorProps {
  opened: boolean;
  onClose: () => void;
  onStartGame: (p1Deck: Card[], p2Deck: Card[]) => void;
}

const expandDeckToCards = (deck: Deck, allCards: CardData[]): Card[] => {
  const cards: Card[] = [];
  for (const entry of deck.cards) {
    const cardData = allCards.find((c) => c.id === entry.cardId);
    if (cardData) {
      for (let i = 0; i < entry.quantity; i++) {
        cards.push({
          ...cardData,
          id: cardData.id + '_' + i,
          description: cardData.triggers ? generateDescription(cardData.triggers) : '',
        } as Card);
      }
    }
  }
  return cards;
};

export const DeckSelector = ({ opened, onClose, onStartGame }: DeckSelectorProps) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [allCards, setAllCards] = useState<CardData[]>([]);
  const [p1Selected, setP1Selected] = useState<string | null>(null);
  const [p2Selected, setP2Selected] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const loadedDecks = await readDecksAsync();
      setDecks(loadedDecks);
      const loadedCards = await readCards();
      const processed = loadedCards.map((raw: any) => ({
        ...raw,
        description: raw.triggers ? generateDescription(raw.triggers) : '',
      }));
      setAllCards(processed);
    };
    if (opened) {
      loadData();
    }
  }, [opened]);

  const getDeckCardStyle = (isSelected: boolean, isValid: boolean, selectedColor: string) => ({
    ...styles.deckCard,
    ...styles.deckCardBase,
    backgroundColor: isSelected ? selectedColor : colors.Gray_6,
    cursor: isValid ? 'pointer' : 'not-allowed',
    opacity: isValid ? 1 : 0.5,
    border: `2px solid ${isSelected ? selectedColor : 'transparent'}`,
  });

  const handleStart = () => {
    if (!p1Selected || !p2Selected) return;
    const p1Deck = decks.find((d) => d.id === p1Selected);
    const p2Deck = decks.find((d) => d.id === p2Selected);
    if (!p1Deck || !p2Deck) return;

    const p1Cards = expandDeckToCards(p1Deck, allCards);
    const p2Cards = expandDeckToCards(p2Deck, allCards);
    onStartGame(p1Cards, p2Cards);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Select Decks"
      size="lg"
      centered
      styles={{
        title: { color: colors.White_1 },
        body: { backgroundColor: colors.Gray_7 },
        header: { backgroundColor: colors.Gray_8 },
      }}
    >
      <Box data-name="deck-selector-root" style={styles.deckSelectorRoot}>
        <Text c={colors.White_1} size="md" fw={600}>Player 1 - Select Deck:</Text>
        <ScrollArea mah={250}>
          <Box data-name="deck-list" style={styles.deckList}>
            {decks.map((deck) => {
              const validation = validateDeck(deck.cards, allCards);
              const isSelected = p1Selected === deck.id;
              return (
                <Box
                  key={deck.id}
                  data-name="deck-option"
                  onClick={() => setP1Selected(deck.id)}
                  style={{
                    ...styles.deckCard,
                    ...styles.deckCardBase,
                    backgroundColor: isSelected ? colors.Blue_5 : colors.Gray_6,
                    cursor: validation.isValid ? 'pointer' : 'not-allowed',
                    opacity: validation.isValid ? 1 : 0.5,
                    border: `2px solid ${isSelected ? colors.Blue_3 : 'transparent'}`,
                  }}
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

        <Text c={colors.White_1} size="md" fw={600}>Player 2 - Select Deck:</Text>
        <ScrollArea mah={250}>
          <Box data-name="deck-list" style={styles.deckList}>
            {decks.map((deck) => {
              const validation = validateDeck(deck.cards, allCards);
              const isSelected = p2Selected === deck.id;
              return (
                <Box
                  key={deck.id}
                  data-name="deck-option"
                  onClick={() => setP2Selected(deck.id)}
                  style={{
                    ...styles.deckCard,
                    ...styles.deckCardBase,
                    backgroundColor: isSelected ? colors.Red_8 : colors.Gray_6,
                    cursor: validation.isValid ? 'pointer' : 'not-allowed',
                    opacity: validation.isValid ? 1 : 0.5,
                    border: `2px solid ${isSelected ? colors.Red_5 : 'transparent'}`,
                  }}
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

        <Button
          onClick={handleStart}
          disabled={!p1Selected || !p2Selected}
          styles={{
            root: {
              backgroundColor: (p1Selected && p2Selected) ? colors.Green_6 : colors.Gray_5,
              '&:hover': {
                backgroundColor: (p1Selected && p2Selected) ? colors.Green_5 : colors.Gray_5,
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