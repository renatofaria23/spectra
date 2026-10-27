import { describe, it, expect } from 'vitest'
import { validateDeck } from './decksAPI'

const makeCard = (id: string, rarity = 'common') => ({ id, name: `Card ${id}`, rarity, type: 'numen' as const, cardType: 'numen', description: '', art: '' })

const withFillers = (entries: { cardId: string; quantity: number; rarity?: string }[]) => {
  const deck = entries.map((e) => ({ cardId: e.cardId, quantity: e.quantity }))
  let total = deck.reduce((s, e) => s + e.quantity, 0)
  let i = 0
  while (total < 40) {
    deck.push({ cardId: `filler-${i++}`, quantity: 1 })
    total++
  }
  const pool = entries.map((e) => makeCard(e.cardId, e.rarity ?? 'common'))
  deck.filter((e) => e.cardId.startsWith('filler')).forEach((e) => pool.push(makeCard(e.cardId, 'common')))
  return { deck, pool }
}

describe('validateDeck rarity limits', () => {
  it('allows 3 commons', () => {
    const { deck, pool } = withFillers([{ cardId: 'c1', quantity: 3 }])
    expect(validateDeck(deck, pool).isValid).toBe(true)
  })

  it('rejects 4 commons', () => {
    const { deck, pool } = withFillers([{ cardId: 'c1', quantity: 4 }])
    const result = validateDeck(deck, pool)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes('Max is 3'))).toBe(true)
  })

  it('allows 2 rares', () => {
    const { deck, pool } = withFillers([{ cardId: 'r1', quantity: 2, rarity: 'rare' }])
    expect(validateDeck(deck, pool).isValid).toBe(true)
  })

  it('rejects 3 rares', () => {
    const { deck, pool } = withFillers([{ cardId: 'r1', quantity: 3, rarity: 'rare' }])
    const result = validateDeck(deck, pool)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes('Max is 2'))).toBe(true)
  })

  it('allows 1 copy of each of 3 different legendaries', () => {
    const { deck, pool } = withFillers(['l1', 'l2', 'l3'].map((id) => ({ cardId: id, quantity: 1, rarity: 'legendary' })))
    expect(validateDeck(deck, pool).isValid).toBe(true)
  })

  it('rejects 2 copies of the same legendary', () => {
    const { deck, pool } = withFillers([{ cardId: 'l1', quantity: 2, rarity: 'legendary' }])
    const result = validateDeck(deck, pool)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes('Max is 1'))).toBe(true)
  })

  it('allows 1 mythic', () => {
    const { deck, pool } = withFillers([{ cardId: 'm1', quantity: 1, rarity: 'mythic' }])
    expect(validateDeck(deck, pool).isValid).toBe(true)
  })

  it('rejects 2 different mythics', () => {
    const { deck, pool } = withFillers([
      { cardId: 'm1', quantity: 1, rarity: 'mythic' },
      { cardId: 'm2', quantity: 1, rarity: 'mythic' },
    ])
    const result = validateDeck(deck, pool)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes('1 Mythic card total'))).toBe(true)
  })
})