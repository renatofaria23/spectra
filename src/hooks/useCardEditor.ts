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
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);

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
      case EffectType.DESTROY:
        return otTarget ? { effect: EffectType.DESTROY, count: op.count || 1, effectTarget: otTarget } : { effect: EffectType.DESTROY, count: op.count || 1 };
      case EffectType.EXILE: {
        const exileFromField = (op as any).exileFromField !== false;
        if (exileFromField) {
          return otTarget ? { effect: EffectType.EXILE, count: op.count || 1, effectTarget: otTarget } : { effect: EffectType.EXILE, count: op.count || 1 };
        } else {
          const criteriaItems = op._criteriaItems || [];
          const mergedExileCriteria: Record<string, any> = {};
          const exileCardTypeFields = ['any_numen', 'any_ward', 'any_rite', 'any_magic'];
          for (const item of criteriaItems) {
            if (item.type === 'name' && item.value) {
              mergedExileCriteria.name = item.value;
            } else if (exileCardTypeFields.includes(item.type)) {
              mergedExileCriteria[item.type] = true;
            } else if (item.type && item.value !== undefined && item.value !== null) {
              if (mergedExileCriteria[item.type]) {
                if (Array.isArray(mergedExileCriteria[item.type])) {
                  mergedExileCriteria[item.type] = [...new Set([...mergedExileCriteria[item.type], ...item.value])];
                }
              } else {
                mergedExileCriteria[item.type] = item.value;
              }
            }
          }
          return { effect: EffectType.EXILE, from: op.from || 'player_deck', criteria: mergedExileCriteria, count: op.count || 1 };
        }
      }
      case EffectType.PETRIFY:
        return otTarget ? { effect: EffectType.PETRIFY, turns: op.turns || 1, effectTarget: otTarget } : { effect: EffectType.PETRIFY, turns: op.turns || 1 };
      case EffectType.DECREASE:
        return otTarget
          ? { effect: EffectType.DECREASE, target: op.target || 'hp', amount: op.amount || 100, duration: isHpManaEffectTarget(otTarget) ? undefined : (op.duration || 'permanent'), durationTurns: isHpManaEffectTarget(otTarget) ? undefined : op.durationTurns, effectTarget: otTarget }
          : { effect: EffectType.DECREASE, target: op.target || 'hp', amount: op.amount || 100, duration: op.duration || 'permanent' };
      case EffectType.LOCK:
        return otTarget
          ? { effect: EffectType.LOCK, duration: op.duration || 'permanent', turns: op.turns, effectTarget: otTarget }
          : { effect: EffectType.LOCK, duration: op.duration || 'permanent', turns: op.turns };
      case EffectType.INCREASE:
        return otTarget
          ? { effect: EffectType.INCREASE, target: op.target || 'atk', amount: op.amount || 100, duration: isHpManaEffectTarget(otTarget) ? undefined : (op.duration || 'permanent'), durationTurns: isHpManaEffectTarget(otTarget) ? undefined : op.durationTurns, effectTarget: otTarget }
          : { effect: EffectType.INCREASE, target: op.target || 'atk', amount: op.amount || 100, duration: op.duration || 'permanent' };
      case EffectType.ETHEREAL:
        return otTarget ? { effect: EffectType.ETHEREAL, count: op.count || 1, type: op.type || 'rite', effectTarget: otTarget } : { effect: EffectType.ETHEREAL, count: op.count || 1, type: op.type || 'rite' };
      case EffectType.FIND:
        return otTarget ? { effect: EffectType.FIND, count: op.count || 1, source: op.source || 'deck', effectTarget: otTarget } : { effect: EffectType.FIND, count: op.count || 1, source: op.source || 'deck' };
      case EffectType.ADD_TRIGGER:
        return otTarget ? { effect: EffectType.ADD_TRIGGER, trigger_type: op.trigger_type || 'CHALLENGE', duration: op.duration || 1, effectTarget: otTarget } : { effect: EffectType.ADD_TRIGGER, trigger_type: op.trigger_type || 'CHALLENGE', duration: op.duration || 1 };
      case EffectType.SUMMON: {
        const criteriaItems = op._criteriaItems || [];
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
        return otTarget
          ? { effect: EffectType.SUMMON, from: op.from || 'player_deck', criteria: mergedCriteria, count: op.count || 1, effectTarget: otTarget }
          : { effect: EffectType.SUMMON, from: op.from || 'player_deck', criteria: mergedCriteria, count: op.count || 1 };
      }
      case EffectType.COPY:
        return otTarget
          ? { effect: EffectType.COPY, copyTarget: op.copyTarget || 'numen', destination: op.destination || 'player_deck', count: op.count || 1, effectTarget: otTarget }
          : { effect: EffectType.COPY, copyTarget: op.copyTarget || 'numen', destination: op.destination || 'player_deck', count: op.count || 1 };
      case EffectType.ADD:
        return otTarget
          ? { effect: EffectType.ADD, destination: op.destination || 'player_deck', count: op.count || 1, effectTarget: otTarget }
          : { effect: EffectType.ADD, destination: op.destination || 'player_deck', count: op.count || 1 };
      case EffectType.RETURN:
        return otTarget
          ? { effect: EffectType.RETURN, destination: op.destination || 'hand', count: op.count || 1, effectTarget: otTarget }
          : { effect: EffectType.RETURN, destination: op.destination || 'hand', count: op.count || 1 };
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
      case EffectType.DESTROY:
        effect = target ? { effect: EffectType.DESTROY, count: effectParams.count || 1, effectTarget: target } : { effect: EffectType.DESTROY, count: effectParams.count || 1 };
        break;
      case EffectType.EXILE: {
        const exileFromField = effectParams.exileFromField !== false;
        if (exileFromField) {
          const exileTarget = effectParams._exileTarget || target;
          effect = exileTarget ? { effect: EffectType.EXILE, count: effectParams.count || 1, effectTarget: exileTarget } : { effect: EffectType.EXILE, count: effectParams.count || 1 };
        } else {
          const criteriaItems = effectParams._criteriaItems || [];
          const mergedExileCriteria: Record<string, any> = {};
          const exileCardTypeFields = ['any_numen', 'any_ward', 'any_rite', 'any_magic'];
          for (const item of criteriaItems) {
            if (item.type === 'name' && item.value) {
              mergedExileCriteria.name = item.value;
            } else if (exileCardTypeFields.includes(item.type)) {
              mergedExileCriteria[item.type] = true;
            } else if (item.type && item.value !== undefined && item.value !== null) {
              if (mergedExileCriteria[item.type]) {
                if (Array.isArray(mergedExileCriteria[item.type])) {
                  mergedExileCriteria[item.type] = [...new Set([...mergedExileCriteria[item.type], ...item.value])];
                }
              } else {
                mergedExileCriteria[item.type] = item.value;
              }
            }
          }
          effect = { effect: EffectType.EXILE, from: effectParams.from || 'player_deck', criteria: mergedExileCriteria, count: effectParams.count || 1 };
        }
        break;
      }
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

  const loadEffectForEditing = (index: number) => {
    const slot = effectSlots[index];
    if (!slot) return;

    setEditingSlotIndex(index);

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

      if (slot.attackTarget) {
        setSelectedAttackTarget(slot.attackTarget);
      } else {
        setSelectedAttackTarget(null);
      }

      const effectsList = slot.effects || (slot.effect ? [slot.effect] : []);
      const firstEffect = effectsList[0];

      if (firstEffect) {
        setSelectedEffectTarget(slot.effectTarget || (firstEffect as any).effectTarget || null);
        setSelectedEffectType(firstEffect.effect as EffectType);

        const params: Record<string, any> = {};
        switch (firstEffect.effect) {
          case EffectType.DRAW:
            params.count = (firstEffect as any).count;
            params.target = (firstEffect as any).target || 'player';
            break;
          case EffectType.SCRY:
            params.count = (firstEffect as any).count;
            params.deck = (firstEffect as any).deck || 'player';
            break;
          case EffectType.DESTROY:
            params.count = (firstEffect as any).count || 1;
            break;
          case EffectType.EXILE:
            params.count = (firstEffect as any).count || 1;
            params.from = (firstEffect as any).from;
            if ((firstEffect as any).criteria) {
              params.exileFromField = false;
              const criteria = (firstEffect as any).criteria;
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
            params.turns = (firstEffect as any).turns;
            break;
          case EffectType.DECREASE:
            params.target = (firstEffect as any).target || 'hp';
            params.amount = (firstEffect as any).amount;
            params.duration = (firstEffect as any).duration || 'permanent';
            if ((firstEffect as any).durationTurns) params.durationTurns = (firstEffect as any).durationTurns;
            break;
          case EffectType.LOCK:
            params.duration = (firstEffect as any).duration || 'permanent';
            if ((firstEffect as any).turns) params.turns = (firstEffect as any).turns;
            break;
          case EffectType.INCREASE:
            params.target = (firstEffect as any).target || 'atk';
            params.amount = (firstEffect as any).amount;
            params.duration = (firstEffect as any).duration || 'permanent';
            if ((firstEffect as any).durationTurns) params.durationTurns = (firstEffect as any).durationTurns;
            break;
          case EffectType.ETHEREAL:
            params.count = (firstEffect as any).count;
            params.type = (firstEffect as any).type || 'rite';
            break;
          case EffectType.FIND:
            params.count = (firstEffect as any).count;
            params.source = (firstEffect as any).source || 'deck';
            break;
          case EffectType.ADD_TRIGGER:
            params.trigger_type = (firstEffect as any).trigger_type || 'CHALLENGE';
            params.duration = (firstEffect as any).duration || 1;
            break;
          case EffectType.SUMMON:
            params.from = (firstEffect as any).from || 'player_deck';
            params.count = (firstEffect as any).count || 1;
            if ((firstEffect as any).criteria) {
              const criteria = (firstEffect as any).criteria;
              params._criteriaItems = [];
              if (criteria.name) params._criteriaItems.push({ type: 'name', value: criteria.name });
              if (criteria.level) params._criteriaItems.push({ type: 'level', value: criteria.level });
              if (criteria.families) params._criteriaItems.push({ type: 'families', value: criteria.families });
              if (criteria.natures) params._criteriaItems.push({ type: 'natures', value: criteria.natures });
              if (criteria.rarities) params._criteriaItems.push({ type: 'rarities', value: criteria.rarities });
            }
            break;
          case EffectType.COPY:
            params.copyTarget = (firstEffect as any).copyTarget || 'numen';
            params.destination = (firstEffect as any).destination || 'player_deck';
            params.count = (firstEffect as any).count || 1;
            break;
          case EffectType.ADD:
            params.destination = (firstEffect as any).destination || 'player_deck';
            params.count = (firstEffect as any).count || 1;
            break;
          case EffectType.RETURN:
            params.destination = (firstEffect as any).destination || 'hand';
            params.count = (firstEffect as any).count || 1;
            break;
        }

        if ((firstEffect as any).otherwise && (firstEffect as any).otherwise_effect) {
          const oe = (firstEffect as any).otherwise_effect;
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

        if ((firstEffect as any).or && (firstEffect as any).or_effect) {
          const orE = (firstEffect as any).or_effect;
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

        if ((firstEffect as any).forEach && (firstEffect as any).forEachConfig) {
          params.forEach = true;
          params.forEachConfig = (firstEffect as any).forEachConfig;
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

  const replaceEffectSlot = () => {
    if (editingSlotIndex === null) return;

    if (triggerType === 'passive') {
      if (!selectedPassiveTrigger) return;
      const newSlot: EffectSlot = {
        trigger: selectedPassiveTrigger,
      };
      setEffectSlots(prev => {
        const next = [...prev];
        next[editingSlotIndex] = newSlot;
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
        const triggers = oldSlot && oldSlot.trigger ? [oldSlot.trigger] : Array.from(selectedActiveTriggers);

        for (const trigger of triggers) {
          const slotIndex = next.findIndex((s, i) => i === editingSlotIndex || (s.trigger === trigger && i >= editingSlotIndex));
          const slot: EffectSlot = {
            trigger,
            effects: pendingEffects.map(p => p.effect),
          };
          if (selectedAttackTarget) {
            slot.attackTarget = selectedAttackTarget;
          }
          if (slotIndex !== -1) {
            next[slotIndex] = slot;
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
    if (selectedActiveTriggers.size === 0) return false;

    switch (selectedEffectType) {
      case EffectType.DRAW:
        return !!effectParams.count && !!effectParams.target;
      case EffectType.SCRY:
        return !!effectParams.count && !!effectParams.deck;
      case EffectType.DESTROY:
        return true;
      case EffectType.EXILE: {
        const exileFromField = effectParams.exileFromField !== false;
        if (exileFromField) return true;
        return !!effectParams.from && !!effectParams.count;
      }
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
    editingSlotIndex,
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
    loadEffectForEditing,
    cancelEditing,
    replaceEffectSlot,
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
