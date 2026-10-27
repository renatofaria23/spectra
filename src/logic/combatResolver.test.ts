import { describe, it, expect } from 'vitest'
import { canNumenAttack, canNumenGroupAttack, mustNumenGroupAttack, resetNumenStats, getTargetableDefenders, resolveBattlePhase } from './combatResolver'
import { PassiveTrigger } from './triggers'

const makeNumen = (overrides: Record<string, unknown> = {}): any => ({
  id: 'numen-1',
  name: 'Test Numen',
  baseAttack: 1000,
  baseDefense: 1000,
  currentAttack: 1000,
  currentDefense: 1000,
  position: 'attack' as const,
  justInvokeed: false,
  hasAttacked: false,
  triggers: [],
  ...overrides,
})

describe('canNumenAttack', () => {
  it('allows attack for numen in attack position', () => {
    const result = canNumenAttack(makeNumen())
    expect(result.canAttack).toBe(true)
    expect(result.reason).toBe('')
  })

  it('denies attack for numen in defense position', () => {
    const result = canNumenAttack(makeNumen({ position: 'defense' }))
    expect(result.canAttack).toBe(false)
    expect(result.reason).toContain('defense')
  })

  it('denies attack for stunned numen', () => {
    const result = canNumenAttack(makeNumen({ triggers: [PassiveTrigger.STUNNED] }))
    expect(result.canAttack).toBe(false)
    expect(result.reason).toContain('stunned')
  })

  it('denies attack for freshly invokeed numen without celerity', () => {
    const result = canNumenAttack(makeNumen({ justInvokeed: true }))
    expect(result.canAttack).toBe(false)
    expect(result.reason).toContain('Freshly invokeed')
  })

  it('allows attack for freshly invokeed numen with celerity', () => {
    const result = canNumenAttack(makeNumen({ justInvokeed: true, triggers: [PassiveTrigger.CELERITY] }))
    expect(result.canAttack).toBe(true)
  })
})

describe('canNumenGroupAttack', () => {
  it('returns true for numen without recluse trigger', () => {
    expect(canNumenGroupAttack(makeNumen())).toBe(true)
  })

  it('returns false for numen with recluse trigger', () => {
    expect(canNumenGroupAttack(makeNumen({ triggers: [PassiveTrigger.RECLUSE] }))).toBe(false)
  })
})

describe('mustNumenGroupAttack', () => {
  it('returns true for numen with legion trigger', () => {
    expect(mustNumenGroupAttack(makeNumen({ triggers: [PassiveTrigger.LEGION] }))).toBe(true)
  })

  it('returns false for numen without legion trigger', () => {
    expect(mustNumenGroupAttack(makeNumen())).toBe(false)
  })
})

describe('resetNumenStats', () => {
  it('resets current stats to base values and clears flags', () => {
    const numena = [
      makeNumen({ currentAttack: 500, currentDefense: 500, hasAttacked: true, justInvokeed: true }),
      makeNumen({ currentAttack: 300, currentDefense: 800, hasAttacked: false, justInvokeed: false }),
    ]
    const result = resetNumenStats(numena)
    expect(result[0]!.currentAttack).toBe(1000)
    expect(result[0]!.currentDefense).toBe(1000)
    expect(result[0]!.hasAttacked).toBe(false)
    expect(result[0]!.justInvokeed).toBe(false)
    expect(result[1]!.currentAttack).toBe(1000)
    expect(result[1]!.currentDefense).toBe(1000)
  })
})

describe('getTargetableDefenders', () => {
  it('returns only the challenge numen when one exists', () => {
    const defenders = [
      makeNumen({ id: 'd1', triggers: [PassiveTrigger.CHALLENGE] }),
      makeNumen({ id: 'd2' }),
      makeNumen({ id: 'd3' }),
    ]
    const result = getTargetableDefenders(defenders)
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('d1')
  })

  it('returns only veiled numena when all are veiled', () => {
    const defenders = [
      makeNumen({ id: 'd1', triggers: [PassiveTrigger.VEILED] }),
      makeNumen({ id: 'd2', triggers: [PassiveTrigger.VEILED] }),
    ]
    const result = getTargetableDefenders(defenders)
    expect(result).toHaveLength(2)
  })

  it('returns non-veiled numena when at least one is unveiled', () => {
    const defenders = [
      makeNumen({ id: 'd1', triggers: [PassiveTrigger.VEILED] }),
      makeNumen({ id: 'd2' }),
    ]
    const result = getTargetableDefenders(defenders)
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('d2')
  })
})

describe('resolveBattlePhase', () => {
  it('returns validation errors for attackers not on field', () => {
    const result = resolveBattlePhase([{ attackerId: 'missing', targetId: null }], [])
    expect(result.validationErrors.length).toBeGreaterThan(0)
    expect(result.validationErrors[0]).toContain('not found')
  })

  it('returns validation errors for numen that cannot attack', () => {
    const field = [makeNumen({ position: 'defense' })]
    const result = resolveBattlePhase([{ attackerId: 'numen-1', targetId: null }], field)
    expect(result.validationErrors.length).toBeGreaterThan(0)
  })

  it('processes a valid solo attack against no target', () => {
    const field = [makeNumen({ id: 'numen-1', currentAttack: 1000 })]
    const result = resolveBattlePhase([{ attackerId: 'numen-1', targetId: null }], field)
    expect(result.validationErrors).toEqual([])
    expect(result.interactions.length).toBe(1)
    expect(result.interactions[0]!.attackerId).toBe('numen-1')
  })
})