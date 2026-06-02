import { useState, useCallback } from 'react';
import { EffectType } from '../logic/Effects';
import { PassiveTrigger, ConditionalTrigger } from '../logic/Triggers';
import type { EffectEntry } from '../logic/Effects';
import type { TriggerEntry } from '../logic/Triggers';
import type { ConditionalTriggerEffect } from '../logic/Triggers';
import type { CardData } from '../components/Card/CardTemplate';
import { generateDescription } from '../logic/DescriptionEngine';
import { isPassiveValue } from '../logic/CardEditorOptions';
import type { CardTypeOption, EffectSlot } from '../logic/CardEditorOptions';
import type { AttackTarget } from '../logic/Triggers';
import type { EffectTarget } from '../logic/Triggers';

export type TriggerType = 'passive' | 'active';

export function useCardEditor() {
  const [cardType, setCardType] = useState<CardTypeOption | ''>('monster');
  const [name, setName] = useState('');
  const [mana, setMana] = useState<number | ''>('');
  const [level, setLevel] = useState<number | ''>('');
  const [attack, setAttack] = useState<number | ''>('');
  const [defense, setDefense] = useState<number | ''>('');
  const [attribute, setAttribute] = useState('dark');
  const [family, setFamily] = useState('');
  const [rarity, setRarity] = useState('');
  const [artFilename, setArtFilename] = useState<string>('placeholder.svg');
  const [artImage, setArtImage] = useState<string | null>(null);

  const [triggerType, setTriggerType] = useState<TriggerType>('passive');
  const [selectedPassiveTrigger, setSelectedPassiveTrigger] = useState<PassiveTrigger | null>(null);
  const [selectedActiveTriggers, setSelectedActiveTriggers] = useState<Set<ConditionalTrigger>>(new Set());
  const [selectedAttackTarget, setSelectedAttackTarget] = useState<AttackTarget | null>(null);
  const [selectedEffectTarget, setSelectedEffectTarget] = useState<EffectTarget | null>(null);
  const [selectedEffects, setSelectedEffects] = useState<Set<EffectType>>(new Set());
  const [effectParams, setEffectParams] = useState<Record<string, any>>({});
  const [effectSlots, setEffectSlots] = useState<EffectSlot[]>([]);

  const buildPreviewTriggers = (): TriggerEntry[] => {
    const triggers: TriggerEntry[] = [];
    for (const slot of effectSlots) {
      if (isPassiveValue(slot.trigger as string)) {
        triggers.push(slot.trigger as PassiveTrigger);
      } else {
        const conditionalEntry: ConditionalTriggerEffect = {
          trigger: slot.trigger as any,
          effect: slot.effect!,
        };
        if (slot.attackTarget) {
          conditionalEntry.attackTarget = slot.attackTarget;
        }
        if (slot.effectTarget) {
          conditionalEntry.effectTarget = slot.effectTarget;
        }
        triggers.push(conditionalEntry);
      }
    }
    return triggers;
  };

  const previewTriggers = buildPreviewTriggers();
  const previewDescription = generateDescription(previewTriggers);

  const buildPreviewCard = useCallback((): CardData => {
    const base: Partial<CardData> = {
      id: 'preview',
      name: name || '',
      type: (cardType || 'monster') as CardData['type'],
      cardType: (cardType || 'monster').charAt(0).toUpperCase() + (cardType || 'monster').slice(1),
      description: previewDescription,
      art: artFilename,
      triggers: previewTriggers,
    };

    if (cardType === 'monster') {
      base.level = level || 1;
      base.attribute = attribute;
      if (family) base.family = family;
      base.attack = attack || 0;
      base.defense = defense || 0;
    } else {
      base.mana = mana || 0;
    }
    if (rarity) base.rarity = rarity;

    return base as CardData;
  }, [cardType, name, mana, level, attack, defense, attribute, family, rarity, previewDescription, previewTriggers, artFilename]);

  const handleTriggerTypeChange = (value: TriggerType | null) => {
    if (!value) return;
    setTriggerType(value);
    setSelectedPassiveTrigger(null);
    setSelectedActiveTriggers(new Set());
    setSelectedAttackTarget(null);
    setSelectedEffectTarget(null);
    setSelectedEffects(new Set());
    setEffectParams({});
  };

  const toggleActiveTrigger = (trigger: ConditionalTrigger) => {
    setSelectedActiveTriggers(prev => {
      const next = new Set(prev);
      if (next.has(trigger)) {
        next.delete(trigger);
      } else {
        next.add(trigger);
      }
      return next;
    });
  };

  const toggleEffect = (effect: EffectType) => {
    setSelectedEffects(prev => {
      const next = new Set(prev);
      if (next.has(effect)) {
        next.delete(effect);
      } else {
        next.add(effect);
      }
      return next;
    });
  };

  const handleEffectSelect = (value: string | null) => {
    setEffectParams({});
  };

  const resetEffectForm = () => {
    setSelectedPassiveTrigger(null);
    setSelectedActiveTriggers(new Set());
    setSelectedAttackTarget(null);
    setSelectedEffectTarget(null);
    setSelectedEffects(new Set());
    setEffectParams({});
  };

  const addEffectToSlot = () => {
    if (triggerType === 'passive') {
      if (!selectedPassiveTrigger) return;
      const slot: EffectSlot = {
        trigger: selectedPassiveTrigger,
      };
      setEffectSlots(prev => [...prev, slot]);
      resetEffectForm();
      return;
    }

    if (triggerType === 'active') {
      if (selectedActiveTriggers.size === 0 || selectedEffects.size === 0) return;

      const newSlots: EffectSlot[] = [];
      for (const trigger of selectedActiveTriggers) {
        for (const effectType of selectedEffects) {
          let effect: EffectEntry | null = null;

          switch (effectType) {
            case EffectType.DRAW:
              effect = { effect: EffectType.DRAW, count: effectParams.count || 1 };
              break;
            case EffectType.SCRY:
              effect = { effect: EffectType.SCRY, count: effectParams.count || 1, deck: effectParams.deck || 'player' };
              break;
            case EffectType.DESTROY:
              effect = { effect: EffectType.DESTROY, targetType: effectParams.targetType || 'monster' };
              break;
            case EffectType.EXILE:
              effect = { effect: EffectType.EXILE, targetType: effectParams.targetType || 'monster' };
              break;
            case EffectType.STUN:
              effect = { effect: EffectType.STUN, turns: effectParams.turns || 1 };
              break;
            case EffectType.DECREASE:
              effect = { effect: EffectType.DECREASE, target: effectParams.target || 'hp', amount: effectParams.amount || 100 };
              break;
            case EffectType.LOCK:
              effect = { effect: EffectType.LOCK, turns: effectParams.turns || 1 };
              break;
            case EffectType.INCREASE:
              effect = { effect: EffectType.INCREASE, target: effectParams.target || 'atk', amount: effectParams.amount || 100 };
              break;
            case EffectType.SHIELD:
              effect = { effect: EffectType.SHIELD, attacks: effectParams.attacks || 1 };
              break;
            case EffectType.ETHEREAL:
              effect = { effect: EffectType.ETHEREAL, count: effectParams.count || 1, type: effectParams.type || 'spell' };
              break;
            case EffectType.FIND:
              effect = { effect: EffectType.FIND, count: effectParams.count || 1, source: effectParams.source || 'deck' };
              break;
            case EffectType.ADD_TRIGGER:
              effect = { effect: EffectType.ADD_TRIGGER, trigger_type: effectParams.trigger_type || 'PROVOCATION', duration: effectParams.duration || 1 };
              break;
          }

          if (!effect) continue;

          const slot: EffectSlot = {
            trigger,
            effect,
          };

          if (selectedAttackTarget) {
            slot.attackTarget = selectedAttackTarget;
          }

          if (selectedEffectTarget) {
            slot.effectTarget = selectedEffectTarget;
          }

          newSlots.push(slot);
        }
      }

      setEffectSlots(prev => [...prev, ...newSlots]);
      resetEffectForm();
      return;
    }
  };

  const removeEffectSlot = (index: number) => {
    setEffectSlots(prev => prev.filter((_, i) => i !== index));
  };

  return {
    cardType, setCardType,
    name, setName,
    mana, setMana,
    level, setLevel,
    attack, setAttack,
    defense, setDefense,
    attribute, setAttribute,
    family, setFamily,
    rarity, setRarity,
    artFilename, setArtFilename,
    artImage, setArtImage,
    triggerType, setTriggerType,
    selectedPassiveTrigger, setSelectedPassiveTrigger,
    selectedActiveTriggers, setSelectedActiveTriggers,
    selectedAttackTarget, setSelectedAttackTarget,
    selectedEffectTarget, setSelectedEffectTarget,
    selectedEffects, setSelectedEffects,
    effectParams, setEffectParams,
    effectSlots, setEffectSlots,
    previewTriggers,
    previewDescription,
    buildPreviewCard,
    handleTriggerTypeChange,
    toggleActiveTrigger,
    toggleEffect,
    handleEffectSelect,
    addEffectToSlot,
    removeEffectSlot,
  };
}