import { Box, NumberInput, Select, TextInput, MultiSelect, Badge, Button, Checkbox } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import { EffectType } from '../../../logic/effects';
import type { EffectTarget } from '../../../logic/triggers';
import { ConditionalTrigger } from '../../../logic/triggers';
import {
  numenStatTargetOptions,
  playerStatTargetOptions,
  scryDeckOptions,
  etherealTypeOptions,
  findSourceOptions,
  inputStyles,
  passiveTriggerOptions,
  invokeFromOptions,
  evokeFromOptions,
  convokeFromOptions,
  familyOptions,
  natureOptions,
  rarityOptions,
  copyTargetTypeOptions,
  addDestinationOptions,
  addFromOptions,
  addTargetTypeOptions,
  getEffectTargetOptions,
  returnTargetOptions,
  returnFieldTargetOptions,
  returnCardTypeOptions,
  returnDestinationOptions,
  isReturnTargetField,
  isReturnTargetZone,
  isReturnAllFieldTarget,
  increaseDecreaseTargetOptions,
  isNumenTarget,
  isPlayerTarget,
  numenTargetDetailOptions,
} from '../../../logic/cardEditorOptions';
import * as styles from './EffectParamInputs.css.ts';

const invokeCriteriaTypeOptions = [
  { value: 'name', label: 'Name' },
  { value: 'level', label: 'Level (exact)' },
  { value: 'levelMin', label: 'Level (min)' },
  { value: 'levelMax', label: 'Level (max)' },
  { value: 'atk', label: 'ATK (exact)' },
  { value: 'atkMin', label: 'ATK (min)' },
  { value: 'atkMax', label: 'ATK (max)' },
  { value: 'def', label: 'DEF (exact)' },
  { value: 'defMin', label: 'DEF (min)' },
  { value: 'defMax', label: 'DEF (max)' },
  { value: 'families', label: 'Family (include)' },
  { value: 'excludeFamilies', label: 'Family (exclude)' },
  { value: 'natures', label: 'Nature (include)' },
  { value: 'excludeNatures', label: 'Nature (exclude)' },
  { value: 'rarities', label: 'Rarity (include)' },
  { value: 'excludeRarities', label: 'Rarity (exclude)' },
];

const isNumericCriteria = (type: string) =>
  ['level', 'levelMin', 'levelMax', 'atk', 'atkMin', 'atkMax', 'def', 'defMin', 'defMax'].includes(type);

const isMultiSelectCriteria = (type: string) =>
  ['families', 'excludeFamilies', 'natures', 'excludeNatures', 'rarities', 'excludeRarities'].includes(type);

const exileCardTypeCriteria = ['any_numen', 'any_ward', 'any_rite', 'any_incantation'];

const isExileCardTypeCriteria = (type: string) =>
  exileCardTypeCriteria.includes(type);

const exileCriteriaTypeOptions = [
  ...invokeCriteriaTypeOptions,
  { value: 'any_numen', label: 'Any numen' },
  { value: 'any_ward', label: 'Any ward' },
  { value: 'any_rite', label: 'Any rite' },
  { value: 'any_incantation', label: 'Any incantation' },
];

const getCriteriaDataForType = (type: string) => {
  if (['families', 'excludeFamilies'].includes(type)) return familyOptions;
  if (['natures', 'excludeNatures'].includes(type)) return natureOptions;
  if (['rarities', 'excludeRarities'].includes(type)) return rarityOptions;
  return [];
};

const getCriteriaLabel = (type: string, value: any): string => {
  if (type === 'name') return `Name: "${value}"`;
  if (type === 'level') return `Level: ${value}`;
  if (type === 'levelMin') return `Level >= ${value}`;
  if (type === 'levelMax') return `Level <= ${value}`;
  if (type === 'atk') return `ATK: ${value}`;
  if (type === 'atkMin') return `ATK >= ${value}`;
  if (type === 'atkMax') return `ATK <= ${value}`;
  if (type === 'def') return `DEF: ${value}`;
  if (type === 'defMin') return `DEF >= ${value}`;
  if (type === 'defMax') return `DEF <= ${value}`;
  if (Array.isArray(value)) {
    const prefix = type.startsWith('exclude') ? 'Exclude ' : '';
    const dataMap: Record<string, { value: string; label: string }[]> = {
      families: familyOptions,
      excludeFamilies: familyOptions,
      natures: natureOptions,
      excludeNatures: natureOptions,
      rarities: rarityOptions,
      excludeRarities: rarityOptions,
    };
    const data = dataMap[type] || [];
    const labels = value.map((v: string) => (data.find((o: { value: string; label: string }) => o.value === v)?.label || v));
    return `${prefix}${labels.join(', ')}`;
  }
  if (type === 'any_numen') return 'Any numen';
  if (type === 'any_ward') return 'Any ward';
  if (type === 'any_rite') return 'Any rite';
  if (type === 'any_incantation') return 'Any incantation';
  return `${type}: ${value}`;
};

