import { NumberInput, Select, TextInput, MultiSelect, Badge, Group, Button, Checkbox } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import { EffectType } from '../../logic/Effects';
import type { ForEachConfig } from '../../logic/Effects';
import colors from '../../styles/Colors';
import type { EffectTarget } from '../../logic/Triggers';
import { ConditionalTrigger } from '../../logic/Triggers';
import {
  statTargetOptions,
  scryDeckOptions,
  etherealTypeOptions,
  findSourceOptions,
  inputStyles,
  passiveTriggerOptions,
  isNumenEffectTarget,
  isHpManaEffectTarget,
  summonFromOptions,
  familyOptions,
  natureOptions,
  rarityOptions,
  copyTargetTypeOptions,
  addDestinationOptions,
  getEffectTargetOptions,
} from '../../logic/CardEditorOptions';

const summonCriteriaTypeOptions = [
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

const exileCardTypeCriteria = ['any_numen', 'any_ward', 'any_rite', 'any_magic'];

const isExileCardTypeCriteria = (type: string) =>
  exileCardTypeCriteria.includes(type);

const exileCriteriaTypeOptions = [
  ...summonCriteriaTypeOptions,
  { value: 'any_numen', label: 'Any numen' },
  { value: 'any_ward', label: 'Any ward' },
  { value: 'any_rite', label: 'Any spell' },
  { value: 'any_magic', label: 'Any magic' },
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
    const include = !type.startsWith('exclude');
    const prefix = include ? '' : 'Exclude ';
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
  if (type === 'any_rite') return 'Any spell';
  if (type === 'any_magic') return 'Any magic';
  return `${type}: ${value}`;
};

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
          <NumberInput
            label="Count"
            value={effectParams.count}
            onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))}
            min={1}
            styles={inputStyles}
          />
          <Select
            data={[
              { value: 'player', label: 'Player' },
              { value: 'opponent', label: 'Opponent' },
              { value: 'both', label: 'Both' }
            ]}
            value={effectParams.target}
            onChange={(val) => setEffectParams(prev => ({ ...prev, target: val }))}
            label="Draw Target"
            styles={inputStyles}
          />
        </>
      );
    case EffectType.SCRY:
      return (
        <>
          <NumberInput
            label="Count"
            value={effectParams.count}
            onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))}
            min={1}
            styles={inputStyles}
          />
          <Select
            data={scryDeckOptions}
            value={effectParams.deck}
            onChange={(val) => setEffectParams(prev => ({ ...prev, deck: val }))}
            label="Deck"
            styles={inputStyles}
          />
        </>
      );
    case EffectType.DESTROY:
       const ALL_DESTROY_TARGETS: EffectTarget[] = [
        'all_allied_numina', 'all_enemy_numina',
        'all_allied_magics', 'all_enemy_magics',
        'all_allied_rites', 'all_enemy_rites',
        'all_allied_wards', 'all_enemy_wards',
      ];
      return (
        effectTarget && effectTarget !== 'self' && !ALL_DESTROY_TARGETS.includes(effectTarget) && (
          <NumberInput
            label="Count"
            value={effectParams.count}
            onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))}
            min={1}
            styles={inputStyles}
          />
        )
      );
    case EffectType.EXILE: {
      const exileFromField = effectParams.exileFromField !== false;
      const ALL_FIELD_TARGETS: EffectTarget[] = [
        'all_allied_numina', 'all_enemy_numina',
        'all_allied_magics', 'all_enemy_magics',
        'all_allied_rites', 'all_enemy_rites',
        'all_allied_wards', 'all_enemy_wards',
      ];
      if (exileFromField) {
        return (
          <>
            <Checkbox
              label="From field?"
              checked={true}
              onChange={() => setEffectParams(prev => ({ ...prev, exileFromField: false }))}
              styles={{ label: { color: colors.Black_1 } }}
            />
            <Select
              data={getEffectTargetOptions(undefined, EffectType.EXILE, undefined)}
              value={effectParams._exileTarget ?? null}
              onChange={(val) => setEffectParams(prev => ({ ...prev, _exileTarget: val }))}
              label="Effect Target"
              styles={inputStyles}
            />
            {effectTarget && effectTarget !== 'self' && !ALL_FIELD_TARGETS.includes(effectTarget) && (
              <NumberInput
                label="Count"
                value={effectParams.count}
                onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))}
                min={1}
                styles={inputStyles}
              />
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
          <Checkbox
            label="From field?"
            checked={false}
            onChange={() => setEffectParams(prev => ({ ...prev, exileFromField: true, _exileTarget: undefined, _criteriaType: undefined, _criteriaValue: undefined }))}
            styles={{ label: { color: colors.Black_1 } }}
          />
          <Select
            data={summonFromOptions}
            value={effectParams.from}
            onChange={(val) => setEffectParams(prev => ({ ...prev, from: val }))}
            label="From"
            styles={inputStyles}
          />
          <NumberInput
            label="Count"
            value={effectParams.count}
            onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))}
            min={1}
            styles={inputStyles}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Select
              data={exileCriteriaTypeOptions}
              value={effectParams._criteriaType}
              onChange={(val) => setEffectParams(prev => ({ ...prev, _criteriaType: val, _criteriaValue: undefined }))}
              label="Criteria Type"
              styles={inputStyles}
            />
            {effectParams._criteriaType && isExileCardTypeCriteria(effectParams._criteriaType) && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  const existing = effectParams._criteriaItems || [];
                  existing.push({
                    type: effectParams._criteriaType,
                    value: true,
                  });
                  setEffectParams(prev => ({
                    ...prev,
                    _criteriaItems: existing,
                    _criteriaType: undefined,
                    _criteriaValue: undefined,
                  }));
                }}
              >
                Add Criteria
              </Button>
            )}
            {effectParams._criteriaType && isNumericCriteria(effectParams._criteriaType) && (
              <NumberInput
                value={effectParams._criteriaValue}
                onChange={(val) => setEffectParams(prev => ({ ...prev, _criteriaValue: val }))}
                min={0}
                label="Value"
                styles={inputStyles}
              />
            )}
            {effectParams._criteriaType && effectParams._criteriaType === 'name' && (
              <TextInput
                value={effectParams._criteriaValue || ''}
                onChange={(e) => setEffectParams(prev => ({ ...prev, _criteriaValue: e.target.value }))}
                placeholder="e.g., Dark Dragon"
                label="Name"
                styles={inputStyles}
              />
            )}
            {effectParams._criteriaType && isMultiSelectCriteria(effectParams._criteriaType) && (
              <MultiSelect
                data={getCriteriaDataForType(effectParams._criteriaType)}
                value={effectParams._criteriaValue}
                onChange={(val) => setEffectParams(prev => ({ ...prev, _criteriaValue: val }))}
                label="Select"
                styles={inputStyles}
              />
            )}
            {effectParams._criteriaType && !isNumericCriteria(effectParams._criteriaType) && !isExileCardTypeCriteria(effectParams._criteriaType) && (
              <Button
                leftSection={<IconPlus size={16} />}
                disabled={!exileNonFieldCriteriaReady}
                onClick={() => {
                  if (!effectParams._criteriaType || !exileNonFieldCriteriaReady) return;
                  const existing = effectParams._criteriaItems || [];
                  existing.push({
                    type: effectParams._criteriaType,
                    value: effectParams._criteriaValue,
                  });
                  setEffectParams(prev => ({
                    ...prev,
                    _criteriaItems: existing,
                    _criteriaType: undefined,
                    _criteriaValue: undefined,
                  }));
                }}
              >
                Add Criteria
              </Button>
            )}
            {effectParams._criteriaItems && effectParams._criteriaItems.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {effectParams._criteriaItems.map((item: { type: string; value: any }, idx: number) => (
                  <Badge key={idx} style={{ cursor: 'pointer' }}>
                    {getCriteriaLabel(item.type, item.value)}
                    <IconX size={12} style={{ marginLeft: 4, cursor: 'pointer' }} onClick={(e) => {
                      e.stopPropagation();
                      const updated = [...effectParams._criteriaItems];
                      updated.splice(idx, 1);
                      setEffectParams(prev => ({ ...prev, _criteriaItems: updated }));
                    }} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </>
      );
    }
    case EffectType.PETRIFY:
      return (
        <NumberInput
          label="Turns"
          value={effectParams.turns}
          onChange={(val) => setEffectParams(prev => ({ ...prev, turns: val }))}
          min={1}
          styles={inputStyles}
        />
      );
    case EffectType.DECREASE:
      const isHpManaDecreaseTarget = isHpManaEffectTarget(effectTarget);
      return (
        <>
          {isNumenEffectTarget(effectTarget) && (
            <Select
              data={[{ value: 'atk', label: 'ATK' }, { value: 'def', label: 'DEF' }]}
              value={effectParams.target}
              onChange={(val) => setEffectParams(prev => ({ ...prev, target: val }))}
              label="Stat"
              styles={inputStyles}
            />
          )}
          {!isNumenEffectTarget(effectTarget) && !isHpManaEffectTarget(effectTarget) && (
            <Select
              data={statTargetOptions}
              value={effectParams.target}
              onChange={(val) => setEffectParams(prev => ({ ...prev, target: val }))}
              label="Target"
              styles={inputStyles}
            />
          )}
          {!isHpManaDecreaseTarget && (
            <Select
              data={[{ value: 'temporary', label: 'Temporary' }, { value: 'permanent', label: 'Permanent' }, { value: 'while_on_field', label: 'While on Field' }]}
              value={effectParams.duration}
              onChange={(val) => setEffectParams(prev => ({ ...prev, duration: val }))}
              label="Duration"
              styles={inputStyles}
            />
          )}
          {!isHpManaDecreaseTarget && effectParams.duration === 'temporary' && (
            <NumberInput
              label="Turns"
              value={effectParams.durationTurns}
              onChange={(val) => setEffectParams(prev => ({ ...prev, durationTurns: val }))}
              min={1}
              styles={inputStyles}
            />
          )}
          <NumberInput
            label="Amount"
            value={effectParams.amount}
            onChange={(val) => setEffectParams(prev => ({ ...prev, amount: val }))}
            min={0}
            styles={inputStyles}
          />
        </>
      );
    case EffectType.LOCK:
      return (
        <>
          <Select
            data={[{ value: 'temporary', label: 'Temporary' }, { value: 'permanent', label: 'Permanent' }, { value: 'while_on_field', label: 'While on Field' }]}
            value={effectParams.duration}
            onChange={(val) => setEffectParams(prev => ({ ...prev, duration: val }))}
            label="Duration"
            styles={inputStyles}
          />
          {effectParams.duration === 'temporary' && (
            <NumberInput
              label="Turns"
              value={effectParams.turns}
              onChange={(val) => setEffectParams(prev => ({ ...prev, turns: val }))}
              min={1}
              styles={inputStyles}
            />
          )}
        </>
      );
    case EffectType.INCREASE:
      const isHpManaIncreaseTarget = isHpManaEffectTarget(effectTarget);
      return (
        <>
          {isNumenEffectTarget(effectTarget) && (
            <Select
              data={[{ value: 'atk', label: 'ATK' }, { value: 'def', label: 'DEF' }]}
              value={effectParams.target}
              onChange={(val) => setEffectParams(prev => ({ ...prev, target: val }))}
              label="Stat"
              styles={inputStyles}
            />
          )}
          {!isNumenEffectTarget(effectTarget) && !isHpManaEffectTarget(effectTarget) && (
            <Select
              data={statTargetOptions}
              value={effectParams.target}
              onChange={(val) => setEffectParams(prev => ({ ...prev, target: val }))}
              label="Target"
              styles={inputStyles}
            />
          )}
          {!isHpManaIncreaseTarget && (
            <Select
              data={[{ value: 'temporary', label: 'Temporary' }, { value: 'permanent', label: 'Permanent' }, { value: 'while_on_field', label: 'While on Field' }]}
              value={effectParams.duration}
              onChange={(val) => setEffectParams(prev => ({ ...prev, duration: val }))}
              label="Duration"
              styles={inputStyles}
            />
          )}
          {!isHpManaIncreaseTarget && effectParams.duration === 'temporary' && (
            <NumberInput
              label="Turns"
              value={effectParams.durationTurns}
              onChange={(val) => setEffectParams(prev => ({ ...prev, durationTurns: val }))}
              min={1}
              styles={inputStyles}
            />
          )}
          <NumberInput
            label="Amount"
            value={effectParams.amount}
            onChange={(val) => setEffectParams(prev => ({ ...prev, amount: val }))}
            min={0}
            styles={inputStyles}
          />
        </>
      );
    case EffectType.ETHEREAL:
      return (
        <>
          <NumberInput
            label="Count"
            value={effectParams.count}
            onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))}
            min={1}
            styles={inputStyles}
          />
          <Select
            data={etherealTypeOptions}
            value={effectParams.type}
            onChange={(val) => setEffectParams(prev => ({ ...prev, type: val }))}
            label="Type"
            styles={inputStyles}
          />
        </>
      );
    case EffectType.FIND:
      return (
        <>
          <NumberInput
            label="Count"
            value={effectParams.count}
            onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))}
            min={1}
            styles={inputStyles}
          />
          <Select
            data={findSourceOptions}
            value={effectParams.source}
            onChange={(val) => setEffectParams(prev => ({ ...prev, source: val }))}
            label="Source"
            styles={inputStyles}
          />
        </>
      );
    case EffectType.ADD_TRIGGER:
      return (
        <>
          <Select
            data={passiveTriggerOptions}
            value={effectParams.trigger_type}
            onChange={(val) => setEffectParams(prev => ({ ...prev, trigger_type: val }))}
            label="Trigger to Add"
            styles={inputStyles}
          />
          <NumberInput
            label="Duration (turns)"
            value={effectParams.duration}
            onChange={(val) => setEffectParams(prev => ({ ...prev, duration: val }))}
            min={1}
            styles={inputStyles}
          />
        </>
      );
    case EffectType.SUMMON:
      const isCriteriaReady = effectParams._criteriaType &&
        ((isNumericCriteria(effectParams._criteriaType) && effectParams._criteriaValue !== undefined && effectParams._criteriaValue !== null) ||
          (effectParams._criteriaType === 'name' && effectParams._criteriaValue) ||
          (isMultiSelectCriteria(effectParams._criteriaType) && effectParams._criteriaValue && effectParams._criteriaValue.length > 0));
      return (
        <>
          <Select
            data={summonFromOptions}
            value={effectParams.from}
            onChange={(val) => setEffectParams(prev => ({ ...prev, from: val }))}
            label="From"
            styles={inputStyles}
          />
          <NumberInput
            label="Count"
            value={effectParams.count}
            onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))}
            min={1}
            styles={inputStyles}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Select
              data={summonCriteriaTypeOptions}
              value={effectParams._criteriaType}
              onChange={(val) => setEffectParams(prev => ({ ...prev, _criteriaType: val, _criteriaValue: undefined }))}
              label="Criteria Type"
              styles={inputStyles}
            />
            {effectParams._criteriaType && isNumericCriteria(effectParams._criteriaType) && (
              <NumberInput
                value={effectParams._criteriaValue}
                onChange={(val) => setEffectParams(prev => ({ ...prev, _criteriaValue: val }))}
                min={0}
                label="Value"
                styles={inputStyles}
              />
            )}
            {effectParams._criteriaType && effectParams._criteriaType === 'name' && (
              <TextInput
                value={effectParams._criteriaValue || ''}
                onChange={(e) => setEffectParams(prev => ({ ...prev, _criteriaValue: e.target.value }))}
                placeholder="e.g., Dark Dragon"
                label="Name"
                styles={inputStyles}
              />
            )}
            {effectParams._criteriaType && isMultiSelectCriteria(effectParams._criteriaType) && (
              <MultiSelect
                data={getCriteriaDataForType(effectParams._criteriaType)}
                value={effectParams._criteriaValue}
                onChange={(val) => setEffectParams(prev => ({ ...prev, _criteriaValue: val }))}
                label="Select"
                styles={inputStyles}
              />
            )}
            {effectParams._criteriaType && (
              <Button
                leftSection={<IconPlus size={16} />}
                disabled={!isCriteriaReady}
                onClick={() => {
                  if (!effectParams._criteriaType || !isCriteriaReady) return;
                  const existing = effectParams._criteriaItems || [];
                  existing.push({
                    type: effectParams._criteriaType,
                    value: effectParams._criteriaValue,
                  });
                  setEffectParams(prev => ({
                    ...prev,
                    _criteriaItems: existing,
                    _criteriaType: undefined,
                    _criteriaValue: undefined,
                  }));
                }}
              >
                Add Criteria
              </Button>
            )}
            {effectParams._criteriaItems && effectParams._criteriaItems.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {effectParams._criteriaItems.map((item: { type: string; value: any }, idx: number) => (
                  <Badge key={idx} style={{ cursor: 'pointer' }}>
                    {getCriteriaLabel(item.type, item.value)}
                    <IconX size={12} style={{ marginLeft: 4, cursor: 'pointer' }} onClick={(e) => {
                      e.stopPropagation();
                      const updated = [...effectParams._criteriaItems];
                      updated.splice(idx, 1);
                      setEffectParams(prev => ({ ...prev, _criteriaItems: updated }));
                    }} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </>
      );
    case EffectType.COPY:
      return (
        <>
          <Select
            data={copyTargetTypeOptions}
            value={effectParams.copyTarget}
            onChange={(val) => setEffectParams(prev => ({ ...prev, copyTarget: val }))}
            label="Copy Target"
            styles={inputStyles}
          />
          <Select
            data={addDestinationOptions}
            value={effectParams.destination}
            onChange={(val) => setEffectParams(prev => ({ ...prev, destination: val }))}
            label="Destination"
            styles={inputStyles}
          />
          <NumberInput
            label="Count"
            value={effectParams.count}
            onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))}
            min={1}
            styles={inputStyles}
          />
        </>
      );
    case EffectType.ADD:
      return (
        <>
          <Select
            data={addDestinationOptions}
            value={effectParams.destination}
            onChange={(val) => setEffectParams(prev => ({ ...prev, destination: val }))}
            label="Destination"
            styles={inputStyles}
          />
          <NumberInput
            label="Count"
            value={effectParams.count}
            onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))}
            min={1}
            styles={inputStyles}
          />
        </>
      );
    case EffectType.RETURN:
      return (
        <>
          <Select
            data={[
              { value: 'hand', label: 'Hand' },
              { value: 'deck', label: 'Deck' },
            ]}
            value={effectParams.destination}
            onChange={(val) => setEffectParams(prev => ({ ...prev, destination: val }))}
            label="Destination"
            styles={inputStyles}
          />
          <NumberInput
            label="Count"
            value={effectParams.count}
            onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))}
            min={1}
            styles={inputStyles}
          />
        </>
      );
    case EffectType.CHOOSE_ONE:
      return (
        <>
          <TextInput
            label="Option 1"
            value={effectParams.options_0 || ''}
            onChange={(e) => setEffectParams(prev => ({ ...prev, options_0: e.target.value }))}
            styles={inputStyles}
          />
          <TextInput
            label="Option 2"
            value={effectParams.options_1 || ''}
            onChange={(e) => setEffectParams(prev => ({ ...prev, options_1: e.target.value }))}
            styles={inputStyles}
          />
        </>
      );
    default:
      return null;
  }
}

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
      <Checkbox
        label="Otherwise"
        checked={effectParams.otherwise || false}
        onChange={(e) => setEffectParams(prev => ({ ...prev, otherwise: e.target.checked }))}
        styles={{ label: { color: '#000' } }}
      />
      {effectParams.otherwise && (
        <>
          <Select
            data={[
              { value: EffectType.DRAW, label: 'Draw' },
              { value: EffectType.SCRY, label: 'Scry' },
              { value: EffectType.DESTROY, label: 'Destroy' },
              { value: EffectType.EXILE, label: 'Exile' },
              { value: EffectType.PETRIFY, label: 'Petrify' },
              { value: EffectType.DECREASE, label: 'Decrease' },
              { value: EffectType.LOCK, label: 'Lock' },
              { value: EffectType.INCREASE, label: 'Increase' },
              { value: EffectType.ETHEREAL, label: 'Ethereal' },
              { value: EffectType.FIND, label: 'Find' },
              { value: EffectType.ADD_TRIGGER, label: 'Add Trigger' },
              { value: EffectType.SUMMON, label: 'Summon' },
              { value: EffectType.COPY, label: 'Copy' },
              { value: EffectType.ADD, label: 'Add' },
              { value: EffectType.RETURN, label: 'Return' },
            ]}
            value={otherwiseEffectType}
            onChange={(val) => setEffectParams(prev => ({ ...prev, otherwise_effect_type: val as any, otherwise_effect_params: {}, otherwise_effect_target: null }))}
            label="Otherwise Effect"
            styles={inputStyles}
          />
          {otherwiseEffectType && otherwiseEffectType !== EffectType.DRAW && otherwiseEffectType !== EffectType.SCRY && otherwiseEffectType !== EffectType.SUMMON && otherwiseEffectType !== EffectType.EXILE && (
            <Select
              data={dynamicOtherwiseTargetOptions}
              value={otherwiseEffectTarget ?? null}
              onChange={(val) => setEffectParams(prev => ({ ...prev, otherwise_effect_target: val as any }))}
              label="Otherwise Effect Target"
              styles={inputStyles}
            />
          )}
          {otherwiseEffectType && (
            <EffectParamInputs
              selectedEffect={otherwiseEffectType}
              effectParams={otherwiseEffectParams}
              setEffectParams={setOtherwiseParam}
              effectTarget={otherwiseEffectTarget ?? undefined}
            />
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
      <Checkbox
        label="Or"
        checked={effectParams.or || false}
        onChange={(e) => setEffectParams(prev => ({ ...prev, or: e.target.checked }))}
        styles={{ label: { color: '#000' } }}
      />
      {effectParams.or && (
        <>
          <Select
            data={[
              { value: EffectType.DRAW, label: 'Draw' },
              { value: EffectType.SCRY, label: 'Scry' },
              { value: EffectType.DESTROY, label: 'Destroy' },
              { value: EffectType.EXILE, label: 'Exile' },
              { value: EffectType.PETRIFY, label: 'Petrify' },
              { value: EffectType.DECREASE, label: 'Decrease' },
              { value: EffectType.LOCK, label: 'Lock' },
              { value: EffectType.INCREASE, label: 'Increase' },
              { value: EffectType.ETHEREAL, label: 'Ethereal' },
              { value: EffectType.FIND, label: 'Find' },
              { value: EffectType.ADD_TRIGGER, label: 'Add Trigger' },
              { value: EffectType.SUMMON, label: 'Summon' },
              { value: EffectType.COPY, label: 'Copy' },
              { value: EffectType.ADD, label: 'Add' },
              { value: EffectType.RETURN, label: 'Return' },
            ]}
            value={orEffectType}
            onChange={(val) => setEffectParams(prev => ({ ...prev, or_effect_type: val as any, or_effect_params: {}, or_effect_target: null }))}
            label="Or Effect"
            styles={inputStyles}
          />
          {orEffectType && orEffectType !== EffectType.DRAW && orEffectType !== EffectType.SCRY && orEffectType !== EffectType.SUMMON && orEffectType !== EffectType.EXILE && (
            <Select
              data={dynamicOrTargetOptions}
              value={orEffectTarget ?? null}
              onChange={(val) => setEffectParams(prev => ({ ...prev, or_effect_target: val as any }))}
              label="Or Effect Target"
              styles={inputStyles}
            />
          )}
          {orEffectType && (
            <EffectParamInputs
              selectedEffect={orEffectType}
              effectParams={orEffectParams}
              setEffectParams={setOrParam}
              effectTarget={orEffectTarget ?? undefined}
            />
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
      <Checkbox
        label="For Each"
        checked={effectParams.forEach || false}
        onChange={(e) => setEffectParams(prev => ({ ...prev, forEach: e.target.checked, forEachConfig: e.target.checked ? {} : undefined }))}
        styles={{ label: { color: '#000' } }}
      />
      {effectParams.forEach && (
        <>
          <Select
            data={[
              { value: 'numen', label: 'Numen' },
              { value: 'ward', label: 'Ward' },
              { value: 'rite', label: 'Rite' },
              { value: 'magic', label: 'Magic' },
              { value: 'any', label: 'Any Card' },
            ]}
            value={forEachConfig.cardType || null}
            onChange={(val) => setEffectParams(prev => ({
              ...prev,
              forEachConfig: { ...prev.forEachConfig, cardType: val },
            }))}
            label="Count Type"
            styles={inputStyles}
          />
          <Select
            data={[
              { value: 'graveyard', label: 'Graveyard' },
              { value: 'field', label: 'Field' },
              { value: 'exile', label: 'Exile' },
              { value: 'deck', label: 'Deck' },
              { value: 'hand', label: 'Hand' },
            ]}
            value={forEachConfig.zone || null}
            onChange={(val) => setEffectParams(prev => ({
              ...prev,
              forEachConfig: { ...prev.forEachConfig, zone: val },
            }))}
            label="Zone"
            styles={inputStyles}
          />
          <Select
            data={[
              { value: 'player', label: 'Player' },
              { value: 'opponent', label: 'Opponent' },
              { value: 'both', label: 'Both' },
            ]}
            value={forEachConfig.owner || null}
            onChange={(val) => setEffectParams(prev => ({
              ...prev,
              forEachConfig: { ...prev.forEachConfig, owner: val },
            }))}
            label="Owner"
            styles={inputStyles}
          />
        </>
      )}
    </>
  );
}
