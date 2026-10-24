import { create } from 'zustand';
import { PHASES, GAME_CONSTANTS, SACRIFICE_REQUIREMENTS } from '../types/constants';
import { getNextPhase, getManaRequirement } from '../logic/gameRules';
import {
  calculateNatureScaling,
  calculateHPRegeneration,
  calculateMaxInvokes,
  calculateManaGain,
  calculateMaxHandSize,
  type NatureScaling,
} from '../logic/natureScaling';
import type { Card } from '../logic/deckConstraints';

export type NumenPosition = 'attack' | 'defense' | 'face_down';

interface PlayerState {
  playerId: string;
  currentHP: number;
  currentMana: number;
  fieldNumina: Card[];
  fieldRites: Card[];
  fieldWards: Card[];
  hand: Card[];
  deck: Card[];
  memora: Card[];
  exiled: Card[];
  numenPositions: Record<string, NumenPosition>;
  fatigueCount: number;
  natureScaling: NatureScaling;
  normalInvokesUsed: number;
  maxHandSize: number;
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
  selectedAttackers: string[];
  selectedDefender: string | null;
}

interface CombatStoreState {
  gameState: GameState;
  combatLog: string[];
  aiEnabled: boolean;
  aiPlayerId: string;
  setAiEnabled: (value: boolean) => void;
  initializeGame: (player1Deck: Card[], player2Deck: Card[]) => void;
  drawCard: (playerId: string) => void;
  discardCard: (playerId: string, cardId: string) => void;
  invokeNumen: (playerId: string, cardId: string, position?: NumenPosition, sacrifices?: string[]) => void;
  activateRite: (playerId: string, riteId: string) => void;
  activateWard: (playerId: string, wardId: string) => void;
  placeNumenFromHand: (playerId: string, cardId: string, slotIndex: number, position: NumenPosition) => void;
  placeIncantationFromHand: (playerId: string, cardId: string, slotIndex: number, faceDown: boolean) => void;
  flipIncantationFaceUp: (playerId: string, slotIndex: number) => void;
  swapCardsInHand: (playerId: string, index1: number, index2: number) => void;
  changePhase: () => void;
  takeDamage: (playerId: string, damage: number) => void;
  healPlayer: (playerId: string, amount: number) => void;
  endGame: (winnerId: string) => void;
  selectAttacker: (numenId: string) => void;
  selectDefender: (numenId: string) => void;
  clearSelections: () => void;
  executeAttack: () => void;
  endTurn: () => void;
  quitGame: () => void;
  getCurrentPlayer: () => PlayerState | null;
  getOpponentPlayer: () => PlayerState | null;
  getGameState: () => GameState;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i] as T;
    shuffled[i] = shuffled[j] as T;
    shuffled[j] = temp;
  }
  return shuffled;
};

const resetNumenStats = (numina: Card[]): Card[] =>
  numina.map((numen: Card) => ({
    ...numen,
    currentAttack: (numen as any).baseAttack ?? 0,
    currentDefense: (numen as any).baseDefense ?? 0,
    hasAttacked: false,
    justInvokeed: false,
  }));

const initializePlayerState = (playerId: string, _isFirstPlayer: boolean, deck: Card[]): PlayerState => {
  const numina = deck.filter((c) => c.type === 'numen');
  const natureScaling = calculateNatureScaling(numina);
  return {
    playerId,
    currentHP: GAME_CONSTANTS.STARTING_HP,
    currentMana: 0,
    fieldNumina: [],
    fieldRites: [],
    fieldWards: [],
    hand: [],
    deck: shuffleArray(deck),
    memora: [],
    exiled: [],
    numenPositions: {},
    fatigueCount: 0,
    natureScaling,
    normalInvokesUsed: 0,
    maxHandSize: calculateMaxHandSize(GAME_CONSTANTS.MAX_HAND_SIZE, natureScaling, false),
  };
};

const makeNumenInstance = (card: Card, cardId: string) => ({
  ...card,
  uid: cardId + '_' + Date.now() + '_' + Math.random(),
  justInvokeed: true,
  hasAttacked: false,
  currentAttack: (card as any).baseAttack || 0,
  currentDefense: (card as any).baseDefense || 0,
});

