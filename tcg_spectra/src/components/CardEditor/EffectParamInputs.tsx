import { NumberInput, Select } from '@mantine/core';
import { EffectType } from '../../logic/Effects';
import {
  destroyTargetTypes,
  statTargetOptions,
  scryDeckOptions,
  etherealTypeOptions,
  findSourceOptions,
  inputStyles,
  passiveTriggerOptions,
} from '../../logic/CardEditorOptions';

interface EffectParamInputsProps {
  selectedEffect: string;
  effectParams: Record<string, any>;
  setEffectParams: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
}

export default function EffectParamInputs({ selectedEffect, effectParams, setEffectParams }: EffectParamInputsProps) {
  if (!selectedEffect) return null;

  switch (selectedEffect) {
    case EffectType.DRAW:
      return (
        <NumberInput
          label="Count"
          value={effectParams.count}
          onChange={(val) => setEffectParams(prev => ({ ...prev, count: val }))}
          min={1}
          styles={inputStyles}
        />
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
      return (
        <Select
          data={destroyTargetTypes}
          value={effectParams.targetType}
          onChange={(val) => setEffectParams(prev => ({ ...prev, targetType: val }))}
          label="Target Type"
          styles={inputStyles}
        />
      );
    case EffectType.EXILE:
      return (
        <Select
          data={destroyTargetTypes}
          value={effectParams.targetType}
          onChange={(val) => setEffectParams(prev => ({ ...prev, targetType: val }))}
          label="Target Type"
          styles={inputStyles}
        />
      );
    case EffectType.STUN:
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
      return (
        <>
          <Select
            data={statTargetOptions}
            value={effectParams.target}
            onChange={(val) => setEffectParams(prev => ({ ...prev, target: val }))}
            label="Target"
            styles={inputStyles}
          />
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
        <NumberInput
          label="Turns"
          value={effectParams.turns}
          onChange={(val) => setEffectParams(prev => ({ ...prev, turns: val }))}
          min={1}
          styles={inputStyles}
        />
      );
    case EffectType.INCREASE:
      return (
        <>
          <Select
            data={statTargetOptions}
            value={effectParams.target}
            onChange={(val) => setEffectParams(prev => ({ ...prev, target: val }))}
            label="Target"
            styles={inputStyles}
          />
          <NumberInput
            label="Amount"
            value={effectParams.amount}
            onChange={(val) => setEffectParams(prev => ({ ...prev, amount: val }))}
            min={0}
            styles={inputStyles}
          />
        </>
      );
    case EffectType.SHIELD:
      return (
        <NumberInput
          label="Attacks"
          value={effectParams.attacks}
          onChange={(val) => setEffectParams(prev => ({ ...prev, attacks: val }))}
          min={1}
          styles={inputStyles}
        />
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
    default:
      return null;
  }
}