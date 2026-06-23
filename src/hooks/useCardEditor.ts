import { useState, useCallback } from 'react';
import { EffectType } from '../logic/Effects';
import { PassiveTrigger, ConditionalTrigger } from '../logic/Triggers';
import type { EffectEntry } from '../logic/Effects';
import type { TriggerEntry } from '../logic/Triggers';
import type { ConditionalTriggerEffect } from '../logic/Triggers';
import type { CardData } from '../components/Card/CardTemplate/CardTemplate';
import { generateDescription } from '../logic/DescriptionEngine';
import { isPassiveValue, isHpManaEffectTarget, isNumenTarget } from '../logic/CardEditorOptions';
import type { CardTypeOption, EffectSlot } from '../logic/CardEditorOptions';
import type { AttackTarget } from '../logic/Triggers';
import type { EffectTarget } from '../logic/Triggers';

export type TriggerType = 'passive' | 'active';

export interface PendingEffect {
  effect: EffectEntry;
  effectTarget?: EffectTarget;
}

function mergeCriteriaItems(criteriaItems: any[]): Record<string, any> {
  const merged: Record<string, any> = {};
  const cardTypeFields = ['any_numen', 'any_ward', 'any_rite', 'any_magic'];
  for (const item of criteriaItems) {
    if (item.type === 'name' && item.value) merged.name = item.value;
    else if (cardTypeFields.includes(item.type)) merged[item.type] = true;
    else if (item.type && item.value != null) {
      merged[item.type] = merged[item.type] && Array.isArray(merged[item.type])
        ? [...new Set([...merged[item.type], ...item.value])]
        : item.value;
    }
  }
  return merged;
}

function mergeSimpleCriteria(criteriaItems: any[]): Record<string, any> {
  const merged: Record<string, any> = {};
  for (const item of criteriaItems) {
    if (item.type === 'name' && item.value) merged.name = item.value;
    else if (item.type && item.value != null) {
      merged[item.type] = merged[item.type] && Array.isArray(merged[item.type])
        ? [...new Set([...merged[item.type], ...item.value])]
        : item.value;
    }
  }
  return merged;
}