const durationOptions = [
  { value: 'temporary', label: 'Temporary' },
  { value: 'permanent', label: 'Permanent' },
  { value: 'while_on_field', label: 'While on Field' },
];

const ALL_FIELD_TARGETS: EffectTarget[] = [
  'all_allied_numina', 'all_enemy_numina',
  'all_allied_incantations', 'all_enemy_incantations',
  'all_allied_rites', 'all_enemy_rites',
  'all_allied_wards', 'all_enemy_wards',
];

const otherwiseOrEffectList = [
  { value: EffectType.DRAW, label: 'Draw' },
  { value: EffectType.SCRY, label: 'Scry' },
  { value: EffectType.FORGET, label: 'Forget' },
  { value: EffectType.EXILE, label: 'Exile' },
  { value: EffectType.PETRIFY, label: 'Petrify' },
  { value: EffectType.DECREASE, label: 'Decrease' },
  { value: EffectType.LOCK, label: 'Lock' },
  { value: EffectType.INCREASE, label: 'Increase' },
  { value: EffectType.ETHEREAL, label: 'Ethereal' },
  { value: EffectType.FIND, label: 'Find' },
  { value: EffectType.ADD_TRIGGER, label: 'Add Trigger' },
  { value: EffectType.INVOKE, label: 'Invoke' },
  { value: EffectType.EVOKE, label: 'Evoke' },
  { value: EffectType.CONVOKE, label: 'Convoke' },
  { value: EffectType.COPY, label: 'Copy' },
  { value: EffectType.ADD, label: 'Add' },
  { value: EffectType.RETURN, label: 'Return' },
];

interface EffectParamInputsProps {
  selectedEffect: string;
  effectParams: Record<string, any>;
  setEffectParams: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  effectTarget?: EffectTarget | null;
}

