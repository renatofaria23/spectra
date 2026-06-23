import { create } from 'zustand';
import { PHASES, GAME_CONSTANTS, SACRIFICE_REQUIREMENTS } from '../types/constants';
import { getNextPhase } from '../logic/gameRules';
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

  initializeGame: (player1Deck: Card[], player2Deck: Card[]) => void;
  drawCard: (playerId: string) => void;
  discardCard: (playerId: string, cardId: string) => void;
  invokeNumen: (playerId: string, cardId: string, position?: NumenPosition, sacrifices?: string[]) => void;
  activateRite: (playerId: string, riteId: string) => void;
  activateWard: (playerId: string, wardId: string) => void;
  placeNumenFromHand: (playerId: string, cardId: string, slotIndex: number, position: NumenPosition) => void;
  placeMagicFromHand: (playerId: string, cardId: string, slotIndex: number, faceDown: boolean) => void;
  flipMagicFaceUp: (playerId: string, slotIndex: number) => void;
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
    justInvokeed: false,
  }));
};

const initializePlayerState = (playerId: string, _isFirstPlayer: boolean, deck: Card[]): PlayerState => {
  const numina = deck.filter((c) => c.type === 'numen');
  const natureScaling = calculateNatureScaling(numina);
  const maxHand = calculateMaxHandSize(GAME_CONSTANTS.MAX_HAND_SIZE, natureScaling, false);

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
    maxHandSize: maxHand,
  };
};

