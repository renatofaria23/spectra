import { describe, it, expect } from 'vitest'
import { getManaRequirement, canPlayerDraw, calculateFatigueDecrease, hasPlayerLost, getNextPhase, canNormalInvoke, validateFieldPosition, checkHandCapacity, checkFieldCapacity, getStartingHandSize, checkWinCondition } from './gameRules'
import { GAME_CONSTANTS } from '../types/constants'

describe('getManaRequirement', () => {
  it('returns level times 100', () => {
    expect(getManaRequirement(1)).toBe(100)
    expect(getManaRequirement(5)).toBe(500)
    expect(getManaRequirement(10)).toBe(1000)
  })
})

describe('canPlayerDraw', () => {
  it('allows drawing when hand is under max and deck is not empty', () => {
    const result = canPlayerDraw(10, 5)
    expect(result.canDraw).toBe(true)
    expect(result.isFatigue).toBe(false)
    expect(result.fatigueDecrease).toBe(0)
  })

  it('disallows drawing when hand is at max', () => {
    const result = canPlayerDraw(10, GAME_CONSTANTS.MAX_HAND_SIZE)
    expect(result.canDraw).toBe(false)
  })

  it('reports fatigue when deck is empty', () => {
    const result = canPlayerDraw(0, 5)
    expect(result.isFatigue).toBe(true)
    expect(result.fatigueDecrease).toBe(100)
  })
})

describe('calculateFatigueDecrease', () => {
  it('returns (count + 1) * 100', () => {
    expect(calculateFatigueDecrease(0)).toBe(100)
    expect(calculateFatigueDecrease(1)).toBe(200)
    expect(calculateFatigueDecrease(3)).toBe(400)
  })
})

describe('hasPlayerLost', () => {
  it('returns true when hp is 0 or below', () => {
    expect(hasPlayerLost(0)).toBe(true)
    expect(hasPlayerLost(-100)).toBe(true)
  })

  it('returns false when hp is positive', () => {
    expect(hasPlayerLost(1)).toBe(false)
    expect(hasPlayerLost(10000)).toBe(false)
  })
})

describe('getNextPhase', () => {
  it('cycles through preparation -> combat -> post_combat -> preparation', () => {
    expect(getNextPhase('preparation')).toBe('combat')
    expect(getNextPhase('combat')).toBe('post_combat')
    expect(getNextPhase('post_combat')).toBe('preparation')
  })

  it('returns preparation for unknown phase', () => {
    expect(getNextPhase('unknown')).toBe('preparation')
  })

  it('is case-insensitive', () => {
    expect(getNextPhase('PREPARATION')).toBe('combat')
    expect(getNextPhase('Combat')).toBe('post_combat')
  })
})

describe('canNormalInvoke', () => {
  it('allows normal invoke when under limit', () => {
    expect(canNormalInvoke(0)).toBe(true)
    expect(canNormalInvoke(GAME_CONSTANTS.NORMAL_INVOKES_PER_TURN - 1)).toBe(true)
  })

  it('disallows normal invoke when at limit', () => {
    expect(canNormalInvoke(GAME_CONSTANTS.NORMAL_INVOKES_PER_TURN)).toBe(false)
  })
})

describe('validateFieldPosition', () => {
  it('accepts valid positions', () => {
    expect(validateFieldPosition('attack').isValid).toBe(true)
    expect(validateFieldPosition('defense').isValid).toBe(true)
    expect(validateFieldPosition('face_down').isValid).toBe(true)
  })

  it('rejects invalid positions', () => {
    expect(validateFieldPosition('invalid').isValid).toBe(false)
    expect(validateFieldPosition('').isValid).toBe(false)
  })
})

describe('checkHandCapacity', () => {
  it('reports over capacity when hand exceeds max', () => {
    const result = checkHandCapacity(GAME_CONSTANTS.MAX_HAND_SIZE + 2)
    expect(result.isOverCapacity).toBe(true)
    expect(result.discardRequired).toBe(2)
  })

  it('reports no discard when under capacity', () => {
    const result = checkHandCapacity(5)
    expect(result.isOverCapacity).toBe(false)
    expect(result.discardRequired).toBe(0)
  })
})

describe('checkFieldCapacity', () => {
  it('reports full when field has 5 numena', () => {
    const result = checkFieldCapacity(5)
    expect(result.isFull).toBe(true)
    expect(result.available).toBe(0)
  })

  it('reports available spots when not full', () => {
    const result = checkFieldCapacity(3)
    expect(result.isFull).toBe(false)
    expect(result.available).toBe(2)
  })
})

describe('getStartingHandSize', () => {
  it('returns 4 for first player', () => {
    expect(getStartingHandSize(true)).toBe(GAME_CONSTANTS.FIRST_PLAYER_HAND)
  })

  it('returns 6 for second player', () => {
    expect(getStartingHandSize(false)).toBe(GAME_CONSTANTS.SECOND_PLAYER_HAND)
  })
})

describe('checkWinCondition', () => {
  it('returns player winner when opponent hp is 0 or below', () => {
    const result = checkWinCondition(5000, 0)
    expect(result.hasWinner).toBe(true)
    expect(result.winner).toBe('player')
  })

  it('returns opponent winner when player hp is 0 or below', () => {
    const result = checkWinCondition(0, 5000)
    expect(result.hasWinner).toBe(true)
    expect(result.winner).toBe('opponent')
  })

  it('returns no winner when both hp are positive', () => {
    const result = checkWinCondition(5000, 5000)
    expect(result.hasWinner).toBe(false)
    expect(result.winner).toBe(null)
  })
})