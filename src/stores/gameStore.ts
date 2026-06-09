import { create } from 'zustand';
import { PHASES, GAME_CONSTANTS } from '../types/constants';
import { getNextPhase } from '../logic/gameRules';
import {
  calculateNatureScaling,
  calculateTotalMaxHP,
  calculateHPRegeneration,
  calculateMaxSummons,
  calculateMaxMana,
  calculateManaGain,
  calculateMaxHandSize,
  type NatureScaling,
} from '../logic/natureScaling';
import type { Card } from '../logic/deckConstraints';

export type NumenPosition = 'attack' | 'defense' | 'face_down';

interface PlayerState {
  playerId: string;
  currentHP: number;
  maxHP: number;
  currentMana: number;
  maxMana: number;
  fieldNumina: Card[];
  fieldRites: Card[];
  fieldWards: Card[];
  hand: Card[];
  deck: Card[];
  graveyard: Card[];
  exiled: Card[];
  numenPositions: Record<string, NumenPosition>;
  fatigueCount: number;
  natureScaling: NatureScaling;
  normalSummonsUsed: number;
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

  initializeGame: (player1Deck: Card[], player2Deck: Card[]) => void;
  drawCard: (playerId: string) => void;
  discardCard: (playerId: string, cardId: string) => void;
  summonNumen: (playerId: string, cardId: string, position?: NumenPosition, tributes?: string[]) => void;
  activateRite: (playerId: string, riteId: string) => void;
  activateWard: (playerId: string, wardId: string) => void;
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

const resetNumenStats = (numina: Card[]): Card[] => {
  return numina.map((numen: Card) => ({
    ...numen,
    currentAttack: (numen as any).baseAttack ?? 0,
    currentDefense: (numen as any).baseDefense ?? 0,
    hasAttacked: false,
    justSummoned: false,
  }));
};

const initializePlayerState = (playerId: string, _isFirstPlayer: boolean, deck: Card[]): PlayerState => {
  const numina = deck.filter((c) => c.type === 'numen');
  const natureScaling = calculateNatureScaling(numina);
  const totalMaxHP = calculateTotalMaxHP(GAME_CONSTANTS.BASE_MAX_HP, natureScaling);
  const totalMaxMana = calculateMaxMana(GAME_CONSTANTS.BASE_MAX_MANA, natureScaling);
  const maxHand = calculateMaxHandSize(GAME_CONSTANTS.MAX_HAND_SIZE, natureScaling, false);

  return {
    playerId,
    currentHP: totalMaxHP,
    maxHP: totalMaxHP,
    currentMana: 0,
    maxMana: totalMaxMana,
    fieldNumina: [],
    fieldRites: [],
    fieldWards: [],
    hand: [],
    deck: shuffleArray(deck),
    graveyard: [],
    exiled: [],
    numenPositions: {},
    fatigueCount: 0,
    natureScaling,
    normalSummonsUsed: 0,
    maxHandSize: maxHand,
  };
};

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
    selectedAttackers: [],
    selectedDefender: null,
  } as GameState,

  combatLog: [],

  initializeGame: (player1Deck: Card[], player2Deck: Card[]) => {
    const p1 = initializePlayerState('player1', true, player1Deck);
    const p2 = initializePlayerState('player2', false, player2Deck);

    for (let i = 0; i < GAME_CONSTANTS.FIRST_PLAYER_HAND; i++) {
      if (p1.deck.length > 0) {
        const card = p1.deck.pop()!;
        p1.hand.push(card);
      }
    }
    for (let i = 0; i < GAME_CONSTANTS.SECOND_PLAYER_HAND; i++) {
      if (p2.deck.length > 0) {
        const card = p2.deck.pop()!;
        p2.hand.push(card);
      }
    }

    set({
      gameState: {
        player1: p1,
        player2: p2,
        currentPlayer: 'player1',
        currentPhase: PHASES.DRAW,
        turnNumber: 1,
        isFirstTurn: true,
        gameActive: true,
        winner: null,
        selectedAttackers: [],
        selectedDefender: null,
      },
      combatLog: ['Game started!'],
    });
  },

  drawCard: (playerId: string) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player || player.deck.length === 0) {
        if (player) {
          player.fatigueCount += 1;
          const fatigueDmg = player.fatigueCount * 100;
          player.currentHP -= fatigueDmg;
        }
        return state;
      }

      const card = player.deck.pop()!;
      const maxHand = player.maxHandSize;
      let newHand = [...player.hand, card];

      if (newHand.length > maxHand) {
        newHand = newHand.slice(0, maxHand);
      }

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            hand: newHand,
          },
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
      const newHand = player.hand.filter((_: Card, idx: number) => idx !== cardIndex);

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            hand: newHand,
            graveyard: [...player.graveyard, card],
          },
        },
      };
    });
  },

  summonNumen: (playerId: string, cardId: string, position: NumenPosition = 'attack', tributes?: string[]) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;

      const cardIndex = player.hand.findIndex((c: Card) => c.id === cardId);
      if (cardIndex === -1) return state;

      const card = player.hand[cardIndex];
      if (!card || card.type !== 'numen') return state;

      if (player.fieldNumina.length >= GAME_CONSTANTS.MAX_NUMEN_SPOTS) return state;

      const newHand = player.hand.filter((_: Card, idx: number) => idx !== cardIndex);

      const level = (card as any).level || 1;
      const requiredTributes = level >= 3 ? Math.ceil((level - 1) / 2) : 0;
      if ((tributes?.length || 0) < requiredTributes) return state;

      const numenInstance = {
        ...card,
        uid: cardId + '_' + Date.now() + '_' + Math.random(),
        justSummoned: true,
        hasAttacked: false,
        currentAttack: card.baseAttack || 0,
        currentDefense: card.baseDefense || 0,
      };

      const tributeNumina = player.fieldNumina.filter(
        (n: Card) => !tributes?.includes((n as any).uid)
      );

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            hand: newHand,
            fieldNumina: [...tributeNumina, numenInstance],
            numenPositions: {
              ...player.numenPositions,
              [(numenInstance as any).uid]: position,
            },
            normalSummonsUsed: player.normalSummonsUsed + 1,
          },
        },
      };
    });
  },

  activateRite: (playerId: string, riteId: string) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;

      const cardIndex = player.hand.findIndex((c: Card) => c.id === riteId);
      if (cardIndex === -1) return state;

      const card = player.hand[cardIndex];
      if (!card || card.type !== 'rite') return state;

      const newHand = player.hand.filter((_: Card, idx: number) => idx !== cardIndex);

      if (player.fieldRites.length >= GAME_CONSTANTS.MAX_MAGIC_SPOTS) return state;

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            hand: newHand,
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

      const cardIndex = player.hand.findIndex((c: Card) => c.id === wardId);
      if (cardIndex === -1) return state;

      const card = player.hand[cardIndex];
      if (!card || card.type !== 'ward') return state;

      const newHand = player.hand.filter((_: Card, idx: number) => idx !== cardIndex);

      if (player.fieldWards.length >= GAME_CONSTANTS.MAX_MAGIC_SPOTS) return state;

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            hand: newHand,
            fieldWards: [...player.fieldWards, card],
          },
        },
        combatLog: [...state.combatLog, `${playerId} activated ward: ${card.name}`],
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
        selectedAttackers: [],
        selectedDefender: null,
      };

      if (nextPhase === PHASES.DRAW) {
        const p = nextPlayer === 'player1' ? newGameState.player1 : newGameState.player2;
        const opp = nextPlayer === 'player1' ? newGameState.player2 : newGameState.player1;

        if (p) {
          p.normalSummonsUsed = 0;
          p.fieldNumina = resetNumenStats(p.fieldNumina);

          const manaGain = calculateManaGain(GAME_CONSTANTS.BASE_MANA_GAIN, p.natureScaling);
          p.currentMana = Math.min(p.maxMana, p.currentMana + manaGain);

          const hpRegen = GAME_CONSTANTS.BASE_HP_REGEN + calculateHPRegeneration(p.natureScaling);
          p.currentHP = Math.min(p.maxHP, p.currentHP + hpRegen);

          if (newGameState.isFirstTurn && nextPlayer === 'player1') {
          } else if (!newGameState.isFirstTurn) {
            if (p.deck.length > 0) {
              const card = p.deck.pop()!;
              if (p.hand.length < p.maxHandSize) {
                p.hand.push(card);
              }
            } else {
              p.fatigueCount += 1;
              p.currentHP -= p.fatigueCount * 100;
            }
          }
        }

        if (opp) {
          opp.fieldNumina = resetNumenStats(opp.fieldNumina);
          const oppManaGain = calculateManaGain(GAME_CONSTANTS.BASE_MANA_GAIN, opp.natureScaling);
          opp.currentMana = Math.min(opp.maxMana, opp.currentMana + oppManaGain);
          const oppHpRegen = GAME_CONSTANTS.BASE_HP_REGEN + calculateHPRegeneration(opp.natureScaling);
          opp.currentHP = Math.min(opp.maxHP, opp.currentHP + oppHpRegen);
        }

        if (p && p.currentHP <= 0) {
          newGameState.gameActive = false;
          newGameState.winner = opp?.playerId || (nextPlayer === 'player1' ? 'player2' : 'player1');
        }
        if (opp && opp.currentHP <= 0) {
          newGameState.gameActive = false;
          newGameState.winner = p?.playerId || (nextPlayer === 'player1' ? 'player1' : 'player2');
        }
      }

      return { gameState: newGameState };
    });
  },

  takeDamage: (playerId: string, damage: number) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;

      const newHP = Math.max(0, player.currentHP - damage);

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            currentHP: newHP,
          },
        },
        combatLog: [...state.combatLog, `${playerId} took ${damage} damage. HP: ${newHP}`],
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
      combatLog: [...state.combatLog, `Game over! ${winnerId} wins!`],
    }));
  },

  selectAttacker: (numenId: string) => {
    set((state: any) => {
      const selected = state.gameState.selectedAttackers;
      const idx = selected.indexOf(numenId);
      let newSelected: string[];

      if (idx >= 0) {
        newSelected = selected.filter((id: string) => id !== numenId);
      } else {
        const cp = state.gameState.currentPlayer;
        const player = cp === 'player1' ? state.gameState.player1 : state.gameState.player2;
        const maxSummons = player ? calculateMaxSummons(player.natureScaling) : 1;
        if (selected.length >= maxSummons) {
          return state;
        }
        newSelected = [...selected, numenId];
      }

      return {
        gameState: {
          ...state.gameState,
          selectedAttackers: newSelected,
        },
      };
    });
  },

  selectDefender: (numenId: string) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        selectedDefender: state.gameState.selectedDefender === numenId ? null : numenId,
      },
    }));
  },

  clearSelections: () => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        selectedAttackers: [],
        selectedDefender: null,
      },
    }));
  },

  executeAttack: () => {
    set((state: any) => {
      const currentPlayer = state.gameState.currentPlayer;
      const opponentId = currentPlayer === 'player1' ? 'player2' : 'player1';
      const player = state.gameState[currentPlayer];
      const opponent = state.gameState[opponentId];

      if (!player || !opponent) return state;

      const attackerIds = state.gameState.selectedAttackers;
      const defenderUid = state.gameState.selectedDefender;

      if (attackerIds.length === 0) return state;

      const attackers = player.fieldNumina.filter(
        (n: Card) => attackerIds.includes((n as any).uid)
      );

      if (attackers.length === 0) return state;

      let log = [...state.combatLog];
      let newOpponentHP = opponent.currentHP;
      let newPlayerField = [...player.fieldNumina];
      let newOpponentField = [...opponent.fieldNumina];

      if (defenderUid) {
        const defender = newOpponentField.find((n: Card) => (n as any).uid === defenderUid);

        if (defender) {
          const defenderPos = opponent.numenPositions[defenderUid];
          const defenderInAttackPos = defenderPos === 'attack';
          const defenderStat = defenderInAttackPos
            ? ((defender as any).currentAttack ?? (defender as any).baseAttack ?? 0)
            : ((defender as any).currentDefense ?? (defender as any).baseDefense ?? 0);

          let totalATK = 0;
          attackers.forEach((a: Card) => {
            totalATK += (a as any).currentAttack ?? (a as any).baseAttack ?? 0;
          });

          const damageBonus = player.natureScaling.fire.damageBonus;
          totalATK += damageBonus;

          if (totalATK > defenderStat) {
            const overflow = totalATK - defenderStat;
            newOpponentField = newOpponentField.filter((n: Card) => (n as any).uid !== defenderUid);
            newOpponentHP -= overflow;
            log.push(`${attackers.length} attacker(s) destroyed ${defender.name}. Overflow: ${overflow}`);
          } else if (totalATK === defenderStat) {
            newOpponentField = newOpponentField.filter((n: Card) => (n as any).uid !== defenderUid);
            const attackerUids = attackers.map((a: Card) => (a as any).uid);
            newPlayerField = newPlayerField.filter((n: Card) => !attackerUids.includes((n as any).uid));
            log.push(`Mutual destruction! ${defender.name} and ${attackers.length} attacker(s) destroyed.`);
          } else {
            log.push(`Attack failed! ${defender.name} defended with ${defenderStat} vs ${totalATK}`);
          }

          attackers.forEach((a: Card) => {
            const idx = newPlayerField.findIndex((n: Card) => (n as any).uid === (a as any).uid);
            if (idx >= 0) {
              newPlayerField[idx] = { ...newPlayerField[idx], currentAttack: 0, hasAttacked: true };
            }
          });
        } else {
          let totalATK = 0;
          attackers.forEach((a: Card) => {
            totalATK += (a as any).currentAttack ?? (a as any).baseAttack ?? 0;
          });
          const damageBonus = player.natureScaling.fire.damageBonus;
          totalATK += damageBonus;
          newOpponentHP -= totalATK;
          log.push(`Direct attack! ${totalATK} damage dealt.`);

          attackers.forEach((a: Card) => {
            const idx = newPlayerField.findIndex((n: Card) => (n as any).uid === (a as any).uid);
            if (idx >= 0) {
              newPlayerField[idx] = { ...newPlayerField[idx], currentAttack: 0, hasAttacked: true };
            }
          });
        }
      } else {
        let totalATK = 0;
        attackers.forEach((a: Card) => {
          totalATK += (a as any).currentAttack ?? (a as any).baseAttack ?? 0;
        });
        const damageBonus = player.natureScaling.fire.damageBonus;
        totalATK += damageBonus;
        newOpponentHP -= totalATK;
        log.push(`Direct attack! ${totalATK} damage dealt.`);

        attackers.forEach((a: Card) => {
          const idx = newPlayerField.findIndex((n: Card) => (n as any).uid === (a as any).uid);
          if (idx >= 0) {
            newPlayerField[idx] = { ...newPlayerField[idx], currentAttack: 0, hasAttacked: true };
          }
        });
      }

      opponent.currentHP = newOpponentHP;

      if (newOpponentHP <= 0) {
        log.push(`${opponentId} defeated! ${currentPlayer} wins!`);
        return {
          gameState: {
            ...state.gameState,
            [opponentId]: {
              ...opponent,
              currentHP: 0,
              fieldNumina: newOpponentField,
            },
            [currentPlayer]: {
              ...player,
              fieldNumina: newPlayerField,
            },
            gameActive: false,
            winner: currentPlayer,
            selectedAttackers: [],
            selectedDefender: null,
          },
          combatLog: log,
        };
      }

      return {
        gameState: {
          ...state.gameState,
          [opponentId]: {
            ...opponent,
            currentHP: newOpponentHP,
            fieldNumina: newOpponentField,
          },
          [currentPlayer]: {
            ...player,
            fieldNumina: newPlayerField,
          },
          selectedAttackers: [],
          selectedDefender: null,
        },
        combatLog: log,
      };
    });
  },

  endTurn: () => {
    set((state: any) => {
      const currentPlayer = state.gameState.currentPlayer;
      const opponentId = currentPlayer === 'player1' ? 'player2' : 'player1';
      const player = state.gameState[currentPlayer];
      const opponent = state.gameState[opponentId];

      if (player && player.currentHP <= 0) {
        return {
          gameState: {
            ...state.gameState,
            gameActive: false,
            winner: opponent?.playerId || opponentId,
          },
          combatLog: [...state.combatLog, `${currentPlayer} has 0 HP. ${opponentId} wins!`],
        };
      }

      return {
        gameState: {
          ...state.gameState,
          selectedAttackers: [],
          selectedDefender: null,
        },
      };
    });
    get().changePhase();
  },

  quitGame: () => {
    set({
      gameState: {
        player1: null,
        player2: null,
        currentPlayer: 'player1',
        currentPhase: PHASES.DRAW,
        turnNumber: 1,
        isFirstTurn: true,
        gameActive: false,
        winner: null,
        selectedAttackers: [],
        selectedDefender: null,
      },
      combatLog: [],
    });
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

export default useGameStore;