export default function EffectParamInputs({ selectedEffect, effectParams, setEffectParams, effectTarget }: EffectParamInputsProps) {
  if (!selectedEffect) return null;

  switch (selectedEffect) {
    case EffectType.DRAW:
      return (
        <>
          <NumberInput label="Count" value={effectParams.count} onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))} min={1} styles={inputStyles} />
          <Select data={[{ value: 'player', label: 'Player' }, { value: 'opponent', label: 'Opponent' }, { value: 'both', label: 'Both' }]} value={effectParams.target} onChange={(val) => setEffectParams(prev => ({ ...prev, target: val }))} label="Draw Target" styles={inputStyles} />
        </>
      );
    case EffectType.SCRY:
      return (
        <>
          <NumberInput label="Count" value={effectParams.count} onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))} min={1} styles={inputStyles} />
          <Select data={scryDeckOptions} value={effectParams.deck} onChange={(val) => setEffectParams(prev => ({ ...prev, deck: val }))} label="Deck" styles={inputStyles} />
        </>
      );
    case EffectType.FORGET: {
        const ALL_FORGET_TARGETS: EffectTarget[] = [
          'all_allied_numina', 'all_enemy_numina',
          'all_allied_incantations', 'all_enemy_incantations',
          'all_allied_rites', 'all_enemy_rites',
          'all_allied_wards', 'all_enemy_wards',
          'global_allied_numina', 'global_enemy_numina',
          'global_allied_non_mythic_numina', 'global_enemy_non_mythic_numina',
        ];
        const forgetTarget = effectParams._forgetTarget || effectTarget;
        const isSelectableForgetTarget = forgetTarget && (forgetTarget === 'allied_numen' || forgetTarget === 'enemy_numen');
        const isAllForgetTarget = forgetTarget && ALL_FORGET_TARGETS.includes(forgetTarget);
        return (
          <>
            <Select data={getEffectTargetOptions(undefined, EffectType.FORGET, undefined)} value={effectParams._forgetTarget ?? null} onChange={(val) => setEffectParams(prev => ({ ...prev, _forgetTarget: val }))} label="Effect Target" styles={inputStyles} />
            {isSelectableForgetTarget && !isAllForgetTarget && (
              <Checkbox label="Random" checked={effectParams.random || false} onChange={(e) => setEffectParams(prev => ({ ...prev, random: e.target.checked }))} styles={styles.checkboxStyle} />
            )}
            {forgetTarget && forgetTarget !== 'self' && !ALL_FORGET_TARGETS.includes(forgetTarget) && (
              <NumberInput label="Count" value={effectParams.count} onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))} min={1} styles={inputStyles} />
            )}
          </>
        );
      }
    case EffectType.EXILE: {
      const exileFromField = effectParams.exileFromField !== false;
      if (exileFromField) {
        const ALL_EXILE_TARGETS: EffectTarget[] = [
          'all_allied_numina', 'all_enemy_numina',
          'all_allied_incantations', 'all_enemy_incantations',
          'all_allied_rites', 'all_enemy_rites',
          'all_allied_wards', 'all_enemy_wards',
          'global_allied_numina', 'global_enemy_numina',
          'global_allied_non_mythic_numina', 'global_enemy_non_mythic_numina',
        ];
        const exileTarget = effectParams._exileTarget || effectTarget;
        const isSelectableExileTarget = exileTarget && (exileTarget === 'allied_numen' || exileTarget === 'enemy_numen');
        const isAllExileTarget = exileTarget && ALL_EXILE_TARGETS.includes(exileTarget);
        return (
          <>
            <Checkbox label="From field?" checked={true} onChange={() => setEffectParams(prev => ({ ...prev, exileFromField: false }))} styles={styles.checkboxStyle} />
            <Select data={getEffectTargetOptions(undefined, EffectType.EXILE, undefined)} value={effectParams._exileTarget ?? null} onChange={(val) => setEffectParams(prev => ({ ...prev, _exileTarget: val }))} label="Effect Target" styles={inputStyles} />
            {isSelectableExileTarget && !isAllExileTarget && (
              <Checkbox label="Random" checked={effectParams.random || false} onChange={(e) => setEffectParams(prev => ({ ...prev, random: e.target.checked }))} styles={styles.checkboxStyle} />
            )}
            {exileTarget && exileTarget !== 'self' && !ALL_FIELD_TARGETS.includes(exileTarget) && (
              <NumberInput label="Count" value={effectParams.count} onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))} min={1} styles={inputStyles} />
            )}
          </>
        );
      }
      const exileNonFieldCriteriaReady = effectParams._criteriaType &&
        (isExileCardTypeCriteria(effectParams._criteriaType) ||
          (isNumericCriteria(effectParams._criteriaType) && effectParams._criteriaValue !== undefined && effectParams._criteriaValue !== null) ||
          (effectParams._criteriaType === 'name' && effectParams._criteriaValue) ||
          (isMultiSelectCriteria(effectParams._criteriaType) && effectParams._criteriaValue && effectParams._criteriaValue.length > 0));
      return (
        <>
          <Checkbox label="From field?" checked={false} onChange={() => setEffectParams(prev => ({ ...prev, exileFromField: true, _exileTarget: undefined, _criteriaType: undefined, _criteriaValue: undefined }))} styles={styles.checkboxStyle} />
          <Select data={invokeFromOptions} value={effectParams.from} onChange={(val) => setEffectParams(prev => ({ ...prev, from: val }))} label="From" styles={inputStyles} />
          <NumberInput label="Count" value={effectParams.count} onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))} min={1} styles={inputStyles} />
          <Box data-name="effect-param-group" style={styles.effectParamBox}>
            <Select data={exileCriteriaTypeOptions} value={effectParams._criteriaType} onChange={(val) => setEffectParams(prev => ({ ...prev, _criteriaType: val, _criteriaValue: undefined }))} label="Criteria Type" styles={inputStyles} />
            {effectParams._criteriaType && isExileCardTypeCriteria(effectParams._criteriaType) && (
              <Button leftSection={<IconPlus size={16} />} onClick={() => {
                  const existing = effectParams._criteriaItems || [];
                  existing.push({ type: effectParams._criteriaType, value: true });
                  setEffectParams(prev => ({ ...prev, _criteriaItems: existing, _criteriaType: undefined, _criteriaValue: undefined }));
                }}>Add Criteria</Button>
            )}
            {effectParams._criteriaType && isNumericCriteria(effectParams._criteriaType) && (
              <NumberInput value={effectParams._criteriaValue} onChange={(val) => setEffectParams(prev => ({ ...prev, _criteriaValue: val }))} min={0} label="Value" styles={inputStyles} />
            )}
            {effectParams._criteriaType && effectParams._criteriaType === 'name' && (
              <TextInput value={effectParams._criteriaValue || ''} onChange={(e) => setEffectParams(prev => ({ ...prev, _criteriaValue: e.target.value }))} placeholder="e.g., Dark Dragon" label="Name" styles={inputStyles} />
            )}
            {effectParams._criteriaType && isMultiSelectCriteria(effectParams._criteriaType) && (
              <MultiSelect data={getCriteriaDataForType(effectParams._criteriaType)} value={effectParams._criteriaValue} onChange={(val) => setEffectParams(prev => ({ ...prev, _criteriaValue: val }))} label="Select" styles={inputStyles} />
            )}
            {effectParams._criteriaType && !isNumericCriteria(effectParams._criteriaType) && !isExileCardTypeCriteria(effectParams._criteriaType) && (
              <Button leftSection={<IconPlus size={16} />} disabled={!exileNonFieldCriteriaReady} onClick={() => {
                  if (!effectParams._criteriaType || !exileNonFieldCriteriaReady) return;
                  const existing = effectParams._criteriaItems || [];
                  existing.push({ type: effectParams._criteriaType, value: effectParams._criteriaValue });
                  setEffectParams(prev => ({ ...prev, _criteriaItems: existing, _criteriaType: undefined, _criteriaValue: undefined }));
                }}>Add Criteria</Button>
            )}
            {effectParams._criteriaItems && effectParams._criteriaItems.length > 0 && (
              <Box data-name="criteria-list" style={styles.criteriaRow}>
                {effectParams._criteriaItems.map((item: { type: string; value: any }, idx: number) => (
                  <Badge key={idx} style={styles.criteriaBadge}>
                    {getCriteriaLabel(item.type, item.value)}
                    <IconX size={12} style={styles.criteriaIcon} onClick={(e) => {
                      e.stopPropagation();
                      const updated = [...effectParams._criteriaItems];
                      updated.splice(idx, 1);
                      setEffectParams(prev => ({ ...prev, _criteriaItems: updated }));
                    }} />
                  </Badge>
                ))}
              </Box>
            )}
          </Box>
        </>
      );
    }
    case EffectType.PETRIFY:
      return (
        <NumberInput label="Turns" value={effectParams.turns} onChange={(val) => setEffectParams(prev => ({ ...prev, turns: val }))} min={1} styles={inputStyles} />
      );
    case EffectType.DECREASE: {
      const decreaseTargetType = effectParams._targetType;
      const decreaseNumenTarget = effectParams._numenTarget;
      const decreaseStatTarget = effectParams.effectTarget;
      const isNumenDecreaseTarget = isNumenTarget(decreaseTargetType);
      const isPlayerDecreaseTarget = isPlayerTarget(decreaseTargetType);
      const isGenericNumen = decreaseTargetType === 'numen';
      return (
        <>
          <Select data={increaseDecreaseTargetOptions} value={decreaseTargetType ?? null} onChange={(val) => setEffectParams(prev => ({ ...prev, _targetType: val, _numenTarget: undefined, effectTarget: undefined }))} label="Target" styles={inputStyles} />
          {isGenericNumen && (
            <Select data={numenTargetDetailOptions} value={decreaseNumenTarget ?? null} onChange={(val) => setEffectParams(prev => ({ ...prev, _numenTarget: val }))} label="Numen Target" styles={inputStyles} />
          )}
          {isNumenDecreaseTarget && (
            <Select data={numenStatTargetOptions} value={decreaseStatTarget} onChange={(val) => setEffectParams(prev => ({ ...prev, effectTarget: val }))} label="Stat" styles={inputStyles} />
          )}
          {isPlayerDecreaseTarget && (
            <Select data={playerStatTargetOptions} value={decreaseStatTarget} onChange={(val) => setEffectParams(prev => ({ ...prev, effectTarget: val }))} label="Stat" styles={inputStyles} />
          )}
          {isNumenDecreaseTarget && (
            <Select data={durationOptions} value={effectParams.duration} onChange={(val) => setEffectParams(prev => ({ ...prev, duration: val }))} label="Duration" styles={inputStyles} />
          )}
          {isNumenDecreaseTarget && effectParams.duration === 'temporary' && (
            <NumberInput label="Turns" value={effectParams.durationTurns} onChange={(val) => setEffectParams(prev => ({ ...prev, durationTurns: val }))} min={1} styles={inputStyles} />
          )}
          <NumberInput label="Amount" value={effectParams.amount} onChange={(val) => setEffectParams(prev => ({ ...prev, amount: val }))} min={0} styles={inputStyles} />
        </>
      );
    }
    case EffectType.LOCK:
      return (
        <>
          <Select data={durationOptions} value={effectParams.duration} onChange={(val) => setEffectParams(prev => ({ ...prev, duration: val }))} label="Duration" styles={inputStyles} />
          {effectParams.duration === 'temporary' && (
            <NumberInput label="Turns" value={effectParams.turns} onChange={(val) => setEffectParams(prev => ({ ...prev, turns: val }))} min={1} styles={inputStyles} />
          )}
        </>
      );
    case EffectType.INCREASE: {
      const increaseTargetType = effectParams._targetType;
      const increaseNumenTarget = effectParams._numenTarget;
      const increaseStatTarget = effectParams.effectTarget;
      const isNumenIncreaseTarget = isNumenTarget(increaseTargetType);
      const isPlayerIncreaseTarget = isPlayerTarget(increaseTargetType);
      const isGenericNumen = increaseTargetType === 'numen';
      return (
        <>
          <Select data={increaseDecreaseTargetOptions} value={increaseTargetType ?? null} onChange={(val) => setEffectParams(prev => ({ ...prev, _targetType: val, _numenTarget: undefined, effectTarget: undefined }))} label="Target" styles={inputStyles} />
          {isGenericNumen && (
            <Select data={numenTargetDetailOptions} value={increaseNumenTarget ?? null} onChange={(val) => setEffectParams(prev => ({ ...prev, _numenTarget: val }))} label="Numen Target" styles={inputStyles} />
          )}
          {isNumenIncreaseTarget && (
            <Select data={numenStatTargetOptions} value={increaseStatTarget} onChange={(val) => setEffectParams(prev => ({ ...prev, effectTarget: val }))} label="Stat" styles={inputStyles} />
          )}
          {isPlayerIncreaseTarget && (
            <Select data={playerStatTargetOptions} value={increaseStatTarget} onChange={(val) => setEffectParams(prev => ({ ...prev, effectTarget: val }))} label="Stat" styles={inputStyles} />
          )}
          {isNumenIncreaseTarget && (
            <Select data={durationOptions} value={effectParams.duration} onChange={(val) => setEffectParams(prev => ({ ...prev, duration: val }))} label="Duration" styles={inputStyles} />
          )}
          {isNumenIncreaseTarget && effectParams.duration === 'temporary' && (
            <NumberInput label="Turns" value={effectParams.durationTurns} onChange={(val) => setEffectParams(prev => ({ ...prev, durationTurns: val }))} min={1} styles={inputStyles} />
          )}
          <NumberInput label="Amount" value={effectParams.amount} onChange={(val) => setEffectParams(prev => ({ ...prev, amount: val }))} min={0} styles={inputStyles} />
        </>
      );
    }
    case EffectType.ETHEREAL:
      return (
        <>
          <NumberInput label="Count" value={effectParams.count} onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))} min={1} styles={inputStyles} />
          <Select data={etherealTypeOptions} value={effectParams.type} onChange={(val) => setEffectParams(prev => ({ ...prev, type: val }))} label="Type" styles={inputStyles} />
        </>
      );
    case EffectType.FIND:
      return (
        <>
          <NumberInput label="Count" value={effectParams.count} onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))} min={1} styles={inputStyles} />
          <Select data={findSourceOptions} value={effectParams.source} onChange={(val) => setEffectParams(prev => ({ ...prev, source: val }))} label="Source" styles={inputStyles} />
        </>
      );
    case EffectType.ADD_TRIGGER:
      return (
        <>
          <Select data={passiveTriggerOptions} value={effectParams.trigger_type} onChange={(val) => setEffectParams(prev => ({ ...prev, trigger_type: val }))} label="Trigger to Add" styles={inputStyles} />
          <NumberInput label="Duration (turns)" value={effectParams.duration} onChange={(val) => setEffectParams(prev => ({ ...prev, duration: val }))} min={1} styles={inputStyles} />
        </>
      );
    case EffectType.INVOKE:
    case EffectType.EVOKE:
    case EffectType.CONVOKE: {
      const isCriteriaReadyInvoke = effectParams._criteriaType &&
        ((isNumericCriteria(effectParams._criteriaType) && effectParams._criteriaValue !== undefined && effectParams._criteriaValue !== null) ||
          (effectParams._criteriaType === 'name' && effectParams._criteriaValue) ||
          (isMultiSelectCriteria(effectParams._criteriaType) && effectParams._criteriaValue && effectParams._criteriaValue.length > 0));
      const fromOptionsMap = {
        [EffectType.INVOKE]: invokeFromOptions,
        [EffectType.EVOKE]: evokeFromOptions,
        [EffectType.CONVOKE]: convokeFromOptions,
      };
      const fromOptions = fromOptionsMap[selectedEffect] || invokeFromOptions;
      return (
        <>
          <Select data={fromOptions} value={effectParams.from} onChange={(val) => setEffectParams(prev => ({ ...prev, from: val }))} label="From" styles={inputStyles} />
          <NumberInput label="Count" value={effectParams.count} onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))} min={1} styles={inputStyles} />
          <Box data-name="criteria-input-group" style={styles.criteriaGroup}>
            <Select data={invokeCriteriaTypeOptions} value={effectParams._criteriaType} onChange={(val) => setEffectParams(prev => ({ ...prev, _criteriaType: val, _criteriaValue: undefined }))} label="Criteria Type" styles={inputStyles} />
            {effectParams._criteriaType && isNumericCriteria(effectParams._criteriaType) && (
              <NumberInput value={effectParams._criteriaValue} onChange={(val) => setEffectParams(prev => ({ ...prev, _criteriaValue: val }))} min={0} label="Value" styles={inputStyles} />
            )}
            {effectParams._criteriaType && effectParams._criteriaType === 'name' && (
              <TextInput value={effectParams._criteriaValue || ''} onChange={(e) => setEffectParams(prev => ({ ...prev, _criteriaValue: e.target.value }))} placeholder="e.g., Dark Dragon" label="Name" styles={inputStyles} />
            )}
            {effectParams._criteriaType && isMultiSelectCriteria(effectParams._criteriaType) && (
              <MultiSelect data={getCriteriaDataForType(effectParams._criteriaType)} value={effectParams._criteriaValue} onChange={(val) => setEffectParams(prev => ({ ...prev, _criteriaValue: val }))} label="Select" styles={inputStyles} />
            )}
            {effectParams._criteriaType && (
              <Button leftSection={<IconPlus size={16} />} disabled={!isCriteriaReadyInvoke} onClick={() => {
                  if (!effectParams._criteriaType || !isCriteriaReadyInvoke) return;
                  const existing = effectParams._criteriaItems || [];
                  existing.push({ type: effectParams._criteriaType, value: effectParams._criteriaValue });
                  setEffectParams(prev => ({ ...prev, _criteriaItems: existing, _criteriaType: undefined, _criteriaValue: undefined }));
                }}>Add Criteria</Button>
            )}
            {effectParams._criteriaItems && effectParams._criteriaItems.length > 0 && (
              <Box data-name="criteria-list" style={styles.criteriaRow}>
                {effectParams._criteriaItems.map((item: { type: string; value: any }, idx: number) => (
                  <Badge key={idx} style={styles.criteriaBadge}>
                    {getCriteriaLabel(item.type, item.value)}
                    <IconX size={12} style={styles.criteriaIcon} onClick={(e) => {
                      e.stopPropagation();
                      const updated = [...effectParams._criteriaItems];
                      updated.splice(idx, 1);
                      setEffectParams(prev => ({ ...prev, _criteriaItems: updated }));
                    }} />
                  </Badge>
                ))}
              </Box>
            )}
          </Box>
        </>
      );
    }
    case EffectType.COPY:
      return (
        <>
          <Select data={copyTargetTypeOptions} value={effectParams.copyTarget} onChange={(val) => setEffectParams(prev => ({ ...prev, copyTarget: val }))} label="Copy Target" styles={inputStyles} />
          <Select data={addDestinationOptions} value={effectParams.destination} onChange={(val) => setEffectParams(prev => ({ ...prev, destination: val }))} label="Destination" styles={inputStyles} />
          <NumberInput label="Count" value={effectParams.count} onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))} min={1} styles={inputStyles} />
        </>
      );
    case EffectType.ADD:
      return (
        <>
          <Select data={addFromOptions} value={effectParams.addFrom} onChange={(val) => setEffectParams(prev => ({ ...prev, addFrom: val }))} label="From" styles={inputStyles} />
          <Select data={addTargetTypeOptions} value={effectParams.addTargetType} onChange={(val) => setEffectParams(prev => ({ ...prev, addTargetType: val }))} label="Target Type" styles={inputStyles} />
          <Select data={addDestinationOptions} value={effectParams.destination} onChange={(val) => setEffectParams(prev => ({ ...prev, destination: val }))} label="Destination" styles={inputStyles} />
          <NumberInput label="Count" value={effectParams.count} onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))} min={1} styles={inputStyles} />
        </>
      );
    case EffectType.RETURN: {
      const isSelfTarget = effectTarget === 'self' || effectParams.returnTarget === 'self';
      const returnTarget = effectParams.returnTarget;
      const isFieldTarget = isReturnTargetField(returnTarget);
      const isZoneTarget = isReturnTargetZone(returnTarget);
      const isAllFieldTarget = isFieldTarget && isReturnAllFieldTarget(effectParams.returnFieldTarget);
      const isAllZoneTarget = isZoneTarget && effectParams.returnCardType === 'any';
      return (
        <>
          <Select data={returnTargetOptions} value={isSelfTarget ? 'self' : (effectParams.returnTarget || null)} onChange={(val) => setEffectParams(prev => ({ ...prev, returnTarget: val, returnFieldTarget: undefined, returnCardType: undefined }))} label="Return Target" styles={inputStyles} />
          {isFieldTarget && (
            <Select data={returnFieldTargetOptions} value={effectParams.returnFieldTarget ?? null} onChange={(val) => setEffectParams(prev => ({ ...prev, returnFieldTarget: val, returnCardType: undefined }))} label="Field Target" styles={inputStyles} />
          )}
          {isZoneTarget && (
            <Select data={returnCardTypeOptions} value={effectParams.returnCardType ?? null} onChange={(val) => setEffectParams(prev => ({ ...prev, returnCardType: val, returnFieldTarget: undefined }))} label="Target Type" styles={inputStyles} />
          )}
          {(isFieldTarget || isZoneTarget || isSelfTarget) && (
            <Select data={returnDestinationOptions} value={effectParams.returnDestination ?? 'hand'} onChange={(val) => setEffectParams(prev => ({ ...prev, returnDestination: val }))} label="Destination" styles={inputStyles} />
          )}
          {!isAllFieldTarget && !isAllZoneTarget && !isSelfTarget && (
            <NumberInput label="Count" value={effectParams.count} onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))} min={1} styles={inputStyles} />
          )}
        </>
      );
    }
    case EffectType.CHOOSE_ONE:
      return (
        <>
          <TextInput label="Option 1" value={effectParams.options_0 || ''} onChange={(e) => setEffectParams(prev => ({ ...prev, options_0: e.target.value }))} styles={inputStyles} />
          <TextInput label="Option 2" value={effectParams.options_1 || ''} onChange={(e) => setEffectParams(prev => ({ ...prev, options_1: e.target.value }))} styles={inputStyles} />
        </>
      );
    default:
      return null;
  }
}

