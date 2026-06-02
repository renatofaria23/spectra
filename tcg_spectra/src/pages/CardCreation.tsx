import React from 'react';
import { Box, Text, Select, NumberInput, Button, TextInput, Group, Checkbox } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconPlus, IconDeviceFloppy, IconPhoto, IconUpload } from '@tabler/icons-react';
import colors from '../styles/Colors';
import { CardTemplate } from '../components/Card/CardTemplate';
import { ConditionalTrigger } from '../logic/Triggers';
import { EffectType } from '../logic/Effects';
import { useNavigate } from 'react-router-dom';
import { addCard, saveArt } from '../services/cardsAPI';
import { useCardEditor } from '../hooks/useCardEditor';
import EffectParamInputs from '../components/CardEditor/EffectParamInputs';
import {
  triggerTypeOptions,
  activeTriggerOptions,
  passiveTriggerOptions,
  attackTargetOptions,
  effectTargetOptions,
  effectOptions,
  familyOptions,
  rarityOptions,
  natureOptions,
  cardTypeOptions,
  inputStyles,
  isAttackTrigger,
  isPassiveValue,
} from '../logic/CardEditorOptions';

export const CardCreation = () => {
  const navigate = useNavigate();
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
    selectedEffects,
    effectParams, setEffectParams,
    effectSlots,
    buildPreviewCard,
    handleTriggerTypeChange,
    toggleActiveTrigger,
    toggleEffect,
    addEffectToSlot,
    removeEffectSlot,
  } = editor;

  const hasAnyActiveAttackTrigger = Array.from(selectedActiveTriggers).some(t => isAttackTrigger(t as ConditionalTrigger));

  const handleSave = async () => {
    if (!name || !cardType) return;

    const newId = `${cardType}-${Date.now()}`;
    const newCard = {
      id: newId,
      name,
      type: cardType,
      cardType: cardType.charAt(0).toUpperCase() + cardType.slice(1),
      description: editor.previewDescription,
      art: artFilename,
      triggers: editor.previewTriggers,
      ...(cardType === 'monster' ? {
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
  };

  const basicInputsSection = (
    <>
      <Text c={colors.Black_1} size="xl" fw={700}>
        Card Creation
      </Text>

      <Select
        data={cardTypeOptions}
        value={cardType}
        onChange={(val) => { if (val) setCardType(val as typeof cardType); }}
        label="Card Type"
        styles={inputStyles}
      />

      <TextInput
        value={name}
        onChange={(e) => setName(e.target.value)}
        label="Card Name"
        styles={inputStyles}
      />

      {cardType === 'monster' ? (
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
            editor.setArtFilename(file.name);
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

  const effectsInputsSection = (
    <>
      <Text c={colors.Black_1} size="md" fw={600}>
        Add Effect
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

      {triggerType === 'active' && hasAnyActiveAttackTrigger && (
        <Select
          data={attackTargetOptions}
          value={selectedAttackTarget}
          onChange={(val) => setSelectedAttackTarget(val as 'player' | 'monster' | 'self' | 'allied_monster' | null)}
          label="Attack Target"
          styles={inputStyles}
        />
      )}

      {triggerType === 'active' && (
        <Select
          data={effectTargetOptions}
          value={selectedEffectTarget}
          onChange={(val) => setSelectedEffectTarget(val as 'self' | 'attack_target' | 'allied_monster' | 'enemy_monster' | 'all_allied_monsters' | 'all_enemy_monsters' | 'opponent_hp' | 'opponent_hand' | 'opponent_deck' | 'opponent_graveyard' | 'opponent_exile' | 'player_hp' | 'player_hand' | 'player_deck' | 'player_graveyard' | 'player_exile' | null)}
          label="Effect Target"
          styles={inputStyles}
        />
      )}

      {triggerType === 'active' && (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '100%' }}>
          <Text c={colors.Black_1} size="sm" fw={600}>
            Effects (select one or more)
          </Text>
          {effectOptions.map(option => (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={selectedEffects.has(option.value as EffectType)}
              onChange={() => toggleEffect(option.value as EffectType)}
              styles={{ label: { color: colors.Black_1 } }}
            />
          ))}
        </Box>
      )}

      {triggerType === 'active' && selectedEffects.size > 0 && (
        <EffectParamInputs
          selectedEffect={Array.from(selectedEffects)[0] || ''}
          effectParams={effectParams}
          setEffectParams={setEffectParams}
        />
      )}

      <Button
        leftSection={<IconPlus size={16} />}
        onClick={addEffectToSlot}
        disabled={
          triggerType === 'passive'
            ? !selectedPassiveTrigger
            : selectedActiveTriggers.size === 0 || selectedEffects.size === 0
        }
        styles={{ root: { backgroundColor: colors.Blue_5, '&:hover': { backgroundColor: colors.Blue_4 } } }}
      >
        Add Effect
      </Button>

      <Button
        leftSection={<IconDeviceFloppy size={16} />}
        onClick={handleSave}
        disabled={!name || !cardType}
        styles={{ root: { backgroundColor: colors.Green_6, '&:hover': { backgroundColor: colors.Green_5 } } }}
      >
        Save Card
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
                {slot.trigger} {slot.attackTarget ? `(attack: ${slot.attackTarget})` : ''} {slot.effectTarget ? `(effect: ${slot.effectTarget})` : ''} → {slot.effect ? `${slot.effect.effect}` : ''}
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
        overflow: 'hidden',
      }}
    >
      <Box />

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
        {effectsInputsSection}
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

      <Box />
    </Box>
  );
};

export default CardCreation;