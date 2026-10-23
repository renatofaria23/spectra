import { GAME_CONSTANTS, PHASES } from '../types/constants';

export const getManaRequirement = (level: number): number => (level * 100);

export const canPlayerDraw = (deckSize: number, handSize: number): {
  canDraw: boolean;
  isFatigue: boolean;
  fatigueDecrease: number;
} => ({
  canDraw: handSize < GAME_CONSTANTS.MAX_HAND_SIZE,
  isFatigue: deckSize === 0,
  fatigueDecrease: deckSize === 0 ? 100 : 0,
});

export const calculateFatigueDecrease = (count: number): number => (count + 1) * 100;

export const hasPlayerLost = (hp: number): boolean => hp <= 0;

export const getNextPhase = (phase: string): string => {
  const p = ['preparation', 'combat', 'post_combat'];
  const idx = p.indexOf(phase.toLowerCase());
  return idx === -1 ? PHASES.PREPARATION : p[(idx + 1) % 3]!;
};

export const canNormalInvoke = (used: number): boolean => used < GAME_CONSTANTS.NORMAL_INVOKES_PER_TURN;

export const validateFieldPosition = (position: string): { isValid: boolean } => ({
  isValid: ['attack', 'defense', 'face_down'].includes(position),
});

export const checkHandCapacity = (size: number): {
  isOverCapacity: boolean;
  discardRequired: number;
} => ({
  isOverCapacity: size > GAME_CONSTANTS.MAX_HAND_SIZE,
  discardRequired: Math.max(0, size - GAME_CONSTANTS.MAX_HAND_SIZE),
});

export const checkFieldCapacity = (count: number): {
  isFull: boolean;
  available: number;
} => ({
  isFull: count >= 5,
  available: Math.max(0, 5 - count),
});

export const getStartingHandSize = (first: boolean): number =>
  first ? GAME_CONSTANTS.FIRST_PLAYER_HAND : GAME_CONSTANTS.SECOND_PLAYER_HAND;

export const checkWinCondition = (playerHP: number, opponentHP: number): {
  hasWinner: boolean;
  winner: 'player' | 'opponent' | null;
} => {
  if (typeof opponentHP === 'number' && opponentHP <= 0) return { hasWinner: true, winner: 'player' };
  if (typeof playerHP === 'number' && playerHP <= 0) return { hasWinner: true, winner: 'opponent' };
  return { hasWinner: false, winner: null };
};

export const validateNumenInvoke = (
  numen: unknown,
  count: number,
  normal: boolean
): { valid: boolean; reason: string } => {
  if (count >= 5) return { valid: false, reason: 'Field numen zone full' };
  if (!normal) return { valid: false, reason: 'Normal invoke already used this turn' };
  const req = getManaRequirement((numen as any)?.level || 1);
  return req > 0 ? { valid: false, reason: `Need ${req} mana` } : { valid: true, reason: '' };
};

export type FieldPosition = 'attack' | 'defense' | 'face_down';

export type Phase = (typeof PHASES)[keyof typeof PHASES];