export function useCardEditor() {
  const [cardType, setCardType] = useState<CardTypeOption | ''>('numen');
  const [name, setName] = useState('');
  const [mana, setMana] = useState<number | ''>('');
  const [level, setLevel] = useState<number | ''>('');
  const [attack, setAttack] = useState<number | ''>('');
  const [defense, setDefense] = useState<number | ''>('');
  const [nature, setnature] = useState('dark');
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
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [editingEffectIndex, setEditingEffectIndex] = useState<number | null>(null);
  const [addingEffectToSlot, setAddingEffectToSlot] = useState(false);

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
        if (slot.attackTarget) conditionalEntry.attackTarget = slot.attackTarget;
        if (slot.effectTarget) conditionalEntry.effectTarget = slot.effectTarget;
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
      base.nature = nature;
      if (family) base.family = family;
      base.attack = attack || 0;
      base.defense = defense || 0;
    } else {
      base.mana = mana || 0;
    }
    if (rarity) base.rarity = rarity;

    return base as CardData;
  }, [cardType, name, mana, level, attack, defense, nature, family, rarity, previewDescription, previewTriggers, artFilename]);

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
      if (next.has(trigger)) next.delete(trigger);
      else next.add(trigger);
      return next;
    });
  };

  const handleEffectSelect = (value: EffectType | null) => {
    setSelectedEffectType(value);
    setEffectParams({});
  };

  const buildSecondaryEffect = (prefix: string): EffectEntry | null => {
    if (!effectParams[`${prefix}_effect_type`]) return null;
    const ot = effectParams[`${prefix}_effect_type`];
    const op = effectParams[`${prefix}_effect_params`] || {};
    const otTarget = effectParams[`${prefix}_effect_target`];
    switch (ot) {
      case EffectType.DRAW:
        return { effect: EffectType.DRAW, count: op.count || 1, target: op.target || 'player' };
      case EffectType.SCRY:
        return { effect: EffectType.SCRY, count: op.count || 1, deck: op.deck || 'player' };
      case EffectType.FORGET:
        return otTarget ? { effect: EffectType.FORGET, count: op.count || 1, effectTarget: otTarget } : { effect: EffectType.FORGET, count: op.count || 1 };
      case EffectType.EXILE: {
        const exileFromField = (op as any).exileFromField !== false;
        if (exileFromField) {
          return otTarget ? { effect: EffectType.EXILE, count: op.count || 1, effectTarget: otTarget } : { effect: EffectType.EXILE, count: op.count || 1 };
        }
        const mergedExileCriteria = mergeCriteriaItems(op._criteriaItems || []);
        return { effect: EffectType.EXILE, from: op.from || 'player_deck', criteria: mergedExileCriteria, count: op.count || 1 };
      }
      case EffectType.PETRIFY:
        return otTarget ? { effect: EffectType.PETRIFY, turns: op.turns || 1, effectTarget: otTarget } : { effect: EffectType.PETRIFY, turns: op.turns || 1 };
      case EffectType.DECREASE: {
        const decTargetType = op._targetType || 'self';
        const decIsNumen = isNumenTarget(decTargetType);
        const decBase: any = { effect: EffectType.DECREASE, target: decTargetType, effectTarget: op.effectTarget || (decIsNumen ? 'atk' : 'hp'), amount: op.amount || 100 };
        if (decIsNumen) { decBase.duration = op.duration || 'permanent'; if (op.durationTurns) decBase.durationTurns = op.durationTurns; }
        if (otTarget) decBase.effectTarget = otTarget;
        return decBase;
      }
      case EffectType.LOCK:
        return otTarget
          ? { effect: EffectType.LOCK, duration: op.duration || 'permanent', turns: op.turns, effectTarget: otTarget }
          : { effect: EffectType.LOCK, duration: op.duration || 'permanent', turns: op.turns };
      case EffectType.INCREASE: {
        const incTargetType = op._targetType || 'self';
        const incIsNumen = isNumenTarget(incTargetType);
        const incBase: any = { effect: EffectType.INCREASE, target: incTargetType, effectTarget: op.effectTarget || (incIsNumen ? 'atk' : 'hp'), amount: op.amount || 100 };
        if (incIsNumen) { incBase.duration = op.duration || 'permanent'; if (op.durationTurns) incBase.durationTurns = op.durationTurns; }
        if (otTarget) incBase.effectTarget = otTarget;
        return incBase;
      }
      case EffectType.ETHEREAL:
        return otTarget ? { effect: EffectType.ETHEREAL, count: op.count || 1, type: op.type || 'rite', effectTarget: otTarget } : { effect: EffectType.ETHEREAL, count: op.count || 1, type: op.type || 'rite' };
      case EffectType.FIND:
        return otTarget ? { effect: EffectType.FIND, count: op.count || 1, source: op.source || 'deck', effectTarget: otTarget } : { effect: EffectType.FIND, count: op.count || 1, source: op.source || 'deck' };
      case EffectType.ADD:
        return otTarget
          ? { effect: EffectType.ADD, addFrom: op.addFrom || 'player_field', addTargetType: op.addTargetType || 'any', destination: op.destination || 'player_deck', count: op.count || 1, effectTarget: otTarget }
          : { effect: EffectType.ADD, addFrom: op.addFrom || 'player_field', addTargetType: op.addTargetType || 'any', destination: op.destination || 'player_deck', count: op.count || 1 };
      case EffectType.RETURN: {
        const returnTarget = effectParams.returnTarget || 'player_memora';
        const returnFieldTarget = effectParams.returnFieldTarget;
        const returnCardType = effectParams.returnCardType;
        const returnDestination = effectParams.returnDestination || 'hand';
        const isFieldTarget = returnTarget === 'player_field' || returnTarget === 'opponent_field';
        const isZoneTarget = returnTarget.includes('_memora') || returnTarget.includes('_exile');
        const isAllField = isFieldTarget && returnFieldTarget && returnFieldTarget.startsWith('all_');
        const isAllZone = isZoneTarget && returnCardType === 'any';
        const baseReturn: any = { effect: EffectType.RETURN, returnTarget, returnDestination, count: (isAllField || isAllZone) ? 1 : (op.count || 1) };
        if (isFieldTarget && returnFieldTarget) baseReturn.returnFieldTarget = returnFieldTarget;
        else if (isZoneTarget) baseReturn.returnCardType = returnCardType;
        if (otTarget) baseReturn.effectTarget = otTarget;
        return baseReturn;
      }
      default:
        return null;
    }
  };

  const buildOtherwiseEffect = (): EffectEntry | null => buildSecondaryEffect('otherwise');
  const buildOrEffect = (): EffectEntry | null => buildSecondaryEffect('or');

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
      case EffectType.FORGET:
        effect = target ? { effect: EffectType.FORGET, count: effectParams.count || 1, effectTarget: target } : { effect: EffectType.FORGET, count: effectParams.count || 1 };
        break;
      case EffectType.EXILE: {
        const exileFromField = effectParams.exileFromField !== false;
        if (exileFromField) {
          const exileTarget = effectParams._exileTarget || target;
          effect = exileTarget ? { effect: EffectType.EXILE, count: effectParams.count || 1, effectTarget: exileTarget } : { effect: EffectType.EXILE, count: effectParams.count || 1 };
        } else {
          const mergedExileCriteria = mergeCriteriaItems(effectParams._criteriaItems || []);
          effect = { effect: EffectType.EXILE, from: effectParams.from || 'player_deck', criteria: mergedExileCriteria, count: effectParams.count || 1 };
        }
        break;
      }
      case EffectType.PETRIFY:
        effect = target ? { effect: EffectType.PETRIFY, turns: effectParams.turns || 1, effectTarget: target } : { effect: EffectType.PETRIFY, turns: effectParams.turns || 1 };
        break;
      case EffectType.DECREASE: {
        const decTargetType = effectParams._targetType || 'self';
        const decIsNumen = isNumenTarget(decTargetType);
        const decEffect: any = { effect: EffectType.DECREASE, target: decTargetType, effectTarget: effectParams.effectTarget || (decIsNumen ? 'atk' : 'hp'), amount: effectParams.amount || 100 };
        if (decIsNumen) { decEffect.duration = effectParams.duration || 'permanent'; if (effectParams.durationTurns) decEffect.durationTurns = effectParams.durationTurns; }
        effect = decEffect;
        break;
      }
      case EffectType.LOCK:
        effect = target
          ? { effect: EffectType.LOCK, duration: effectParams.duration || 'permanent', turns: effectParams.turns, effectTarget: target }
          : { effect: EffectType.LOCK, duration: effectParams.duration || 'permanent', turns: effectParams.turns };
        break;
      case EffectType.INCREASE: {
        const incTargetType = effectParams._targetType || 'self';
        const incIsNumen = isNumenTarget(incTargetType);
        const incEffect: any = { effect: EffectType.INCREASE, target: incTargetType, effectTarget: effectParams.effectTarget || (incIsNumen ? 'atk' : 'hp'), amount: effectParams.amount || 100 };
        if (incIsNumen) { incEffect.duration = effectParams.duration || 'permanent'; if (effectParams.durationTurns) incEffect.durationTurns = effectParams.durationTurns; }
        effect = incEffect;
        break;
      }
      case EffectType.ETHEREAL:
        effect = target ? { effect: EffectType.ETHEREAL, count: effectParams.count || 1, type: effectParams.type || 'rite', effectTarget: target } : { effect: EffectType.ETHEREAL, count: effectParams.count || 1, type: effectParams.type || 'rite' };
        break;
      case EffectType.FIND:
        effect = target ? { effect: EffectType.FIND, count: effectParams.count || 1, source: effectParams.source || 'deck', effectTarget: target } : { effect: EffectType.FIND, count: effectParams.count || 1, source: effectParams.source || 'deck' };
        break;
      case EffectType.ADD_TRIGGER:
        effect = target ? { effect: EffectType.ADD_TRIGGER, trigger_type: effectParams.trigger_type || 'CHALLENGE', duration: effectParams.duration || 1, effectTarget: target } : { effect: EffectType.ADD_TRIGGER, trigger_type: effectParams.trigger_type || 'CHALLENGE', duration: effectParams.duration || 1 };
        break;
      case EffectType.INVOKE:
        effect = target
          ? { effect: EffectType.INVOKE, from: effectParams.from || 'player_hand', criteria: mergeSimpleCriteria(effectParams._criteriaItems || []), count: effectParams.count || 1, effectTarget: target }
          : { effect: EffectType.INVOKE, from: effectParams.from || 'player_hand', criteria: mergeSimpleCriteria(effectParams._criteriaItems || []), count: effectParams.count || 1 };
        break;
      case EffectType.EVOKE:
        effect = target
          ? { effect: EffectType.EVOKE, from: effectParams.from || 'player_memora', criteria: mergeSimpleCriteria(effectParams._criteriaItems || []), count: effectParams.count || 1, effectTarget: target }
          : { effect: EffectType.EVOKE, from: effectParams.from || 'player_memora', criteria: mergeSimpleCriteria(effectParams._criteriaItems || []), count: effectParams.count || 1 };
        break;
      case EffectType.CONVOKE:
        effect = target
          ? { effect: EffectType.CONVOKE, from: effectParams.from || 'player_deck', criteria: mergeSimpleCriteria(effectParams._criteriaItems || []), count: effectParams.count || 1, effectTarget: target }
          : { effect: EffectType.CONVOKE, from: effectParams.from || 'player_deck', criteria: mergeSimpleCriteria(effectParams._criteriaItems || []), count: effectParams.count || 1 };
        break;
      case EffectType.COPY:
        effect = target
          ? { effect: EffectType.COPY, copyTarget: effectParams.copyTarget || 'numen', destination: effectParams.destination || 'player_deck', count: effectParams.count || 1, effectTarget: target }
          : { effect: EffectType.COPY, copyTarget: effectParams.copyTarget || 'numen', destination: effectParams.destination || 'player_deck', count: effectParams.count || 1 };
        break;
      case EffectType.ADD:
        effect = target
          ? { effect: EffectType.ADD, addFrom: effectParams.addFrom || 'player_field', addTargetType: effectParams.addTargetType || 'any', destination: effectParams.destination || 'player_deck', count: effectParams.count || 1, effectTarget: target }
          : { effect: EffectType.ADD, addFrom: effectParams.addFrom || 'player_field', addTargetType: effectParams.addTargetType || 'any', destination: effectParams.destination || 'player_deck', count: effectParams.count || 1 };
        break;
      case EffectType.RETURN: {
        const isSelfReturn = target === 'self';
        if (isSelfReturn) {
          effect = { effect: EffectType.RETURN, effectTarget: 'self', returnDestination: effectParams.returnDestination || 'hand' };
        } else {
          const returnTarget = effectParams.returnTarget || 'player_memora';
          const returnFieldTarget = effectParams.returnFieldTarget;
          const returnCardType = effectParams.returnCardType;
          const returnDestination = effectParams.returnDestination || 'hand';
          const isFieldTarget = returnTarget === 'player_field' || returnTarget === 'opponent_field';
          const isZoneTarget = returnTarget.includes('_memora') || returnTarget.includes('_exile');
          const isAllField = isFieldTarget && returnFieldTarget && returnFieldTarget.startsWith('all_');
          const isAllZone = isZoneTarget && returnCardType === 'any';
          const baseReturn: any = { effect: EffectType.RETURN, returnTarget, returnDestination, count: (isAllField || isAllZone) ? 1 : (effectParams.count || 1) };
          if (isFieldTarget && returnFieldTarget) baseReturn.returnFieldTarget = returnFieldTarget;
          else if (isZoneTarget) baseReturn.returnCardType = returnCardType;
          if (target) baseReturn.effectTarget = target;
          effect = baseReturn;
        }
        break;
      }
      default:
        effect = null;
    }

    if (!effect) return;

    if (effectParams.otherwise && effectParams.otherwise_effect_type) {
      const otherwiseEffect = buildOtherwiseEffect();
      if (otherwiseEffect) {
        (effect as any).otherwise = true;
        (effect as any).otherwise_effect = otherwiseEffect;
      }
    }

    if (effectParams.or && effectParams.or_effect_type) {
      const orEffect = buildOrEffect();
      if (orEffect) {
        (effect as any).or = true;
        (effect as any).or_effect = orEffect;
      }
    }

    if (effectParams.forEach && effectParams.forEachConfig) {
      (effect as any).forEach = true;
      (effect as any).forEachConfig = effectParams.forEachConfig;
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
    if (cardType === 'rite' || cardType === 'ward') {
      if (pendingEffects.length === 0) return;
      const slot: EffectSlot = {
        trigger: ConditionalTrigger.DECREE,
        effects: pendingEffects.map(p => p.effect),
      };
      setEffectSlots(prev => [...prev, slot]);
      resetEffectForm();
      return;
    }

    if (triggerType === 'passive') {
      if (!selectedPassiveTrigger) return;
      setEffectSlots(prev => [...prev, { trigger: selectedPassiveTrigger }]);
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
        if (selectedAttackTarget) slot.attackTarget = selectedAttackTarget;
        newSlots.push(slot);
      }
      setEffectSlots(prev => [...prev, ...newSlots]);
      resetEffectForm();
      return;
    }
  };

  const removeEffectInSlot = (slotIndex: number, effectIndex: number) => {
    setEffectSlots(prev => {
      const next = [...prev];
      const slot = next[slotIndex]!;
      const effectsList = slot.effects || (slot.effect ? [slot.effect] : []);
      effectsList.splice(effectIndex, 1);
      if (effectsList.length === 0) next.splice(slotIndex, 1);
      else next[slotIndex] = { ...slot, effects: effectsList };
      return next;
    });
  };

  const moveEffectInSlot = (slotIndex: number, effectIndex: number, direction: -1 | 1) => {
    setEffectSlots(prev => {
      const next = [...prev];
      const slot = next[slotIndex]!;
      const effectsList = slot.effects || (slot.effect ? [slot.effect] : []);
      const newEffectIndex = effectIndex + direction;
      if (newEffectIndex < 0 || newEffectIndex >= effectsList.length) return prev;
      const temp: EffectEntry = effectsList[effectIndex]!;
      effectsList[effectIndex] = effectsList[newEffectIndex]!;
      effectsList[newEffectIndex] = temp;
      next[slotIndex] = { ...slot, effects: effectsList };
      return next;
    });
  };

  const removeEffectSlot = (index: number) => {
    setEffectSlots(prev => prev.filter((_, i) => i !== index));
  };

  const moveEffectSlot = (index: number, direction: -1 | 1) => {
    setEffectSlots(prev => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const next = [...prev];
      const temp: EffectSlot = next[index]!;
      next[index] = next[newIndex]!;
      next[newIndex] = temp;
      return next;
    });
  };

  const loadSlotForAddingEffect = (index: number) => {
    const slot = effectSlots[index];
    if (!slot) return;
    if (isPassiveValue(slot.trigger as string)) return;

    setEditingSlotIndex(index);
    setEditingEffectIndex(null);
    setAddingEffectToSlot(true);
    setTriggerType('active');
    setSelectedPassiveTrigger(null);
    setSelectedActiveTriggers(new Set([slot.trigger as ConditionalTrigger]));
    setSelectedAttackTarget(slot.attackTarget || null);
    setSelectedEffectTarget(null);
    setSelectedEffectType(null);
    setPendingEffects([]);
    setEffectParams({});
    setWhenTarget('');
    setWhenCondition('');
  };

  const loadEffectForEditing = (index: number, effectIndex?: number) => {
    const slot = effectSlots[index];
    if (!slot) return;

    setEditingSlotIndex(index);
    setEditingEffectIndex(effectIndex ?? null);

    const isPassive = isPassiveValue(slot.trigger as string);

    if (isPassive) {
      setTriggerType('passive');
      setSelectedPassiveTrigger(slot.trigger as PassiveTrigger);
      setSelectedActiveTriggers(new Set());
      setSelectedAttackTarget(null);
      setSelectedEffectTarget(null);
      setSelectedEffectType(null);
      setPendingEffects([]);
      setEffectParams({});
      setWhenTarget('');
      setWhenCondition('');
    } else {
      setTriggerType('active');
      setSelectedPassiveTrigger(null);
      const trigger = slot.trigger as ConditionalTrigger;
      setSelectedActiveTriggers(new Set([trigger]));
      setSelectedAttackTarget(slot.attackTarget || null);

      const effectsList = slot.effects || (slot.effect ? [slot.effect] : []);
      const targetEffect = effectIndex !== undefined ? effectsList[effectIndex] : effectsList[0];

      if (targetEffect) {
        setSelectedEffectTarget(slot.effectTarget || (targetEffect as any).effectTarget || null);
        setSelectedEffectType(targetEffect.effect as EffectType);

        const params: Record<string, any> = {};
        switch (targetEffect.effect) {
          case EffectType.DRAW:
            params.count = (targetEffect as any).count;
            params.target = (targetEffect as any).target || 'player';
            break;
          case EffectType.SCRY:
            params.count = (targetEffect as any).count;
            params.deck = (targetEffect as any).deck || 'player';
            break;
          case EffectType.FORGET:
            params.count = (targetEffect as any).count || 1;
            break;
          case EffectType.EXILE:
            params.count = (targetEffect as any).count || 1;
            params.from = (targetEffect as any).from;
            if ((targetEffect as any).criteria) {
              params.exileFromField = false;
              const criteria = (targetEffect as any).criteria;
              params._criteriaItems = [];
              if (criteria.name) params._criteriaItems.push({ type: 'name', value: criteria.name });
              if (criteria.level) params._criteriaItems.push({ type: 'level', value: criteria.level });
              if (criteria.families) params._criteriaItems.push({ type: 'families', value: criteria.families });
              if (criteria.natures) params._criteriaItems.push({ type: 'natures', value: criteria.natures });
              if (criteria.rarities) params._criteriaItems.push({ type: 'rarities', value: criteria.rarities });
            } else {
              params.exileFromField = true;
            }
            break;
          case EffectType.PETRIFY:
            params.turns = (targetEffect as any).turns;
            break;
          case EffectType.DECREASE:
            params._targetType = (targetEffect as any).target || 'self';
            params.effectTarget = (targetEffect as any).effectTarget || 'atk';
            params.amount = (targetEffect as any).amount;
            params.duration = (targetEffect as any).duration || 'permanent';
            if ((targetEffect as any).durationTurns) params.durationTurns = (targetEffect as any).durationTurns;
            break;
          case EffectType.LOCK:
            params.duration = (targetEffect as any).duration || 'permanent';
            if ((targetEffect as any).turns) params.turns = (targetEffect as any).turns;
            break;
          case EffectType.INCREASE:
            params._targetType = (targetEffect as any).target || 'self';
            params.effectTarget = (targetEffect as any).effectTarget || 'atk';
            params.amount = (targetEffect as any).amount;
            params.duration = (targetEffect as any).duration || 'permanent';
            if ((targetEffect as any).durationTurns) params.durationTurns = (targetEffect as any).durationTurns;
            break;
          case EffectType.ETHEREAL:
            params.count = (targetEffect as any).count;
            params.type = (targetEffect as any).type || 'rite';
            break;
          case EffectType.FIND:
            params.count = (targetEffect as any).count;
            params.source = (targetEffect as any).source || 'deck';
            break;
          case EffectType.ADD_TRIGGER:
            params.trigger_type = (targetEffect as any).trigger_type || 'CHALLENGE';
            params.duration = (targetEffect as any).duration || 1;
            break;
          case EffectType.INVOKE:
            params.from = (targetEffect as any).from || 'player_deck';
            params.count = (targetEffect as any).count || 1;
            if ((targetEffect as any).criteria) {
              const ic = (targetEffect as any).criteria;
              params._criteriaItems = [];
              if (ic.name) params._criteriaItems.push({ type: 'name', value: ic.name });
              if (ic.level) params._criteriaItems.push({ type: 'level', value: ic.level });
              if (ic.families) params._criteriaItems.push({ type: 'families', value: ic.families });
              if (ic.natures) params._criteriaItems.push({ type: 'natures', value: ic.natures });
              if (ic.rarities) params._criteriaItems.push({ type: 'rarities', value: ic.rarities });
            }
            break;
          case EffectType.COPY:
            params.copyTarget = (targetEffect as any).copyTarget || 'numen';
            params.destination = (targetEffect as any).destination || 'player_deck';
            params.count = (targetEffect as any).count || 1;
            break;
          case EffectType.ADD:
            params.addFrom = (targetEffect as any).addFrom || 'player_field';
            params.addTargetType = (targetEffect as any).addTargetType || 'any';
            params.destination = (targetEffect as any).destination || 'player_deck';
            params.count = (targetEffect as any).count || 1;
            break;
          case EffectType.RETURN:
            params.returnTarget = (targetEffect as any).returnTarget || ((targetEffect as any).effectTarget === 'self' ? 'self' : 'memora');
            params.returnFieldTarget = (targetEffect as any).returnFieldTarget;
            params.returnCardType = (targetEffect as any).returnCardType;
            params.returnDestination = (targetEffect as any).returnDestination || 'hand';
            params.count = (targetEffect as any).count || 1;
            break;
        }

        if ((targetEffect as any).otherwise && (targetEffect as any).otherwise_effect) {
          const oe = (targetEffect as any).otherwise_effect;
          params.otherwise = true;
          params.otherwise_effect_type = oe.effect;
          params.otherwise_effect_params = {};
          if ((oe as any).count !== undefined) params.otherwise_effect_params.count = (oe as any).count;
          if ((oe as any).turns !== undefined) params.otherwise_effect_params.turns = (oe as any).turns;
          if ((oe as any).amount !== undefined) params.otherwise_effect_params.amount = (oe as any).amount;
          if ((oe as any).target !== undefined) params.otherwise_effect_params.target = (oe as any).target;
          if ((oe as any).duration !== undefined) params.otherwise_effect_params.duration = (oe as any).duration;
          if ((oe as any).source !== undefined) params.otherwise_effect_params.source = (oe as any).source;
          if ((oe as any).from !== undefined) params.otherwise_effect_params.from = (oe as any).from;
          if ((oe as any).destination !== undefined) params.otherwise_effect_params.destination = (oe as any).destination;
          if ((oe as any).copyTarget !== undefined) params.otherwise_effect_params.copyTarget = (oe as any).copyTarget;
          if ((oe as any).trigger_type !== undefined) params.otherwise_effect_params.trigger_type = (oe as any).trigger_type;
          if ((oe as any).type !== undefined) params.otherwise_effect_params.type = (oe as any).type;
          if ((oe as any).deck !== undefined) params.otherwise_effect_params.deck = (oe as any).deck;
          if ((oe as any).effectTarget) params.otherwise_effect_target = (oe as any).effectTarget;
        } else {
          params.otherwise = false;
        }

        if ((targetEffect as any).or && (targetEffect as any).or_effect) {
          const orE = (targetEffect as any).or_effect;
          params.or = true;
          params.or_effect_type = orE.effect;
          params.or_effect_params = {};
          if ((orE as any).count !== undefined) params.or_effect_params.count = (orE as any).count;
          if ((orE as any).turns !== undefined) params.or_effect_params.turns = (orE as any).turns;
          if ((orE as any).amount !== undefined) params.or_effect_params.amount = (orE as any).amount;
          if ((orE as any).target !== undefined) params.or_effect_params.target = (orE as any).target;
          if ((orE as any).duration !== undefined) params.or_effect_params.duration = (orE as any).duration;
          if ((orE as any).source !== undefined) params.or_effect_params.source = (orE as any).source;
          if ((orE as any).from !== undefined) params.or_effect_params.from = (orE as any).from;
          if ((orE as any).destination !== undefined) params.or_effect_params.destination = (orE as any).destination;
          if ((orE as any).copyTarget !== undefined) params.or_effect_params.copyTarget = (orE as any).copyTarget;
          if ((orE as any).trigger_type !== undefined) params.or_effect_params.trigger_type = (orE as any).trigger_type;
          if ((orE as any).type !== undefined) params.or_effect_params.type = (orE as any).type;
          if ((orE as any).deck !== undefined) params.or_effect_params.deck = (orE as any).deck;
          if ((orE as any).effectTarget) params.or_effect_target = (orE as any).effectTarget;
        } else {
          params.or = false;
        }

        if ((targetEffect as any).forEach && (targetEffect as any).forEachConfig) {
          params.forEach = true;
          params.forEachConfig = (targetEffect as any).forEachConfig;
        } else {
          params.forEach = false;
        }

        setEffectParams(params);
      } else {
        setSelectedEffectTarget(null);
        setSelectedEffectType(null);
        setEffectParams({});
      }
    }
  };

  const cancelEditing = () => {
    setEditingSlotIndex(null);
    setEditingEffectIndex(null);
    setAddingEffectToSlot(false);
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

  const addPendingEffectToSlot = () => {
    if (editingSlotIndex === null || pendingEffects.length === 0) return;
    setEffectSlots(prev => {
      const next = [...prev];
      const slot = next[editingSlotIndex]!;
      const effectsList = slot.effects || (slot.effect ? [slot.effect] : []);
      effectsList.push(...pendingEffects.map(p => p.effect));
      next[editingSlotIndex] = { ...slot, effects: effectsList };
      return next;
    });
    cancelEditing();
  };

  const replaceEffectSlot = () => {
    if (editingSlotIndex === null) return;

    if (triggerType === 'passive') {
      if (!selectedPassiveTrigger) return;
      setEffectSlots(prev => {
        const next = [...prev];
        next[editingSlotIndex] = { trigger: selectedPassiveTrigger };
        return next;
      });
      cancelEditing();
      return;
    }

    if (triggerType === 'active') {
      if (selectedActiveTriggers.size === 0 || pendingEffects.length === 0) return;
      setEffectSlots(prev => {
        const next = [...prev];
        const oldSlot = next[editingSlotIndex];

        if (editingEffectIndex !== null && oldSlot) {
          const effectsList = oldSlot.effects || (oldSlot.effect ? [oldSlot.effect] : []);
          effectsList[editingEffectIndex] = pendingEffects[0]?.effect || effectsList[editingEffectIndex]!;
          next[editingSlotIndex] = { ...oldSlot, effects: effectsList };
        } else {
          const triggers = oldSlot && oldSlot.trigger ? [oldSlot.trigger] : Array.from(selectedActiveTriggers);
          for (const trigger of triggers) {
            const slotIndex = next.findIndex((s, i) => i === editingSlotIndex || (s.trigger === trigger && i >= editingSlotIndex));
            const slot: EffectSlot = {
              trigger,
              effects: pendingEffects.map(p => p.effect),
            };
            if (selectedAttackTarget) slot.attackTarget = selectedAttackTarget;
            if (slotIndex !== -1) next[slotIndex] = slot;
          }
        }
        return next;
      });
      cancelEditing();
      return;
    }
  };

  const isEffectComplete = (): boolean => {
    if (!selectedEffectType) return false;

    switch (selectedEffectType) {
      case EffectType.DRAW:
        return !!effectParams.count && !!effectParams.target;
      case EffectType.SCRY:
        return !!effectParams.count && !!effectParams.deck;
      case EffectType.FORGET:
        return true;
      case EffectType.EXILE: {
        const exileFromField = effectParams.exileFromField !== false;
        if (exileFromField) return true;
        return !!effectParams.from && !!effectParams.count;
      }
      case EffectType.PETRIFY:
        return !!effectParams.turns;
      case EffectType.DECREASE: {
        const decTargetType = effectParams._targetType;
        const decIsNumen = isNumenTarget(decTargetType);
        return !!effectParams._targetType && !!effectParams.effectTarget && !!effectParams.amount &&
          (decIsNumen ? !!effectParams.duration && (effectParams.duration === 'temporary' ? !!effectParams.durationTurns : true) : true);
      }
      case EffectType.LOCK:
        return !!effectParams.duration && (effectParams.duration === 'temporary' ? !!effectParams.turns : true);
      case EffectType.INCREASE: {
        const incTargetType = effectParams._targetType;
        const incIsNumen = isNumenTarget(incTargetType);
        return !!effectParams._targetType && !!effectParams.effectTarget && !!effectParams.amount &&
          (incIsNumen ? !!effectParams.duration && (effectParams.duration === 'temporary' ? !!effectParams.durationTurns : true) : true);
      }
      case EffectType.ETHEREAL:
        return !!effectParams.count && !!effectParams.type;
      case EffectType.FIND:
        return !!effectParams.count && !!effectParams.source;
      case EffectType.ADD_TRIGGER:
        return !!effectParams.trigger_type && !!effectParams.duration;
      case EffectType.INVOKE:
      case EffectType.EVOKE:
      case EffectType.CONVOKE:
        return !!effectParams.from && !!effectParams.count;
      case EffectType.COPY:
        return !!effectParams.copyTarget && !!effectParams.destination && !!effectParams.count;
      case EffectType.ADD:
        return !!effectParams.addFrom && !!effectParams.addTargetType && !!effectParams.destination && !!effectParams.count;
      case EffectType.RETURN: {
        if (effectParams.returnTarget === 'self') return true;
        const returnTarget = effectParams.returnTarget;
        const isField = returnTarget === 'field';
        const isZone = returnTarget === 'memora' || returnTarget === 'exile';
        const isAll = isField && effectParams.returnFieldTarget && effectParams.returnFieldTarget.startsWith('all_');
        return !!returnTarget && (isField ? !!effectParams.returnFieldTarget : true) && (isZone ? !!effectParams.returnCardType : true) && (isAll ? true : !!effectParams.count);
      }
      default:
        return false;
    }
  };

  const isForEachComplete = (): boolean => {
    if (!effectParams.forEach) return true;
    if (!effectParams.forEachConfig) return false;
    return !!effectParams.forEachConfig.cardType && !!effectParams.forEachConfig.zone && !!effectParams.forEachConfig.owner;
  };

  const isEffectAndForEachComplete = (): boolean => {
    return isEffectComplete() && isForEachComplete();
  };

  return {
    cardType, setCardType,
    name, setName,
    mana, setMana,
    level, setLevel,
    attack, setAttack,
    defense, setDefense,
    nature, setnature,
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
    editingSlotIndex,
    editingEffectIndex,
    addingEffectToSlot,
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
    moveEffectSlot,
    removeEffectInSlot,
    moveEffectInSlot,
    loadEffectForEditing,
    loadSlotForAddingEffect,
    cancelEditing,
    replaceEffectSlot,
    addPendingEffectToSlot,
    isEffectComplete,
    isEffectAndForEachComplete,
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