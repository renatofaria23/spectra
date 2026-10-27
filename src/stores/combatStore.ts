import { create } from 'zustand';
import { resolveBattlePhase, type Attack } from '../logic/combatResolver';
import { isMythicQuestComplete, updateQuestProgress } from '../logic/mythicSystem';
import type { CombatInteraction } from '../logic/deckConstraints';


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

const defaultQuest = (mythicId: string): QuestProgressTracker => ({
  mythicId, wardsActivated: 0, numinaForgeted: 0, decreaseDealt: 0, cardsDrawn: 0, customProgress: {},
});

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
  isMythicQuestReady: (mythicId: string, mythic: unknown, progress: QuestProgressTracker) => boolean;
};

export const useCombatStore = create<CombatState>((set, get) => ({
  battlePhaseActive: false,
  selectedAttacker: null,
  selectedTarget: null,
  attackSequence: [],
  battleResults: null,
  combatLog: [],
  questProgress: {},

  startBattlePhase: () => set({ battlePhaseActive: true, attackSequence: [], battleResults: null }),
  selectAttacker: (numenId) => set({ selectedAttacker: numenId }),
  selectTarget: (numenId) => set({ selectedTarget: numenId }),
  addAttackToSequence: (attack) => set((s) => ({ attackSequence: [...s.attackSequence, attack] })),
  removeAttackFromSequence: (index) => set((s) => ({ attackSequence: s.attackSequence.filter((_, i) => i !== index) })),
  clearAttackSequence: () => set({ attackSequence: [] }),

  resolveBattle: (attackSequence) => set((s) => {
    const results = resolveBattlePhase(attackSequence);
    return { battleResults: results, battlePhaseActive: false, attackSequence: [], combatLog: [...s.combatLog, ...results.interactions] };
  }),

  endBattlePhase: () => set({ battlePhaseActive: false, selectedAttacker: null, selectedTarget: null, attackSequence: [] }),

  updateQuestProgress: (mythicId, eventType, amount = 1) => set((s) => {
    const current = s.questProgress[mythicId] || defaultQuest(mythicId);
    return { questProgress: { ...s.questProgress, [mythicId]: updateQuestProgress(current as any, eventType, amount) } };
  }),

  clearQuestProgress: (mythicId) => set((s) => ({
    questProgress: Object.fromEntries(Object.entries(s.questProgress).filter(([k]) => k !== mythicId)),
  })),

  resetCombat: () => set({ battlePhaseActive: false, selectedAttacker: null, selectedTarget: null, attackSequence: [], battleResults: null }),

  isBattlePhaseActive: () => get().battlePhaseActive,
  getSelectedAttacker: () => get().selectedAttacker,
  getSelectedTarget: () => get().selectedTarget,
  getAttackSequence: () => get().attackSequence,
  getBattleResults: () => get().battleResults,
  getCombatLog: () => get().combatLog,
  getQuestProgress: (mythicId) => get().questProgress[mythicId],
  isMythicQuestReady: (_mythicId, mythic, progress) => !!progress && isMythicQuestComplete(mythic, progress),
}));