export const useGameStore = create<CombatStoreState>((set, get) => ({
  gameState: {
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
  } as GameState,

  combatLog: [],

  initializeGame: (player1Deck: Card[], player2Deck: Card[]) => {
    const p1 = initializePlayerState('player1', true, player1Deck);
    const p2 = initializePlayerState('player2', false, player2Deck);

    const p1ManaGain = calculateManaGain(GAME_CONSTANTS.BASE_MANA_GAIN, p1.natureScaling);
    p1.currentMana = p1ManaGain;

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
        currentPhase: PHASES.PREPARATION,
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

      const cardIndex = player.hand.findIndex((c: Card) => c.id === cardId);
      if (cardIndex === -1) return state;

      const card = player.hand[cardIndex];
      if (!card || card.type !== 'numen') return state;

      if (player.fieldNumina.length >= GAME_CONSTANTS.MAX_NUMEN_SPOTS) return state;

      const newHand = player.hand.filter((_: Card, idx: number) => idx !== cardIndex);

      const level = (card as any).level || 1;
      const isMythic = (card as any).rarity === 'mythic';
      const requiredSacrifices = SACRIFICE_REQUIREMENTS[level] || 0;
      if ((sacrifices?.length || 0) < requiredSacrifices) return state;

      const numenInstance = {
        ...card,
        uid: cardId + '_' + Date.now() + '_' + Math.random(),
        justInvokeed: true,
        hasAttacked: false,
        currentAttack: card.baseAttack || 0,
        currentDefense: card.baseDefense || 0,
      };

      const sacrificeNumina = player.fieldNumina.filter(
        (n: Card) => !sacrifices?.includes((n as any).uid)
      );

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            hand: newHand,
            fieldNumina: [...sacrificeNumina, numenInstance],
            numenPositions: {
              ...player.numenPositions,
              [(numenInstance as any).uid]: position,
            },
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

  placeNumenFromHand: (playerId: string, cardId: string, slotIndex: number, position: NumenPosition) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;

      const cardIndex = player.hand.findIndex((c: Card) => c.id === cardId);
      if (cardIndex === -1) return state;

      const card = player.hand[cardIndex];
      if (!card || card.type !== 'numen') return state;

      if (slotIndex < 0 || slotIndex >= GAME_CONSTANTS.MAX_NUMEN_SPOTS) return state;
      if (player.fieldNumina[slotIndex]) return state;

      const newHand = player.hand.filter((_: Card, idx: number) => idx !== cardIndex);

      const numenInstance = {
        ...card,
        uid: cardId + '_' + Date.now() + '_' + Math.random(),
        justInvokeed: true,
        hasAttacked: false,
        currentAttack: card.baseAttack || 0,
        currentDefense: card.baseDefense || 0,
      };

      const newField = [...player.fieldNumina];
      newField[slotIndex] = numenInstance;

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            hand: newHand,
            fieldNumina: newField,
            numenPositions: {
              ...player.numenPositions,
              [(numenInstance as any).uid]: position,
            },
          },
        },
      };
    });
  },

  placeMagicFromHand: (playerId: string, cardId: string, slotIndex: number, faceDown: boolean) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;

      const cardIndex = player.hand.findIndex((c: Card) => c.id === cardId);
      if (cardIndex === -1) return state;

      const card = player.hand[cardIndex];
      if (!card || (card.type !== 'rite' && card.type !== 'ward')) return state;

      if (slotIndex < 0 || slotIndex >= GAME_CONSTANTS.MAX_MAGIC_SPOTS) return state;

      const newHand = player.hand.filter((_: Card, idx: number) => idx !== cardIndex);

      const magicInstance = {
        ...card,
        uid: cardId + '_' + Date.now() + '_' + Math.random(),
        isFaceDown: faceDown,
      };

      const newFieldRites = [...player.fieldRites];
      const newFieldWards = [...player.fieldWards];

      if (card.type === 'rite') {
        if (newFieldRites[slotIndex]) return state;
        newFieldRites[slotIndex] = magicInstance;
      } else {
        if (newFieldWards[slotIndex]) return state;
        newFieldWards[slotIndex] = magicInstance;
      }

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            hand: newHand,
            fieldRites: newFieldRites,
            fieldWards: newFieldWards,
          },
        },
      };
    });
  },

  flipMagicFaceUp: (playerId: string, slotIndex: number) => {
    set((state: any) => {
      const player = state.gameState[playerId];
      if (!player) return state;

      const newFieldRites = [...player.fieldRites];
      const newFieldWards = [...player.fieldWards];

      let flipped = false;

      if (slotIndex < newFieldRites.length && newFieldRites[slotIndex]) {
        const card = newFieldRites[slotIndex];
        if ((card as any).isFaceDown) {
          newFieldRites[slotIndex] = { ...card, isFaceDown: false };
          flipped = true;
        }
      }

      if (slotIndex < newFieldWards.length && newFieldWards[slotIndex]) {
        const card = newFieldWards[slotIndex];
        if ((card as any).isFaceDown) {
          newFieldWards[slotIndex] = { ...card, isFaceDown: false };
          flipped = true;
        }
      }

      if (!flipped) return state;

      return {
        gameState: {
          ...state.gameState,
          [playerId]: {
            ...player,
            fieldRites: newFieldRites,
            fieldWards: newFieldWards,
          },
        },
      };
    });
  },

  changePhase: () => {
    set((state: any) => {
      const currentPhase = state.gameState.currentPhase;
      const currentPlayer = state.gameState.currentPlayer;

      if (currentPhase === PHASES.START_OF_TURN) {
        const p = currentPlayer === 'player1' ? state.gameState.player1 : state.gameState.player2;
        const opp = currentPlayer === 'player1' ? state.gameState.player2 : state.gameState.player1;

        if (p) {
          p.normalInvokesUsed = 0;
          p.fieldNumina = resetNumenStats(p.fieldNumina);

          const hpRegen = GAME_CONSTANTS.BASE_HP_REGEN + calculateHPRegeneration(p.natureScaling);
          p.currentHP = p.currentHP + hpRegen;

          const manaGain = calculateManaGain(GAME_CONSTANTS.BASE_MANA_REGEN, p.natureScaling);
          p.currentMana = p.currentMana + manaGain;

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

        if (opp) {
          opp.fieldNumina = resetNumenStats(opp.fieldNumina);
        }

        let gameActive = true;
        let winner: string | null = null;

        if (p && p.currentHP <= 0) {
          gameActive = false;
          winner = opp?.playerId || (currentPlayer === 'player1' ? 'player2' : 'player1');
        }
        if (opp && opp.currentHP <= 0) {
          gameActive = false;
          winner = p?.playerId || (currentPlayer === 'player1' ? 'player1' : 'player2');
        }

        return {
          gameState: {
            ...state.gameState,
            currentPhase: PHASES.PREPARATION,
            gameActive,
            winner,
            selectedAttackers: [],
            selectedDefender: null,
          },
        };
      }

      if (currentPhase === PHASES.POST_COMBAT || currentPhase === PHASES.END_OF_TURN) {
        const nextPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
        let newTurnNumber = state.gameState.turnNumber;
        if (currentPlayer === 'player2') {
          newTurnNumber += 1;
        }

        const p = nextPlayer === 'player1' ? state.gameState.player1 : state.gameState.player2;
        const opp = nextPlayer === 'player1' ? state.gameState.player2 : state.gameState.player1;

        if (p) {
          p.normalInvokesUsed = 0;
          p.fieldNumina = resetNumenStats(p.fieldNumina);

          const hpRegen = GAME_CONSTANTS.BASE_HP_REGEN + calculateHPRegeneration(p.natureScaling);
          p.currentHP = p.currentHP + hpRegen;

          const manaGain = calculateManaGain(GAME_CONSTANTS.BASE_MANA_REGEN, p.natureScaling);
          p.currentMana = p.currentMana + manaGain;

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

        if (opp) {
          opp.fieldNumina = resetNumenStats(opp.fieldNumina);
        }

        let gameActive = true;
        let winner: string | null = null;

        if (p && p.currentHP <= 0) {
          gameActive = false;
          winner = opp?.playerId || (nextPlayer === 'player1' ? 'player2' : 'player1');
        }
        if (opp && opp.currentHP <= 0) {
          gameActive = false;
          winner = p?.playerId || (nextPlayer === 'player1' ? 'player1' : 'player2');
        }

        return {
          gameState: {
            ...state.gameState,
            currentPhase: PHASES.PREPARATION,
            currentPlayer: nextPlayer,
            turnNumber: newTurnNumber,
            isFirstTurn: newTurnNumber === 1,
            gameActive,
            winner,
            selectedAttackers: [],
            selectedDefender: null,
          },
        };
      }

      const nextPhase = getNextPhase(currentPhase);

      return {
        gameState: {
          ...state.gameState,
          currentPhase: nextPhase,
          selectedAttackers: [],
          selectedDefender: null,
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

      const newHP = player.currentHP + amount;

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
        const maxInvokes = player ? calculateMaxInvokes(player.natureScaling) : 1;
        if (selected.length >= maxInvokes) {
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
            log.push(`${attackers.length} attacker(s) forgeted ${defender.name}. Overflow: ${overflow}`);
          } else if (totalATK === defenderStat) {
            newOpponentField = newOpponentField.filter((n: Card) => (n as any).uid !== defenderUid);
            const attackerUids = attackers.map((a: Card) => (a as any).uid);
            newPlayerField = newPlayerField.filter((n: Card) => !attackerUids.includes((n as any).uid));
            log.push(`Mutual destruction! ${defender.name} and ${attackers.length} attacker(s) forgeted.`);
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
          currentPhase: PHASES.END_OF_TURN,
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
        currentPhase: PHASES.START_OF_TURN,
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
    start_of_turn: 'Start of Turn',
    preparation: 'Preparation',
    combat: 'Combat',
    post_combat: 'Post Combat',
    end_of_turn: 'End of Turn',
  };
  return phaseNames[phase as keyof typeof phaseNames] || phase;
};

export default useGameStore;