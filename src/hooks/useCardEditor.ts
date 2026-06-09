import { useState, useCallback } from 'react';
import { EffectType } from '../logic/Effects';
import { PassiveTrigger, ConditionalTrigger } from '../logic/Triggers';
import type { EffectEntry } from '../logic/Effects';
import type { TriggerEntry } from '../logic/Triggers';
import type { ConditionalTriggerEffect } from '../logic/Triggers';
import type { CardData } from '../components/Card/CardTemplate';
import { generateDescription } from '../logic/DescriptionEngine';
import { isPassiveValue, isHpManaEffectTarget } from '../logic/CardEditorOptions';
import type { CardTypeOption, EffectSlot } from '../logic/CardEditorOptions';
import type { AttackTarget } from '../logic/Triggers';
import type { EffectTarget } from '../logic/Triggers';

export type TriggerType = 'passive' | 'active';

export interface PendingEffect {
  effect: EffectEntry;
  effectTarget?: EffectTarget;
}

export function useCardEditor() {
  const [cardType, setCardType] = useState<CardTypeOption | ''>('numen');
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
  const [selectedEffectType, setSelectedEffectType] = useState<EffectType | null>(null);
  const [effectParams, setEffectParams] = useState<Record<string, any>>({});
  const [whenTarget, setWhenTarget] = useState<string>('');
  const [whenCondition, setWhenCondition] = useState<string>('');
  const [pendingEffects, setPendingEffects] = useState<PendingEffect[]>([]);
  const [effectSlots, setEffectSlots] = useState<EffectSlot[]>([]);

  const buildPreviewTriggers = (): TriggerEntry[] => {
    const triggers: TriggerEntry[] = [];
    for (const slot of effectSlots) {
      if (isPassiveValue(slot.trigger as string)) {
        triggers.push(slot.trigger as PassiveTrigger);
      } else {
        const effectsList = slot.effects || (slot.effect ? [slot.effect] : []);
        const conditionalEntry: ConditionalTriggerEffect = {
          trigger: slot.trigger as any,
          effects: effectsList,
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
      type: (cardType || 'numen') as CardData['type'],
      cardType: (cardType || 'numen').charAt(0).toUpperCase() + (cardType || 'numen').slice(1),
      description: previewDescription,
      art: artFilename,
      triggers: previewTriggers,
    };

    if (cardType === 'numen') {
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
    setSelectedEffectType(null);
    setPendingEffects([]);
    setEffectParams({});
    setWhenTarget('');
    setWhenCondition('');
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

  const handleEffectSelect = (value: EffectType | null) => {
    setSelectedEffectType(value);
    setEffectParams({});
  };

  const buildOtherwiseEffect = (): EffectEntry | null => {
    if (!effectParams.otherwise_effect_type) return null;
    const ot = effectParams.otherwise_effect_type;
    const op = effectParams.otherwise_effect_params || {};
    switch (ot) {
      case EffectType.DRAW:
        return { effect: EffectType.DRAW, count: op.count || 1, target: op.target || 'player' };
      case EffectType.DECREASE:
        return { effect: EffectType.DECREASE, target: op.target || 'hp', amount: op.amount || 100, duration: op.duration || 'permanent' };
      case EffectType.INCREASE:
        return { effect: EffectType.INCREASE, target: op.target || 'atk', amount: op.amount || 100, duration: op.duration || 'permanent' };
      case EffectType.DESTROY:
        return { effect: EffectType.DESTROY, count: op.count || 1 };
      case EffectType.EXILE:
        return { effect: EffectType.EXILE, count: op.count || 1 };
      case EffectType.SCRY:
        return { effect: EffectType.SCRY, count: op.count || 1, deck: op.deck || 'player' };
      case EffectType.PETRIFY:
        return { effect: EffectType.PETRIFY, turns: op.turns || 1 };
      case EffectType.LOCK:
        return { effect: EffectType.LOCK, duration: op.duration || 'permanent' };
      case EffectType.ETHEREAL:
        return { effect: EffectType.ETHEREAL, count: op.count || 1, type: op.type || 'rite' };
      case EffectType.FIND:
        return { effect: EffectType.FIND, count: op.count || 1, source: op.source || 'deck' };
      case EffectType.ADD_TRIGGER:
        return { effect: EffectType.ADD_TRIGGER, trigger_type: op.trigger_type || 'CHALLENGE', duration: op.duration || 1 };
      case EffectType.SUMMON:
        return { effect: EffectType.SUMMON, from: op.from || 'player_deck', criteria: {}, count: op.count || 1 };
      case EffectType.COPY:
        return { effect: EffectType.COPY, copyTarget: op.copyTarget || 'numen', destination: op.destination || 'player_deck', count: op.count || 1 };
      case EffectType.ADD:
        return { effect: EffectType.ADD, destination: op.destination || 'player_deck', count: op.count || 1 };
      case EffectType.RETURN:
        return { effect: EffectType.RETURN, destination: op.destination || 'hand', count: op.count || 1 };
      default:
        return null;
    }
  };

  const addEffectToPending = () => {
    if (!selectedEffectType) return;

    let effect: EffectEntry | null = null;
    const target = selectedEffectTarget;

    switch (selectedEffectType) {
      case EffectType.DRAW:
        effect = { effect: EffectType.DRAW, count: effectParams.count || 1, target: effectParams.target || 'player' };
        break;
      case EffectType.SCRY:
        effect = { effect: EffectType.SCRY, count: effectParams.count || 1, deck: effectParams.deck || 'player' };
        break;
      case EffectType.DESTROY:
        effect = target ? { effect: EffectType.DESTROY, count: effectParams.count || 1, effectTarget: target } : { effect: EffectType.DESTROY, count: effectParams.count || 1 };
        break;
      case EffectType.EXILE:
        effect = target ? { effect: EffectType.EXILE, count: effectParams.count || 1, effectTarget: target } : { effect: EffectType.EXILE, count: effectParams.count || 1 };
        break;
      case EffectType.PETRIFY:
        effect = target ? { effect: EffectType.PETRIFY, turns: effectParams.turns || 1, effectTarget: target } : { effect: EffectType.PETRIFY, turns: effectParams.turns || 1 };
        break;
      case EffectType.DECREASE:
        effect = target
          ? { effect: EffectType.DECREASE, target: effectParams.target || 'hp', amount: effectParams.amount || 100, duration: isHpManaEffectTarget(target) ? undefined : (effectParams.duration || 'permanent'), durationTurns: isHpManaEffectTarget(target) ? undefined : effectParams.durationTurns, effectTarget: target }
          : { effect: EffectType.DECREASE, target: effectParams.target || 'hp', amount: effectParams.amount || 100, duration: isHpManaEffectTarget(target) ? undefined : (effectParams.duration || 'permanent'), durationTurns: isHpManaEffectTarget(target) ? undefined : effectParams.durationTurns };
        break;
      case EffectType.LOCK:
        effect = target
          ? { effect: EffectType.LOCK, duration: effectParams.duration || 'permanent', turns: effectParams.turns, effectTarget: target }
          : { effect: EffectType.LOCK, duration: effectParams.duration || 'permanent', turns: effectParams.turns };
        break;
      case EffectType.INCREASE:
        effect = target
          ? { effect: EffectType.INCREASE, target: effectParams.target || 'atk', amount: effectParams.amount || 100, duration: isHpManaEffectTarget(target) ? undefined : (effectParams.duration || 'permanent'), durationTurns: isHpManaEffectTarget(target) ? undefined : effectParams.durationTurns, effectTarget: target }
          : { effect: EffectType.INCREASE, target: effectParams.target || 'atk', amount: effectParams.amount || 100, duration: isHpManaEffectTarget(target) ? undefined : (effectParams.duration || 'permanent'), durationTurns: isHpManaEffectTarget(target) ? undefined : effectParams.durationTurns };
        break;
      case EffectType.ETHEREAL:
         effect = target ? { effect: EffectType.ETHEREAL, count: effectParams.count || 1, type: effectParams.type || 'rite', effectTarget: target } : { effect: EffectType.ETHEREAL, count: effectParams.count || 1, type: effectParams.type || 'rite' };
        break;
      case EffectType.FIND:
        effect = target ? { effect: EffectType.FIND, count: effectParams.count || 1, source: effectParams.source || 'deck', effectTarget: target } : { effect: EffectType.FIND, count: effectParams.count || 1, source: effectParams.source || 'deck' };
        break;
      case EffectType.ADD_TRIGGER:
        effect = target ? { effect: EffectType.ADD_TRIGGER, trigger_type: effectParams.trigger_type || 'CHALLENGE', duration: effectParams.duration || 1, effectTarget: target } : { effect: EffectType.ADD_TRIGGER, trigger_type: effectParams.trigger_type || 'CHALLENGE', duration: effectParams.duration || 1 };
        break;
      case EffectType.SUMMON: {
        const criteriaItems = effectParams._criteriaItems || [];
        const mergedCriteria: Record<string, any> = {};
        for (const item of criteriaItems) {
          if (item.type === 'name' && item.value) {
            mergedCriteria.name = item.value;
          } else if (item.type && item.value !== undefined && item.value !== null) {
            if (mergedCriteria[item.type]) {
              if (Array.isArray(mergedCriteria[item.type])) {
                mergedCriteria[item.type] = [...new Set([...mergedCriteria[item.type], ...item.value])];
              }
            } else {
              mergedCriteria[item.type] = item.value;
            }
          }
        }
        effect = target
          ? { effect: EffectType.SUMMON, from: effectParams.from || 'player_deck', criteria: mergedCriteria, count: effectParams.count || 1, effectTarget: target }
          : { effect: EffectType.SUMMON, from: effectParams.from || 'player_deck', criteria: mergedCriteria, count: effectParams.count || 1 };
        break;
      }
      case EffectType.COPY:
        effect = target
          ? { effect: EffectType.COPY, copyTarget: effectParams.copyTarget || 'numen', destination: effectParams.destination || 'player_deck', count: effectParams.count || 1, effectTarget: target }
          : { effect: EffectType.COPY, copyTarget: effectParams.copyTarget || 'numen', destination: effectParams.destination || 'player_deck', count: effectParams.count || 1 };
        break;
      case EffectType.ADD:
        effect = target
          ? { effect: EffectType.ADD, destination: effectParams.destination || 'player_deck', count: effectParams.count || 1, effectTarget: target }
          : { effect: EffectType.ADD, destination: effectParams.destination || 'player_deck', count: effectParams.count || 1 };
        break;
      case EffectType.RETURN:
        effect = target
          ? { effect: EffectType.RETURN, destination: effectParams.destination || 'hand', count: effectParams.count || 1, effectTarget: target }
          : { effect: EffectType.RETURN, destination: effectParams.destination || 'hand', count: effectParams.count || 1 };
        break;
    }

    if (!effect) return;

    if (effectParams.otherwise && effectParams.otherwise_effect_type) {
      const otherwiseEffect = buildOtherwiseEffect();
      if (otherwiseEffect) {
        (effect as any).otherwise = true;
        (effect as any).otherwise_effect = otherwiseEffect;
      }
    }

    const pendingEntry: PendingEffect = { effect };
    if (target) pendingEntry.effectTarget = target;
    setPendingEffects(prev => [...prev, pendingEntry]);
    setSelectedEffectType(null);
    setEffectParams({});
  };

  const removePendingEffect = (index: number) => {
    setPendingEffects(prev => prev.filter((_, i) => i !== index));
  };

  const resetEffectForm = () => {
    setSelectedPassiveTrigger(null);
    setSelectedActiveTriggers(new Set());
    setSelectedAttackTarget(null);
    setSelectedEffectTarget(null);
    setSelectedEffectType(null);
    setPendingEffects([]);
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
      if (selectedActiveTriggers.size === 0 || pendingEffects.length === 0) return;

      const newSlots: EffectSlot[] = [];
      for (const trigger of selectedActiveTriggers) {
        const slot: EffectSlot = {
          trigger,
          effects: pendingEffects.map(p => p.effect),
        };

        if (selectedAttackTarget) {
          slot.attackTarget = selectedAttackTarget;
        }

        newSlots.push(slot);
      }

      setEffectSlots(prev => [...prev, ...newSlots]);
      resetEffectForm();
      return;
    }
  };

  const removeEffectSlot = (index: number) => {
    setEffectSlots(prev => prev.filter((_, i) => i !== index));
  };

  const isEffectComplete = (): boolean => {
    if (!selectedEffectType) return false;
    if (selectedActiveTriggers.size === 0) return false;

    switch (selectedEffectType) {
      case EffectType.DRAW:
        return !!effectParams.count && !!effectParams.target;
      case EffectType.SCRY:
        return !!effectParams.count && !!effectParams.deck;
      case EffectType.DESTROY:
        return true;
      case EffectType.EXILE:
        return true;
      case EffectType.PETRIFY:
        return !!effectParams.turns;
      case EffectType.DECREASE: {
        const isHpManaTarget = isHpManaEffectTarget(selectedEffectTarget);
        const hasStat = !selectedEffectTarget || isNumenEffectTarget(selectedEffectTarget) ? !!effectParams.target : true;
        const hasDuration = isHpManaTarget ? true : !!effectParams.duration;
        const hasDurationTurns = effectParams.duration === 'temporary' ? !!effectParams.durationTurns : true;
        const hasAmount = !!effectParams.amount;
        return hasStat && hasDuration && hasDurationTurns && hasAmount;
      }
      case EffectType.LOCK: {
        const hasDuration = !!effectParams.duration;
        const hasTurns = effectParams.duration === 'temporary' ? !!effectParams.turns : true;
        return hasDuration && hasTurns;
      }
      case EffectType.INCREASE: {
        const isHpManaTarget = isHpManaEffectTarget(selectedEffectTarget);
        const hasStat = !selectedEffectTarget || isNumenEffectTarget(selectedEffectTarget) ? !!effectParams.target : true;
        const hasDuration = isHpManaTarget ? true : !!effectParams.duration;
        const hasDurationTurns = effectParams.duration === 'temporary' ? !!effectParams.durationTurns : true;
        const hasAmount = !!effectParams.amount;
        return hasStat && hasDuration && hasDurationTurns && hasAmount;
      }
      case EffectType.ETHEREAL:
        return !!effectParams.count && !!effectParams.type;
      case EffectType.FIND:
        return !!effectParams.count && !!effectParams.source;
      case EffectType.ADD_TRIGGER:
        return !!effectParams.trigger_type && !!effectParams.duration;
      case EffectType.SUMMON:
        return !!effectParams.from && !!effectParams.count;
      case EffectType.COPY:
        return !!effectParams.copyTarget && !!effectParams.destination && !!effectParams.count;
      case EffectType.ADD:
        return !!effectParams.destination && !!effectParams.count;
      case EffectType.RETURN:
        return !!effectParams.destination && !!effectParams.count;
      default:
        return false;
    }
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
    selectedEffectType, setSelectedEffectType,
    effectParams, setEffectParams,
    pendingEffects, setPendingEffects,
    effectSlots, setEffectSlots,
    previewTriggers,
    previewDescription,
    buildPreviewCard,
    handleTriggerTypeChange,
    toggleActiveTrigger,
    handleEffectSelect,
    addEffectToPending,
    removePendingEffect,
    addEffectToSlot,
    removeEffectSlot,
    isEffectComplete,
    whenTarget, setWhenTarget,
    whenCondition, setWhenCondition,
  };
}

function isNumenEffectTarget(target: EffectTarget | null | undefined): boolean {
  if (!target) return false;
  const numenTargets: EffectTarget[] = [
    'self', 'attack_target', 'any_numen', 'allied_numen', 'enemy_numen',
    'all_allied_numina', 'all_enemy_numina', 'global_allied_numina', 'global_enemy_numina',
  ];
  return numenTargets.includes(target);
}
