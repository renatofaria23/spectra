import { describe, it, expect } from 'vitest'
import { calculateNatureScaling, calculateHPRegeneration, calculateMaxInvokes, calculateManaGain, calculateMaxHandSize, calculateDamageBonus } from './natureScaling'
import { GAME_CONSTANTS } from '../types/constants'

describe('calculateNatureScaling', () => {
  it('returns zero scaling for empty deck', () => {
    const result = calculateNatureScaling([])
    expect(result.fire.numenAttackBonus).toBe(0)
    expect(result.fire.numinaCount).toBe(0)
    expect(result.earth.numenDefenseBonus).toBe(0)
    expect(result.earth.numinaCount).toBe(0)
    expect(result.water.hpRegenBonus).toBe(0)
    expect(result.water.numinaCount).toBe(0)
    expect(result.air.manaRegenBonus).toBe(0)
    expect(result.air.numinaCount).toBe(0)
    expect(result.light.riteCostReduction).toBe(0)
    expect(result.light.numinaCount).toBe(0)
    expect(result.dark.wardCostReduction).toBe(0)
    expect(result.dark.numinaCount).toBe(0)
  })

  it('counts fire nature cards and applies numen attack bonus', () => {
    const result = calculateNatureScaling([{ nature: 'fire' }, { nature: 'fire' }, { nature: 'fire' }])
    expect(result.fire.numinaCount).toBe(3)
    expect(result.fire.numenAttackBonus).toBe(15)
  })

  it('counts earth nature cards and applies numen defense bonus', () => {
    const result = calculateNatureScaling([{ nature: 'earth' }, { nature: 'earth' }])
    expect(result.earth.numinaCount).toBe(2)
    expect(result.earth.numenDefenseBonus).toBe(10)
  })

  it('counts water nature cards and applies hp regen bonus', () => {
    const result = calculateNatureScaling([{ nature: 'water' }, { nature: 'water' }, { nature: 'water' }, { nature: 'water' }])
    expect(result.water.numinaCount).toBe(4)
    expect(result.water.hpRegenBonus).toBe(20)
  })

  it('counts wind nature cards and applies mana regen bonus', () => {
    const result = calculateNatureScaling(Array.from({ length: 10 }, () => ({ nature: 'air' })))
    expect(result.air.numinaCount).toBe(10)
    expect(result.air.manaRegenBonus).toBe(10)
  })

  it('counts light nature cards and applies rite cost reduction', () => {
    const result = calculateNatureScaling([{ nature: 'light' }, { nature: 'light' }, { nature: 'light' }])
    expect(result.light.numinaCount).toBe(3)
    expect(result.light.riteCostReduction).toBe(3)
  })

  it('counts dark nature cards and applies ward cost reduction', () => {
    const result = calculateNatureScaling(Array.from({ length: 12 }, () => ({ nature: 'dark' })))
    expect(result.dark.numinaCount).toBe(12)
    expect(result.dark.wardCostReduction).toBe(12)
  })

  it('ignores unknown nature values', () => {
    const result = calculateNatureScaling([{ nature: 'fire' }, { nature: 'unknown' as any }])
    expect(result.fire.numinaCount).toBe(1)
    expect(result.fire.numenAttackBonus).toBe(5)
  })

  it('is case-insensitive for nature values', () => {
    const result = calculateNatureScaling([{ nature: 'FIRE' as any }, { nature: 'Fire' as any }])
    expect(result.fire.numinaCount).toBe(2)
    expect(result.fire.numenAttackBonus).toBe(10)
  })
})

describe('calculateHPRegeneration', () => {
  it('returns water hp regen bonus from scaling', () => {
    const scaling = { water: { hpRegenBonus: 20, numinaCount: 4 } } as any
    expect(calculateHPRegeneration(scaling)).toBe(20)
  })
})

describe('calculateMaxInvokes', () => {
  it('returns base normal invokes per turn', () => {
    const scaling = { air: { manaRegenBonus: 10, numinaCount: 10 } } as any
    expect(calculateMaxInvokes(scaling)).toBe(GAME_CONSTANTS.NORMAL_INVOKES_PER_TURN)
  })
})

describe('calculateManaGain', () => {
  it('adds wind mana regen bonus to base', () => {
    const scaling = { air: { manaRegenBonus: 10, numinaCount: 10 } } as any
    expect(calculateManaGain(100, scaling)).toBe(110)
  })
})

describe('calculateMaxHandSize', () => {
  it('returns base hand size', () => {
    const scaling = { dark: { wardCostReduction: 12, numinaCount: 12 } } as any
    expect(calculateMaxHandSize(10, scaling)).toBe(10)
  })

  it('returns base hand size for opponent', () => {
    const scaling = { dark: { wardCostReduction: 12, numinaCount: 12 } } as any
    expect(calculateMaxHandSize(10, scaling, true)).toBe(10)
  })
})

describe('calculateDamageBonus', () => {
  it('returns fire numen attack bonus', () => {
    const scaling = { fire: { numenAttackBonus: 15, numinaCount: 3 } } as any
    expect(calculateDamageBonus(scaling)).toBe(15)
  })
})