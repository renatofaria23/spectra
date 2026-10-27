import { GAME_CONSTANTS, PHASES } from '../../types/constants';

const clone = (state: any): any => JSON.parse(JSON.stringify(state));

const atk = (c: any) => c.currentAttack ?? c.baseAttack ?? c.attack ?? 0;
const defe = (c: any) => c.currentDefense ?? c.baseDefense ?? c.defense ?? 0;

export const simulateAction = (state: any, aiPlayerId: string, action: any): any => {
  const s = clone(state);
  const opponentId = aiPlayerId === 'player1' ? 'player2' : 'player1';
  const player = s[aiPlayerId];
  const opponent = s[opponentId];
  if (!player || !opponent) return s;

  const { type } = action;

  const removeFromHand = (p: any, id: string) => {
    p.hand = p.hand.filter((c: any) => c.id !== id);
  };

  switch (type) {
    case 'placeNumen': {
      const card = player.hand.find((c: any) => c.id === action.cardId);
      if (!card) return s;
      const cost = (card.level ?? 1) * 100;
      if (player.currentMana < cost) return s;
      if ((player.fieldNumina || [])[action.slotIndex]) return s;
      const instance = { ...card, uid: `${card.id}_${Date.now()}_${Math.random()}`, hasAttacked: false, justInvoked: false };
      player.fieldNumina = player.fieldNumina || [];
      player.fieldNumina[action.slotIndex] = instance;
      player.numenPositions = player.numenPositions || {};
      player.numenPositions[instance.uid] = action.position;
      player.currentMana -= cost;
      removeFromHand(player, card.id);
      return s;
    }
    case 'placeIncantation': {
      const card = player.hand.find((c: any) => c.id === action.cardId);
      if (!card) return s;
      const cost = card.mana ?? 0;
      if (player.currentMana < cost) return s;
      if ((player.fieldRites || [])[action.slotIndex] || (player.fieldWards || [])[action.slotIndex]) return s;
      const instance = { ...card, uid: `${card.id}_${Date.now()}_${Math.random()}`, isFaceDown: action.faceDown };
      if (card.type === 'rite') {
        player.fieldRites = player.fieldRites || [];
        player.fieldRites[action.slotIndex] = instance;
      } else {
        player.fieldWards = player.fieldWards || [];
        player.fieldWards[action.slotIndex] = instance;
      }
      player.currentMana -= cost;
      removeFromHand(player, card.id);
      return s;
    }
    case 'activateRite': {
      const card = player.hand.find((c: any) => c.id === action.cardId);
      if (!card || card.type !== 'rite') return s;
      const cost = card.mana ?? 0;
      if (player.currentMana < cost) return s;
      if ((player.fieldRites || []).length >= GAME_CONSTANTS.MAX_INCANTATION_SPOTS) return s;
      player.fieldRites = [...(player.fieldRites || []), { ...card, isFaceDown: false }];
      player.currentMana -= cost;
      removeFromHand(player, card.id);
      return s;
    }
    case 'activateWard': {
      const card = player.hand.find((c: any) => c.id === action.cardId);
      if (!card || card.type !== 'ward') return s;
      const cost = card.mana ?? 0;
      if (player.currentMana < cost) return s;
      if ((player.fieldWards || []).length >= GAME_CONSTANTS.MAX_INCANTATION_SPOTS) return s;
      player.fieldWards = [...(player.fieldWards || []), { ...card, isFaceDown: false }];
      player.currentMana -= cost;
      removeFromHand(player, card.id);
      return s;
    }
    case 'selectAttacker':
      s.selectedAttackers = s.selectedAttackers || [];
      if (!s.selectedAttackers.includes(action.numenId)) s.selectedAttackers.push(action.numenId);
      return s;
    case 'selectDefender':
      s.selectedDefender = action.numenId;
      return s;
    case 'executeAttack': {
      const attackers = (s.selectedAttackers || []).map((id: string) =>
        (player.fieldNumina || []).find((n: any) => n.uid === id)
      ).filter(Boolean);
      const defender = (opponent.fieldNumina || []).find((n: any) => n.uid === s.selectedDefender);
      const totalATK = attackers.reduce((sum: number, a: any) => sum + atk(a), 0);
      const defenderStat = defender ? defe(defender) : 0;
      if (defender) {
        if (totalATK > defenderStat) {
          opponent.fieldNumina = (opponent.fieldNumina || []).filter((n: any) => n.uid !== s.selectedDefender);
          player.currentHP = Math.max(0, player.currentHP - 0);
        } else if (totalATK === defenderStat) {
          opponent.fieldNumina = (opponent.fieldNumina || []).filter((n: any) => n.uid !== s.selectedDefender);
          player.fieldNumina = (player.fieldNumina || []).filter((n: any) => !(s.selectedAttackers || []).includes(n.uid));
        } else {
          player.fieldNumina = (player.fieldNumina || []).filter((n: any) => !(s.selectedAttackers || []).includes(n.uid));
        }
        attackers.forEach((a: any) => { if (a) a.hasAttacked = true; });
      } else {
        opponent.currentHP -= totalATK;
        attackers.forEach((a: any) => { if (a) a.hasAttacked = true; });
      }
      s.selectedAttackers = [];
      s.selectedDefender = null;
      return s;
    }
    case 'changePhase': {
      const order = [PHASES.START_OF_TURN, PHASES.PREPARATION, PHASES.COMBAT, PHASES.POST_COMBAT, PHASES.END_OF_TURN];
      const cur = s.currentPhase;
      const idx = order.indexOf(cur);
      s.currentPhase = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : order[0];
      return s;
    }
    case 'endTurn':
      s.currentPhase = PHASES.END_OF_TURN;
      s.selectedAttackers = [];
      s.selectedDefender = null;
      return s;
    default:
      return s;
  }
};
