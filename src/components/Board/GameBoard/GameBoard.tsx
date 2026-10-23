import React, { useState, useCallback, useRef } from "react";
import { Box, Text, Button, Group, Badge } from "@mantine/core";
import { IconArrowBack } from "@tabler/icons-react";
import colors from "../../../styles/Colors";
import * as S from './GameBoard.css.ts';
import useGameStore, { getCurrentPhaseName } from "../../../stores/gameStore";
import type { Card, FieldPosition } from "../../../logic/deckConstraints";
import { NatureIcon } from "../../Card/NatureIcon/NatureIcon";
import { CardTemplate } from "../../Card/CardTemplate/CardTemplate";

const N: Record<string, string[]> = {
  fire: colors.FireTheme,
  water: colors.WaterTheme,
  earth: colors.EarthTheme,
  air: colors.AirTheme,
  light: colors.LightTheme,
  dark: colors.DarkTheme,
};

const getBg = (c: Card) => {
  const t = N[(c as any).nature?.toLowerCase()];
  if (t && t.length >= 3) return `linear-gradient(135deg, ${t[1]}, ${t[2]}, ${t[3] || t[2]})`;
  if (c.type === "rite") { const v = colors.RiteTheme; return `linear-gradient(135deg, ${v[1] || colors.Green_7}, ${v[2] || colors.Green_8}, ${v[3] || colors.Green_9})`; }
  if (c.type === "ward") { const v = colors.WardTheme; return `linear-gradient(135deg, ${v[1] || colors.Red_8}, ${v[2] || colors.Red_9}, ${v[3] || colors.Red_10})`; }
  return colors.Gray_7;
};

const getArt = (a: string | undefined) => a ? `/src/assets/art/${a}` : null;

const getBd = (c: Card) => {
  const t = N[(c as any).nature?.toLowerCase()];
  if (t) return t[2] ?? t[0] ?? colors.Gray_5;
  if (c.type === "rite") return colors.Green_6;
  if (c.type === "ward") return colors.Red_9;
  return colors.Gray_5;
};

interface DS {
  card: Card | null;
  hid: string | null;
  offset: { x: number; y: number };
  startPos: { x: number; y: number };
  cursorPos: { x: number; y: number };
  isDragging: boolean;
}

interface PT {
  si: number;
  zone: "numen" | "incantation";
  pid: string;
}

const FCard: React.FC<{
  card: Card; sel: boolean; onSel: () => void; onInsp: () => void;
  faceDown: boolean; isDef: boolean;
}> = ({ card, sel, onSel, onInsp, faceDown, isDef }) => {
  const bg = faceDown ? colors.Gray_9 : getBg(card);
  const bd = faceDown ? colors.Gray_5 : getBd(card);
  const [hov, setHov] = useState(false);

  return (
    <Box
      data-name="field-card-wrapper"
      onClick={onSel}
      onMouseUp={onInsp}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...S.fieldCardWrapper,
        border: `2px solid ${sel ? colors.Red_5 : bd}`,
        background: bg,
        boxShadow: sel ? `0 0 10px ${colors.Red_5}88` : "none",
        transform: `${isDef ? "rotate(90deg)" : "none"} ${hov ? "scale(1.2)" : "scale(1)"}`,
        transition: "transform 0.2s ease",
        zIndex: hov ? 100 : 1,
      }}
    >
      {faceDown ? (
        <Box style={S.cardContentArea}>
          <Text c={colors.Gray_5} size="xs" fw={700}>?</Text>
        </Box>
      ) : (
        <Box style={{ flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          {getArt(card.art) ? (
            <img src={getArt(card.art)!} alt="Card art" style={{ width: "120%", height: "120%", objectFit: "cover" }} />
          ) : (
            <NatureIcon type={card.nature || "dark"} size={30} />
          )}
        </Box>
      )}
    </Box>
  );
};

