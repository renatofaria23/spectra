import { create } from 'zustand';
import { PHASES, GAME_CONSTANTS, NATURES } from '../types/constants';
import { getStartingHandSize, getNextPhase } from '../logic/gameRules';
import { resetMonsterStats } from '../logic/combatResolver';
import { calculateNatureScaling, calculateTotalHP, calculateHPRegeneration } from '../logic/natureScaling';

type Nature = (typeof NATURES)[keyof typeof NATURES];
import type { Card } from '../logic/deckConstraints';

interface NatureScaling {
  fire: { atkBonus: number; monstersCount: number };
  earth: { hpBonus: number; monstersCount: number };
  water: { hpRegenBonus: number; monstersCount: number };
  air: { extraActions: number; monstersCount: number };
  light: { drawBonus: number; monstersCount: number };
  dark: { wardBonus: number; monstersCount: number };
}

export type MonsterPosition = 'attack' | 'defense' | 'face_down';

interface PlayerState {
  playerId: string;
  currentHP: number;
  maxHP: number;
  currentMana: number;
  maxMana: number;
  fieldMonsters: Card[];
  fieldSpells: Card[];
  hand: Card[];
  deck: Card[];
  graveyard: Card[];
  banished: Card[];
  monsterPositions: Record<string, MonsterPosition>;
  fatigueDecrease: number;
  attributeScaling: NatureScaling;
  normalSummonsUsed: number;
  handSize: number;
  hasAttacked: boolean;
}

interface GameState {
  player1: PlayerState | null;
  player2: PlayerState | null;
  currentPlayer: 'player1' | 'player2';
  currentPhase: string;
  turnNumber: number;
  isFirstTurn: boolean;
  gameActive: boolean;
  winner: string | null;
}

const initializePlayerState = (playerId: string, isFirstPlayer: boolean, deck: Card[]): PlayerState => {
  const startingHP = GAME_CONSTANTS.STARTING_HP;
  const attributeScaling = calculateNatureScaling(deck.filter((c) => c.type === 'monster'));
  const totalHP = calculateTotalHP(startingHP, deck.filter((c) => c.type === 'monster'));

  const startingMana = GAME_CONSTANTS.STARTING_MANA || 0;
  const maxMana = GAME_CONSTANTS.MAX_MANA || 500;

  return {
    playerId,
    currentHP: totalHP,
    maxHP: totalHP,
    currentMana: startingMana,
    maxMana: maxMana,
    fieldMonsters: [],
    fieldSpells: [],
    hand: [],
    deck: [...deck],
    graveyard: [],
    banished: [],
    monsterPositions: {},
    fatigueDecrease: 0,
    attributeScaling,
    normalSummonsUsed: 0,
    handSize: getStartingHandSize(isFirstPlayer),
    hasAttacked: false,
  };
};

interface CombatStoreState {
  gameState: GameState;
  combatLog: unknown[];

  initializeGame: (player1Deck: Card[], player2Deck: Card[]) => void;
  drawCard: (playerId: string, card: Card) => void;
  discardCard: (playerId: string, cardId: string) => void;
  summonMonster: (playerId: string, cardId: string, position?: MonsterPosition, tributes?: unknown[]) => void;
  changePhase: () => void;
  takeDecrease: (playerId: string, decrease: number) => void;
  healPlayer: (playerId: string, amount: number) => void;
  endGame: (winnerId: string) => void;

  getCurrentPlayer: () => PlayerState | null;
  getOpponentPlayer: () => PlayerState | null;
  getGameState: () => GameState;
}

