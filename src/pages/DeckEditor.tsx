import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, TextInput, Button, Group, ScrollArea, Badge, NumberInput } from '@mantine/core';
import { IconDeviceFloppy, IconSearch, IconPlus, IconMinus, IconX } from '@tabler/icons-react';
import colors from '../styles/Colors';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { readCards } from '../services/cardsAPI';
import { readDecksAsync, saveDeck, type Deck } from '../services/decksAPI';
import { validateDeck } from '../services/decksAPI';
import type { CardData } from '../components/Card/CardTemplate';
import { generateDescription } from '../logic/DescriptionEngine';
import { CardTemplate } from '../components/Card/CardTemplate';

interface DeckEntry {
  cardId: string;
  quantity: number;
}

export const DeckEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [allCards, setAllCards] = useState<CardData[]>([]);
  const [deckName, setDeckName] = useState('');
  const [deckEntries, setDeckEntries] = useState<DeckEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [availableCards, setAvailableCards] = useState<CardData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const loadedCards = await readCards();
      const processed = loadedCards.map((raw: any) => ({
        ...raw,
        description: raw.triggers ? generateDescription(raw.triggers) : '',
      }));
      setAllCards(processed);
      setAvailableCards(processed);

      if (isEditMode && id) {
        const decks = await readDecksAsync();
        const deck = decks.find((d: Deck) => d.id === id);
        if (deck) {
          setDeckName(deck.name);
          setDeckEntries(deck.cards);
        } else {
          navigate('/deck-list');
        }
      }
    };
    loadData();
  }, [id, isEditMode, navigate]);

  const maxForCard = (card: CardData): number => {
    const rarity = card.rarity || 'common';
    if (rarity === 'common') return 3;
    if (rarity === 'rare') return 2;
    if (rarity === 'legendary') return 1;
    if (rarity === 'mythic') return 1;
    return 3;
  };

  const hasMythicInDeck = (): boolean => {
    return deckEntries.some((entry) => {
      const card = allCards.find((c) => c.id === entry.cardId);
      return card?.rarity === 'mythic';
    });
  };

  const hasLegendaryInDeck = (): boolean => {
    return deckEntries.some((entry) => {
      const card = allCards.find((c) => c.id === entry.cardId);
      return card?.rarity === 'legendary';
    });
  };

  const currentQuantity = (cardId: string): number => {
    const entry = deckEntries.find((e) => e.cardId === cardId);
    return entry ? entry.quantity : 0;
  };

  const addToDeck = (card: CardData) => {
    const qty = currentQuantity(card.id);
    const max = maxForCard(card);

    if (card.rarity === 'legendary' && hasLegendaryInDeck()) {
      return;
    }

    if (card.rarity === 'mythic' && hasMythicInDeck()) {
      return;
    }

    if (qty >= max) return;

    setDeckEntries((prev) => {
      const existing = prev.find((e) => e.cardId === card.id);
      if (existing) {
        return prev.map((e) => (e.cardId === card.id ? { ...e, quantity: e.quantity + 1 } : e));
      }
      return [...prev, { cardId: card.id, quantity: 1 }];
    });
  };

  const removeFromDeck = (cardId: string) => {
    setDeckEntries((prev) => {
      const existing = prev.find((e) => e.cardId === cardId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((e) => e.cardId !== cardId);
      }
      return prev.map((e) => (e.cardId === cardId ? { ...e, quantity: e.quantity - 1 } : e));
    });
  };

  const removeCardFromDeck = (cardId: string) => {
    setDeckEntries((prev) => prev.filter((e) => e.cardId !== cardId));
  };

  const totalCards = useMemo(() => {
    return deckEntries.reduce((sum, e) => sum + e.quantity, 0);
  }, [deckEntries]);

  const validation = useMemo(() => {
    return validateDeck(deckEntries, allCards);
  }, [deckEntries, allCards]);

  const filteredAvailable = useMemo(() => {
    let result = availableCards;
    if (filterType !== 'all') {
      result = result.filter((c) => c.type === filterType);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }
    return result;
  }, [availableCards, filterType, searchQuery]);

  const handleSave = async () => {
    if (!deckName.trim()) return;

    const deck: Deck = {
      id: isEditMode && id ? id : `deck-${Date.now()}`,
      name: deckName,
      cards: deckEntries,
    };

    await saveDeck(deck);
    navigate('/deck-list');
  };

  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        width: '100%',
        height: '100vh',
        boxSizing: 'border-box',
        background: `linear-gradient(135deg, ${colors.Blue_8} 0%, ${colors.Blue_12} 100%)`,
      }}
    >
      <ScrollArea>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            padding: '1.5rem',
            minWidth: '400px',
          }}
        >
          <Text c={colors.White_1} size="xl" fw={700}>
            {isEditMode ? 'Edit Deck' : 'Create Deck'}
          </Text>

          <TextInput
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            label="Deck Name"
            styles={{
              input: { backgroundColor: colors.White_1, color: colors.Black_1 },
              label: { color: colors.White_1 },
            }}
          />

          <Group gap="sm">
            <Text c={colors.White_1} size="md" fw={600}>
              Cards: {totalCards}/40
            </Text>
            {!validation.isValid && (
              <Badge color="red">Deck is unusable</Badge>
            )}
            {validation.isValid && totalCards === 40 && (
              <Badge color="green">Valid Deck</Badge>
            )}
          </Group>

          {validation.errors.length > 0 && (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {validation.errors.map((err, i) => (
                <Text key={i} c={colors.Red_4} size="xs" fw={500}>
                  {err}
                </Text>
              ))}
            </Box>
          )}

          <TextInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftSection={<IconSearch size={16} color={colors.Gray_3} />}
            label="Search Cards"
            styles={{
              input: { backgroundColor: colors.White_1, color: colors.Black_1 },
              label: { color: colors.White_1 },
            }}
          />

          <Group gap="sm">
            {['all', 'numen', 'rite', 'ward'].map((type) => (
              <Button
                key={type}
                size="xs"
                onClick={() => setFilterType(type)}
                styles={{
                  root: {
                    backgroundColor: filterType === type ? colors.Blue_4 : colors.Gray_7,
                    '&:hover': { backgroundColor: colors.Blue_5 },
                  },
                }}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </Group>

          <Text c={colors.White_1} size="sm" fw={600}>
            Available Cards
          </Text>

          <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredAvailable.map((card) => {
              const qty = currentQuantity(card.id);
              const max = maxForCard(card);
               const isMythic = card.rarity === 'mythic';
               const isLegendary = card.rarity === 'legendary';
               const blockedByMythic = isMythic && hasMythicInDeck() && qty === 0;
               const blockedByLegendary = isLegendary && hasLegendaryInDeck() && qty === 0;
               const atMax = qty >= max || blockedByMythic || blockedByLegendary;

              return (
                <Box
                  key={card.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.8rem',
                    backgroundColor: colors.Gray_8,
                    borderRadius: '6px',
                  }}
                >
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <Text c={colors.White_1} size="xs" fw={600}>
                      {card.name}
                    </Text>
                    <Group gap="xs">
                      <Badge
                        c={colors.White_1}
                        size="sm"
                        style={{
                          backgroundColor:
                            card.type === 'numen' ? colors.Red_11 : card.type === 'rite' ? colors.Green_8 : colors.Red_12,
                        }}
                      >
                        {card.type}
                      </Badge>
                      {card.rarity && (
                        <Badge c={colors.White_1} size="sm" style={{ backgroundColor: colors.Gray_5 }}>
                          {card.rarity}
                        </Badge>
                      )}
                    </Group>
                  </Box>

                  <Group gap="xs">
                    {qty > 0 && (
                      <Button
                        size="xs"
                        onClick={() => removeFromDeck(card.id)}
                        styles={{ root: { backgroundColor: colors.Red_8, '&:hover': { backgroundColor: colors.Red_7 } } }}
                      >
                        <IconMinus size={12} />
                      </Button>
                    )}
                    <Text c={colors.White_1} size="xs" fw={600}>
                      {qty}/{max}
                    </Text>
                    <Button
                      size="xs"
                      onClick={() => addToDeck(card)}
                      disabled={atMax}
                      styles={{
                        root: {
                          backgroundColor: atMax ? colors.Gray_6 : colors.Green_6,
                          '&:hover': { backgroundColor: atMax ? colors.Gray_6 : colors.Green_5 },
                        },
                      }}
                    >
                      <IconPlus size={12} />
                    </Button>
                  </Group>
                </Box>
              );
            })}
          </Box>
        </Box>
      </ScrollArea>

      <ScrollArea>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            padding: '1.5rem',
          }}
        >
          <Group justify="space-between" align="center">
            <Text c={colors.White_1} size="lg" fw={700}>
              Deck Contents ({totalCards})
            </Text>
            <Group gap="sm">
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSave}
                disabled={!deckName.trim()}
                styles={{ root: { backgroundColor: colors.Green_6, '&:hover': { backgroundColor: colors.Green_5 } } }}
              >
                {isEditMode ? 'Save Changes' : 'Save Deck'}
              </Button>
              <Text
                c={colors.White_1}
                size="sm"
                fw={600}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/deck-list')}
              >
                Back to Deck List
              </Text>
            </Group>
          </Group>

          {deckEntries.length === 0 ? (
            <Text c={colors.Gray_5} size="md" fw={500}>
              No cards added yet
            </Text>
          ) : (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {deckEntries.map((entry) => {
                const card = allCards.find((c) => c.id === entry.cardId);
                if (!card) return null;

                return (
                  <Box
                    key={entry.cardId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0.8rem',
                      backgroundColor: colors.Gray_8,
                      borderRadius: '6px',
                    }}
                  >
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <Text c={colors.White_1} size="xs" fw={600}>
                        {card.name}
                      </Text>
                      <Text c={colors.Gray_4} size="xs">
                        x{entry.quantity}
                      </Text>
                    </Box>

                    <Group gap="xs">
                      <NumberInput
                        value={entry.quantity}
                        onChange={(val) => {
                          const num = typeof val === 'number' ? val : 1;
                          const max = maxForCard(card);
                          const clamped = Math.min(Math.max(1, num), max);
                          setDeckEntries((prev) =>
                            prev.map((e) => (e.cardId === card.id ? { ...e, quantity: clamped } : e))
                          );
                        }}
                        min={1}
                        max={maxForCard(card)}
                        size="xs"
                        styles={{
                          input: { backgroundColor: colors.White_1, color: colors.Black_1, width: '60px' },
                        }}
                      />
                      <Button
                        size="xs"
                        onClick={() => removeCardFromDeck(entry.cardId)}
                        styles={{ root: { backgroundColor: colors.Red_8, '&:hover': { backgroundColor: colors.Red_7 } } }}
                      >
                        <IconX size={12} />
                      </Button>
                    </Group>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </ScrollArea>
    </Box>
  );
};

export default DeckEditor;