const ESlot: React.FC<{ hig: boolean; zone: string; si: number; pid: string }> = ({ hig, zone, si, pid }) => (
  <Box
    data-name="empty-card-slot"
    data-slot-zone={zone}
    data-slot-index={si}
    data-slot-player={pid}
    style={{
      ...S.emptyCardSlot,
      backgroundColor: colors.Gray_8,
      border: `2px solid ${hig ? colors.Blue_11 : colors.Gray_6}`,
      boxShadow: hig ? `0 0 12px ${colors.Blue_11}88` : "none",
      transition: "border 0.15s ease, box-shadow 0.15s ease",
    }}
  />
);

const HCard: React.FC<{
  card: Card; _onInsp: () => void; onDS: (c: Card, s: { x: number; y: number }, i: number) => void;
  onDM: (o: { x: number; y: number }) => void; onDE: () => void;
  isDrag: boolean; dOff: { x: number; y: number }; canDrag: boolean;
  dataHandIndex: number; dataHandPlayer: string; onSwapHover: (idx: number) => void;
}> = ({ card, _onInsp, onDS, onDM, onDE, isDrag, dOff, canDrag, dataHandIndex, dataHandPlayer, onSwapHover }) => {
  const bg = getBg(card);
  const bd = getBd(card);
  const [hov, setHov] = useState(false);
  const sRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canDrag) return;
    const s = { x: e.clientX, y: e.clientY };
    sRef.current = s;
    onDS(card, s, dataHandIndex);
    const mm = (m: MouseEvent) => onDM({ x: m.clientX - s.x, y: m.clientY - s.y });
    const mu = () => { document.removeEventListener("mousemove", mm); document.removeEventListener("mouseup", mu); onDE(); };
    document.addEventListener("mousemove", mm);
    document.addEventListener("mouseup", mu);
  };

  const handleSwapHover = () => onSwapHover(dataHandIndex);

  const moved = canDrag && isDrag && (Math.sqrt(dOff.x ** 2 + dOff.y ** 2) > 5);

  return (
    <Box
      data-name="hand-card"
      data-hand-index={dataHandIndex}
      data-hand-player={dataHandPlayer}
      onMouseEnter={() => { setHov(true); handleSwapHover(); }}
      onMouseLeave={() => setHov(false)}
      onMouseDown={handleMouseDown}
      style={{
        ...S.handCard,
        border: `1px solid ${bd}`,
        background: bg,
        cursor: canDrag ? "grab" : "pointer",
        transform: moved ? `translate(${dOff.x}px, ${dOff.y}px) scale(0.8)` : isDrag && canDrag ? "scale(0.8)" : hov ? "scale(1.5)" : "scale(1)",
        transition: isDrag && canDrag ? "none" : "transform 0.2s ease",
        zIndex: isDrag && canDrag ? 9999 : hov ? 100 : 1,
        position: "relative",
        pointerEvents: isDrag && canDrag ? "none" : "auto",
      }}
    >
      <Box style={S.fieldCardFaceDown}>
        {getArt((card as any).art) ? (
          <img src={getArt((card as any).art)!} alt="Card art" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <NatureIcon type={(card as any).nature || "dark"} size={30} />
        )}
      </Box>
    </Box>
  );
};

const ZRow: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box data-name="zone-row" style={S.zoneRow}>{children}</Box>
);

