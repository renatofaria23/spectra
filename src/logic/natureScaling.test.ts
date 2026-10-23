import { describe, it, expect } from 'vitest'
import { calculateNatureScaling, calculateHPRegeneration, calculateMaxInvokes, calculateManaGain, calculateMaxHandSize, calculateDamageBonus } from './natureScaling'

describe('calculateNatureScaling', () => {
  it('returns zero scaling for empty deck', () => {
    const result = calculateNatureScaling([])
    expect(result.fire.damageBonus).toBe(0)
    expect(result.fire.numinaCount).toBe(0)
    expect(result.earth.hpBonus).toBe(0)
    expect(result.earth.numinaCount).toBe(0)
    expect(result.water.hpRegenBonus).toBe(0)
    expect(result.water.numinaCount).toBe(0)
    expect(result.air.extraInvokes).toBe(0)
    expect(result.air.numinaCount).toBe(0)
    expect(result.light.manaGainBonus).toBe(0)
    expect(result.light.numinaCount).toBe(0)
    expect(result.dark.handSizeBonus).toBe(0)
    expect(result.dark.numinaCount).toBe(0)
  })

  it('counts fire nature cards and applies damage bonus', () => {
    const result = calculateNatureScaling([{ nature: 'fire' }, { nature: 'fire' }, { nature: 'fire' }])
    expect(result.fire.numinaCount).toBe(3)
    expect(result.fire.damageBonus).toBe(6)
  })

  it('counts earth nature cards and applies hp bonus', () => {
    const result = calculateNatureScaling([{ nature: 'earth' }, { nature: 'earth' }])
    expect(result.earth.numinaCount).toBe(2)
    expect(result.earth.hpBonus).toBe(100)
  })

  it('counts water nature cards and applies hp regen bonus', () => {
    const result = calculateNatureScaling([{ nature: 'water' }, { nature: 'water' }, { nature: 'water' }, { nature: 'water' }])
    expect(result.water.numinaCount).toBe(4)
    expect(result.water.hpRegenBonus).toBe(40)
  })

  it('counts air nature cards and applies extra invokes', () => {
    const result = calculateNatureScaling(Array.from({ length: 10 }, () => ({ nature: 'air' })))
    expect(result.air.numinaCount).toBe(10)
    expect(result.air.extraInvokes).toBe(1)
  })

  it('counts light nature cards and applies mana gain bonus', () => {
    const result = calculateNatureScaling([{ nature: 'light' }, { nature: 'light' }, { nature: 'light' }])
    expect(result.light.numinaCount).toBe(3)
    expect(result.light.manaGainBonus).toBe(9)
  })

  it('counts dark nature cards and applies hand size bonus', () => {
    const result = calculateNatureScaling(Array.from({ length: 12 }, () => ({ nature: 'dark' })))
    expect(result.dark.numinaCount).toBe(12)
    expect(result.dark.handSizeBonus).toBe(2)
  })

  it('ignores unknown nature values', () => {
    const result = calculateNatureScaling([{ nature: 'fire' }, { nature: 'unknown' as any }])
    expect(result.fire.numinaCount).toBe(1)
    expect(result.fire.damageBonus).toBe(2)
  })

  it('is case-insensitive for nature values', () => {
    const result = calculateNatureScaling([{ nature: 'FIRE' }, { nature: 'Fire' }])
    expect(result.fire.numinaCount).toBe(2)
    expect(result.fire.damageBonus).toBe(4)
  })
})

describe('calculateHPRegeneration', () => {
  it('returns water hp regen bonus from scaling', () => {
    const scaling = { water: { hpRegenBonus: 50, numinaCount: 5 } } as any
    expect(calculateHPRegeneration(scaling)).toBe(50)
  })
})

describe('calculateMaxInvokes', () => {
  it('returns 1 plus air extra invokes', () => {
    const scaling = { air: { extraInvokes: 2, numinaCount: 20 } } as any
    expect(calculateMaxInvokes(scaling)).toBe(3)
  })
})

describe('calculateManaGain', () => {
  it('adds light mana gain bonus to base', () => {
    const scaling = { light: { manaGainBonus: 9, numinaCount: 3 } } as any
    expect(calculateManaGain(100, scaling)).toBe(109)
  })
})

describe('calculateMaxHandSize', () => {
  it('adds dark hand size bonus for player', () => {
    const scaling = { dark: { handSizeBonus: 2, numinaCount: 12 } } as any
    expect(calculateMaxHandSize(10, scaling)).toBe(12)
  })

  it('subtracts dark hand size bonus for opponent with minimum 1', () => {
    const scaling = { dark: { handSizeBonus: 10, numinaCount: 50 } } as any
    expect(calculateMaxHandSize(10, scaling, true)).toBe(1)
  })
})

describe('calculateDamageBonus', () => {
  it('returns fire damage bonus', () => {
    const scaling = { fire: { damageBonus: 10, numinaCount: 5 } } as any
    expect(calculateDamageBonus(scaling)).toBe(10)
  })
})