const applyTurnStart = (p: PlayerState, opp: PlayerState | null) => {
  p.normalInvokesUsed = 0;
  p.fieldNumina = resetNumenStats(p.fieldNumina);
  p.currentHP += GAME_CONSTANTS.BASE_HP_REGEN + calculateHPRegeneration(p.natureScaling);
  p.currentMana += calculateManaGain(GAME_CONSTANTS.BASE_MANA_REGEN, p.natureScaling);
  if (p.deck.length > 0) {
    const card = p.deck.pop()!;
    if (p.hand.length < p.maxHandSize) p.hand.push(card);
  } else {
    p.fatigueCount += 1;
    p.currentHP -= p.fatigueCount * 100;
  }
  if (opp) opp.fieldNumina = resetNumenStats(opp.fieldNumina);
};

const checkWinner = (p: PlayerState | null, opp: PlayerState | null, pId: string, oppId: string) => {
  let gameActive = true, winner: string | null = null;
  if (p && p.currentHP <= 0) { gameActive = false; winner = opp?.playerId || oppId; }
  if (opp && opp.currentHP <= 0) { gameActive = false; winner = p?.playerId || pId; }
  return { gameActive, winner };
};

const calcTotalATK = (attackers: Card[], damageBonus: number): number =>
  attackers.reduce((s: number, a: Card) => s + ((a as any).currentAttack ?? (a as any).baseAttack ?? 0), 0) + damageBonus;

const markAttacked = (field: Card[], attackers: Card[]): Card[] => {
  const result = [...field];
  attackers.forEach((a: Card) => {
    const idx = result.findIndex((n: Card) => (n as any).uid === (a as any).uid);
    if (idx >= 0) result[idx] = { ...result[idx], currentAttack: 0, hasAttacked: true } as Card;
  });
  return result;
};

const INITIAL_GAME_STATE: GameState = {
  player1: null,
  player2: null,
  currentPlayer: 'player1',
  currentPhase: PHASES.START_OF_TURN,
  turnNumber: 1,
  isFirstTurn: true,
  gameActive: false,
  winner: null,
  selectedAttackers: [],
  selectedDefender: null,
};

