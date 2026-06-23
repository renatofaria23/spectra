import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, TextInput, Button, Group, ScrollArea, Badge, NumberInput } from "@mantine/core";
import { IconDeviceFloppy, IconSearch, IconPlus, IconMinus, IconX } from "@tabler/icons-react";
import colors from "../../styles/Colors";
import { useNavigate, useParams } from "react-router-dom";
import { readCards } from "../../services/cardsAPI";
import { readDecksAsync, saveDeck, type Deck } from "../../services/decksAPI";
import { validateDeck } from "../../services/decksAPI";
import type { CardData } from "../../components/Card/CardTemplate/CardTemplate";
import { generateDescription } from "../../logic/DescriptionEngine";
import * as S from "./DeckEditor.css";

interface DeckEntry {
  cardId: string;
  quantity: number;
}

export const DeckEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [allCards, setAllCards] = useState<CardData[]>([]);
  const [deckName, setDeckName] = useState("");
  const [deckEntries, setDeckEntries] = useState<DeckEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [availableCards, setAvailableCards] = useState<CardData[]>([]);

  useEffect(() => {
    (async () => {
      const loadedCards = await readCards();
      const processed = loadedCards.map((raw: any) => ({ ...raw, description: raw.triggers ? generateDescription(raw.triggers) : "" }));
      setAllCards(processed);
      setAvailableCards(processed);
      if (isEditMode && id) {
        const deck = (await readDecksAsync()).find((d: Deck) => d.id === id);
        if (deck) { setDeckName(deck.name); setDeckEntries(deck.cards); }
        else navigate("/deck-list");
      }
    })();
  }, [id, isEditMode, navigate]);

  const maxForCard = (card: CardData): number => card.rarity === "rare" ? 2 : ["legendary", "mythic"].includes(card.rarity || "") ? 1 : 3;
  const hasMythicInDeck = (): boolean => deckEntries.some((entry) => allCards.find((c) => c.id === entry.cardId)?.rarity === "mythic");
  const currentQuantity = (cardId: string): number => (deckEntries.find((e) => e.cardId === cardId)?.quantity ?? 0);

  const addToDeck = (card: CardData) => {
    if (card.rarity === "mythic" && hasMythicInDeck()) return;
    if (currentQuantity(card.id) >= maxForCard(card)) return;
    setDeckEntries((prev) => {
      const existing = prev.find((e) => e.cardId === card.id);
      return existing ? prev.map((e) => e.cardId === card.id ? { ...e, quantity: e.quantity + 1 } : e) : [...prev, { cardId: card.id, quantity: 1 }];
    });
  };

  const removeFromDeck = (cardId: string) => {
    setDeckEntries((prev) => {
      const existing = prev.find((e) => e.cardId === cardId);
      if (!existing) return prev;
      return existing.quantity <= 1 ? prev.filter((e) => e.cardId !== cardId) : prev.map((e) => e.cardId === cardId ? { ...e, quantity: e.quantity - 1 } : e);
    });
  };

  const removeCardFromDeck = (cardId: string) => setDeckEntries((prev) => prev.filter((e) => e.cardId !== cardId));
  const totalCards = useMemo(() => deckEntries.reduce((sum, e) => sum + e.quantity, 0), [deckEntries]);
  const validation = useMemo(() => validateDeck(deckEntries, allCards), [deckEntries, allCards]);

  const filteredAvailable = useMemo(() => {
    let result = availableCards;
    if (filterType !== "all") result = result.filter((c) => c.type === filterType);
    if (searchQuery.trim()) result = result.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return result;
  }, [availableCards, filterType, searchQuery]);

  const handleSave = async () => {
    if (!deckName.trim()) return;
    await saveDeck({ id: isEditMode && id ? id : `deck-${Date.now()}`, name: deckName, cards: deckEntries });
    navigate("/deck-list");
  };

  return (
    <Box data-name="deck-editor-grid" style={S.root}>
      <ScrollArea>
        <Box data-name="deck-editor-left-column" style={S.leftColumn}>
          <Text c={colors.White_1} size="xl" fw={700}>{isEditMode ? "Edit Deck" : "Create Deck"}</Text>
          <TextInput value={deckName} onChange={(e) => setDeckName(e.target.value)} label="Deck Name" styles={{ input: { backgroundColor: colors.White_1, color: colors.Black_1 }, label: { color: colors.White_1 } }} />
          <Group data-name="deck-info-group" gap="sm">
            <Text c={colors.White_1} size="md" fw={600}>Cards: {totalCards}/40</Text>
            {!validation.isValid && <Badge color="red">Deck is unusable</Badge>}
            {validation.isValid && totalCards === 40 && <Badge color="green">Valid Deck</Badge>}
          </Group>
          {validation.errors.length > 0 && (
            <Box data-name="validation-errors-box" style={S.errorsBox}>
              {validation.errors.map((err, i) => <Text key={i} c={colors.Red_4} size="xs" fw={500}>{err}</Text>)}
            </Box>
          )}
          <TextInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftSection={<IconSearch size={16} color={colors.Gray_3} />} label="Search Cards" styles={{ input: { backgroundColor: colors.White_1, color: colors.Black_1 }, label: { color: colors.White_1 } }} />
          <Group data-name="filter-buttons-group" gap="sm">
            {["all", "numen", "rite", "ward"].map((type) => (
              <Button key={type} size="xs" onClick={() => setFilterType(type)} styles={{ root: { backgroundColor: filterType === type ? colors.Blue_4 : colors.Gray_7, "&:hover": { backgroundColor: colors.Blue_5 } } }}>
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </Group>
          <Text c={colors.White_1} size="sm" fw={600}>Available Cards</Text>
          <Box data-name="available-cards-list" style={S.cardsList}>
            {filteredAvailable.map((card) => {
              const qty = currentQuantity(card.id);
              const max = maxForCard(card);
              const atMax = qty >= max || (card.rarity === "mythic" && hasMythicInDeck() && qty === 0);
              return (
                <Box data-name="available-card-item" key={card.id} style={S.cardItem}>
                  <Box data-name="card-info-box" style={S.cardInfoBox}>
                    <Text c={colors.White_1} size="xs" fw={600}>{card.name}</Text>
                    <Group data-name="card-badge-group" gap="xs">
                      <Badge c={colors.White_1} size="sm" style={{ backgroundColor: card.type === "numen" ? colors.Red_11 : card.type === "rite" ? colors.Green_8 : colors.Red_12 }}>{card.type}</Badge>
                      {card.rarity && <Badge c={colors.White_1} size="sm" style={S.rarityBadge}>{card.rarity}</Badge>}
                    </Group>
                  </Box>
                  <Group data-name="card-quantity-group" gap="xs">
                    {qty > 0 && <Button size="xs" onClick={() => removeFromDeck(card.id)} styles={{ root: { backgroundColor: colors.Red_8, "&:hover": { backgroundColor: colors.Red_7 } } }}><IconMinus size={12} /></Button>}
                    <Text c={colors.White_1} size="xs" fw={600}>{qty}/{max}</Text>
                    <Button size="xs" onClick={() => addToDeck(card)} disabled={atMax} styles={{ root: { backgroundColor: atMax ? colors.Gray_6 : colors.Green_6, "&:hover": { backgroundColor: atMax ? colors.Gray_6 : colors.Green_5 } } }}><IconPlus size={12} /></Button>
                  </Group>
                </Box>
              );
            })}
          </Box>
        </Box>
      </ScrollArea>
      <ScrollArea>
        <Box data-name="deck-editor-right-column" style={S.rightColumn}>
          <Group data-name="deck-header-group" justify="space-between" align="center">
            <Text c={colors.White_1} size="lg" fw={700}>Deck Contents ({totalCards})</Text>
            <Group data-name="deck-actions-group" gap="sm">
              <Button leftSection={<IconDeviceFloppy size={16} />} onClick={handleSave} disabled={!deckName.trim()} styles={{ root: { backgroundColor: colors.Green_6, "&:hover": { backgroundColor: colors.Green_5 } } }}>
                {isEditMode ? "Save Changes" : "Save Deck"}
              </Button>
              <Text c={colors.White_1} size="sm" fw={600} style={S.navLink} onClick={() => navigate("/deck-list")}>Back to Deck List</Text>
            </Group>
          </Group>
          {deckEntries.length === 0 ? (
            <Text c={colors.Gray_5} size="md" fw={500}>No cards added yet</Text>
          ) : (
            <Box data-name="deck-contents-list" style={S.cardsList}>
              {deckEntries.map((entry) => {
                const card = allCards.find((c) => c.id === entry.cardId);
                if (!card) return null;
                return (
                  <Box data-name="deck-entry-item" key={entry.cardId} style={S.cardItem}>
                    <Box data-name="deck-entry-info" style={S.cardInfoBox}>
                      <Text c={colors.White_1} size="xs" fw={600}>{card.name}</Text>
                      <Text c={colors.Gray_4} size="xs">x{entry.quantity}</Text>
                    </Box>
                    <Group data-name="deck-entry-actions" gap="xs">
                      <NumberInput value={entry.quantity} onChange={(val) => {
                        const clamped = Math.min(Math.max(1, typeof val === "number" ? val : 1), maxForCard(card));
                        setDeckEntries((prev) => prev.map((e) => e.cardId === card.id ? { ...e, quantity: clamped } : e));
                      }} min={1} max={maxForCard(card)} size="xs" styles={{ input: { backgroundColor: colors.White_1, color: colors.Black_1, width: "60px" } }} />
                      <Button size="xs" onClick={() => removeCardFromDeck(entry.cardId)} styles={{ root: { backgroundColor: colors.Red_8, "&:hover": { backgroundColor: colors.Red_7 } } }}><IconX size={12} /></Button>
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