const isOtherwiseTargetExcluded = (type: string) =>
  [EffectType.DRAW, EffectType.SCRY, EffectType.INVOKE, EffectType.EVOKE, EffectType.CONVOKE, EffectType.EXILE].includes(type as EffectType);

interface OtherwiseEffectInputsProps {
  setEffectParams: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  effectParams: Record<string, any>;
  currentTrigger?: ConditionalTrigger | undefined;
  cardType?: string | undefined;
}

export function OtherwiseEffectInputs({ setEffectParams, effectParams, currentTrigger, cardType }: OtherwiseEffectInputsProps) {
  const otherwiseEffectType = effectParams.otherwise_effect_type;
  const otherwiseEffectParams = effectParams.otherwise_effect_params || {};
  const otherwiseEffectTarget = effectParams.otherwise_effect_target;
  const dynamicOtherwiseTargetOptions = getEffectTargetOptions(currentTrigger, otherwiseEffectType ?? undefined, cardType);

  const setOtherwiseParam = (updater: (prev: Record<string, any>) => Record<string, any>) => {
    setEffectParams(prev => ({
      ...prev,
      otherwise_effect_params: updater(prev.otherwise_effect_params || {}),
    }));
  };

  return (
    <>
      <Checkbox label="Otherwise" checked={effectParams.otherwise || false} onChange={(e) => setEffectParams(prev => ({ ...prev, otherwise: e.target.checked }))} styles={styles.checkboxStyle} />
      {effectParams.otherwise && (
        <>
          <Select data={otherwiseOrEffectList} value={otherwiseEffectType} onChange={(val) => setEffectParams(prev => ({ ...prev, otherwise_effect_type: val as any, otherwise_effect_params: {}, otherwise_effect_target: null }))} label="Otherwise Effect" styles={inputStyles} />
          {otherwiseEffectType && !isOtherwiseTargetExcluded(otherwiseEffectType) && (
            <Select data={dynamicOtherwiseTargetOptions} value={otherwiseEffectTarget ?? null} onChange={(val) => setEffectParams(prev => ({ ...prev, otherwise_effect_target: val as any }))} label="Otherwise Effect Target" styles={inputStyles} />
          )}
          {otherwiseEffectType && (
            <EffectParamInputs selectedEffect={otherwiseEffectType} effectParams={otherwiseEffectParams} setEffectParams={setOtherwiseParam} effectTarget={otherwiseEffectTarget ?? undefined} />
          )}
        </>
      )}
    </>
  );
}

