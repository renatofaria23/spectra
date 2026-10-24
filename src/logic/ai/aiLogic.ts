export type AiAction =
  | { type: 'placeNumen'; playerId: string; cardId: string; slotIndex: number; position: 'attack' | 'defense' }
  | { type: 'placeIncantation'; playerId: string; cardId: string; slotIndex: number; faceDown: boolean }
  | { type: 'selectAttacker'; numenId: string }
  | { type: 'selectDefender'; numenId: string }
  | { type: 'executeAttack' }
  | { type: 'changePhase' }
  | { type: 'endTurn' }
  | { type: 'none' };

export const getAiAction = (state: any, aiPlayerId: string): AiAction => {
  const player = state?.[aiPlayerId];
  const opponentId = aiPlayerId === 'player1' ? 'player2' : 'player1';
  const opponent = state?.[opponentId];
  if (!state?.gameActive || !player) return { type: 'none' };
  if (state.currentPlayer !== aiPlayerId) return { type: 'none' };

  const phase = state.currentPhase;

  if (phase === 'start_of_turn' || phase === 'end_of_turn' || phase === 'post_combat') {
    return { type: 'changePhase' };
  }

  if (phase === 'preparation') {
    const emptyNumenSlot = [0,1,2,3,4].find((i) => !(player.fieldNumina || [])[i]) ?? -1;
    if (emptyNumenSlot >= 0) {
      const affordable = (player.hand || [])
        .filter((c: any) => c?.type === 'numen')
        .filter((c: any) => (player.currentMana || 0) >= (c.level || 1) * 100)
        .sort((a: any, b: any) => ((b.baseAttack || 0) - (a.baseAttack || 0)));
      if (affordable.length) {
        const card = affordable[0];
        return { type: 'placeNumen', playerId: aiPlayerId, cardId: card.id, slotIndex: emptyNumenSlot, position: 'attack' };
      }
    }
    let incSlot = -1;
    for (let i = 0; i < 5; i++) {
      if (!player.fieldRites?.[i] && !player.fieldWards?.[i]) { incSlot = i; break; }
    }
    if (incSlot >= 0) {
      const inc = (player.hand || [])
        .filter((c: any) => c?.type === 'rite' || c?.type === 'ward')
        .filter((c: any) => (player.currentMana || 0) >= (c.mana || 0))
        .sort((a: any, b: any) => (b.mana || 0) - (a.mana || 0));
      if (inc.length) {
        const card = inc[0];
        return { type: 'placeIncantation', playerId: aiPlayerId, cardId: card.id, slotIndex: incSlot, faceDown: false };
      }
    }
    return { type: 'changePhase' };
  }

  if (phase === 'combat') {
    const candidates = (player.fieldNumina || [])
      .filter((n: any) => n && !n.hasAttacked)
      .map((n: any) => n.uid);
    const maxInvokes = 1 + (player.natureScaling?.air?.extraInvokes || 0);
    const toSelect = candidates.slice(0, maxInvokes);
    const selected = state.selectedAttackers || [];
    const nextAttacker = toSelect.find((u: string) => !selected.includes(u));
    if (nextAttacker) return { type: 'selectAttacker', numenId: nextAttacker };
    if (selected.length === 0) return { type: 'endTurn' };
    if (state.selectedDefender === null || state.selectedDefender === undefined) {
      const oppNumina = (opponent?.fieldNumina || []).filter((n: any) => n);
      if (oppNumina.length) {
        const weakest = [...oppNumina].sort((a: any, b: any) =>
          ((a.currentDefense ?? a.baseDefense ?? 0) - (b.currentDefense ?? b.baseDefense ?? 0)))[0];
        return { type: 'selectDefender', numenId: weakest.uid };
      }
    }
    return { type: 'executeAttack' };
  }

  return { type: 'changePhase' };
};
