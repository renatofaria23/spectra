import React, { useMemo, useState, useEffect } from 'react';
import { Box, Text, TextInput, Group, Button, Badge } from '@mantine/core';
import { IconPlus, IconSearch, IconTrash, IconPencil } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { readDecksAsync, deleteDeck, validateDeck, type Deck } from '../../services/decksAPI';
import { readCards } from '../../services/cardsAPI';
import type { CardData } from '../../components/Card/CardTemplate/CardTemplate';
import { generateDescription } from '../../logic/descriptionEngine';
import colors from '../../styles/Colors';
import * as s from './DeckList.css';

export const DeckList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [decks, setDecks] = useState<Deck[]>([]);
  const [allCards, setAllCards] = useState<CardData[]>([]);

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
    loadData();
  }, []);

  const filteredDecks = useMemo(() => {
    if (searchQuery.trim() === '') return decks;
    const query = searchQuery.toLowerCase();
    return decks.filter((d) => d.name.toLowerCase().includes(query));
  }, [decks, searchQuery]);

  const getDeckCardCount = (deck: Deck) => deck.cards.reduce((sum, c) => sum + c.quantity, 0);

  const getDeckCardDetails = (deck: Deck) => {
    const numina = deck.cards.filter((e) => allCards.find((c) => c.id === e.cardId)?.type === 'numen').reduce((s, c) => s + c.quantity, 0);
    const rites = deck.cards.filter((e) => allCards.find((c) => c.id === e.cardId)?.type === 'rite').reduce((s, c) => s + c.quantity, 0);
    const wards = deck.cards.filter((e) => allCards.find((c) => c.id === e.cardId)?.type === 'ward').reduce((s, c) => s + c.quantity, 0);
    return { numina, rites, wards };
  };

  return (
    <Box data-name="deck-list-container" style={s.deckListContainer}>
      <Text c={colors.Gray_2} size="xl" fw={700}>Deck List</Text>
      <Text c={colors.Gray_3} size="md" fw={500}>
        Total: {filteredDecks.length} deck{filteredDecks.length !== 1 ? 's' : ''}
      </Text>
      <Group data-name="filter-group" style={s.filterGroup}>
        <TextInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftSection={<IconSearch size={16} color={colors.Gray_3} />}
          label="Filter by Name"
          styles={{ input: { color: colors.Gray_2, borderColor: colors.Gray_5 }, label: { color: colors.Gray_2 } }}
        />
      </Group>
      <Box data-name="deck-list-grid" style={s.deckListGrid}>
        {filteredDecks.map((deck) => {
          const count = getDeckCardCount(deck);
          const details = getDeckCardDetails(deck);
          const validation = validateDeck(deck.cards, allCards);
          return (
            <Box
              data-name="deck-item"
              key={deck.id}
              style={{ ...s.deckItem, border: `2px solid ${validation.isValid ? colors.Green_6 : colors.Red_8}` }}
            >
              <Box data-name="deck-info-box" style={s.deckInfoBox}>
                <Text c={colors.White_1} size="lg" fw={600}>{deck.name}</Text>
                <Group data-name="deck-badges-group">
                  <Badge style={s.badgeCount}>{count} cards</Badge>
                  <Badge style={s.badgeNumina}>{details.numina} Numina</Badge>
                  <Badge style={s.badgeRites}>{details.rites} Rites</Badge>
                  <Badge style={s.badgeWards}>{details.wards} Wards</Badge>
                  {!validation.isValid && <Badge color="red">Deck is unusable</Badge>}
                  {validation.isValid && count === 40 && <Badge color="green">Valid Deck</Badge>}
                </Group>
                {validation.errors.length > 0 && (
                  <Box data-name="validation-errors-box" style={s.validationErrorsBox}>
                    {validation.errors.map((err, i) => (
                      <Text key={i} c={colors.Red_4} size="xs" fw={500}>{err}</Text>
                    ))}
                  </Box>
                )}
              </Box>
              <Group data-name="deck-action-group">
                <Button
                  size="xs"
                  leftSection={<IconPencil size={12} />}
                  onClick={() => navigate(`/deck-edit/${deck.id}`)}
                  styles={{ root: { ...s.buttonEdit, '&:hover': s.buttonEditHover } }}
                >Edit</Button>
                <Button
                  size="xs"
                  leftSection={<IconTrash size={12} />}
                  onClick={async () => { await deleteDeck(deck.id); setDecks((p) => p.filter((d) => d.id !== deck.id)); }}
                  styles={{ root: { ...s.buttonDelete, '&:hover': s.buttonDeleteHover } }}
                >Delete</Button>
              </Group>
            </Box>
          );
        })}
      </Box>
      <Button
        leftSection={<IconPlus size={16} />}
        onClick={() => navigate('/deck-creation')}
        styles={{ root: { ...s.buttonCreate, '&:hover': s.buttonCreateHover } }}
      >Create New Deck</Button>
      <Link to="/" style={s.linkStyle}>
        <Text c={colors.Blue_3} size="lg" fw={600}>Back to Board</Text>
      </Link>
    </Box>
  );
};

export default DeckList;