const PField: React.FC<{
  player: any; pid: string; isCP: boolean;
  onTA: (u: string) => void; onTD: (u: string) => void;
  atk: string[]; def: string | null;
  onInsp: (c: Card, isSM?: boolean, opid?: string, si?: number) => void;
  drag: DS; onDrop: (t: PT) => void; onFlip: (p: string, i: number) => void;
  mirrored: boolean;
}> = ({ player, pid, isCP, onTA, onTD, atk, def, onInsp, drag, mirrored }) => {
  const hcc = (c: Card, u: string) => { if (isCP) onTA(u); else onTD(u); };

  const getHig = useCallback((zone: string, idx: number): boolean => {
    if (!drag.isDragging) return false;
    const el = document.elementFromPoint(drag.cursorPos.x, drag.cursorPos.y);
    if (!el) return false;
    const s = el.closest("[data-slot-zone]");
    if (!s) return false;
    const z = s.getAttribute("data-slot-zone");
    const i = parseInt(s.getAttribute("data-slot-index") || "-1", 10);
    const p = s.getAttribute("data-slot-player");
    if (z !== zone || i !== idx || p !== pid) return false;
    if (zone === "numen" && drag.card!.type !== "numen") return false;
    if (zone === "incantation" && drag.card!.type !== "rite" && drag.card!.type !== "ward") return false;
    return true;
  }, [drag.isDragging, drag.cursorPos, drag.card, pid]);

  const renderIncantation = () => (
    <ZRow data-name="incantation-zone-row">
      {Array.from({ length: 5 }).map((_, i) => {
        const c = player.fieldRites[i] || player.fieldWards[i];
        const fd = c ? !!(c as any).isFaceDown : false;
        if (!c) return <Box key={`s${i}`} data-name={`incantation-slot-${i}`}><ESlot hig={getHig("incantation", i)} zone="incantation" si={i} pid={pid} /></Box>;
        return <Box key={`s${i}`} data-name={`incantation-slot-${i}`}><FCard card={c} uid={(c as any).uid || `spell_${i}`} sel={false} onSel={() => {}} onInsp={() => fd ? onInsp(c, true, pid, i) : onInsp(c)} faceDown={fd} isDef={false} /></Box>;
      })}
    </ZRow>
  );

  const renderNumen = () => (
    <ZRow data-name="numen-zone-row">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = player.fieldNumina[i];
        const u = n ? (n as any).uid || `field_${i}` : null;
        const isA = u ? atk.includes(u) : false;
        const isD = u ? def === u : false;
        const isDefPos = u ? player.numenPositions[u] === "defense" : false;
        if (!n) return <Box key={`n${i}`} data-name={`numen-slot-${i}`}><ESlot hig={getHig("numen", i)} zone="numen" si={i} pid={pid} /></Box>;
        return <Box key={`n${i}`} data-name={`numen-slot-${i}`}><FCard card={n} uid={u} sel={isA || isD} onSel={() => hcc(n, u)} onInsp={() => onInsp(n)} faceDown={false} isDef={isDefPos} /></Box>;
      })}
    </ZRow>
  );

  return (
    <Box
      data-name="player-field"
      style={{
        ...S.playerField,
        flexDirection: mirrored ? "column-reverse" : "column",
        backgroundColor: isCP ? "rgba(59, 130, 246, 0.05)" : "rgba(0,0,0,0.1)",
        border: `1px solid ${isCP ? colors.Blue_5 : colors.Gray_6}`,
      }}
    >
      {mirrored ? <>
        {renderIncantation()}
        {renderNumen()}
      </> : <>
        {renderNumen()}
        {renderIncantation()}
      </>}
    </Box>
  );
};

const NSBadge: React.FC<{ nature: string; label: string; val: string; theme: string[] }> = ({ nature, label, val, theme }) => {
  const bg = theme[4] ?? theme[2] ?? colors.Gray_6;
  const tc = nature === "light" || nature === "air" ? colors.Gray_9 : colors.White_1;
  return (
    <Badge
      data-name={`nature-badge-${nature}`}
      size="xs"
      style={{ backgroundColor: bg, color: tc, fontSize: "9px", padding: "2px 6px", whiteSpace: "nowrap" }}
    >
      {label}: {val}
    </Badge>
  );
};

