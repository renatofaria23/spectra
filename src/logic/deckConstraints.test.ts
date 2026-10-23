import { describe, it, expect } from 'vitest'
import { validateDeckComposition, calculateDeckRequirements, validateCardRequirements, getDeckStats } from './deckConstraints'

const makeCard = (overrides: Record<string, unknown> = {}): any => ({
  id: 'card-1',
  type: 'numen',
  name: 'Test Numen',
  nature: 'fire',
  numenFamily: 'beast',
  rarity: 'common',
  level: 1,
  baseAttack: 100,
  baseDefense: 100,
  ...overrides,
})

describe('validateDeckComposition', () => {
  it('validates a deck of exactly 40 cards with no duplicates over 3', () => {
    const deck = Array.from({ length: 40 }, (_, i) => makeCard({ id: `card-${i}` }))
    const result = validateDeckComposition(deck)
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('rejects deck smaller than minimum', () => {
    const deck = Array.from({ length: 39 }, () => makeCard())
    const result = validateDeckComposition(deck)
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('Deck too small')
  })

  it('rejects deck larger than maximum', () => {
    const deck = Array.from({ length: 41 }, () => makeCard())
    const result = validateDeckComposition(deck)
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('Deck too large')
  })

  it('rejects a card appearing more than 3 times', () => {
    const deck = Array.from({ length: 40 }, () => makeCard({ id: 'same-card' }))
    const result = validateDeckComposition(deck)
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('appears 40 times (max 3)')
  })
})

describe('calculateDeckRequirements', () => {
  it('returns empty requirements for a deck with no mythic cards', () => {
    const deck = [makeCard(), makeCard({ type: 'rite' }), makeCard({ type: 'ward' })]
    const result = calculateDeckRequirements(deck)
    expect(result.totalRequired).toBe(0)
    expect(result.rites).toBe(0)
    expect(result.wards).toBe(0)
  })

  it('accumulates deck requirements from mythic cards', () => {
    const deck = [
      makeCard({ id: 'mythic-1', type: 'rite', isMythic: true, mythicQuest: { deckRequirements: { rites: 2, wards: 1 } } }),
      makeCard({ id: 'mythic-2', type: 'ward', isMythic: true, mythicQuest: { deckRequirements: { rites: 1, wards: 3 } } }),
    ]
    const result = calculateDeckRequirements(deck)
    expect(result.rites).toBe(2)
    expect(result.wards).toBe(3)
    expect(result.totalRequired).toBe(5)
  })
})

describe('validateCardRequirements', () => {
  it('returns canInvoke true for mythic with no requirements', () => {
    const deck = [makeCard({ id: 'mythic-1', isMythic: true, mythicQuest: { deckRequirements: {} } })]
    const result = validateCardRequirements(deck, ['mythic-1'])
    expect(result.canInvoke['mythic-1']).toBe(true)
    expect(result.missingRequirements['mythic-1']).toEqual([])
  })

  it('returns canInvoke false for mythic with unmet requirements', () => {
    const deck = [makeCard({ id: 'mythic-1', isMythic: true, mythicQuest: { deckRequirements: { beast: 5, rites: 3 } } })]
    const result = validateCardRequirements(deck, ['mythic-1'])
    expect(result.canInvoke['mythic-1']).toBe(false)
    expect(result.missingRequirements['mythic-1'].length).toBeGreaterThan(0)
  })

  it('handles mythic card not found in deck', () => {
    const deck = [makeCard()]
    const result = validateCardRequirements(deck, ['missing-mythic'])
    expect(result.canInvoke['missing-mythic']).toBe(false)
    expect(result.missingRequirements['missing-mythic']).toContain('Card not found or not mythic')
  })
})

describe('getDeckStats', () => {
  it('counts card types correctly', () => {
    const deck = [
      makeCard({ type: 'numen', numenFamily: 'beast', nature: 'fire' }),
      makeCard({ type: 'numen', numenFamily: 'beast', nature: 'fire' }),
      makeCard({ type: 'numen', numenFamily: 'dragon', nature: 'water' }),
      makeCard({ type: 'rite' }),
      makeCard({ type: 'ward' }),
    ]
    const stats = getDeckStats(deck)
    expect(stats.numenCount).toBe(3)
    expect(stats.riteCount).toBe(1)
    expect(stats.wardCount).toBe(1)
    expect(stats.typeCounts['beast']).toBe(2)
    expect(stats.typeCounts['dragon']).toBe(1)
    expect(stats.natureCounts['fire']).toBe(2)
    expect(stats.natureCounts['water']).toBe(1)
  })
})