export const useGameStore = create<CombatStoreState>((set, get) => ({
  gameState: {
    player1: null,
    player2: null,
    currentPlayer: 'player1',
    currentPhase: PHASES.DRAW,
    turnNumber: 1,
    isFirstTurn: true,
    gameActive: false,
    winner: null,
  } as GameState,

  combatLog: [],

  initializeGame: (player1Deck: Card[], player2Deck: Card[]) => {
    set({
      gameState: {
        player1: initializePlayerState('player1', true, player1Deck),
        player2: initializePlayerState('player2', false, player2Deck),
        currentPlayer: 'player1',
        currentPhase: PHASES.DRAW,
        turnNumber: 1,
        isFirstTurn: true,
        gameActive: true,
        winner: null,
      },
    });
  },

  drawCard: (playerId: string, card: Card) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;

      const handSize = player.hand.length + 1;

      if (handSize > GAME_CONSTANTS.MAX_HAND_SIZE) {
        const discardIndex = Math.floor(Math.random() * player.hand.length);
        const discardedCard = player.hand[discardIndex];
        player.hand.splice(discardIndex, 1);
      }

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            hand: [...player.hand, card],
            handSize: handSize > GAME_CONSTANTS.MAX_HAND_SIZE ? GAME_CONSTANTS.MAX_HAND_SIZE : handSize,
          },
        },
      };
    });
  },

  discardCard: (playerId: string, cardId: string) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;

      const card = player.hand.find((c: Card) => c.id === cardId);
      const newHand = player.hand.filter((c: Card) => c.id !== cardId);

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            hand: newHand,
            graveyard: [...player.graveyard, card],
            handSize: newHand.length,
          },
        },
      };
    });
  },

  summonMonster: (playerId: string, cardId: string, position = 'attack' as MonsterPosition, tributes = []) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;

      const card = player.hand.find((c: Card) => c.id === cardId);
      if (!card || card.type !== 'monster') return state;

      const newHand = player.hand.filter((c: Card) => c.id !== cardId);
      const monsterInstance = {
        ...card,
        justSummoned: true,
        position,
        currentAttack: card.baseAttack || 0,
        currentDefense: card.baseDefense || 0,
      };

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            hand: newHand,
            fieldMonsters: [...player.fieldMonsters, monsterInstance],
            normalSummonsUsed: player.normalSummonsUsed + 1,
          },
        },
      };
    });
  },

  changePhase: () => {
    set((state: any) => {
      const currentPhase = state.gameState.currentPhase;
      const currentPlayer = state.gameState.currentPlayer;
      const nextPhase = getNextPhase(currentPhase);
      const isEndOfTurn = nextPhase === PHASES.DRAW;

      let newTurnNumber = state.gameState.turnNumber;
      let nextPlayer = currentPlayer;

      if (isEndOfTurn) {
        nextPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
        if (currentPlayer === 'player2') {
          newTurnNumber += 1;
        }
      }

      const newGameState: GameState = {
        ...state.gameState,
        currentPhase: nextPhase,
        currentPlayer: nextPlayer,
        turnNumber: newTurnNumber,
        isFirstTurn: newTurnNumber === 1,
      };

      if (nextPhase === PHASES.MAIN2 || nextPhase === PHASES.END) {
        const p1 = (newGameState as any).player1;
        const p2 = (newGameState as any).player2;
        if (p1?.fieldMonsters) {
          p1.fieldMonsters = resetMonsterStats(p1.fieldMonsters);
        }
        if (p2?.fieldMonsters) {
          p2.fieldMonsters = resetMonsterStats(p2.fieldMonsters);
        }
      }

      if (nextPhase === PHASES.DRAW) {
        const player1 = newGameState.player1;
        const player2 = newGameState.player2;

        if (player1) {
          const p1HPRegen = calculateHPRegeneration(player1.fieldMonsters || []);
          const totalRegen = GAME_CONSTANTS.BASE_HP_REGEN + p1HPRegen;
          if (totalRegen > 0) {
            player1.currentHP = Math.min(GAME_CONSTANTS.STARTING_HP, player1.currentHP + totalRegen);
          }
        }
        if (player2) {
          const p2HPRegen = calculateHPRegeneration(player2.fieldMonsters || []);
          const totalRegen = GAME_CONSTANTS.BASE_HP_REGEN + p2HPRegen;
          if (totalRegen > 0) {
            player2.currentHP = Math.min(GAME_CONSTANTS.STARTING_HP, player2.currentHP + totalRegen);
          }
        }

        if (nextPlayer === 'player1') {
          player1!.normalSummonsUsed = 0;
          player1!.hasAttacked = false;
        } else {
          player2!.normalSummonsUsed = 0;
          player2!.hasAttacked = false;
        }
      }

      return { gameState: newGameState };
    });
  },

  takeDecrease: (playerId: string, decrease: number) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;

      const newHP = Math.max(0, player.currentHP - decrease);

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            currentHP: newHP,
          },
        },
      };
    });
  },

  healPlayer: (playerId: string, amount: number) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;

      const newHP = Math.min(player.maxHP, player.currentHP + amount);

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            currentHP: newHP,
          },
        },
      };
    });
  },

  endGame: (winnerId: string) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        gameActive: false,
        winner: winnerId,
      },
    }));
  },

  getCurrentPlayer: () => {
    const state = get().gameState;
    return state[state.currentPlayer];
  },

  getOpponentPlayer: () => {
    const state = get().gameState;
    const opponentId = state.currentPlayer === 'player1' ? 'player2' : 'player1';
    return state[opponentId];
  },

  getGameState: () => {
    return get().gameState;
  },
}));

export const checkHandCapacity = (handSize: number): { isOverCapacity: boolean; discardRequired: number } => {
  const isOverCapacity = handSize > GAME_CONSTANTS.MAX_HAND_SIZE;
  const discardRequired = Math.max(0, handSize - GAME_CONSTANTS.MAX_HAND_SIZE);
  return { isOverCapacity, discardRequired };
};

export const getCurrentPhaseName = (phase: string): string => {
  const phaseNames: Record<string, string> = {
    draw: 'Draw Phase',
    standby: 'Standby Phase',
    main1: 'Main Phase 1',
    battle: 'Battle Phase',
    main2: 'Main Phase 2',
    end: 'End Phase',
  };
  return phaseNames[phase as keyof typeof phaseNames] || phase;
};

export const getCurrentTurn = (turnNumber: number, currentPlayer: string): string => {
  const playerNames: Record<string, string> = { player1: 'Player 1', player2: 'Player 2' };
  return `${playerNames[currentPlayer as keyof typeof playerNames]} - Turn ${turnNumber}`;
};

export default useGameStore;