import { describe, it, expect } from 'vitest'
import { EffectType, isDrawEffect, isScryEffect, isForgetEffect, isExileEffect, isPetrifyEffect, isDecreaseEffect, isLockEffect, isIncreaseEffect, isEtherealEffect, isFindEffect, isChooseOneEffect, isAddTriggerEffect, isInvokeEffect, isEvokeEffect, isConvokeEffect, isCopyEffect, isAddEffect, isReturnEffect, handleEffect } from './effects'

describe('EffectType enum', () => {
  it('defines all expected effect types', () => {
    expect(EffectType.DRAW).toBe('DRAW')
    expect(EffectType.SCRY).toBe('SCRY')
    expect(EffectType.FORGET).toBe('FORGET')
    expect(EffectType.EXILE).toBe('EXILE')
    expect(EffectType.PETRIFY).toBe('PETRIFY')
  })
})

describe('isDrawEffect', () => {
  it('identifies draw effects', () => {
    expect(isDrawEffect({ effect: EffectType.DRAW, count: 2 })).toBe(true)
    expect(isDrawEffect({ effect: EffectType.SCRY, count: 1 })).toBe(false)
  })
})

describe('isScryEffect', () => {
  it('identifies scry effects', () => {
    expect(isScryEffect({ effect: EffectType.SCRY, count: 3, deck: 'player' })).toBe(true)
    expect(isScryEffect({ effect: EffectType.DRAW, count: 1 })).toBe(false)
  })
})

describe('isForgetEffect', () => {
  it('identifies forget effects', () => {
    expect(isForgetEffect({ effect: EffectType.FORGET, count: 1 })).toBe(true)
    expect(isForgetEffect({ effect: EffectType.EXILE, count: 1 })).toBe(false)
  })
})

describe('isExileEffect', () => {
  it('identifies exile effects', () => {
    expect(isExileEffect({ effect: EffectType.EXILE, count: 1 })).toBe(true)
    expect(isExileEffect({ effect: EffectType.FORGET, count: 1 })).toBe(false)
  })
})

describe('isPetrifyEffect', () => {
  it('identifies petrify effects', () => {
    expect(isPetrifyEffect({ effect: EffectType.PETRIFY, turns: 2 })).toBe(true)
    expect(isPetrifyEffect({ effect: EffectType.DECREASE, amount: 100 })).toBe(false)
  })
})
describe('isDecreaseEffect', () => {
  it('identifies decrease effects', () => {
    expect(isDecreaseEffect({ effect: EffectType.DECREASE, target: 'numen', effectTarget: 'atk', amount: 100 })).toBe(true)
    expect(isDecreaseEffect({ effect: EffectType.INCREASE, target: 'numen', effectTarget: 'atk', amount: 100 })).toBe(false)
  })
})

describe('isLockEffect', () => {
  it('identifies lock effects', () => {
    expect(isLockEffect({ effect: EffectType.LOCK, duration: 'temporary' })).toBe(true)
    expect(isLockEffect({ effect: EffectType.ETHEREAL, count: 1, type: 'rite' })).toBe(false)
  })
})

describe('isIncreaseEffect', () => {
  it('identifies increase effects', () => {
    expect(isIncreaseEffect({ effect: EffectType.INCREASE, target: 'numen', effectTarget: 'atk', amount: 100 })).toBe(true)
    expect(isIncreaseEffect({ effect: EffectType.DECREASE, target: 'numen', effectTarget: 'atk', amount: 100 })).toBe(false)
  })
})
describe('isEtherealEffect', () => {
  it('identifies ethereal effects', () => {
    expect(isEtherealEffect({ effect: EffectType.ETHEREAL, count: 1, type: 'rite' })).toBe(true)
    expect(isEtherealEffect({ effect: EffectType.FIND, count: 1, source: 'deck' })).toBe(false)
  })
})

describe('isFindEffect', () => {
  it('identifies find effects', () => {
    expect(isFindEffect({ effect: EffectType.FIND, count: 1, source: 'deck' })).toBe(true)
    expect(isFindEffect({ effect: EffectType.CHOOSE_ONE, options: ['a', 'b'] })).toBe(false)
  })
})

