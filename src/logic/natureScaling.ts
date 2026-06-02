import { NATURES } from '../types/constants';

import type { Nature } from '../types/constants';

export interface NatureScaling {
  fire: { atkBonus: number; monstersCount: number };
  earth: { hpBonus: number; monstersCount: number };
  water: { hpRegenBonus: number; monstersCount: number };
  air: { extraActions: number; monstersCount: number };
  light: { drawBonus: number; monstersCount: number };
  dark: { wardBonus: number; monstersCount: number };
}

export interface Card {
  id?: string;
  attribute?: Nature;
  baseAttack?: number;
  baseDefense?: number;
  [key: string]: unknown;
}

export const calculateNatureScaling = (monsterCards: Card[]): NatureScaling => {
  const scaling: NatureScaling = {
    fire: { atkBonus: 0, monstersCount: 0 },
    earth: { hpBonus: 0, monstersCount: 0 },
    water: { hpRegenBonus: 0, monstersCount: 0 },
    air: { extraActions: 0, monstersCount: 0 },
    light: { drawBonus: 0, monstersCount: 0 },
    dark: { wardBonus: 0, monstersCount: 0 },
  };

  monsterCards.forEach((card) => {
    const attribute = card.attribute?.toLowerCase() as Nature | undefined;
    if (!attribute || !scaling[attribute]) return;

    scaling[attribute].monstersCount += 1;
  });

  scaling.fire.atkBonus = scaling.fire.monstersCount * 10;

  scaling.earth.hpBonus = scaling.earth.monstersCount * 50;

  scaling.water.hpRegenBonus = scaling.water.monstersCount * 10;

  scaling.air.extraActions = Math.floor(scaling.air.monstersCount / 10);

  scaling.light.drawBonus = Math.floor(scaling.light.monstersCount / 80);

  scaling.dark.wardBonus = Math.floor(scaling.dark.monstersCount / 80);

  return scaling;
};

export const applyNatureScaling = (monster: Card, scaling: NatureScaling): { boostedAttack: number; boostedDefense: number } => {
  const attribute = monster.attribute?.toLowerCase() as Nature | undefined;
  let boostedAttack = monster.baseAttack || 0;
  let boostedDefense = monster.baseDefense || 0;

  if (attribute === 'fire' && scaling.fire) {
    boostedAttack += scaling.fire.atkBonus;
  }

  return { boostedAttack, boostedDefense };
};

export const calculateTotalHP = (baseHP: number, monsterCards: Card[]): number => {
  const earthMonsters = monsterCards.filter(
    (card) => card.attribute?.toLowerCase() === 'earth'
  ).length;
  return baseHP + earthMonsters * 50;
};

export const calculateHPRegeneration = (monsterCards: Card[]): number => {
  const waterMonsters = monsterCards.filter(
    (card) => card.attribute?.toLowerCase() === 'water'
  ).length;
  return waterMonsters * 10;
};