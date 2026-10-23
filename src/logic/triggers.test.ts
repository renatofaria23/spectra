import { describe, it, expect } from 'vitest'
import { hasPassiveTrigger, isPassiveTrigger, isCounterTrigger, isMentalDebtTrigger, isAbsorbTrigger, isConditionalTrigger, PassiveTrigger, SemiConfigurableTrigger } from './triggers'

describe('hasPassiveTrigger', () => {
  it('returns true when card has the trigger', () => {
    const card = { triggers: [PassiveTrigger.CHALLENGE, PassiveTrigger.VEILED] }
    expect(hasPassiveTrigger(card, PassiveTrigger.CHALLENGE)).toBe(true)
    expect(hasPassiveTrigger(card, PassiveTrigger.VEILED)).toBe(true)
  })

  it('returns false when card does not have the trigger', () => {
    const card = { triggers: [PassiveTrigger.CHALLENGE] }
    expect(hasPassiveTrigger(card, PassiveTrigger.STOUNNED)).toBe(false)
    expect(hasPassiveTrigger(card, PassiveTrigger.RELENTLESS)).toBe(false)
  })

  it('returns false when card has no triggers', () => {
    expect(hasPassiveTrigger({}, PassiveTrigger.CHALLENGE)).toBe(false)
    expect(hasPassiveTrigger({ triggers: undefined }, PassiveTrigger.CHALLENGE)).toBe(false)
  })
})

describe('isPassiveTrigger', () => {
  it('returns true for string entries', () => {
    expect(isPassiveTrigger(PassiveTrigger.CHALLENGE)).toBe(true)
    expect(isPassiveTrigger('VEILED')).toBe(true)
  })

  it('returns false for object entries', () => {
    expect(isPassiveTrigger({ trigger: SemiConfigurableTrigger.COUNTER, count_type: 'test', value: 1 })).toBe(false)
  })
})

describe('isCounterTrigger', () => {
  it('identifies counter triggers', () => {
    const entry = { trigger: SemiConfigurableTrigger.COUNTER, count_type: 'test', value: 1 }
    expect(isCounterTrigger(entry)).toBe(true)
  })

  it('rejects non-counter triggers', () => {
    expect(isCounterTrigger(PassiveTrigger.CHALLENGE)).toBe(false)
    expect(isCounterTrigger({ trigger: SemiConfigurableTrigger.MENTAL_DEBT, mana_amount: 0, trigger_condition: 'test' })).toBe(false)
  })
})

describe('isMentalDebtTrigger', () => {
  it('identifies mental debt triggers', () => {
    const entry = { trigger: SemiConfigurableTrigger.MENTAL_DEBT, mana_amount: 100, trigger_condition: 'test' }
    expect(isMentalDebtTrigger(entry)).toBe(true)
  })

  it('rejects non-mental-debt triggers', () => {
    expect(isMentalDebtTrigger(PassiveTrigger.CHALLENGE)).toBe(false)
  })
})

describe('isAbsorbTrigger', () => {
  it('identifies absorb triggers', () => {
    const entry = { trigger: SemiConfigurableTrigger.ABSORB, count_type: 'test', value: 1 }
    expect(isAbsorbTrigger(entry)).toBe(true)
  })

  it('rejects non-absorb triggers', () => {
    expect(isAbsorbTrigger(PassiveTrigger.CHALLENGE)).toBe(false)
  })
})

describe('isConditionalTrigger', () => {
  it('identifies conditional trigger effects', () => {
    const entry = { trigger: 'END_OF_TURN', effects: [] }
    expect(isConditionalTrigger(entry)).toBe(true)
  })

  it('rejects non-conditional triggers', () => {
    expect(isConditionalTrigger(PassiveTrigger.CHALLENGE)).toBe(false)
    expect(isConditionalTrigger({ trigger: SemiConfigurableTrigger.COUNTER, count_type: 'test', value: 1 })).toBe(false)
  })
})