const PInfo: React.FC<{ player: any; pid: string; active: boolean }> = ({ player, pid, active }) => {
  const isP1 = pid === "player1";
  const sc = player.natureScaling;
  const badges = [
    { nature: "light", label: "Light", val: `+${sc.light.manaGainBonus} MG`, theme: colors.LightTheme },
    { nature: "dark", label: "Dark", val: `+${sc.dark.handSizeBonus} HS`, theme: colors.DarkTheme },
    { nature: "fire", label: "Fire", val: `+${sc.fire.damageBonus} DMG`, theme: colors.FireTheme },
    { nature: "water", label: "Water", val: `+${sc.water.hpRegenBonus} HPR`, theme: colors.WaterTheme },
    { nature: "earth", label: "Earth", val: `+${sc.earth.hpBonus} HP`, theme: colors.EarthTheme },
    { nature: "air", label: "Air", val: `+${sc.air.extraInvokes} NS`, theme: colors.AirTheme },
  ];

  return (
    <Group data-name="player-info-bar" justify="space-between" style={S.playerInfoBar}>
      <Text c={colors.White_1} size="xs" fw={700}>
        {isP1 ? "Player 1" : "Player 2"}
        {active && <Badge ml="xs" size="xs" color="blue">ACTIVE</Badge>}
      </Text>
      <Group data-name="nature-scaling-group" gap="4px" justify="center">
        {badges.map((b) => <NSBadge key={b.nature} nature={b.nature} label={b.label} val={b.val} theme={b.theme} />)}
      </Group>
      <Group data-name="player-stats-group" gap="sm">
        <Group data-name="player-mana-group" gap="4px" align="center">
          <Text c={colors.Blue_11} size="xs" fw={600}>MANA</Text>
          <Text c={colors.White_1} size="xs" fw={700}>{player.currentMana}</Text>
        </Group>
        <Group data-name="player-lp-group" gap="4px" align="center">
          <Text c={colors.Red_1} size="xs" fw={600}>LP</Text>
          <Text c={colors.White_1} size="xs" fw={700}>{player.currentHP}</Text>
        </Group>
      </Group>
    </Group>
  );
};

const POverlay: React.FC<{
  card: Card; onClose: () => void; onPlace: (p: FieldPosition) => void;
  onCast: () => void; onSet: () => void; mode: "numen" | "incantation";
}> = ({ card, onClose, onPlace, onCast, onSet, mode }) => {
  const bg = getBg(card);
  return (
    <Box data-name="placement-overlay" onClick={onClose} style={{ ...S.placementOverlay, backgroundColor: "rgba(0,0,0,0.6)", cursor: "pointer" }}>
      <Box data-name="placement-dialog" onClick={(e) => e.stopPropagation()} style={{ ...S.placementDialog, animation: "fadeInScale 0.3s ease forwards" }}>
        <Box style={{ ...S.placementPreviewCard, background: bg, border: `2px solid ${getBd(card)}` }}>
          {getArt((card as any).art) ? (
            <img src={getArt((card as any).art)!} alt="Card art" style={S.handCardImage} />
          ) : (
            <NatureIcon type={(card as any).nature || "dark"} size={60} />
          )}
        </Box>
        <Text c={colors.White_1} size="md" fw={700}>{card.name}</Text>
        <Group gap="md">
          {mode === "numen" ? (
            <>
              <Button size="sm" onClick={() => onPlace("attack")} styles={{ root: { backgroundColor: colors.Blue_5 } }}>Attack Position</Button>
              <Button size="sm" onClick={() => onPlace("defense")} styles={{ root: { backgroundColor: colors.Green_5 } }}>Defense Position</Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={onCast} styles={{ root: { backgroundColor: colors.Green_5 } }}>Cast</Button>
              <Button size="sm" onClick={onSet} styles={{ root: { backgroundColor: colors.Gray_7 } }}>Set</Button>
            </>
          )}
        </Group>
      </Box>
    </Box>
  );
};

