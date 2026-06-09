import React, { useMemo, useState, useEffect } from 'react';
import { Box, Text, Select, Button, TextInput, Group } from '@mantine/core';
import { IconPlus, IconSearch, IconTrash, IconPencil } from '@tabler/icons-react';
import colors from '../styles/Colors';
import { CardTemplate, type CardData } from '../components/Card/CardTemplate';
import { generateDescription } from '../logic/DescriptionEngine';
import rawCardsData from '../data/cards.json';
import { Link, useNavigate } from 'react-router-dom';
import { readCards, deleteCard } from '../services/cardsAPI';
import { NATURES, NUMEN_FAMILIES } from '../types/constants';

const baseCards: CardData[] = (rawCardsData as any[]).map((raw) => ({
  ...raw,
  description: raw.triggers ? generateDescription(raw.triggers as any[]) : '',
}));

export const CardList = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterNature, setFilterNature] = useState<string>('all');
  const [filterFamily, setFilterFamily] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cards, setCards] = useState<CardData[]>(baseCards);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const loaded = await readCards();
        const processed = loaded.map((raw) => ({
          ...raw,
          description: raw.triggers ? generateDescription(raw.triggers) : '',
        }));
        setCards(processed);
      } catch {
        setCards(baseCards);
      }
    };
    loadCards();
  }, []);

  const filteredCards = useMemo(() => {
    let result = cards;

    if (filterType !== 'all') {
      result = result.filter((card) => card.type === filterType);
    }

    if (filterType === 'numen' && filterNature !== 'all') {
      result = result.filter((card) => card.attribute?.toLowerCase() === filterNature);
    }

    if (filterType === 'numen' && filterFamily !== 'all') {
      result = result.filter((card) => card.family?.toLowerCase() === filterFamily);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter((card) => card.name.toLowerCase().includes(query));
    }

    const typeOrder: Record<string, number> = { numen: 0, rite: 1, ward: 2 };

    result.sort((a, b) => {
      const typeA = (a.type || '').toLowerCase();
      const typeB = (b.type || '').toLowerCase();
      const orderA = typeOrder[typeA] ?? 3;
      const orderB = typeOrder[typeB] ?? 3;
      if (orderA !== orderB) return orderA - orderB;

      if (typeA === 'numen') {
        const natureA = (a.attribute || '').toLowerCase();
        const natureB = (b.attribute || '').toLowerCase();
        if (natureA !== natureB) return natureA.localeCompare(natureB);

        const familyA = (a.family || '').toLowerCase();
        const familyB = (b.family || '').toLowerCase();
        if (familyA !== familyB) return familyA.localeCompare(familyB);

        const levelA = a.level ?? 0;
        const levelB = b.level ?? 0;
        if (levelA !== levelB) return levelA - levelB;
      }

      return a.name.localeCompare(b.name);
    });

    return result;
  }, [filterType, filterNature, filterFamily, searchQuery, cards]);

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
        Card List
      </Text>

      <Text c={colors.Gray_3} size="md" fw={500}>
        Total: {filteredCards.length} / {cards.length} cards
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

        <Select
          data={[
            { value: 'all', label: 'All Types' },
            { value: 'numen', label: 'Numen' },
            { value: 'rite', label: 'Rite' },
            { value: 'ward', label: 'Ward' },
          ]}
          value={filterType}
          onChange={(val) => {
            setFilterType(val || 'all');
            if (val !== 'numen') {
              setFilterNature('all');
              setFilterFamily('all');
            }
          }}
          label="Filter by Type"
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

        {filterType === 'numen' && (
          <>
            <Select
              data={[
                { value: 'all', label: 'All Natures' },
                ...Object.entries(NATURES).map(([key, val]) => ({
                  value: val,
                  label: val.charAt(0).toUpperCase() + val.slice(1),
                })),
              ]}
              value={filterNature}
              onChange={(val) => setFilterNature(val || 'all')}
              label="Filter by Nature"
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

            <Select
              data={[
                { value: 'all', label: 'All Families' },
                ...Object.entries(NUMEN_FAMILIES).map(([key, val]) => ({
                  value: val,
                  label: val.charAt(0).toUpperCase() + val.slice(1),
                })),
              ]}
              value={filterFamily}
              onChange={(val) => setFilterFamily(val || 'all')}
              label="Filter by Family"
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
          </>
        )}
      </Group>

      <Box
        style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {filteredCards.map((card) => (
          <Box
            key={card.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CardTemplate card={card} size="lg" artImage={card.art ? `/src/assets/art/${card.art}` : null} />
            <Group gap="sm">
              <Button
                size="xs"
                leftSection={<IconPencil size={12} />}
                onClick={() => navigate(`/card-edit/${card.id}`)}
                styles={{ root: { backgroundColor: colors.Blue_5, '&:hover': { backgroundColor: colors.Blue_4 } } }}
              >
                Edit
              </Button>
              <Button
                size="xs"
                leftSection={<IconTrash size={12} />}
                onClick={async () => {
                  await deleteCard(card.id);
                  setCards((prev) => prev.filter((c) => c.id !== card.id));
                }}
                styles={{ root: { backgroundColor: colors.Red_8, '&:hover': { backgroundColor: colors.Red_7 } } }}
              >
                Delete
              </Button>
            </Group>
          </Box>
        ))}
      </Box>

      <Button
        leftSection={<IconPlus size={16} />}
        onClick={() => navigate('/card-creation')}
        styles={{ root: { backgroundColor: colors.Green_6, '&:hover': { backgroundColor: colors.Green_5 } } }}
      >
        Create New Card
      </Button>

      <Link to="/" style={{ textDecoration: 'none', marginTop: '2rem' }}>
        <Text c={colors.Blue_3} size="lg" fw={600}>
          Back to Board
        </Text>
      </Link>
    </Box>
  );
};

export default CardList;