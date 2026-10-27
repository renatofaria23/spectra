import type { Card } from '../../types/cardTypes';

type Ctx = {
  state: any;
  aiPlayerId: string;
  player: any;
  opponent: any;
};

const RARITY_W: Record<string, number> = { common: 1, rare: 1.5, legendary: 2.2, mythic: 3 };

const atk = (c: any) => c.currentAttack ?? c.baseAttack ?? c.attack ?? 0;
const defe = (c: any) => c.currentDefense ?? c.baseDefense ?? c.defense ?? 0;

export const numenValue = (card: Card, _ctx: Ctx): number => {
  const c = card as any;
  return atk(c) * 0.5 + defe(c) * 0.25 + ((c.level ?? 1) * 30) + (RARITY_W[c.rarity] ?? 1) * 15 + ((c.triggers?.length ?? 0) * 10);
};

export const riteValue = (card: Card, _ctx: Ctx): number => {
  const c = card as any;
  return ((c.triggers?.length ?? 0) * 22) + (RARITY_W[c.rarity] ?? 1) * 12;
};

export const wardValue = (card: Card, _ctx: Ctx): number => {
  const c = card as any;
  return ((c.triggers?.length ?? 0) * 26) + (RARITY_W[c.rarity] ?? 1) * 12;
};

export const actionThreshold = 6;

export const combineScore = (actionScore: number, stateScore: number): number => actionScore + stateScore * 0.5;

export const scoreAction = (state: any, aiPlayerId: string, action: any): number => {
  const ctx: Ctx = {
    state,
    aiPlayerId,
    player: state[aiPlayerId],
    opponent: state[aiPlayerId === 'player1' ? 'player2' : 'player1'],
  };
  const { type } = action;
  const hand = ctx.player?.hand || [];
  const card = hand.find((c: any) => c.id === action.cardId);
  switch (type) {
    case 'placeNumen':
      if (!card) return -1e6;
      return numenValue(card, ctx) - (((card.level ?? 1) * 100) * 0.4) + (action.position === 'attack' ? 8 : 2);
    case 'placeIncantation':
    case 'activateRite':
    case 'activateWard': {
      if (!card) return -1e6;
      const val = card.type === 'ward' ? wardValue(card, ctx) : riteValue(card, ctx);
      return val - ((card.mana ?? 0) * 0.4);
    }
    case 'selectAttacker': {
      const n = (ctx.player.fieldNumina || []).find((x: any) => x.uid === action.numenId);
      if (!n) return -1e6;
      return atk(n) * 0.3;
    }
    case 'selectDefender': {
      const n = (ctx.opponent?.fieldNumina || []).find((x: any) => x.uid === action.numenId);
      if (!n) return -1e6;
      const attacker = (ctx.player.fieldNumina || []).find((x: any) => (ctx.state.selectedAttackers || []).includes(x.uid));
      const canKill = attacker ? atk(attacker) >= (defe(n) ?? 0) : false;
      return numenValue(n as any, ctx) * 0.6 + (canKill ? 30 : 0);
    }
    case 'executeAttack':
      return 20;
    case 'changePhase':
      return 5;
    case 'endTurn':
      return 3;
    default:
      return 0;
  }
};
