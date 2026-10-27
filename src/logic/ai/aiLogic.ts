import { GAME_CONSTANTS } from '../../types/constants';
import { scoreAction, actionThreshold, combineScore } from './heuristics';
import { evaluateState } from './stateScore';
import { simulateAction } from './simulate';

export type AiAction =
  | { type: 'placeNumen'; playerId: string; cardId: string; slotIndex: number; position: 'attack' | 'defense' }
  | { type: 'placeIncantation'; playerId: string; cardId: string; slotIndex: number; faceDown: boolean }
  | { type: 'activateRite'; playerId: string; cardId: string }
  | { type: 'activateWard'; playerId: string; cardId: string }
  | { type: 'selectAttacker'; numenId: string }
  | { type: 'selectDefender'; numenId: string }
  | { type: 'executeAttack' }
  | { type: 'changePhase' }
  | { type: 'endTurn' }
  | { type: 'none' };

type Pick = { action: AiAction; score: number };

const best = (cands: Pick[]): Pick | null => {
  let b: Pick | null = null;
  for (const c of cands) if (!b || c.score > b.score) b = c;
  return b;
};

const emptyNumenSlots = (player: any) => [0, 1, 2, 3, 4].filter((i: number) => !(player.fieldNumina || [])[i]);
const emptyIncSlots = (player: any) => [0, 1, 2, 3, 4].filter((i: number) => !(player.fieldRites?.[i]) && !(player.fieldWards?.[i]));

const evaluateCandidate = (state: any, aiPlayerId: string, action: AiAction): number => {
  const immediate = scoreAction(state, aiPlayerId, action);
  const next = simulateAction(state, aiPlayerId, action);
  const stateScore = evaluateState(next, aiPlayerId);
  return combineScore(immediate, stateScore);
};

export const getAiAction = (state: any, aiPlayerId: string): AiAction => {
  const opponentId = aiPlayerId === 'player1' ? 'player2' : 'player1';
  const player = state?.[aiPlayerId];
  const opponent = state?.[opponentId];
  if (!state?.gameActive || !player) return { type: 'none' };
  if (state.currentPlayer !== aiPlayerId) return { type: 'none' };

  const phase = state.currentPhase;
  const pass: AiAction = phase === 'combat' ? { type: 'endTurn' } : { type: 'changePhase' };
  const cands: Pick[] = [];

  const add = (action: AiAction) => cands.push({ action, score: evaluateCandidate(state, aiPlayerId, action) });

  if (phase === 'start_of_turn' || phase === 'end_of_turn' || phase === 'post_combat') {
    add({ type: 'changePhase' });
  } else if (phase === 'preparation') {
    const mana = player.currentMana || 0;
    for (const c of (player.hand || []).filter((x: any) => x?.type === 'numen')) {
      const cost = (c.level ?? 1) * 100;
      if (mana < cost) continue;
      for (const slot of emptyNumenSlots(player)) {
        add({ type: 'placeNumen', playerId: aiPlayerId, cardId: c.id, slotIndex: slot, position: 'attack' });
        add({ type: 'placeNumen', playerId: aiPlayerId, cardId: c.id, slotIndex: slot, position: 'defense' });
      }
    }
    for (const c of (player.hand || []).filter((x: any) => x?.type === 'rite' || x?.type === 'ward')) {
      const cost = c.mana ?? 0;
      if (mana < cost) continue;
      for (const slot of emptyIncSlots(player)) {
        add({ type: 'placeIncantation', playerId: aiPlayerId, cardId: c.id, slotIndex: slot, faceDown: false });
        add({ type: 'placeIncantation', playerId: aiPlayerId, cardId: c.id, slotIndex: slot, faceDown: true });
      }
      if (c.type === 'rite' && (player.fieldRites || []).length < GAME_CONSTANTS.MAX_INCANTATION_SPOTS) {
        add({ type: 'activateRite', playerId: aiPlayerId, cardId: c.id });
      }
      if (c.type === 'ward' && (player.fieldWards || []).length < GAME_CONSTANTS.MAX_INCANTATION_SPOTS) {
        add({ type: 'activateWard', playerId: aiPlayerId, cardId: c.id });
      }
    }
    add({ type: 'changePhase' });
  } else if (phase === 'combat') {
    const ready = (player.fieldNumina || []).filter((n: any) => n && !n.hasAttacked);
    const maxInvokes = GAME_CONSTANTS.NORMAL_INVOKES_PER_TURN;
    const selected = state.selectedAttackers || [];
    const attackersLeft = ready.slice(0, maxInvokes).filter((n: any) => !selected.includes(n.uid));
    for (const n of attackersLeft) add({ type: 'selectAttacker', numenId: n.uid });
    if (selected.length > 0 && (state.selectedDefender === null || state.selectedDefender === undefined)) {
      const oppNumina = (opponent?.fieldNumina || []).filter((n: any) => n);
      if (oppNumina.length) {
        for (const n of oppNumina) add({ type: 'selectDefender', numenId: n.uid });
      }
    }
    if (selected.length > 0 && state.selectedDefender !== null && state.selectedDefender !== undefined) {
      add({ type: 'executeAttack' });
    }
    add({ type: 'endTurn' });
  } else {
    add({ type: 'changePhase' });
  }

  const b = best(cands);
  if (!b || b.score < actionThreshold) return pass;
  return b.action;
};


