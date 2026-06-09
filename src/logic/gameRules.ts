import { GAME_CONSTANTS, PHASES, TRIBUTE_REQUIREMENTS } from '../types/constants';

export const getTributeRequirement = (level: number): number => {
  return TRIBUTE_REQUIREMENTS[level] || 0;
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
  const phaseNames = ['DRAW', 'STANDBY', 'MAIN1', 'BATTLE', 'MAIN2', 'END'];

  const currentIndex = phaseNames.findIndex(name => 
    name.toLowerCase() === currentPhase.toLowerCase().replace('_', '')
  );

  const nextIndex = (currentIndex + 1) % phaseNames.length;
  return PHASES[phaseNames[nextIndex] as keyof typeof PHASES];
};

export const canNormalSummon = (normalSummonsUsed: number): boolean => {
  return normalSummonsUsed < GAME_CONSTANTS.NORMAL_SUMMONS_PER_TURN;
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

export const validateNumenSummon = (
  numen: unknown,
  fieldNumenCount: number,
  tributes: number,
  canNormalSummon: boolean
): { valid: boolean; reason: string } => {
  const { isFull } = checkFieldCapacity(fieldNumenCount);

  if (isFull) {
    return { valid: false, reason: 'Field numen zone full' };
  }

  if (!canNormalSummon) {
    return { valid: false, reason: 'Normal summon already used this turn' };
  }

  const level = (numen as any)?.level || 1;
  const required = getTributeRequirement(level);
  if (tributes < required) {
    return {
      valid: false,
      reason: `Need ${required} tributes, have ${tributes}`,
    };
  }

  return { valid: true, reason: '' };
};

export type FieldPosition = 'attack' | 'defense' | 'face_down';

export type Phase = (typeof PHASES)[keyof typeof PHASES];