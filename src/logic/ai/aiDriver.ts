import useGameStore from '../../stores/gameStore';
import { getAiAction } from './aiLogic';

export const applyAiAction = (action: any) => {
  const s = useGameStore.getState() as any;
  switch (action.type) {
    case 'placeNumen':
      s.placeNumenFromHand(action.playerId, action.cardId, action.slotIndex, action.position);
      break;
    case 'placeIncantation':
      s.placeIncantationFromHand(action.playerId, action.cardId, action.slotIndex, action.faceDown);
      break;
    case 'selectAttacker':
      s.selectAttacker(action.numenId);
      break;
    case 'selectDefender':
      s.selectDefender(action.numenId);
      break;
    case 'executeAttack':
      s.executeAttack();
      break;
    case 'changePhase':
      s.changePhase();
      break;
    case 'endTurn':
      s.endTurn();
      break;
    default:
      break;
  }
};

export const runAiTurn = async (aiPlayerId: string, delayMs = 350): Promise<void> => {
  let guard = 0;
  while (guard < 100) {
    guard++;
    const state = useGameStore.getState().gameState;
    if (!state.gameActive) break;
    if (state.currentPlayer !== aiPlayerId) break;
    const action = getAiAction(state, aiPlayerId);
    if (action.type === 'none') break;
    const before = useGameStore.getState().gameState;
    applyAiAction(action);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    const after = useGameStore.getState().gameState;
    if (after === before) break;
  }
};
