export const evaluateState = (state: any, aiPlayerId: string): number => {
  const opponentId = aiPlayerId === 'player1' ? 'player2' : 'player1';
  const player = state?.[aiPlayerId];
  const opponent = state?.[opponentId];
  if (!player || !opponent) return 0;

  const hpDiff = (player.currentHP ?? 0) - (opponent.currentHP ?? 0);
  const playerAtk = (player.fieldNumina || []).reduce((s: number, n: any) => s + (n.currentAttack ?? n.baseAttack ?? n.attack ?? 0), 0);
  const oppAtk = (opponent.fieldNumina || []).reduce((s: number, n: any) => s + (n.currentAttack ?? n.baseAttack ?? n.attack ?? 0), 0);
  const playerDef = (player.fieldNumina || []).reduce((s: number, n: any) => s + (n.currentDefense ?? n.baseDefense ?? n.defense ?? 0), 0);
  const oppDef = (opponent.fieldNumina || []).reduce((s: number, n: any) => s + (n.currentDefense ?? n.baseDefense ?? n.defense ?? 0), 0);

  const boardAdv = (playerAtk - oppAtk) * 0.4 + (playerDef - oppDef) * 0.2;
  const cardAdv = ((player.hand?.length ?? 0) + (player.fieldNumina?.length ?? 0))
    - ((opponent.hand?.length ?? 0) + (opponent.fieldNumina?.length ?? 0));
  const manaAdv = (player.currentMana ?? 0) - (opponent.currentMana ?? 0);

  return hpDiff * 0.02 + boardAdv + cardAdv * 8 + manaAdv * 0.1;
};
