import { NATURES } from '../types/constants';
import type { Nature } from '../types/constants';

export interface NatureScaling {
  fire: { damageBonus: number; numinaCount: number };
  earth: { hpBonus: number; numinaCount: number };
  water: { hpRegenBonus: number; numinaCount: number };
  air: { extraSummons: number; numinaCount: number };
  light: { manaGainBonus: number; maxManaBonus: number; numinaCount: number };
  dark: { handSizeBonus: number; numinaCount: number };
}

export interface Card {
  id?: string;
  attribute?: Nature;
  baseAttack?: number;
  baseDefense?: number;
  [key: string]: unknown;
}

export const calculateNatureScaling = (deckCards: Card[]): NatureScaling => {
  const scaling: NatureScaling = {
    fire: { damageBonus: 0, numinaCount: 0 },
    earth: { hpBonus: 0, numinaCount: 0 },
    water: { hpRegenBonus: 0, numinaCount: 0 },
    air: { extraSummons: 0, numinaCount: 0 },
    light: { manaGainBonus: 0, maxManaBonus: 0, numinaCount: 0 },
    dark: { handSizeBonus: 0, numinaCount: 0 },
  };

  deckCards.forEach((card) => {
    const attribute = card.attribute?.toLowerCase() as Nature | undefined;
    if (!attribute || !scaling[attribute]) return;

    scaling[attribute].numinaCount += 1;
  });

  scaling.fire.damageBonus = scaling.fire.numinaCount * 2;

  scaling.earth.hpBonus = scaling.earth.numinaCount * 50;

  scaling.water.hpRegenBonus = scaling.water.numinaCount * 10;

  scaling.air.extraSummons = Math.floor(scaling.air.numinaCount / 10);

  scaling.light.manaGainBonus = scaling.light.numinaCount * 2;
  scaling.light.maxManaBonus = scaling.light.numinaCount * 20;

  scaling.dark.handSizeBonus = Math.floor(scaling.dark.numinaCount / 5);

  return scaling;
};

export const calculateTotalMaxHP = (baseHP: number, scaling: NatureScaling): number => {
  return baseHP + scaling.earth.hpBonus;
};

export const calculateHPRegeneration = (scaling: NatureScaling): number => {
  return scaling.water.hpRegenBonus;
};

export const calculateMaxSummons = (scaling: NatureScaling): number => {
  return 1 + scaling.air.extraSummons;
};

export const calculateMaxMana = (baseMaxMana: number, scaling: NatureScaling): number => {
  return baseMaxMana + scaling.light.maxManaBonus;
};

export const calculateManaGain = (baseManaGain: number, scaling: NatureScaling): number => {
  return baseManaGain + scaling.light.manaGainBonus;
};

export const calculateMaxHandSize = (baseHandSize: number, scaling: NatureScaling, isOpponent: boolean = false): number => {
  const bonus = scaling.dark.handSizeBonus;
  if (isOpponent) {
    return Math.max(1, baseHandSize - bonus);
  }
  return baseHandSize + bonus;
};

export const calculateDamageBonus = (scaling: NatureScaling): number => {
  return scaling.fire.damageBonus;
};