interface OrEffectInputsProps {
  setEffectParams: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  effectParams: Record<string, any>;
  currentTrigger?: ConditionalTrigger | undefined;
  cardType?: string | undefined;
}

export function OrEffectInputs({ setEffectParams, effectParams, currentTrigger, cardType }: OrEffectInputsProps) {
  const orEffectType = effectParams.or_effect_type;
  const orEffectParams = effectParams.or_effect_params || {};
  const orEffectTarget = effectParams.or_effect_target;
  const dynamicOrTargetOptions = getEffectTargetOptions(currentTrigger, orEffectType ?? undefined, cardType);

  const setOrParam = (updater: (prev: Record<string, any>) => Record<string, any>) => {
    setEffectParams(prev => ({
      ...prev,
      or_effect_params: updater(prev.or_effect_params || {}),
    }));
  };

  return (
    <>
      <Checkbox label="Or" checked={effectParams.or || false} onChange={(e) => setEffectParams(prev => ({ ...prev, or: e.target.checked }))} styles={styles.checkboxStyle} />
      {effectParams.or && (
        <>
          <Select data={otherwiseOrEffectList} value={orEffectType} onChange={(val) => setEffectParams(prev => ({ ...prev, or_effect_type: val as any, or_effect_params: {}, or_effect_target: null }))} label="Or Effect" styles={inputStyles} />
          {orEffectType && !isOtherwiseTargetExcluded(orEffectType) && (
            <Select data={dynamicOrTargetOptions} value={orEffectTarget ?? null} onChange={(val) => setEffectParams(prev => ({ ...prev, or_effect_target: val as any }))} label="Or Effect Target" styles={inputStyles} />
          )}
          {orEffectType && (
            <EffectParamInputs selectedEffect={orEffectType} effectParams={orEffectParams} setEffectParams={setOrParam} effectTarget={orEffectTarget ?? undefined} />
          )}
        </>
      )}
    </>
  );
}