export const GameBoard = () => {
  const gs = useGameStore((s) => s.gameState);
  const changePhase = useGameStore((s) => s.changePhase);
  const selectAttacker = useGameStore((s) => s.selectAttacker);
  const selectDefender = useGameStore((s) => s.selectDefender);
  const endTurn = useGameStore((s) => s.endTurn);
  const quitGame = useGameStore((s) => s.quitGame);
  const placeNumen = useGameStore((s) => s.placeNumenFromHand);
  const placeIncantation = useGameStore((s) => s.placeIncantationFromHand);
  const flipIncantation = useGameStore((s) => s.flipIncantationFaceUp);

  const cp = gs.currentPlayer;
  const p1 = gs.player1;
  const p2 = gs.player2;
  const phase = gs.currentPhase;

  const [insp, setInsp] = useState<{ card: Card; isSM: boolean; opid: string; si: number } | null>(null);
  const [drag, setDrag] = useState<DS>({ card: null, hid: null, offset: { x: 0, y: 0 }, startPos: { x: 0, y: 0 }, cursorPos: { x: 0, y: 0 }, isDragging: false });
  const [_dragSPid, setDragSPid] = useState<string | null>(null);
  const dOffRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dCurRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dCardRef = useRef<Card | null>(null);
  const dStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dDragHandIndexRef = useRef<number | null>(null);
  const dLastSwapTargetRef = useRef<number | null>(null);

  const [place, setPlace] = useState<{ card: Card; target: PT } | null>(null);

  const hInsp = useCallback((c: Card, isSM = false, opid: string = cp, si = -1) => setInsp({ card: c, isSM, opid, si }), [cp]);
  const hCloseInsp = useCallback((e: React.MouseEvent) => { e.stopPropagation(); setInsp(null); }, []);

  const hCastSet = useCallback(() => {
    if (!insp) return;
    flipIncantation(insp.opid, insp.si);
    setInsp(null);
  }, [insp, flipIncantation]);

  const hDS = useCallback((c: Card, s: { x: number; y: number }, handIdx: number) => {
    const hp = cp === "player1" ? p1 : p2;
    dCardRef.current = c;
    dOffRef.current = { x: 0, y: 0 };
    dCurRef.current = { x: s.x, y: s.y };
    dStartRef.current = s;
    dDragHandIndexRef.current = handIdx;
    dLastSwapTargetRef.current = null;
    setDrag({ card: c, hid: hp?.playerId || null, offset: { x: 0, y: 0 }, startPos: s, cursorPos: { x: s.x, y: s.y }, isDragging: true });
    setDragSPid(hp?.playerId || null);
  }, [cp, p1, p2]);

  const swapCardsInHand = useGameStore((s) => s.swapCardsInHand);

  const hDM = useCallback((o: { x: number; y: number }) => {
    dOffRef.current = o;
    const ac = { x: dStartRef.current.x + o.x, y: dStartRef.current.y + o.y };
    dCurRef.current = ac;
    setDrag((p: DS) => ({ ...p, offset: o, cursorPos: ac }));
  }, []);

  const hDE = useCallback(() => {
    const o = dOffRef.current;
    const c = dCardRef.current;
    const cur = dCurRef.current;
    const moved = c !== null ? Math.sqrt(o.x ** 2 + o.y ** 2) > 5 : false;
    const hoverIdx = dLastSwapTargetRef.current;
    const dragIdx = dDragHandIndexRef.current;
    if (!moved && c) { hInsp(c); }
    else if (moved && c && dragIdx !== null && hoverIdx !== null && hoverIdx !== dragIdx) {
      const hp = cp === "player1" ? p1 : p2;
      if (hp) swapCardsInHand(hp.playerId, dragIdx, hoverIdx);
    }
    else if (moved && c) {
      const el = document.elementFromPoint(cur.x, cur.y);
      if (el) {
        const s = el.closest("[data-slot-zone]");
        if (s) {
          const z = s.getAttribute("data-slot-zone");
          const si = parseInt(s.getAttribute("data-slot-index") || "-1", 10);
          const tp = s.getAttribute("data-slot-player");
          if (z === "numen" && si >= 0 && tp && c.type === "numen") setPlace({ card: c, target: { si, zone: "numen", pid: tp } });
          else if (z === "incantation" && si >= 0 && tp && (c.type === "rite" || c.type === "ward")) setPlace({ card: c, target: { si, zone: "incantation", pid: tp } });
        }
      }
    }
    dCardRef.current = null;
    dOffRef.current = { x: 0, y: 0 };
    dCurRef.current = { x: 0, y: 0 };
    setDrag({ card: null, hid: null, offset: { x: 0, y: 0 }, startPos: { x: 0, y: 0 }, cursorPos: { x: 0, y: 0 }, isDragging: false });
    setDragSPid(null);
    dDragHandIndexRef.current = null;
    dLastSwapTargetRef.current = null;
  }, [hInsp, cp, p1, p2, swapCardsInHand]);

  const hDrop = useCallback((t: PT) => {
    if (!drag.card || !drag.isDragging) return;
    const c = drag.card;
    if (Math.sqrt(drag.offset.x ** 2 + drag.offset.y ** 2) <= 5) return;
    if (c.type === "numen" && t.zone === "numen") setPlace({ card: c, target: t });
    else if ((c.type === "rite" || c.type === "ward") && t.zone === "incantation") setPlace({ card: c, target: t });
    setDrag({ card: null, hid: null, offset: { x: 0, y: 0 }, startPos: { x: 0, y: 0 }, cursorPos: { x: 0, y: 0 }, isDragging: false });
    setDragSPid(null);
  }, [drag]);

  const hPlaceN = useCallback((p: FieldPosition) => {
    if (!place) return;
    const { card, target } = place;
    placeNumen(target.pid, card.id, target.si, p);
    setPlace(null);
  }, [place, placeNumen]);

  const hCastM = useCallback(() => {
    if (!place) return;
    const { card, target } = place;
    placeIncantation(target.pid, card.id, target.si, false);
    setPlace(null);
  }, [place, placeIncantation]);

  const hSetM = useCallback(() => {
    if (!place) return;
    const { card, target } = place;
    placeIncantation(target.pid, card.id, target.si, true);
    setPlace(null);
  }, [place, placeIncantation]);

  const hFlip = useCallback((p: string, i: number) => flipIncantation(p, i), [flipIncantation]);

  const hSwapHover = useCallback((targetIdx: number) => {
    if (drag.isDragging && dDragHandIndexRef.current !== null && dDragHandIndexRef.current !== targetIdx) {
      dLastSwapTargetRef.current = targetIdx;
    }
  }, [drag.isDragging]);

  if (!p1 || !p2) return <Box data-name="no-game-state" style={S.noGameStateMessage}><Text c={colors.Gray_3}>No active game</Text></Box>;

  const renderHand = (hand: Card[], isCP: boolean, pid: string) => hand.map((c: Card, i: number) => (
    <HCard key={i} card={c} onInsp={() => hInsp(c)} onDS={(card, s) => hDS(card, s, i)} onDM={hDM} onDE={hDE} isDrag={drag.card === c} dOff={drag.card === c ? drag.offset : { x: 0, y: 0 }} canDrag={isCP} dataHandIndex={i} dataHandPlayer={pid} onSwapHover={hSwapHover} />
  ));

  return (
    <Box data-name="game-board-root" style={S.gameBoardRoot}>
      <Box data-name="main-board-area" style={{ ...S.mainBoardArea, filter: insp || place ? "blur(8px)" : "none", transition: "filter 0.3s ease", pointerEvents: insp || place ? "none" : "auto" }}>
        <Box data-name="left-sidebar" style={S.leftSidebar}></Box>
        <Box data-name="center-board" style={S.centerBoard}>
          <Box data-name="p2-hand" style={S.handRow}>{renderHand(p2.hand || [], cp === "player2", "player2")}</Box>
          <PInfo player={p2} pid="player2" active={cp === "player2"} />
          <PField player={p2} pid="player2" isCP={cp === "player2"} onTA={cp === "player2" ? selectAttacker : () => {}} onTD={cp === "player1" ? selectDefender : () => {}} atk={cp === "player2" ? gs.selectedAttackers : []} def={cp === "player2" ? gs.selectedDefender : null} onInsp={hInsp as any} drag={drag} onDrop={hDrop} onFlip={hFlip} mirrored />
          <Group data-name="center-controls" justify="center" gap="xs" style={S.centerControls}>
            <Button size="xs" onClick={changePhase} styles={{ root: { backgroundColor: colors.Blue_5 } }}>Next Phase</Button>
            <Text c={colors.Orange_7} size="xs" fw={700}>TURN {gs.turnNumber}</Text>
            <Badge data-name="phase-badge" size="xs" style={{ backgroundColor: colors.Blue_5 }}>{getCurrentPhaseName(phase)}</Badge>
            <Button size="xs" onClick={endTurn} styles={{ root: { backgroundColor: colors.Orange_7 } }}>End Turn</Button>
          </Group>
          <PField player={p1} pid="player1" isCP={cp === "player1"} onTA={cp === "player1" ? selectAttacker : () => {}} onTD={cp === "player2" ? selectDefender : () => {}} atk={cp === "player1" ? gs.selectedAttackers : []} def={cp === "player1" ? gs.selectedDefender : null} onInsp={hInsp as any} drag={drag} onDrop={hDrop} onFlip={hFlip} mirrored={false} />
          <PInfo player={p1} pid="player1" active={cp === "player1"} />
          <Box data-name="p1-hand" style={S.handRow}>{renderHand(p1.hand || [], cp === "player1", "player1")}</Box>
        </Box>
        <Box data-name="right-sidebar" style={S.rightSidebar}>
          <Button size="xs" onClick={quitGame} styles={{ root: { backgroundColor: colors.Red_10 } }}><IconArrowBack size={12} /></Button>
        </Box>
      </Box>
      {insp && (
        <Box data-name="card-inspect-overlay" onClick={hCloseInsp} style={S.cardInspectOverlay}>
          <Box data-name="card-inspect-card" onClick={(e) => e.stopPropagation()} style={S.cardInspectCard}>
            <CardTemplate card={{ id: (insp.card as any).id || "", name: (insp.card as any).name || "", type: (insp.card as any).type || "numen", cardType: (insp.card as any).cardType || "", description: (insp.card as any).description || "", art: (insp.card as any).art || "", family: (insp.card as any).family, rarity: (insp.card as any).rarity, level: (insp.card as any).level, nature: (insp.card as any).nature, attack: (insp.card as any).attack, defense: (insp.card as any).defense, mana: (insp.card as any).mana, triggers: (insp.card as any).triggers }} size="xl" artImage={getArt((insp.card as any).art)} />
            {insp.isSM && insp.opid === cp && <Button size="sm" onClick={hCastSet} styles={{ root: { backgroundColor: colors.Green_5 } }}>Cast</Button>}
          </Box>
        </Box>
      )}
      {place && <POverlay card={place.card} onClose={() => setPlace(null)} onPlace={hPlaceN} onCast={hCastM} onSet={hSetM} mode={place.card.type === "numen" ? "numen" : "incantation"} />}
      {gs.gameActive === false && gs.winner && (
        <Box data-name="game-over-overlay" style={S.gameOverOverlay}>
          <Box data-name="game-over-dialog" style={S.gameOverDialog}>
            <Text c={colors.Orange_7} size="xl" fw={700}>Game Over!</Text>
            <Text c={colors.White_1} size="lg">{gs.winner === "player1" ? "Player 1" : "Player 2"} Wins!</Text>
            <Button onClick={quitGame} styles={{ root: { backgroundColor: colors.Blue_5 } }}>Back to Menu</Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GameBoard;