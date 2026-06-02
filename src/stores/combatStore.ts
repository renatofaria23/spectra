import { create } from 'zustand';
import { resolveBattlePhase, resetMonsterStats, type Attack } from '../logic/combatResolver';
import { isLegendaryQuestComplete, updateQuestProgress } from '../logic/legendarySystem';

export interface CombatInteraction {
  attackerId: string;
  targetId: string | null;
  spentATK: number;
  decreaseDealt: number;
  killedMonster: boolean;
  error?: string;
}

export interface BattleResultSummary {
  totalDecrease: number;
  destroyedMonsters: { monsterId: string; destroyedBy: string }[];
  interactions: CombatInteraction[];
  validationErrors: string[];
}

export interface QuestProgressTracker {
  legendaryId: string;
  wardsActivated: number;
  monstersDestroyed: number;
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
  selectAttacker: (monsterId: string) => void;
  selectTarget: (monsterId: string) => void;
  addAttackToSequence: (attack: Attack) => void;
  removeAttackFromSequence: (index: number) => void;
  clearAttackSequence: () => void;
  resolveBattle: (attackSequence: Attack[]) => void;
  endBattlePhase: () => void;
  updateQuestProgress: (legendaryId: string, eventType: string, amount?: number) => void;
  clearQuestProgress: (legendaryId: string) => void;
  resetCombat: () => void;

  isBattlePhaseActive: () => boolean;
  getSelectedAttacker: () => string | null;
  getSelectedTarget: () => string | null;
  getAttackSequence: () => Attack[];
  getBattleResults: () => BattleResultSummary | null;
  getCombatLog: () => CombatInteraction[];
  getQuestProgress: (legendaryId: string) => QuestProgressTracker | undefined;
  isLegendaryQuestReady: (legendaryId: string, progress: QuestProgressTracker) => boolean;
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

  selectAttacker: (monsterId: string) => set({ selectedAttacker: monsterId }),

  selectTarget: (monsterId: string) => set({ selectedTarget: monsterId }),

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

  updateQuestProgress: (legendaryId: string, eventType: string, amount = 1) =>
    set((state) => {
      const current = state.questProgress[legendaryId] || {
        legendaryId,
        wardsActivated: 0,
        monstersDestroyed: 0,
        decreaseDealt: 0,
        cardsDrawn: 0,
        customProgress: {},
      };

      const updated = updateQuestProgress(current as any, eventType, amount);

      return {
        questProgress: {
          ...state.questProgress,
          [legendaryId]: updated,
        },
      };
    }),

  clearQuestProgress: (legendaryId: string) =>
    set((state) => ({
      questProgress: Object.fromEntries(
        Object.entries(state.questProgress).filter(([key]) => key !== legendaryId)
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

  getQuestProgress: (legendaryId: string) => get().questProgress[legendaryId],

  isLegendaryQuestReady: (legendaryId: string, progress: QuestProgressTracker) => {
    if (!progress) return false;
    return isLegendaryQuestComplete(progress, progress);
  },
}));