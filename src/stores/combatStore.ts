import { create } from 'zustand';
import { resolveBattlePhase, resetNumenStats, type Attack } from '../logic/combatResolver';
import { isMythicQuestComplete, updateQuestProgress } from '../logic/mythicSystem';

export interface CombatInteraction {
  attackerId: string;
  targetId: string | null;
  spentATK: number;
  decreaseDealt: number;
  killedNumen: boolean;
  error?: string;
}

export interface BattleResultSummary {
  totalDecrease: number;
  forgetedNumina: { numenId: string; forgetedBy: string }[];
  interactions: CombatInteraction[];
  validationErrors: string[];
}

export interface QuestProgressTracker {
  mythicId: string;
  wardsActivated: number;
  numinaForgeted: number;
  decreaseDealt: number;
  cardsDrawn: number;
  customProgress: Record<string, unknown>;
}

type CombatState = {
  battlePhaseActive: boolean;
  selectedAttacker: string | null;
  selectedTarget: string | null;
  attackSequence: Attack[];
  battleResults: BattleResultSummary | null;
  combatLog: CombatInteraction[];
  questProgress: Record<string, QuestProgressTracker>;

  startBattlePhase: () => void;
  selectAttacker: (numenId: string) => void;
  selectTarget: (numenId: string) => void;
  addAttackToSequence: (attack: Attack) => void;
  removeAttackFromSequence: (index: number) => void;
  clearAttackSequence: () => void;
  resolveBattle: (attackSequence: Attack[]) => void;
  endBattlePhase: () => void;
  updateQuestProgress: (mythicId: string, eventType: string, amount?: number) => void;
  clearQuestProgress: (mythicId: string) => void;
  resetCombat: () => void;

  isBattlePhaseActive: () => boolean;
  getSelectedAttacker: () => string | null;
  getSelectedTarget: () => string | null;
  getAttackSequence: () => Attack[];
  getBattleResults: () => BattleResultSummary | null;
  getCombatLog: () => CombatInteraction[];
  getQuestProgress: (mythicId: string) => QuestProgressTracker | undefined;
  isMythicQuestReady: (mythicId: string, progress: QuestProgressTracker) => boolean;
};

export const useCombatStore = create<CombatState>((set, get) => ({
  battlePhaseActive: false,
  selectedAttacker: null,
  selectedTarget: null,
  attackSequence: [],
  battleResults: null,
  combatLog: [],
  questProgress: {},

  startBattlePhase: () =>
    set({
      battlePhaseActive: true,
      attackSequence: [],
      battleResults: null,
    }),

  selectAttacker: (numenId: string) => set({ selectedAttacker: numenId }),

  selectTarget: (numenId: string) => set({ selectedTarget: numenId }),

  addAttackToSequence: (attack: Attack) =>
    set((state) => ({
      attackSequence: [...state.attackSequence, attack],
    })),

  removeAttackFromSequence: (index: number) =>
    set((state) => ({
      attackSequence: state.attackSequence.filter((_, i) => i !== index),
    })),

  clearAttackSequence: () => set({ attackSequence: [] }),

  resolveBattle: (attackSequence: Attack[]) =>
    set((state) => {
      const results = resolveBattlePhase(attackSequence);
      return {
        battleResults: results,
        battlePhaseActive: false,
        attackSequence: [],
        combatLog: [...state.combatLog, ...results.interactions],
      };
    }),

  endBattlePhase: () =>
    set({
      battlePhaseActive: false,
      selectedAttacker: null,
      selectedTarget: null,
      attackSequence: [],
    }),

  updateQuestProgress: (mythicId: string, eventType: string, amount = 1) =>
    set((state) => {
      const current = state.questProgress[mythicId] || {
        mythicId,
        wardsActivated: 0,
        numinaForgeted: 0,
        decreaseDealt: 0,
        cardsDrawn: 0,
        customProgress: {},
      };

      const updated = updateQuestProgress(current as any, eventType, amount);

      return {
        questProgress: {
          ...state.questProgress,
          [mythicId]: updated,
        },
      };
    }),

  clearQuestProgress: (mythicId: string) =>
    set((state) => ({
      questProgress: Object.fromEntries(
        Object.entries(state.questProgress).filter(([key]) => key !== mythicId)
      ),
    })),

  resetCombat: () =>
    set({
      battlePhaseActive: false,
      selectedAttacker: null,
      selectedTarget: null,
      attackSequence: [],
      battleResults: null,
    }),

  isBattlePhaseActive: () => get().battlePhaseActive,

  getSelectedAttacker: () => get().selectedAttacker,

  getSelectedTarget: () => get().selectedTarget,

  getAttackSequence: () => get().attackSequence,

  getBattleResults: () => get().battleResults,

  getCombatLog: () => get().combatLog,

  getQuestProgress: (mythicId: string) => get().questProgress[mythicId],

  isMythicQuestReady: (mythicId: string, progress: QuestProgressTracker) => {
    if (!progress) return false;
    return isMythicQuestComplete(progress, progress);
  },
}));