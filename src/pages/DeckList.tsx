import React, { useMemo, useState, useEffect } from 'react';
import { Box, Text, TextInput, Group, Button, Badge } from '@mantine/core';
import { IconPlus, IconSearch, IconTrash, IconPencil } from '@tabler/icons-react';
import colors from '../styles/Colors';
import { Link, useNavigate } from 'react-router-dom';
import { readDecksAsync, deleteDeck, validateDeck, type Deck } from '../services/decksAPI';
import { readCards } from '../services/cardsAPI';
import type { CardData } from '../components/Card/CardTemplate';
import { generateDescription } from '../logic/DescriptionEngine';

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

  const getDeckCardCount = (deck: Deck) => {
    return deck.cards.reduce((sum, c) => sum + c.quantity, 0);
  };

  const getDeckCardDetails = (deck: Deck) => {
    const numina = deck.cards.filter((entry) => {
      const card = allCards.find((c) => c.id === entry.cardId);
      return card?.type === 'numen';
    }).reduce((sum, c) => sum + c.quantity, 0);

    const rites = deck.cards.filter((entry) => {
      const card = allCards.find((c) => c.id === entry.cardId);
      return card?.type === 'rite';
    }).reduce((sum, c) => sum + c.quantity, 0);

    const wards = deck.cards.filter((entry) => {
      const card = allCards.find((c) => c.id === entry.cardId);
      return card?.type === 'ward';
    }).reduce((sum, c) => sum + c.quantity, 0);

    return { numina, rites, wards };
  };

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: colors.White_1,
        padding: '2rem',
        boxSizing: 'border-box',
      }}
    >
      <Text c={colors.Gray_2} size="xl" fw={700}>
        Deck List
      </Text>

      <Text c={colors.Gray_3} size="md" fw={500}>
        Total: {filteredDecks.length} deck{filteredDecks.length !== 1 ? 's' : ''}
      </Text>

      <Group gap="md" style={{ flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
        <TextInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftSection={<IconSearch size={16} color={colors.Gray_3} />}
          label="Filter by Name"
          styles={{
            input: {
              color: colors.Gray_2,
              borderColor: colors.Gray_5,
            },
            label: {
              color: colors.Gray_2,
            },
          }}
        />
      </Group>

      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '100%',
          maxWidth: '600px',
        }}
      >
         {filteredDecks.map((deck) => {
           const count = getDeckCardCount(deck);
           const details = getDeckCardDetails(deck);
           const validation = validateDeck(deck.cards, allCards);

           return (
             <Box
               key={deck.id}
               style={{
                 display: 'flex',
                 justifyContent: 'space-between',
                 alignItems: 'center',
                 padding: '1rem 1.5rem',
                 backgroundColor: colors.Gray_8,
                 borderRadius: '8px',
                 border: `2px solid ${validation.isValid ? colors.Green_6 : colors.Red_8}`,
               }}
             >
               <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                 <Text c={colors.White_1} size="lg" fw={600}>
                   {deck.name}
                 </Text>
                 <Group gap="sm">
                   <Badge c={colors.White_1} style={{ backgroundColor: colors.Blue_5 }}>
                     {count} cards
                   </Badge>
                   <Badge c={colors.White_1} style={{ backgroundColor: colors.Red_11 }}>
                     {details.numina} Numina
                   </Badge>
                   <Badge c={colors.White_1} style={{ backgroundColor: colors.Green_8 }}>
                      {details.rites} Rites
                   </Badge>
                   <Badge c={colors.White_1} style={{ backgroundColor: colors.Red_12 }}>
                     {details.wards} Wards
                   </Badge>
                   {!validation.isValid && (
                     <Badge color="red">Deck is unusable</Badge>
                   )}
                   {validation.isValid && count === 40 && (
                     <Badge color="green">Valid Deck</Badge>
                   )}
                 </Group>
                 {validation.errors.length > 0 && (
                   <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                     {validation.errors.map((err, i) => (
                       <Text key={i} c={colors.Red_4} size="xs" fw={500}>
                         {err}
                       </Text>
                     ))}
                   </Box>
                 )}
               </Box>

              <Group gap="sm">
                <Button
                  size="xs"
                  leftSection={<IconPencil size={12} />}
                  onClick={() => navigate(`/deck-edit/${deck.id}`)}
                  styles={{ root: { backgroundColor: colors.Blue_5, '&:hover': { backgroundColor: colors.Blue_4 } } }}
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  leftSection={<IconTrash size={12} />}
                  onClick={async () => {
                    await deleteDeck(deck.id);
                    setDecks((prev) => prev.filter((d) => d.id !== deck.id));
                  }}
                  styles={{ root: { backgroundColor: colors.Red_8, '&:hover': { backgroundColor: colors.Red_7 } } }}
                >
                  Delete
                </Button>
              </Group>
            </Box>
          );
        })}
      </Box>

      <Button
        leftSection={<IconPlus size={16} />}
        onClick={() => navigate('/deck-creation')}
        styles={{ root: { backgroundColor: colors.Green_6, '&:hover': { backgroundColor: colors.Green_5 } } }}
      >
        Create New Deck
      </Button>

      <Link to="/" style={{ textDecoration: 'none', marginTop: '2rem' }}>
        <Text c={colors.Blue_3} size="lg" fw={600}>
          Back to Board
        </Text>
      </Link>
    </Box>
  );
};

export default DeckList;