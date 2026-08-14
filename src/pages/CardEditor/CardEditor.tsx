import React, { useEffect, useState } from "react";
import { Box, Text, Select, NumberInput, Button, TextInput, Group, Checkbox } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconPlus, IconDeviceFloppy, IconPhoto, IconUpload, IconX, IconPencil, IconChevronUp, IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import colors from "../../styles/Colors";
import { CardTemplate } from "../../components/Card/CardTemplate/CardTemplate";
import { ConditionalTrigger, isConditionalTrigger, isPassiveTrigger } from "../../logic/triggers";
import type { TriggerEntry } from "../../logic/triggers";
import type { EffectEntry } from "../../logic/effects";
import { useNavigate, useParams } from "react-router-dom";
import { readCards, saveCards, saveArt, readArt, addCard } from "../../services/cardsAPI";
import { useCardEditor } from "../../hooks/useCardEditor";
import EffectParamInputs, { OtherwiseEffectInputs, OrEffectInputs, ForEachInputs } from "../../components/Card/EffectParamInputs/EffectParamInputs";
import { triggerTypeOptions, activeTriggerOptions, passiveTriggerOptions, attackTargetOptions, getAttackTargetOptions, getEffectTargetOptions, effectOptions, familyOptions, rarityOptions, natureOptions, cardTypeOptions, inputStyles, isAttackTrigger, isPassiveValue, isDirectValueTarget, isNonAttackTrigger, getEffectTargetLabel, type CardTypeOption, type EffectSlot } from "../../logic/cardEditorOptions";
import { EffectType } from "../../logic/effects";
import * as styles from "./CardEditor.styles";