export const useGameStore = create<CombatStoreState>((set, get) => ({
  gameState: { ...INITIAL_GAME_STATE } as GameState,
  combatLog: [],
  aiEnabled: false,
  aiPlayerId: 'player2',
  setAiEnabled: (value: boolean) => set({ aiEnabled: value }),

  initializeGame: (player1Deck: Card[], player2Deck: Card[]) => {
    const p1 = initializePlayerState('player1', true, player1Deck);
    const p2 = initializePlayerState('player2', false, player2Deck);
    p1.currentMana = calculateManaGain(GAME_CONSTANTS.BASE_MANA_REGEN, p1.natureScaling);
    for (let i = 0; i < GAME_CONSTANTS.FIRST_PLAYER_HAND; i++) {
      if (p1.deck.length > 0) p1.hand.push(p1.deck.pop()!);
    }
    for (let i = 0; i < GAME_CONSTANTS.SECOND_PLAYER_HAND; i++) {
      if (p2.deck.length > 0) p2.hand.push(p2.deck.pop()!);
    }
    set({
      gameState: {
        player1: p1, player2: p2, currentPlayer: 'player1',
        currentPhase: PHASES.PREPARATION, turnNumber: 1, isFirstTurn: true,
        gameActive: true, winner: null, selectedAttackers: [], selectedDefender: null,
      },
      combatLog: ['Game started!'],
    });
  },

  drawCard: (playerId: string) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player || player.deck.length === 0) {
        if (player) { player.fatigueCount += 1; player.currentHP -= player.fatigueCount * 100; }
        return state;
      }
      const card = player.deck.pop()!;
      const newHand = [...player.hand, card];
      return {
        gameState: {
          ...state.gameState,
          [playerId]: { ...player, hand: newHand.length > player.maxHandSize ? newHand.slice(0, player.maxHandSize) : newHand },
        },
      };
    });
  },

  discardCard: (playerId: string, cardId: string) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;
      const cardIndex = player.hand.findIndex((c: Card) => c.id === cardId);
      if (cardIndex === -1) return state;
      const card = player.hand[cardIndex];
      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            hand: player.hand.filter((_: Card, idx: number) => idx !== cardIndex),
            memora: [...player.memora, card],
          },
        },
      };
    });
  },

  invokeNumen: (playerId: string, cardId: string, position: NumenPosition = 'attack', sacrifices?: string[]) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;
      if (!state.gameState.gameActive) return state;
      if (state.gameState.currentPlayer !== playerId) return state;
      const cardIndex = player.hand.findIndex((c: Card) => c.id === cardId);
      if (cardIndex === -1) return state;
      const card = player.hand[cardIndex];
      if (!card || card.type !== 'numen') return state;
      if (player.fieldNumina.length >= GAME_CONSTANTS.MAX_NUMEN_SPOTS) return state;
      const level = (card as any).level || 1;
      const isMythic = (card as any).rarity === 'mythic';
      if ((sacrifices?.length || 0) < (SACRIFICE_REQUIREMENTS[level] || 0)) return state;
      const manaCost = getManaRequirement(level);
      if (player.currentMana < manaCost) return state;
      const numenInstance = makeNumenInstance(card, cardId);
      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            currentMana: player.currentMana - manaCost,
            hand: player.hand.filter((_: Card, idx: number) => idx !== cardIndex),
            fieldNumina: [...player.fieldNumina.filter((n: Card) => !sacrifices?.includes((n as any).uid)), numenInstance],
            numenPositions: { ...player.numenPositions, [(numenInstance as any).uid]: position },
            normalInvokesUsed: isMythic ? player.normalInvokesUsed : player.normalInvokesUsed + 1,
          },
        },
      };
    });
  },

  activateRite: (playerId: string, riteId: string) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;
      if (!state.gameState.gameActive) return state;
      if (state.gameState.currentPlayer !== playerId) return state;
      if (state.gameState.currentPhase !== PHASES.PREPARATION) return state;
      const cardIndex = player.hand.findIndex((c: Card) => c.id === riteId);
      if (cardIndex === -1) return state;
      const card = player.hand[cardIndex];
      if (!card || card.type !== 'rite') return state;
      if (player.fieldRites.length >= GAME_CONSTANTS.MAX_INCANTATION_SPOTS) return state;
      const manaCost = (card as any).mana || 0;
      if (player.currentMana < manaCost) return state;
      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            currentMana: player.currentMana - manaCost,
            hand: player.hand.filter((_: Card, idx: number) => idx !== cardIndex),
            fieldRites: [...player.fieldRites, card],
          },
        },
        combatLog: [...state.combatLog, `${playerId} activated rite: ${card.name}`],
      };
    });
  },

  activateWard: (playerId: string, wardId: string) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;
      if (!state.gameState.gameActive) return state;
      if (state.gameState.currentPlayer !== playerId) return state;
      if (state.gameState.currentPhase !== PHASES.PREPARATION) return state;
      const cardIndex = player.hand.findIndex((c: Card) => c.id === wardId);
      if (cardIndex === -1) return state;
      const card = player.hand[cardIndex];
      if (!card || card.type !== 'ward') return state;
      if (player.fieldWards.length >= GAME_CONSTANTS.MAX_INCANTATION_SPOTS) return state;
      const manaCost = (card as any).mana || 0;
      if (player.currentMana < manaCost) return state;
      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            currentMana: player.currentMana - manaCost,
            hand: player.hand.filter((_: Card, idx: number) => idx !== cardIndex),
            fieldWards: [...player.fieldWards, card],
          },
        },
        combatLog: [...state.combatLog, `${playerId} activated ward: ${card.name}`],
      };
    });
  },

  placeNumenFromHand: (playerId: string, cardId: string, slotIndex: number, position: NumenPosition) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;
      if (!state.gameState.gameActive) return state;
      if (state.gameState.currentPlayer !== playerId) return state;
      if (state.gameState.currentPhase !== PHASES.PREPARATION) return state;
      const cardIndex = player.hand.findIndex((c: Card) => c.id === cardId);
      if (cardIndex === -1) return state;
      const card = player.hand[cardIndex];
      if (!card || card.type !== 'numen') return state;
      if (slotIndex < 0 || slotIndex >= GAME_CONSTANTS.MAX_NUMEN_SPOTS) return state;
      if (player.fieldNumina[slotIndex]) return state;
      const manaCost = getManaRequirement((card as any).level || 1);
      if (player.currentMana < manaCost) return state;
      const numenInstance = makeNumenInstance(card, cardId);
      const newField = [...player.fieldNumina];
      newField[slotIndex] = numenInstance;
      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            currentMana: player.currentMana - manaCost,
            hand: player.hand.filter((_: Card, idx: number) => idx !== cardIndex),
            fieldNumina: newField,
            numenPositions: { ...player.numenPositions, [(numenInstance as any).uid]: position },
          },
        },
      };
    });
  },

  placeIncantationFromHand: (playerId: string, cardId: string, slotIndex: number, faceDown: boolean) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;
      if (!state.gameState.gameActive) return state;
      if (state.gameState.currentPlayer !== playerId) return state;
      if (state.gameState.currentPhase !== PHASES.PREPARATION) return state;
      const cardIndex = player.hand.findIndex((c: Card) => c.id === cardId);
      if (cardIndex === -1) return state;
      const card = player.hand[cardIndex];
      if (!card || (card.type !== 'rite' && card.type !== 'ward')) return state;
      if (slotIndex < 0 || slotIndex >= GAME_CONSTANTS.MAX_INCANTATION_SPOTS) return state;
      const manaCost = (card as any).mana || 0;
      if (player.currentMana < manaCost) return state;
      const incantationInstance = { ...card, uid: cardId + '_' + Date.now() + '_' + Math.random(), isFaceDown: faceDown };
      const newFieldRites = [...player.fieldRites];
      const newFieldWards = [...player.fieldWards];
      if (card.type === 'rite') {
        if (newFieldRites[slotIndex]) return state;
        newFieldRites[slotIndex] = incantationInstance;
      } else {
        if (newFieldWards[slotIndex]) return state;
        newFieldWards[slotIndex] = incantationInstance;
      }
      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            currentMana: player.currentMana - manaCost,
            hand: player.hand.filter((_: Card, idx: number) => idx !== cardIndex),
            fieldRites: newFieldRites,
            fieldWards: newFieldWards,
          },
        },
      };
    });
  },

  flipIncantationFaceUp: (playerId: string, slotIndex: number) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;
      const newFieldRites = [...player.fieldRites];
      const newFieldWards = [...player.fieldWards];
      let flipped = false;
      if (slotIndex < newFieldRites.length && newFieldRites[slotIndex] && (newFieldRites[slotIndex] as any).isFaceDown) {
        newFieldRites[slotIndex] = { ...newFieldRites[slotIndex], isFaceDown: false };
        flipped = true;
      }
      if (slotIndex < newFieldWards.length && newFieldWards[slotIndex] && (newFieldWards[slotIndex] as any).isFaceDown) {
        newFieldWards[slotIndex] = { ...newFieldWards[slotIndex], isFaceDown: false };
        flipped = true;
      }
      if (!flipped) return state;
      return {
        gameState: { ...state.gameState, [playerId]: { ...player, fieldRites: newFieldRites, fieldWards: newFieldWards } },
      };
    });
  },

  swapCardsInHand: (playerId: string, index1: number, index2: number) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;
      if (index1 < 0 || index1 >= player.hand.length || index2 < 0 || index2 >= player.hand.length) return state;
      if (index1 === index2) return state;
      const newHand = [...player.hand];
      const temp = newHand[index1];
      newHand[index1] = newHand[index2];
      newHand[index2] = temp;
      return {
        gameState: { ...state.gameState, [playerId]: { ...player, hand: newHand } },
      };
    });
  },

  changePhase: () => {
    set((state: any) => {
      const { currentPhase, currentPlayer } = state.gameState;

      if (currentPhase === PHASES.START_OF_TURN) {
        const p = state.gameState[currentPlayer];
        const opp = currentPlayer === 'player1' ? state.gameState.player2 : state.gameState.player1;
        if (p) applyTurnStart(p, opp);
        const { gameActive, winner } = checkWinner(p, opp, currentPlayer, currentPlayer === 'player1' ? 'player2' : 'player1');
        return {
          gameState: {
            ...state.gameState,
            currentPhase: PHASES.PREPARATION,
            gameActive, winner,
            selectedAttackers: [], selectedDefender: null,
          },
        };
      }

      if (currentPhase === PHASES.POST_COMBAT || currentPhase === PHASES.END_OF_TURN) {
        const nextPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
        const newTurnNumber = state.gameState.turnNumber + (currentPlayer === 'player2' ? 1 : 0);
        const p = state.gameState[nextPlayer];
        const opp = nextPlayer === 'player1' ? state.gameState.player2 : state.gameState.player1;
        if (p) applyTurnStart(p, opp);
        const { gameActive, winner } = checkWinner(p, opp, nextPlayer, nextPlayer === 'player1' ? 'player2' : 'player1');
        return {
          gameState: {
            ...state.gameState,
            currentPhase: PHASES.PREPARATION,
            currentPlayer: nextPlayer,
            turnNumber: newTurnNumber,
            isFirstTurn: newTurnNumber === 1,
            gameActive, winner,
            selectedAttackers: [], selectedDefender: null,
          },
        };
      }

      return {
        gameState: {
          ...state.gameState,
          currentPhase: getNextPhase(currentPhase),
          selectedAttackers: [], selectedDefender: null,
        },
      };
    });
  },

  takeDamage: (playerId: string, damage: number) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;
      const newHP = Math.max(0, player.currentHP - damage);
      return {
        gameState: { ...state.gameState, [playerId]: { ...player, currentHP: newHP } },
        combatLog: [...state.combatLog, `${playerId} took ${damage} damage. HP: ${newHP}`],
      };
    });
  },

  healPlayer: (playerId: string, amount: number) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;
      return {
        gameState: { ...state.gameState, [playerId]: { ...player, currentHP: player.currentHP + amount } },
      };
    });
  },

  endGame: (winnerId: string) => {
    set((state: any) => ({
      gameState: { ...state.gameState, gameActive: false, winner: winnerId },
      combatLog: [...state.combatLog, `Game over! ${winnerId} wins!`],
    }));
  },

  selectAttacker: (numenId: string) => {
    set((state: any) => {
      if (!state.gameState.gameActive) return state;
      if (state.gameState.currentPhase !== PHASES.COMBAT) return state;
      const selected = state.gameState.selectedAttackers;
      const idx = selected.indexOf(numenId);
      if (idx >= 0) {
        return { gameState: { ...state.gameState, selectedAttackers: selected.filter((id: string) => id !== numenId) } };
      }
      if (state.gameState.isFirstTurn) return state;
      const cp = state.gameState.currentPlayer;
      const player = state.gameState[cp];
      const maxInvokes = player ? calculateMaxInvokes(player.natureScaling) : 1;
      if (selected.length >= maxInvokes) return state;
      const numen = (player?.fieldNumina || []).find((n: Card) => (n as any).uid === numenId);
      if (!numen) return state;
      if ((numen as any).hasAttacked) return state;
      if ((numen as any).justInvoked) return state;
      return { gameState: { ...state.gameState, selectedAttackers: [...selected, numenId] } };
    });
  },

  selectDefender: (numenId: string) => {
    set((state: any) => {
      if (!state.gameState.gameActive) return state;
      if (state.gameState.currentPhase !== PHASES.COMBAT) return state;
      return {
        gameState: {
          ...state.gameState,
          selectedDefender: state.gameState.selectedDefender === numenId ? null : numenId,
        },
      };
    });
  },

  clearSelections: () => {
    set((state: any) => ({
      gameState: { ...state.gameState, selectedAttackers: [], selectedDefender: null },
    }));
  },

  executeAttack: () => {
    set((state: any) => {
      if (!state.gameState.gameActive) return state;
      if (state.gameState.currentPhase !== PHASES.COMBAT) return state;
      const currentPlayer = state.gameState.currentPlayer;
      const opponentId = currentPlayer === 'player1' ? 'player2' : 'player1';
      const player = state.gameState[currentPlayer];
      const opponent = state.gameState[opponentId];
      if (!player || !opponent) return state;

      const attackerIds = state.gameState.selectedAttackers;
      const defenderUid = state.gameState.selectedDefender;
      if (attackerIds.length === 0) return state;

      const attackers = player.fieldNumina.filter((n: Card) => attackerIds.includes((n as any).uid));
      if (attackers.length === 0) return state;

      const log = [...state.combatLog];
      let newOpponentHP = opponent.currentHP;
      let newPlayerField = [...player.fieldNumina];
      let newOpponentField = [...opponent.fieldNumina];
      const damageBonus = player.natureScaling.fire.damageBonus;

      if (defenderUid) {
        const defender = newOpponentField.find((n: Card) => (n as any).uid === defenderUid);
        if (defender) {
          const defenderPos = opponent.numenPositions[defenderUid];
          const defenderStat = defenderPos === 'attack'
            ? ((defender as any).currentAttack ?? (defender as any).baseAttack ?? 0)
            : ((defender as any).currentDefense ?? (defender as any).baseDefense ?? 0);
          const totalATK = calcTotalATK(attackers, damageBonus);
          if (totalATK > defenderStat) {
            newOpponentField = newOpponentField.filter((n: Card) => (n as any).uid !== defenderUid);
            newOpponentHP -= totalATK - defenderStat;
            log.push(`${attackers.length} attacker(s) forgeted ${defender.name}. Overflow: ${totalATK - defenderStat}`);
          } else if (totalATK === defenderStat) {
            newOpponentField = newOpponentField.filter((n: Card) => (n as any).uid !== defenderUid);
            const attackerUids = attackers.map((a: Card) => (a as any).uid);
            newPlayerField = newPlayerField.filter((n: Card) => !attackerUids.includes((n as any).uid));
            log.push(`Mutual destruction! ${defender.name} and ${attackers.length} attacker(s) forgeted.`);
          } else {
            log.push(`Attack failed! ${defender.name} defended with ${defenderStat} vs ${totalATK}`);
          }
          newPlayerField = markAttacked(newPlayerField, attackers);
        } else {
          const totalATK = calcTotalATK(attackers, damageBonus);
          newOpponentHP -= totalATK;
          log.push(`Direct attack! ${totalATK} damage dealt.`);
          newPlayerField = markAttacked(newPlayerField, attackers);
        }
      } else {
        const totalATK = calcTotalATK(attackers, damageBonus);
        newOpponentHP -= totalATK;
        log.push(`Direct attack! ${totalATK} damage dealt.`);
        newPlayerField = markAttacked(newPlayerField, attackers);
      }

      opponent.currentHP = newOpponentHP;
      const baseState = {
        ...state.gameState,
        [opponentId]: { ...opponent, currentHP: newOpponentHP, fieldNumina: newOpponentField },
        [currentPlayer]: { ...player, fieldNumina: newPlayerField },
        selectedAttackers: [], selectedDefender: null,
      };

      if (newOpponentHP <= 0) {
        log.push(`${opponentId} defeated! ${currentPlayer} wins!`);
        return { gameState: { ...baseState, [opponentId]: { ...opponent, currentHP: 0, fieldNumina: newOpponentField }, gameActive: false, winner: currentPlayer }, combatLog: log };
      }

      return { gameState: baseState, combatLog: log };
    });
  },

  endTurn: () => {
    const state = get();
    if (!state.gameState.gameActive) return;
    set((s: any) => {
      const currentPlayer = s.gameState.currentPlayer;
      const opponentId = currentPlayer === 'player1' ? 'player2' : 'player1';
      const player = s.gameState[currentPlayer];
      const opponent = s.gameState[opponentId];
      if (player && player.currentHP <= 0) {
        return {
          gameState: { ...s.gameState, gameActive: false, winner: opponent?.playerId || opponentId },
          combatLog: [...s.combatLog, `${currentPlayer} has 0 HP. ${opponentId} wins!`],
        };
      }
      return {
        gameState: { ...s.gameState, currentPhase: PHASES.END_OF_TURN, selectedAttackers: [], selectedDefender: null },
      };
    });
    get().changePhase();
  },

  quitGame: () => {
    set({ gameState: { ...INITIAL_GAME_STATE }, combatLog: [] });
  },

  getCurrentPlayer: () => {
    const state = get().gameState;
    return state[state.currentPlayer];
  },

  getOpponentPlayer: () => {
    const state = get().gameState;
    return state[state.currentPlayer === 'player1' ? 'player2' : 'player1'];
  },

  getGameState: () => get().gameState,
}));

export const getCurrentPhaseName = (phase: string): string => {
  const phaseNames: Record<string, string> = {
    start_of_turn: 'Start of Turn',
    preparation: 'Preparation',
    combat: 'Combat',
    post_combat: 'Post Combat',
    end_of_turn: 'End of Turn',
  };
  return phaseNames[phase as keyof typeof phaseNames] || phase;
};

export default useGameStore;