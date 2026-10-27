import { GAME_CONSTANTS } from '../types/constants';
import type { Nature } from '../types/constants';

export interface NatureScaling {
  fire: { numenAttackBonus: number; numinaCount: number };
  earth: { numenDefenseBonus: number; numinaCount: number };
  water: { hpRegenBonus: number; numinaCount: number };
  air: { manaRegenBonus: number; numinaCount: number };
  light: { riteCostReduction: number; numinaCount: number };
  dark: { wardCostReduction: number; numinaCount: number };
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
    fire: { numenAttackBonus: 0, numinaCount: 0 },
    earth: { numenDefenseBonus: 0, numinaCount: 0 },
    water: { hpRegenBonus: 0, numinaCount: 0 },
    air: { manaRegenBonus: 0, numinaCount: 0 },
    light: { riteCostReduction: 0, numinaCount: 0 },
    dark: { wardCostReduction: 0, numinaCount: 0 },
  };

  deckCards.forEach((card) => {
    const nature = card.nature?.toLowerCase() as Nature | undefined;
    if (nature && scaling[nature]) scaling[nature].numinaCount++;
  });

  scaling.fire.numenAttackBonus = scaling.fire.numinaCount * 5;
  scaling.earth.numenDefenseBonus = scaling.earth.numinaCount * 5;
  scaling.water.hpRegenBonus = scaling.water.numinaCount * 5;
  scaling.air.manaRegenBonus = scaling.air.numinaCount * 1;
  scaling.light.riteCostReduction = scaling.light.numinaCount * 1;
  scaling.dark.wardCostReduction = scaling.dark.numinaCount * 1;

  return scaling;
};

export const calculateHPRegeneration = (scaling: NatureScaling): number => scaling.water.hpRegenBonus;

export const calculateMaxInvokes = (_scaling: NatureScaling): number => GAME_CONSTANTS.NORMAL_INVOKES_PER_TURN;

export const calculateManaGain = (baseManaGain: number, scaling: NatureScaling): number =>
  baseManaGain + scaling.air.manaRegenBonus;

export const calculateMaxHandSize = (_baseHandSize: number, _scaling: NatureScaling, _isOpponent = false): number =>
  _baseHandSize;

export const calculateDamageBonus = (scaling: NatureScaling): number => scaling.fire.numenAttackBonus;