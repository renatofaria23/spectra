import type { Nature } from '../types/constants';

export interface NatureScaling {
  fire: { damageBonus: number; numinaCount: number };
  earth: { hpBonus: number; numinaCount: number };
  water: { hpRegenBonus: number; numinaCount: number };
  air: { extraInvokes: number; numinaCount: number };
  light: { manaGainBonus: number; numinaCount: number };
  dark: { handSizeBonus: number; numinaCount: number };
}

export interface Card {
  id?: string;
  nature?: Nature;
  baseAttack?: number;
  baseDefense?: number;
  [key: string]: unknown;
}

export const calculateNatureScaling = (deckCards: Card[]): NatureScaling => {
  const scaling = {
    fire: { damageBonus: 0, numinaCount: 0 },
    earth: { hpBonus: 0, numinaCount: 0 },
    water: { hpRegenBonus: 0, numinaCount: 0 },
    air: { extraInvokes: 0, numinaCount: 0 },
    light: { manaGainBonus: 0, numinaCount: 0 },
    dark: { handSizeBonus: 0, numinaCount: 0 },
  };

  deckCards.forEach((card) => {
    const nature = card.nature?.toLowerCase() as Nature | undefined;
    if (nature && scaling[nature]) scaling[nature].numinaCount++;
  });

  scaling.fire.damageBonus = scaling.fire.numinaCount * 2;
  scaling.earth.hpBonus = scaling.earth.numinaCount * 50;
  scaling.water.hpRegenBonus = scaling.water.numinaCount * 10;
  scaling.air.extraInvokes = Math.floor(scaling.air.numinaCount / 10);
  scaling.light.manaGainBonus = scaling.light.numinaCount * 3;
  scaling.dark.handSizeBonus = Math.floor(scaling.dark.numinaCount / 5);

  return scaling;
};

export const calculateHPRegeneration = (scaling: NatureScaling): number => scaling.water.hpRegenBonus;

export const calculateMaxInvokes = (scaling: NatureScaling): number => 1 + scaling.air.extraInvokes;

export const calculateManaGain = (baseManaGain: number, scaling: NatureScaling): number =>
  baseManaGain + scaling.light.manaGainBonus;

export const calculateMaxHandSize = (baseHandSize: number, scaling: NatureScaling, isOpponent = false): number =>
  isOpponent ? Math.max(1, baseHandSize - scaling.dark.handSizeBonus) : baseHandSize + scaling.dark.handSizeBonus;

export const calculateDamageBonus = (scaling: NatureScaling): number => scaling.fire.damageBonus;