function triggersToSlots(triggers: TriggerEntry[]): EffectSlot[] {
  return triggers.map((t) => {
    if (isPassiveTrigger(t)) return { trigger: t };
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

  const [expandedTriggers, setExpandedTriggers] = useState<Set<number>>(
    new Set(),
  );

  const editor = useCardEditor();

  const toggleTriggerExpansion = (slotIndex: number) => {
    setExpandedTriggers((prev) => {
      const next = new Set(prev);
      next.has(slotIndex) ? next.delete(slotIndex) : next.add(slotIndex);
      return next;
    });
  };

  const {
    cardType,
    setCardType,
    name,
    setName,
    mana,
    setMana,
    level,
    setLevel,
    attack,
    setAttack,
    defense,
    setDefense,
    nature,
    setnature,
    family,
    setFamily,
    rarity,
    setRarity,
    artFilename,
    artImage,
    triggerType,
    selectedPassiveTrigger,
    setSelectedPassiveTrigger,
    selectedActiveTriggers,
    selectedAttackTarget,
    setSelectedAttackTarget,
    selectedEffectTarget,
    setSelectedEffectTarget,
    selectedEffectType,
    effectParams,
    setEffectParams,
    pendingEffects,
    effectSlots,
    setEffectSlots,
    editingSlotIndex,
    editingEffectIndex,
    addingEffectToSlot,
    buildPreviewCard,
    handleTriggerTypeChange,
    toggleActiveTrigger,
    handleEffectSelect,
    addEffectToPending,
    removePendingEffect,
    addEffectToSlot,
    removeEffectSlot,
    moveEffectSlot,
    removeEffectInSlot,
    moveEffectInSlot,
    loadEffectForEditing,
    loadSlotForAddingEffect,
    cancelEditing,
    replaceEffectSlot,
    addPendingEffectToSlot,
    setArtFilename,
    isEffectComplete,
    isEffectAndForEachComplete,
    whenTarget,
    setWhenTarget,
    whenCondition,
    setWhenCondition,
  } = editor;

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const cards = await readCards();
        const card = cards.find((c: any) => c.id === id);
        if (!card) return;
        setCardType(card.type);
        setName(card.name);
        setArtFilename(card.art || "placeholder.svg");
        if (card.art) {
          try {
            const artData = await readArt(card.art);
            if (artData) editor.setArtImage(artData);
          } catch {}
        }
        if (card.type === "numen") {
          setLevel(card.level ?? "");
          setnature(card.nature || "");
          setFamily(card.family || "");
          setAttack(card.attack ?? "");
          setDefense(card.defense ?? "");
        } else setMana(card.mana ?? "");
        setRarity(card.rarity || "");
        if (card.triggers?.length) setEffectSlots(triggersToSlots(card.triggers));
      } catch {
        navigate("/card-list");
      }
    })();
  }, [id, navigate]);

  const hasAnyActiveAttackTrigger = Array.from(selectedActiveTriggers).some((t) => isAttackTrigger(t as ConditionalTrigger));
  const allTriggersNonAttack = Array.from(selectedActiveTriggers).every((t) => isNonAttackTrigger(t as ConditionalTrigger));
  const hasWhenTrigger = Array.from(selectedActiveTriggers).includes(ConditionalTrigger.WHEN);
  const hasPassiveTrigger = effectSlots.some((slot) => isPassiveValue(slot.trigger as string));
  const currentTrigger = selectedActiveTriggers.size === 1 ? (Array.from(selectedActiveTriggers)[0] as ConditionalTrigger) : undefined;
  const dynamicAttackTargetOptions = currentTrigger ? getAttackTargetOptions(currentTrigger) : attackTargetOptions;
  const dynamicEffectTargetOptions = getEffectTargetOptions(currentTrigger, selectedEffectType ?? undefined, cardType);

  const handleSave = async () => {
    if (!name || !cardType) return;
    const commonCard = {
      name,
      type: cardType,
      cardType: cardType.charAt(0).toUpperCase() + cardType.slice(1),
      description: editor.previewDescription,
      art: artFilename,
      triggers: editor.previewTriggers,
      ...(cardType === "numen"
        ? { level: level || 1, nature, ...(family ? { family } : {}), ...(rarity ? { rarity } : {}), attack: attack || 0, defense: defense || 0 }
        : { ...(rarity ? { rarity } : {}), mana: mana || 0 }),
    };
    if (isEditMode && id) {
      const cards = await readCards();
      await saveCards(cards.map((c: any) => (c.id === id ? { id, ...commonCard } : c)));
      navigate("/card-list");
    } else {
      await addCard({ id: `${cardType}-${Date.now()}`, ...commonCard });
      navigate("/card-list");
    }
  };

  const basicInputsSection = (
    <>
      <Text c={colors.Black_1} size="xl" fw={700}>{isEditMode ? "Card Edit" : "Card Creation"}</Text>
      <Select data={cardTypeOptions} value={cardType} onChange={(val) => val && setCardType(val as CardTypeOption)} label="Card Type" disabled={hasPassiveTrigger} styles={inputStyles} />
      <TextInput value={name} onChange={(e) => setName(e.target.value)} label="Card Name" styles={inputStyles} />
      {cardType === "numen" ? (
        <>
          <Select data={familyOptions} value={family} onChange={(val) => setFamily(val || "")} label="Family" styles={inputStyles} maxDropdownHeight={Infinity} />
          <Select data={rarityOptions} value={rarity} onChange={(val) => setRarity(val || "")} label="Rarity" styles={inputStyles} />
          <NumberInput label="Level" value={level} onChange={(val) => setLevel(typeof val === "number" ? val : "")} min={1} max={10} styles={inputStyles} />
          <Select data={natureOptions} value={nature} onChange={(val) => setnature(val || "")} label="Nature" styles={inputStyles} maxDropdownHeight={Infinity} />
          <NumberInput label="Attack" value={attack} onChange={(val) => setAttack(typeof val === "number" ? val : "")} min={0} styles={inputStyles} />
          <NumberInput label="Defense" value={defense} onChange={(val) => setDefense(typeof val === "number" ? val : "")} min={0} styles={inputStyles} />
        </>
      ) : (
        <>
          <Select data={rarityOptions} value={rarity} onChange={(val) => setRarity(val || "")} label="Rarity" styles={inputStyles} />
          <NumberInput label="Mana Cost" value={mana} onChange={(val) => setMana(typeof val === "number" ? val : "")} min={0} styles={inputStyles} />
        </>
      )}
      <Text c={colors.Black_1} size="md" fw={600}>Card Art</Text>
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
        accept={["image/png", "image/jpeg", "image/gif", "image/webp"]}
        style={styles.dropzoneContainer}
      >
        <Group data-name="dropzone-content" justify="center" style={styles.dropzoneContent}>
          <IconPhoto size={32} color={colors.Gray_5} />
          <Text c={colors.Black_1} size="sm" fw={500}>{artFilename}</Text>
          <IconUpload size={20} color={colors.Gray_5} />
        </Group>
      </Dropzone>
    </>
  );

  const isRiteOrWard = cardType === "rite" || cardType === "ward";

  const effectTypeTriggersSection = (
    <>
      <Text c={colors.Black_1} size="md" fw={600}>Add Effect - Type</Text>
      {!isRiteOrWard && (
        <Select data={triggerTypeOptions} value={triggerType} onChange={(val) => handleTriggerTypeChange(val as "passive" | "active" | null)} label="Trigger Type" styles={inputStyles} />
      )}
      {triggerType === "passive" && !isRiteOrWard && (
        <Select data={passiveTriggerOptions} value={selectedPassiveTrigger} onChange={(val) => setSelectedPassiveTrigger(val as any)} label="Passive Trigger" styles={inputStyles} maxDropdownHeight={Infinity} />
      )}
      {(triggerType === "active" || isRiteOrWard) && (
        <Box data-name="active-triggers-box" style={styles.activeTriggersBox}>
          <Text c={colors.Black_1} size="sm" fw={600}>Active Triggers (select one or more)</Text>
          {activeTriggerOptions.map((option) => (
            <Checkbox key={option.value} label={option.label} checked={selectedActiveTriggers.has(option.value as ConditionalTrigger)} onChange={() => toggleActiveTrigger(option.value as ConditionalTrigger)} styles={{ label: { color: colors.Black_1 } }} />
          ))}
        </Box>
      )}
      {(triggerType === "active" || isRiteOrWard) && hasAnyActiveAttackTrigger && !allTriggersNonAttack && (
        <Select data={dynamicAttackTargetOptions} value={selectedAttackTarget} onChange={(val) => setSelectedAttackTarget(val as "player" | "numen" | "allied_numen" | "anything" | null)} label="Attack Target" styles={inputStyles} />
      )}
      {(triggerType === "active" || isRiteOrWard) && hasWhenTrigger && (
        <>
          <TextInput placeholder="What (e.g. opponent's card, allied numen)..." value={whenTarget} onChange={(e) => setWhenTarget(e.target.value)} label="When - What" styles={inputStyles} />
          <TextInput placeholder="When what (e.g. is removed from their deck)..." value={whenCondition} onChange={(e) => setWhenCondition(e.target.value)} label="When - Condition" styles={inputStyles} />
        </>
      )}
    </>
  );

  const effectsDropdownSection = (
    <>
      {(triggerType === "active" || isRiteOrWard) && selectedActiveTriggers.size > 0 && (
        <Select data={effectOptions} value={selectedEffectType ?? null} onChange={(val) => handleEffectSelect(val as EffectType | null)} label="Select Effect" styles={inputStyles} />
      )}
      {(triggerType === "active" || isRiteOrWard) && selectedEffectType && (
        <EffectParamInputs selectedEffect={selectedEffectType} effectParams={effectParams} setEffectParams={setEffectParams} effectTarget={selectedEffectTarget ?? null} />
      )}
      {(triggerType === "active" || isRiteOrWard) && selectedEffectType && (
        <OtherwiseEffectInputs setEffectParams={setEffectParams} effectParams={effectParams} currentTrigger={currentTrigger} cardType={cardType} />
      )}
      {(triggerType === "active" || isRiteOrWard) && selectedEffectType && (
        <OrEffectInputs setEffectParams={setEffectParams} effectParams={effectParams} currentTrigger={currentTrigger} cardType={cardType} />
      )}
      {(triggerType === "active" || isRiteOrWard) && selectedEffectType && (
        <ForEachInputs setEffectParams={setEffectParams} effectParams={effectParams} />
      )}
      {(triggerType === "active" || isRiteOrWard) && selectedEffectType && (
        <Button leftSection={<IconPlus size={16} />} onClick={addEffectToPending} disabled={!isEffectAndForEachComplete()} styles={{ root: styles.addPendingButton }}>Add to Pending</Button>
      )}
      {(triggerType === "active" || isRiteOrWard) && pendingEffects.length > 0 && (
        <Box data-name="pending-effects-box" style={styles.pendingEffectsBox}>
          <Text c={colors.Black_1} size="sm" fw={600}>Pending Effects</Text>
          {pendingEffects.map((p, index) => (
            <Box data-name="pending-effect-item" key={index} style={styles.pendingEffectItem}>
              <Text c={colors.White_1} size="xs" fw={500}>{p.effect.effect}{p.effectTarget ? ` → ${getEffectTargetLabel(p.effectTarget)}` : ""}</Text>
              <Button size="xs" leftSection={<IconX size={12} />} onClick={() => removePendingEffect(index)} styles={{ root: styles.pendingRemoveButton }}>Remove</Button>
            </Box>
          ))}
        </Box>
      )}
      {editingSlotIndex !== null ? (
        <>
          {addingEffectToSlot ? (
            <Button leftSection={<IconPlus size={16} />} onClick={addPendingEffectToSlot} disabled={selectedActiveTriggers.size === 0 || pendingEffects.length === 0} styles={{ root: styles.saveButton }}>Add Effect to Trigger</Button>
          ) : (
            <Button leftSection={<IconDeviceFloppy size={16} />} onClick={replaceEffectSlot} disabled={isRiteOrWard ? selectedActiveTriggers.size === 0 || pendingEffects.length === 0 : triggerType === "passive" ? !selectedPassiveTrigger : selectedActiveTriggers.size === 0 || pendingEffects.length === 0} styles={{ root: styles.saveButton }}>Replace Effect</Button>
          )}
          <Button leftSection={<IconX size={16} />} onClick={cancelEditing} styles={{ root: styles.cancelButton }}>Cancel Editing</Button>
        </>
      ) : (
        <Button leftSection={<IconPlus size={16} />} onClick={addEffectToSlot} disabled={isRiteOrWard ? pendingEffects.length === 0 : triggerType === "passive" ? !selectedPassiveTrigger : selectedActiveTriggers.size === 0 || pendingEffects.length === 0} styles={{ root: styles.addEffectButton }}>Add Effect with Trigger</Button>
      )}
      <Button leftSection={<IconDeviceFloppy size={16} />} onClick={handleSave} disabled={!name || !cardType || (cardType === "numen" && !nature)} styles={{ root: styles.saveButton }}>{isEditMode ? "Save Changes" : "Save Card"}</Button>
      <Box data-name="back-to-card-list-box" style={styles.backToCardListBox}>
        <Text c={colors.Black_1} size="md" fw={600} style={styles.clickableText} onClick={() => navigate("/card-list")}>Back to Card List</Text>
      </Box>
    </>
  );

  const effectsSection = (
    <Box data-name="effects-section" style={styles.effectsSection}>
      {effectSlots.length > 0 ? (
        <>
          <Text c={colors.Black_1} size="lg" fw={700}>Card Effects</Text>
          {effectSlots.map((slot: EffectSlot, slotIndex: number) => {
            const isPassive = isPassiveValue(slot.trigger as string);
            const effectsList = slot.effects || (slot.effect ? [slot.effect] : []);
            const isEditing = editingSlotIndex === slotIndex;
            return (
              <Box data-name="effect-slot-wrapper" key={slotIndex} style={styles.effectSlotWrapper}>
                {isPassive ? (
                  <Box data-name="passive-effect-slot" style={styles.effectSlotHeader(false)}>
                    <Box data-name="effect-slot-trigger-info" style={styles.effectSlotTriggerInfo}>
                      <Text c={colors.White_1} size="sm" fw={600}>{slot.trigger}</Text>
                    </Box>
                    <Box data-name="effect-slot-action-buttons" style={styles.effectSlotActionButtons}>
                      <Button size="xs" leftSection={<IconChevronUp size={10} />} onClick={(e) => { e.stopPropagation(); moveEffectSlot(slotIndex, -1); }} disabled={slotIndex === 0} styles={{ root: styles.smallGrayButtonRoot }} />
                      <Button size="xs" leftSection={<IconChevronDown size={10} />} onClick={(e) => { e.stopPropagation(); moveEffectSlot(slotIndex, 1); }} disabled={slotIndex === effectSlots.length - 1} styles={{ root: styles.smallGrayButtonRoot }} />
                      <Button size="xs" leftSection={<IconX size={10} />} onClick={(e) => { e.stopPropagation(); removeEffectSlot(slotIndex); }} styles={{ root: styles.smallRedButtonRoot }} />
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Box data-name="effect-slot-header" style={styles.effectSlotHeader(isEditing)} onClick={(e) => { if ((e.target as HTMLElement).closest("button")) return; toggleTriggerExpansion(slotIndex); }}>
                      <Box data-name="effect-slot-trigger-info" style={styles.effectSlotTriggerInfo}>
                        {expandedTriggers.has(slotIndex) ? <IconChevronDown size={14} color={colors.White_1} /> : <IconChevronRight size={14} color={colors.White_1} />}
                        <Text c={colors.White_1} size="sm" fw={600}>{slot.trigger}{slot.attackTarget ? ` (attack: ${slot.attackTarget})` : ""}</Text>
                      </Box>
                      <Box data-name="effect-slot-action-buttons" style={styles.effectSlotActionButtons}>
                        <Button size="xs" leftSection={<IconChevronUp size={10} />} onClick={(e) => { e.stopPropagation(); moveEffectSlot(slotIndex, -1); }} disabled={slotIndex === 0} styles={{ root: styles.smallGrayButtonRoot }} />
                        <Button size="xs" leftSection={<IconChevronDown size={10} />} onClick={(e) => { e.stopPropagation(); moveEffectSlot(slotIndex, 1); }} disabled={slotIndex === effectSlots.length - 1} styles={{ root: styles.smallGrayButtonRoot }} />
                        <Button size="xs" leftSection={<IconPlus size={10} />} onClick={(e) => { e.stopPropagation(); loadSlotForAddingEffect(slotIndex); }} styles={{ root: styles.smallGreenButtonRoot }} />
                        <Button size="xs" leftSection={<IconX size={10} />} onClick={(e) => { e.stopPropagation(); removeEffectSlot(slotIndex); }} styles={{ root: styles.smallRedButtonRoot }} />
                      </Box>
                    </Box>
                    {expandedTriggers.has(slotIndex) && (
                      <Box data-name="expanded-effects-list" style={styles.expandedEffectsList}>
                        {effectsList.map((effect: EffectEntry, effectIdx: number) => {
                          const targetLabel = (effect as any).effectTarget ? getEffectTargetLabel((effect as any).effectTarget) : "";
                          const isActiveEffect = isEditing && editingEffectIndex === effectIdx;
                          return (
                            <Box data-name="effect-item" key={effectIdx} style={styles.effectItem(isActiveEffect)} onClick={() => loadEffectForEditing(slotIndex, effectIdx)}>
                              <Text c={colors.White_1} size="xs" fw={500} style={styles.clickableText}>{effect.effect}{targetLabel ? ` → ${targetLabel}` : ""}</Text>
                              <Box data-name="effect-item-action-buttons" style={styles.effectItemActionButtons}>
                                <Button size="xs" leftSection={<IconChevronUp size={10} />} onClick={(e) => { e.stopPropagation(); moveEffectInSlot(slotIndex, effectIdx, -1); }} disabled={effectIdx === 0} styles={{ root: styles.smallGrayButtonRoot }} />
                                <Button size="xs" leftSection={<IconChevronDown size={10} />} onClick={(e) => { e.stopPropagation(); moveEffectInSlot(slotIndex, effectIdx, 1); }} disabled={effectIdx === effectsList.length - 1} styles={{ root: styles.smallGrayButtonRoot }} />
                                <Button size="xs" leftSection={<IconPencil size={10} />} onClick={(e) => { e.stopPropagation(); loadEffectForEditing(slotIndex, effectIdx); }} styles={{ root: styles.smallBlueButtonRoot }} />
                                <Button size="xs" leftSection={<IconX size={10} />} onClick={(e) => { e.stopPropagation(); removeEffectInSlot(slotIndex, effectIdx); }} styles={{ root: styles.smallRedButtonRoot }} />
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            );
          })}
        </>
      ) : (
        <Text c={colors.White_1} size="md" fw={500} style={styles.noEffectsText}>No effects added yet</Text>
      )}
    </Box>
  );

  return (
    <Box data-name="card-editor-grid" style={styles.cardEditorGrid}>
      <Box data-name="basic-inputs-column" style={styles.basicInputsColumn}>{basicInputsSection}</Box>
      <Box data-name="effect-type-triggers-column" style={styles.effectTypeTriggersColumn}>{effectTypeTriggersSection}</Box>
      <Box data-name="effects-dropdown-column" style={styles.effectsDropdownColumn}>{effectsDropdownSection}</Box>
      <Box data-name="effects-section-column" style={styles.effectsSectionColumn}>{effectsSection}</Box>
      <Box data-name="card-preview-column" style={styles.cardPreviewColumn}><CardTemplate card={buildPreviewCard()} size="lg" artImage={artImage} /></Box>
    </Box>
  );
};

export default CardEditor;
