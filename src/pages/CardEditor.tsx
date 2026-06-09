import React, { useEffect } from 'react';
import { Box, Text, Select, NumberInput, Button, TextInput, Group, Checkbox } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconPlus, IconDeviceFloppy, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import colors from '../styles/Colors';
import { CardTemplate, type CardData } from '../components/Card/CardTemplate';
import { ConditionalTrigger, PassiveTrigger, isConditionalTrigger, isPassiveTrigger } from '../logic/Triggers';
import type { TriggerEntry } from '../logic/Triggers';
import type { EffectEntry } from '../logic/Effects';
import { useNavigate, useParams } from 'react-router-dom';
import { readCards, saveCards, saveArt, readArt, addCard } from '../services/cardsAPI';
import { useCardEditor } from '../hooks/useCardEditor';
import EffectParamInputs, { OtherwiseEffectInputs } from '../components/CardEditor/EffectParamInputs';
import {
  triggerTypeOptions,
  activeTriggerOptions,
  passiveTriggerOptions,
  attackTargetOptions,
  getAttackTargetOptions,
  getEffectTargetOptions,
  effectOptions,
  familyOptions,
  rarityOptions,
  natureOptions,
  cardTypeOptions,
  inputStyles,
  isAttackTrigger,
  isPassiveValue,
  effectSupportsOwnTarget,
  isDirectValueTarget,
  isNonAttackTrigger,
  getEffectTargetLabel,
  type CardTypeOption,
  type EffectSlot,
} from '../logic/CardEditorOptions';
import { EffectType } from '../logic/Effects';

function triggersToSlots(triggers: TriggerEntry[]): EffectSlot[] {
  return triggers.map((t) => {
    if (isPassiveTrigger(t)) {
      return { trigger: t };
    }
    if (isConditionalTrigger(t)) {
      const slot: EffectSlot = { trigger: t.trigger };
      if (t.attackTarget) slot.attackTarget = t.attackTarget;
      if (t.effectTarget) slot.effectTarget = t.effectTarget;
      if (t.effects) slot.effects = t.effects;
      if ((t as any).effect) slot.effect = (t as any).effect;
      return slot;
    }
    return { trigger: (t as any).trigger as ConditionalTrigger };
  });
}