describe('isChooseOneEffect', () => {
  it('identifies choose_one effects', () => {
    expect(isChooseOneEffect({ effect: EffectType.CHOOSE_ONE, options: ['a', 'b'] })).toBe(true)
    expect(isChooseOneEffect({ effect: EffectType.ADD_TRIGGER, trigger_type: 'test', duration: 1 })).toBe(false)
  })
})

describe('isAddTriggerEffect', () => {
  it('identifies add_trigger effects', () => {
    expect(isAddTriggerEffect({ effect: EffectType.ADD_TRIGGER, trigger_type: 'test', duration: 1 })).toBe(true)
    expect(isAddTriggerEffect({ effect: EffectType.INVOKE, from: 'player_hand', criteria: {}, count: 1 })).toBe(false)
  })
describe('isInvokeEffect', () => {
  it('identifies invoke effects', () => {
})
    expect(isInvokeEffect({ effect: EffectType.INVOKE, from: 'player_hand', criteria: {}, count: 1 })).toBe(true)
    expect(isInvokeEffect({ effect: EffectType.EVOKE, from: 'player_memora', criteria: {}, count: 1 })).toBe(false)
  })
})

describe('isEvokeEffect', () => {
  it('identifies evoke effects', () => {
    expect(isEvokeEffect({ effect: EffectType.EVOKE, from: 'player_memora', criteria: {}, count: 1 })).toBe(true)
    expect(isEvokeEffect({ effect: EffectType.CONVOKE, from: 'player_deck', criteria: {}, count: 1 })).toBe(false)
  })
})

describe('isConvokeEffect', () => {
  it('identifies convoke effects', () => {
    expect(isConvokeEffect({ effect: EffectType.CONVOKE, from: 'player_deck', criteria: {}, count: 1 })).toBe(true)
    expect(isConvokeEffect({ effect: EffectType.COPY, copyTarget: 'a', destination: 'b', count: 1 })).toBe(false)
  })
})
describe('isCopyEffect', () => {
  it('identifies copy effects', () => {
    expect(isCopyEffect({ effect: EffectType.COPY, copyTarget: 'a', destination: 'b', count: 1 })).toBe(true)
    expect(isCopyEffect({ effect: EffectType.ADD, addFrom: 'player_field', addTargetType: 'numen', destination: 'player_deck', count: 1 })).toBe(false)
  })
})

describe('isAddEffect', () => {
  it('identifies add effects', () => {
    expect(isAddEffect({ effect: EffectType.ADD, addFrom: 'player_field', addTargetType: 'numen', destination: 'player_deck', count: 1 })).toBe(true)
    expect(isAddEffect({ effect: EffectType.RETURN })).toBe(false)
  })
})

describe('isReturnEffect', () => {
  it('identifies return effects', () => {
    expect(isReturnEffect({ effect: EffectType.RETURN })).toBe(true)
    expect(isReturnEffect({ effect: EffectType.DRAW, count: 1 })).toBe(false)
  })
})

describe('handleEffect', () => {
  it('returns undefined for all effect types', () => {
    expect(handleEffect({ effect: EffectType.DRAW, count: 1 })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.SCRY, count: 1, deck: 'player' })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.FORGET, count: 1 })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.EXILE, count: 1 })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.PETRIFY, turns: 1 })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.DECREASE, target: 'numen', effectTarget: 'atk', amount: 100 })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.LOCK, duration: 'temporary' })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.INCREASE, target: 'numen', effectTarget: 'atk', amount: 100 })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.ETHEREAL, count: 1, type: 'rite' })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.FIND, count: 1, source: 'deck' })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.CHOOSE_ONE, options: ['a'] })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.ADD_TRIGGER, trigger_type: 'test', duration: 1 })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.INVOKE, from: 'player_hand', criteria: {}, count: 1 })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.EVOKE, from: 'player_memora', criteria: {}, count: 1 })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.CONVOKE, from: 'player_deck', criteria: {}, count: 1 })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.COPY, copyTarget: 'a', destination: 'b', count: 1 })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.ADD, addFrom: 'player_field', addTargetType: 'numen', destination: 'player_deck', count: 1 })).toBeUndefined()
    expect(handleEffect({ effect: EffectType.RETURN })).toBeUndefined()
  })
})