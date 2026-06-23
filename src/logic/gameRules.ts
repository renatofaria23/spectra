import { GAME_CONSTANTS, PHASES, SACRIFICE_REQUIREMENTS } from '../types/constants';

export const getSacrificeRequirement = (level: number): number => {
  return SACRIFICE_REQUIREMENTS[level] || 0;
};

export const canPlayerDraw = (deckSize: number, handSize: number): {
  canDraw: boolean;
  isFatigue: boolean;
  fatigueDecrease: number;
} => {
  const isFatigue = deckSize === 0;
  const canDraw = handSize < GAME_CONSTANTS.MAX_HAND_SIZE;

  let fatigueDecrease = 0;
  if (isFatigue) {
    fatigueDecrease = 100;
  }

  return {
    canDraw,
    isFatigue,
    fatigueDecrease,
  };
};

export const calculateFatigueDecrease = (currentFatigueCount: number): number => {
  return (currentFatigueCount + 1) * 100;
};

export const hasPlayerLost = (currentHP: number): boolean => {
  return currentHP <= 0;
};

export const getNextPhase = (currentPhase: string): string => {
  const visiblePhaseOrder: string[] = ['preparation', 'combat', 'post_combat'];

  const normalized = currentPhase.toLowerCase();
  const currentIndex = visiblePhaseOrder.findIndex(name => name === normalized);

  if (currentIndex === -1) return PHASES.PREPARATION;

  const nextIndex = (currentIndex + 1) % visiblePhaseOrder.length;
  return visiblePhaseOrder[nextIndex]!;
};

export const canNormalInvoke = (normalInvokesUsed: number): boolean => {
  return normalInvokesUsed < GAME_CONSTANTS.NORMAL_INVOKES_PER_TURN;
};

export const validateFieldPosition = (position: string): { isValid: boolean } => {
  const validPositions = ['attack', 'defense', 'face_down'];

  return {
    isValid: validPositions.includes(position),
  };
};

export const checkHandCapacity = (handSize: number): {
  isOverCapacity: boolean;
  discardRequired: number;
} => {
  const isOverCapacity = handSize > GAME_CONSTANTS.MAX_HAND_SIZE;
  const discardRequired = Math.max(0, handSize - GAME_CONSTANTS.MAX_HAND_SIZE);

  return { isOverCapacity, discardRequired };
};

export const checkFieldCapacity = (fieldNumenCount: number): {
  isFull: boolean;
  available: number;
} => {
  const MAX_FIELD_NUMENS = 5;
  const isFull = fieldNumenCount >= MAX_FIELD_NUMENS;
  const available = Math.max(0, MAX_FIELD_NUMENS - fieldNumenCount);

  return { isFull, available };
};

export const getStartingHandSize = (isFirstPlayer: boolean): number => {
  return isFirstPlayer
    ? GAME_CONSTANTS.FIRST_PLAYER_HAND
    : GAME_CONSTANTS.SECOND_PLAYER_HAND;
};

export const checkWinCondition = (playerHP: number, opponentHP: number): {
  hasWinner: boolean;
  winner: 'player' | 'opponent' | null;
} => {
  if (typeof opponentHP === 'number' && opponentHP <= 0) {
    return { hasWinner: true, winner: 'player' };
  }

  if (typeof playerHP === 'number' && playerHP <= 0) {
    return { hasWinner: true, winner: 'opponent' };
  }

  return { hasWinner: false, winner: null };
};

export const validateNumenInvoke = (
  numen: unknown,
  fieldNumenCount: number,
  sacrifices: number,
  canNormalInvoke: boolean
): { valid: boolean; reason: string } => {
  const { isFull } = checkFieldCapacity(fieldNumenCount);

  if (isFull) {
    return { valid: false, reason: 'Field numen zone full' };
  }

  if (!canNormalInvoke) {
    return { valid: false, reason: 'Normal invoke already used this turn' };
  }

  const level = (numen as any)?.level || 1;
  const required = getSacrificeRequirement(level);
  if (sacrifices < required) {
    return {
      valid: false,
      reason: `Need ${required} sacrifices, have ${sacrifices}`,
    };
  }

  return { valid: true, reason: '' };
};

export type FieldPosition = 'attack' | 'defense' | 'face_down';

export type Phase = (typeof PHASES)[keyof typeof PHASES];