export const CardEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = !!id;

  const editor = useCardEditor();

  const {
    cardType, setCardType,
    name, setName,
    mana, setMana,
    level, setLevel,
    attack, setAttack,
    defense, setDefense,
    attribute, setAttribute,
    family, setFamily,
    rarity, setRarity,
    artFilename,
    artImage,
    triggerType,
    selectedPassiveTrigger, setSelectedPassiveTrigger,
    selectedActiveTriggers,
    selectedAttackTarget, setSelectedAttackTarget,
    selectedEffectTarget, setSelectedEffectTarget,
    selectedEffectType,
    effectParams, setEffectParams,
    pendingEffects,
    effectSlots, setEffectSlots,
    buildPreviewCard,
    handleTriggerTypeChange,
    toggleActiveTrigger,
    handleEffectSelect,
    addEffectToPending,
    removePendingEffect,
    addEffectToSlot,
    removeEffectSlot,
    setArtFilename,
    isEffectComplete,
    whenTarget, setWhenTarget,
    whenCondition, setWhenCondition,
  } = editor;

  useEffect(() => {
    const loadCard = async () => {
      if (!id) return;
      try {
        const cards = await readCards();
        const card = cards.find((c: any) => c.id === id);
        if (!card) return;

        setCardType(card.type);
        setName(card.name);
        setArtFilename(card.art || 'placeholder.svg');

        if (card.art) {
          try {
            const artData = await readArt(card.art);
            if (artData) editor.setArtImage(artData);
          } catch {
          }
        }

        if (card.type === 'numen') {
          setLevel(card.level ?? '');
          setAttribute(card.attribute || 'dark');
          setFamily(card.family || '');
          setAttack(card.attack ?? '');
          setDefense(card.defense ?? '');
        } else {
          setMana(card.mana ?? '');
        }

        setRarity(card.rarity || '');

        if (card.triggers && card.triggers.length > 0) {
          setEffectSlots(triggersToSlots(card.triggers));
        }
      } catch {
        navigate('/card-list');
      }
    };
    loadCard();
  }, [id, navigate]);

  const hasAnyActiveAttackTrigger = Array.from(selectedActiveTriggers).some(t => isAttackTrigger(t as ConditionalTrigger));
  const allTriggersNonAttack = Array.from(selectedActiveTriggers).every(t => isNonAttackTrigger(t as ConditionalTrigger));
  const hasWhenTrigger = Array.from(selectedActiveTriggers).includes(ConditionalTrigger.WHEN);
  const currentTrigger = selectedActiveTriggers.size === 1 ? Array.from(selectedActiveTriggers)[0] as ConditionalTrigger : undefined;
  const dynamicAttackTargetOptions = currentTrigger ? getAttackTargetOptions(currentTrigger) : attackTargetOptions;
  const dynamicEffectTargetOptions = getEffectTargetOptions(currentTrigger, selectedEffectType ?? undefined, cardType);
  const hideSecondaryEffectTarget = selectedEffectType === EffectType.INCREASE || selectedEffectType === EffectType.DECREASE
    ? isDirectValueTarget(selectedEffectTarget)
    : false;

  const handleSave = async () => {
    if (!name || !cardType) return;

    if (isEditMode && id) {
      const cards = await readCards();
      const updatedCard = {
        id,
        name,
        type: cardType,
        cardType: cardType.charAt(0).toUpperCase() + cardType.slice(1),
        description: editor.previewDescription,
        art: artFilename,
        triggers: editor.previewTriggers,
        ...(cardType === 'numen' ? {
          level: level || 1,
          attribute,
          ...(family ? { family } : {}),
          ...(rarity ? { rarity } : {}),
          attack: attack || 0,
          defense: defense || 0,
        } : {
          ...(rarity ? { rarity } : {}),
          mana: mana || 0,
        }),
      };

      const updated = cards.map((c: any) => (c.id === id ? updatedCard : c));
      await saveCards(updated);
      navigate('/card-list');
    } else {
      const newId = `${cardType}-${Date.now()}`;
      const newCard = {
        id: newId,
        name,
        type: cardType,
        cardType: cardType.charAt(0).toUpperCase() + cardType.slice(1),
        description: editor.previewDescription,
        art: artFilename,
        triggers: editor.previewTriggers,
        ...(cardType === 'numen' ? {
          level: level || 1,
          attribute,
          ...(family ? { family } : {}),
          ...(rarity ? { rarity } : {}),
          attack: attack || 0,
          defense: defense || 0,
        } : {
          ...(rarity ? { rarity } : {}),
          mana: mana || 0,
        }),
      };

      await addCard(newCard);
      navigate('/card-list');
    }
  };

  const basicInputsSection = (
    <>
      <Text c={colors.Black_1} size="xl" fw={700}>
        {isEditMode ? 'Card Edit' : 'Card Creation'}
      </Text>

      <Select
        data={cardTypeOptions}
        value={cardType}
        onChange={(val) => { if (val) setCardType(val as CardTypeOption); }}
        label="Card Type"
        styles={inputStyles}
      />

      <TextInput
        value={name}
        onChange={(e) => setName(e.target.value)}
        label="Card Name"
        styles={inputStyles}
      />

      {cardType === 'numen' ? (
        <>
          <Select
            data={familyOptions}
            value={family}
            onChange={(val) => setFamily(val || '')}
            label="Family"
            styles={inputStyles}
          />
          <Select
            data={rarityOptions}
            value={rarity}
            onChange={(val) => setRarity(val || '')}
            label="Rarity"
            styles={inputStyles}
          />
          <NumberInput
            label="Level"
            value={level}
            onChange={(val) => setLevel(typeof val === 'number' ? val : '')}
            min={1}
            max={10}
            styles={inputStyles}
          />
          <Select
            data={natureOptions}
            value={attribute}
            onChange={(val) => setAttribute(val || 'dark')}
            label="Nature"
            styles={inputStyles}
          />
          <NumberInput
            label="Attack"
            value={attack}
            onChange={(val) => setAttack(typeof val === 'number' ? val : '')}
            min={0}
            styles={inputStyles}
          />
          <NumberInput
            label="Defense"
            value={defense}
            onChange={(val) => setDefense(typeof val === 'number' ? val : '')}
            min={0}
            styles={inputStyles}
          />
        </>
      ) : (
        <>
          <Select
            data={rarityOptions}
            value={rarity}
            onChange={(val) => setRarity(val || '')}
            label="Rarity"
            styles={inputStyles}
          />
          <NumberInput
            label="Mana Cost"
            value={mana}
            onChange={(val) => setMana(typeof val === 'number' ? val : '')}
            min={0}
            styles={inputStyles}
          />
        </>
      )}

      <Text c={colors.Black_1} size="md" fw={600}>
        Card Art
      </Text>

      <Dropzone
        onDrop={async (files) => {
          const file = files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result as string;
            editor.setArtImage(base64);
            setArtFilename(file.name);
            await saveArt(file.name, base64);
          };
          reader.readAsDataURL(file);
        }}
        accept={['image/png', 'image/jpeg', 'image/gif', 'image/webp']}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '6px',
        }}
      >
        <Group justify="center" style={{ pointerEvents: 'none', gap: '0.5rem' }}>
          <IconPhoto size={32} color={colors.Gray_5} />
          <Text c={colors.Black_1} size="sm" fw={500}>
            {artFilename}
          </Text>
          <IconUpload size={20} color={colors.Gray_5} />
        </Group>
      </Dropzone>
    </>
  );

  const effectTypeTriggersSection = (
    <>
      <Text c={colors.Black_1} size="md" fw={600}>
        Add Effect - Type
      </Text>

      <Select
        data={triggerTypeOptions}
        value={triggerType}
        onChange={(val) => handleTriggerTypeChange(val as 'passive' | 'active' | null)}
        label="Trigger Type"
        styles={inputStyles}
      />

      {triggerType === 'passive' && (
        <Select
          data={passiveTriggerOptions}
          value={selectedPassiveTrigger}
          onChange={(val) => setSelectedPassiveTrigger(val as any)}
          label="Passive Trigger"
          styles={inputStyles}
        />
      )}

      {triggerType === 'active' && (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '100%' }}>
          <Text c={colors.Black_1} size="sm" fw={600}>
            Active Triggers (select one or more)
          </Text>
          {activeTriggerOptions.map(option => (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={selectedActiveTriggers.has(option.value as ConditionalTrigger)}
              onChange={() => toggleActiveTrigger(option.value as ConditionalTrigger)}
              styles={{ label: { color: colors.Black_1 } }}
            />
          ))}
        </Box>
      )}

      {triggerType === 'active' && hasAnyActiveAttackTrigger && !allTriggersNonAttack && (
        <Select
          data={dynamicAttackTargetOptions}
          value={selectedAttackTarget}
          onChange={(val) => setSelectedAttackTarget(val as 'player' | 'numen' | 'allied_numen' | 'anything' | null)}
          label="Attack Target"
          styles={inputStyles}
        />
      )}

      {triggerType === 'active' && hasWhenTrigger && (
        <>
          <TextInput
            placeholder="What (e.g. opponent's card, allied numen)..."
            value={whenTarget}
            onChange={(e) => setWhenTarget(e.target.value)}
            label="When - What"
            styles={inputStyles}
          />
          <TextInput
            placeholder="When what (e.g. is removed from their deck)..."
            value={whenCondition}
            onChange={(e) => setWhenCondition(e.target.value)}
            label="When - Condition"
            styles={inputStyles}
          />
        </>
      )}

    </>
  );

  const effectsDropdownSection = (
    <>
      {triggerType === 'active' && selectedActiveTriggers.size > 0 && (
        <Select
          data={effectOptions}
          value={selectedEffectType ?? null}
          onChange={(val) => handleEffectSelect(val as EffectType | null)}
          label="Select Effect"
          styles={inputStyles}
        />
      )}

      {triggerType === 'active' && selectedEffectType && selectedEffectType !== EffectType.DRAW && selectedEffectType !== EffectType.SCRY && selectedEffectType !== EffectType.SUMMON && (
        <Select
          data={dynamicEffectTargetOptions}
          value={selectedEffectTarget}
          onChange={(val) => setSelectedEffectTarget(val as any)}
          label="Effect Target"
          styles={inputStyles}
        />
      )}


      {triggerType === 'active' && selectedEffectType && (
        <EffectParamInputs
          selectedEffect={selectedEffectType}
          effectParams={effectParams}
          setEffectParams={setEffectParams}
          effectTarget={selectedEffectTarget}
        />
      )}

      {triggerType === 'active' && selectedEffectType && (
        <OtherwiseEffectInputs
          effectParams={effectParams}
          setEffectParams={setEffectParams}
        />
      )}

      {triggerType === 'active' && selectedEffectType && (
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={addEffectToPending}
          disabled={!isEffectComplete()}
          styles={{ root: { backgroundColor: colors.Orange_5, '&:hover': { backgroundColor: colors.Orange_4 } } }}
        >
          Add to Pending
        </Button>
      )}

      {triggerType === 'active' && pendingEffects.length > 0 && (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '100%' }}>
          <Text c={colors.Black_1} size="sm" fw={600}>
            Pending Effects
          </Text>
          {pendingEffects.map((p, index) => (
            <Box
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: colors.Gray_6,
                borderRadius: '4px',
                border: `1px solid ${colors.Gray_5}`,
              }}
            >
              <Text c={colors.White_1} size="xs" fw={500}>
                {p.effect.effect}{p.effectTarget ? ` → ${getEffectTargetLabel(p.effectTarget)}` : ''}
              </Text>
              <Button
                size="xs"
                leftSection={<IconX size={12} />}
                onClick={() => removePendingEffect(index)}
                styles={{ root: { backgroundColor: colors.Red_8, '&:hover': { backgroundColor: colors.Red_7 }, padding: '2px 8px' } }}
              >
                Remove
              </Button>
            </Box>
          ))}
        </Box>
      )}

      <Button
        leftSection={<IconPlus size={16} />}
        onClick={addEffectToSlot}
        disabled={
          triggerType === 'passive'
            ? !selectedPassiveTrigger
            : selectedActiveTriggers.size === 0 || pendingEffects.length === 0
        }
        styles={{ root: { backgroundColor: colors.Blue_5, '&:hover': { backgroundColor: colors.Blue_4 } } }}
      >
        Add Effect with Trigger
      </Button>

      <Button
        leftSection={<IconDeviceFloppy size={16} />}
        onClick={handleSave}
        disabled={!name || !cardType}
        styles={{ root: { backgroundColor: colors.Green_6, '&:hover': { backgroundColor: colors.Green_5 } } }}
      >
        {isEditMode ? 'Save Changes' : 'Save Card'}
      </Button>

      <Box style={{ marginTop: '1rem' }}>
        <Text
          c={colors.Black_1}
          size="md"
          fw={600}
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/card-list')}
        >
          Back to Card List
        </Text>
      </Box>
    </>
  );

  const effectsSection = (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {effectSlots.length > 0 ? (
        <>
          <Text c={colors.Black_1} size="lg" fw={700}>
            Card Effects
          </Text>
          {effectSlots.map((slot, index) => (
            <Box
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 20px',
                backgroundColor: colors.Gray_7,
                borderRadius: '6px',
                border: `2px solid ${colors.Gray_5}`,
                minWidth: '300px',
              }}
            >
              <Text c={colors.White_1} size="sm" fw={600}>
                {(() => {
                  const effectsList = slot.effects || (slot.effect ? [slot.effect] : []);
                  const effectsText = effectsList.map((e: EffectEntry) => {
                    const ownTarget = (e as any).effectTarget;
                    const targetLabel = ownTarget ? getEffectTargetLabel(ownTarget) : '';
                    return targetLabel ? `${e.effect} → ${targetLabel}` : e.effect;
                  }).join(', ');
                  return `${slot.trigger} ${slot.attackTarget ? `(attack: ${slot.attackTarget})` : ''} → ${effectsText || 'no effects'}`;
                })()}
              </Text>
              <Button
                size="xs"
                color="red"
                onClick={() => removeEffectSlot(index)}
                styles={{ root: { backgroundColor: colors.Red_8, '&:hover': { backgroundColor: colors.Red_7 } } }}
              >
                Remove
              </Button>
            </Box>
          ))}
        </>
      ) : (
        <Text c={colors.White_1} size="md" fw={500} style={{ opacity: 0.5 }}>
          No effects added yet
        </Text>
      )}
    </Box>
  );

  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
        width: '100%',
        height: '100vh',
        boxSizing: 'border-box',
        background: `linear-gradient(135deg, ${colors.Blue_8} 0%, ${colors.Blue_12} 100%)`,
      }}
    >
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem',
          padding: '1rem 1.5rem',
          alignItems: 'flex-start',
          justifyContent: 'center',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {basicInputsSection}
      </Box>

      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem',
          padding: '1rem 1.5rem',
          alignItems: 'flex-start',
          justifyContent: 'center',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {effectTypeTriggersSection}
      </Box>

      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem',
          padding: '1rem 1.5rem',
          alignItems: 'flex-start',
          justifyContent: 'center',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {effectsDropdownSection}
      </Box>

      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {effectsSection}
      </Box>

      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CardTemplate card={buildPreviewCard()} size="lg" artImage={artImage} />
      </Box>
    </Box>
  );
};

export default CardEditor;