interface ForEachInputsProps {
  setEffectParams: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  effectParams: Record<string, any>;
}

export function ForEachInputs({ setEffectParams, effectParams }: ForEachInputsProps) {
  const forEachConfig = effectParams.forEachConfig || {};

  return (
    <>
      <Checkbox label="For Each" checked={effectParams.forEach || false} onChange={(e) => setEffectParams(prev => ({ ...prev, forEach: e.target.checked, forEachConfig: e.target.checked ? {} : undefined }))} styles={styles.checkboxStyle} />
      {effectParams.forEach && (
        <>
          <Select data={[{ value: 'numen', label: 'Numen' }, { value: 'ward', label: 'Ward' }, { value: 'rite', label: 'Rite' }, { value: 'incantation', label: 'Incantation' }, { value: 'any', label: 'Any Card' }]} value={forEachConfig.cardType || null} onChange={(val) => setEffectParams(prev => ({
              ...prev,
              forEachConfig: { ...prev.forEachConfig, cardType: val },
            }))} label="Count Type" styles={inputStyles} />
          <Select data={[{ value: 'memora', label: 'Memora' }, { value: 'field', label: 'Field' }, { value: 'exile', label: 'Exile' }, { value: 'deck', label: 'Deck' }, { value: 'hand', label: 'Hand' }]} value={forEachConfig.zone || null} onChange={(val) => setEffectParams(prev => ({
              ...prev,
              forEachConfig: { ...prev.forEachConfig, zone: val },
            }))} label="Zone" styles={inputStyles} />
          <Select data={[{ value: 'player', label: 'Player' }, { value: 'opponent', label: 'Opponent' }, { value: 'both', label: 'Both' }]} value={forEachConfig.owner || null} onChange={(val) => setEffectParams(prev => ({
              ...prev,
              forEachConfig: { ...prev.forEachConfig, owner: val },
            }))} label="Owner" styles={inputStyles} />
        </>
      )}
    </>
  );
}