import React, { useState, useCallback, useRef } from "react";
import { Box, Text, Button, Group, Badge } from "@mantine/core";
import { IconArrowBack } from "@tabler/icons-react";
import colors from "../../../styles/Colors";
import * as styles from './GameBoard.css.ts';
import useGameStore, { getCurrentPhaseName } from "../../../stores/gameStore";
import type { Card, FieldPosition } from "../../../logic/deckConstraints";
import { NatureIcon } from "../../Card/NatureIcon/NatureIcon";
import { CardTemplate } from "../../Card/CardTemplate/CardTemplate";

const FIELD_CARD_WIDTH = 60;
const FIELD_CARD_HEIGHT = 90;

const natureThemeMap: Record<string, string[]> = {
  fire: colors.FireTheme,
  water: colors.WaterTheme,
  earth: colors.EarthTheme,
  air: colors.AirTheme,
  light: colors.LightTheme,
  dark: colors.DarkTheme,
};

const getCardBackground = (card: Card): string => {
  const theme = natureThemeMap[(card as any).nature?.toLowerCase()];
  if (theme && theme.length >= 3) {
    return `linear-gradient(135deg, ${theme[1]}, ${theme[2]}, ${theme[3] || theme[2]})`;
  }
  if (card.type === "rite") {
    const c = colors.RiteTheme;
    return `linear-gradient(135deg, ${c[1] || colors.Green_7}, ${c[2] || colors.Green_8}, ${c[3] || colors.Green_9})`;
  }
  if (card.type === "ward") {
    const c = colors.WardTheme;
    return `linear-gradient(135deg, ${c[1] || colors.Red_8}, ${c[2] || colors.Red_9}, ${c[3] || colors.Red_10})`;
  }
  return colors.Gray_7;
};

const getArtUrl = (artName: string | undefined): string | null => {
  if (!artName) return null;
  return `/src/assets/art/${artName}`;
};

const getCardBorderColor = (card: Card): string => {
  const theme = natureThemeMap[(card as any).nature?.toLowerCase()];
  if (theme) return theme[2] ?? theme[0] ?? colors.Gray_5;
  if (card.type === "rite") return colors.Green_6;
  if (card.type === "ward") return colors.Red_9;
  return colors.Gray_5;
};

interface DragState {
  card: Card | null;
  handPlayerId: string | null;
  offset: { x: number; y: number };
  startPos: { x: number; y: number };
  cursorPos: { x: number; y: number };
  isDragging: boolean;
}

interface PlacementTarget {
  slotIndex: number;
  zone: "numen" | "magic";
  playerId: string;
}

const FieldCard: React.FC<{
  card: Card;
  uid: string;
  isSelected: boolean;
  onSelect: () => void;
  onInspect: (card: Card, isSetMagic?: boolean, ownerPlayerId?: string, slotIndex?: number) => void;
  isFaceDown: boolean;
  onFlip?: () => void;
  isDefensePosition: boolean;
}> = ({ card, uid, isSelected, onSelect, onInspect, isFaceDown, onFlip, isDefensePosition }) => {
  const bg = isFaceDown ? colors.Gray_9 : getCardBackground(card);
  const borderColor = isFaceDown ? colors.Gray_5 : getCardBorderColor(card);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInspect(card);
  };

  const getTransform = () => {
    const scale = isHovered ? "scale(1.2)" : "scale(1)";
    const rotate = isDefensePosition ? "rotate(90deg)" : "none";
    return `${rotate} ${scale}`;
  };

  return (
    <Box
      data-name="field-card-wrapper"
      onClick={handleClick}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.fieldCardWrapper,
        border: `2px solid ${isSelected ? colors.Red_5 : borderColor}`,
        background: bg,
        boxShadow: isSelected ? `0 0 10px ${colors.Red_5}88` : "none",
        transform: getTransform(),
        transition: "transform 0.2s ease",
        zIndex: isHovered ? 100 : 1,
      }}
    >
      {isFaceDown ? (
        <Box
          style={styles.cardContentArea}
        >
          <Text c={colors.Gray_5} size="xs" fw={700}>
            ?
          </Text>
        </Box>
      ) : (
        <Box
          style={{
            flex: 1,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {getArtUrl((card as any).art) ? (
            <img
              src={getArtUrl((card as any).art)!}
              alt="Card art"
              style={{
                width: "120%",
                height: "120%",
                objectFit: "cover",
              }}
            />
          ) : (
            <NatureIcon type={(card as any).nature || "dark"} size={30} />
          )}
        </Box>
      )}
    </Box>
  );
};

const EmptySlot: React.FC<{
  isHighlighted: boolean;
  zone: string;
  slotIndex: number;
  playerId: string;
}> = ({ isHighlighted, zone, slotIndex, playerId }) => (
  <Box
    data-name="empty-card-slot"
    data-slot-zone={zone}
    data-slot-index={slotIndex}
    data-slot-player={playerId}
    style={{
      ...styles.emptyCardSlot,
      backgroundColor: colors.Gray_8,
      border: `2px solid ${isHighlighted ? colors.Blue_11 : colors.Gray_6}`,
      boxShadow: isHighlighted ? `0 0 12px ${colors.Blue_11}88` : "none",
      transition: "border 0.15s ease, box-shadow 0.15s ease",
    }}
  />
);

const HAND_CARD_WIDTH = 60;
const HAND_CARD_HEIGHT = 90;

const HandCard: React.FC<{
  card: Card;
  onInspect: (card: Card) => void;
  onDragStart: (card: Card, startPos: { x: number; y: number }) => void;
  onDragMove: (offset: { x: number; y: number }) => void;
  onDragEnd: () => void;
  isDraggingThisCard: boolean;
  dragOffset: { x: number; y: number };
  canDrag: boolean;
}> = ({ card, onInspect, onDragStart, onDragMove, onDragEnd, isDraggingThisCard, dragOffset, canDrag }) => {
  const bg = getCardBackground(card);
  const borderColor = getCardBorderColor(card);
  const [isHovered, setIsHovered] = useState(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canDrag) return;
    const start = { x: e.clientX, y: e.clientY };
    startPosRef.current = start;
    onDragStart(card, start);

    const onMouseMove = (moveEvent: MouseEvent) => {
      onDragMove({
        x: moveEvent.clientX - start.x,
        y: moveEvent.clientY - start.y,
      });
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      onDragEnd();
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const hasMoved = canDrag && isDraggingThisCard && (Math.sqrt(dragOffset.x ** 2 + dragOffset.y ** 2) > 5);

  return (
    <Box
      data-name="hand-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      style={{
        ...styles.handCard,
        border: `1px solid ${borderColor}`,
        background: bg,
        cursor: canDrag ? "grab" : "pointer",
        transform: hasMoved
          ? `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(0.8)`
          : isDraggingThisCard && canDrag
            ? "scale(0.8)"
            : isHovered
              ? "scale(1.5)"
              : "scale(1)",
        transition: isDraggingThisCard && canDrag ? "none" : "transform 0.2s ease",
        zIndex: isDraggingThisCard && canDrag ? 9999 : isHovered ? 100 : 1,
        position: "relative",
        pointerEvents: isDraggingThisCard && canDrag ? "none" : "auto",
      }}
    >
      <Box
        style={styles.fieldCardFaceDown}
      >
        {getArtUrl((card as any).art) ? (
          <img
            src={getArtUrl((card as any).art)!}
            alt="Card art"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <NatureIcon type={(card as any).nature || "dark"} size={30} />
        )}
      </Box>
    </Box>
  );
};

const ZoneRow: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => (
  <Box
    data-name="zone-row"
    style={styles.zoneRow}
  >
    {children}
  </Box>
);

const PlayerField: React.FC<{
  player: any;
  playerId: string;
  isCurrentPlayer: boolean;
  onToggleAttacker: (uid: string) => void;
  onToggleDefender: (uid: string) => void;
  selectedAttackers: string[];
  selectedDefender: string | null;
  onInspect: (card: Card, isSetMagic?: boolean, ownerPlayerId?: string, slotIndex?: number) => void;
  dragState: DragState;
  onDropOnSlot: (target: PlacementTarget) => void;
  onFlipMagic: (playerId: string, slotIndex: number) => void;
  mirrored: boolean;
}> = ({
  player,
  playerId,
  isCurrentPlayer,
  onToggleAttacker,
  onToggleDefender,
  selectedAttackers,
  selectedDefender,
  onInspect,
  dragState,
  onDropOnSlot,
  onFlipMagic,
  mirrored,
}) => {
  const handleCardClick = (card: Card, uid: string) => {
    if (isCurrentPlayer) {
      onToggleAttacker(uid);
    } else {
      onToggleDefender(uid);
    }
  };

  const numenSlots = 5;
  const magicSlots = 5;

  const isDragging = dragState.isDragging && dragState.card !== null;
  const draggedCardType = isDragging ? dragState.card!.type : null;

  const getHighlighted = useCallback((zone: string, idx: number): boolean => {
    if (!isDragging) return false;
    const el = document.elementFromPoint(dragState.cursorPos.x, dragState.cursorPos.y);
    if (!el) return false;
    const slotEl = el.closest("[data-slot-zone]");
    if (!slotEl) return false;
    const z = slotEl.getnature("data-slot-zone");
    const i = parseInt(slotEl.getnature("data-slot-index") || "-1", 10);
    const p = slotEl.getnature("data-slot-player");
    if (z !== zone || i !== idx || p !== playerId) return false;
    if (zone === "numen" && draggedCardType !== "numen") return false;
    if (zone === "magic" && draggedCardType !== "rite" && draggedCardType !== "ward") return false;
    return true;
  }, [isDragging, dragState.cursorPos, draggedCardType, playerId]);

  const handleFlipMagic = (slotIndex: number) => {
    onFlipMagic(playerId, slotIndex);
  };

  return (
    <Box
      data-name="player-field"
      style={{
        ...styles.playerField,
        flexDirection: mirrored ? "column-reverse" : "column",
        backgroundColor: isCurrentPlayer
          ? "rgba(59, 130, 246, 0.05)"
          : "rgba(0,0,0,0.1)",
        border: `1px solid ${isCurrentPlayer ? colors.Blue_5 : colors.Gray_6}`,
      }}
    >
      {mirrored ? (
        <>
          <ZoneRow data-name="magic-zone-row">
            {Array.from({ length: magicSlots }).map((_, i) => {
              const rite = player.fieldRites[i];
              const ward = player.fieldWards[i];
              const card = rite || ward;
              const isFaceDown = card ? !!(card as any).isFaceDown : false;

              if (!card) {
                return (
                  <Box key={`s${i}`} data-name={`magic-slot-${i}`}>
                    <EmptySlot isHighlighted={getHighlighted("magic", i)} zone="magic" slotIndex={i} playerId={playerId} />
                  </Box>
                );
              }

              return (
                <Box key={`s${i}`} data-name={`magic-slot-${i}`}>
                  <FieldCard
                    card={card}
                    uid={(card as any).uid || `spell_${i}`}
                    isSelected={false}
                    onSelect={() => {}}
                    onInspect={() => {
                      if (isFaceDown) {
                        onInspect(card, true, playerId, i);
                      } else {
                        onInspect(card);
                      }
                    }}
                    isFaceDown={isFaceDown}
                    isDefensePosition={false}
                  />
                </Box>
              );
            })}
          </ZoneRow>
          <ZoneRow data-name="numen-zone-row">
            {Array.from({ length: numenSlots }).map((_, i) => {
              const numen = player.fieldNumina[i];
              const uid = numen ? (numen as any).uid || `field_${i}` : null;
              const isSelectedAttacker = uid
                ? selectedAttackers.includes(uid)
                : false;
              const isSelectedDefender = uid ? selectedDefender === uid : false;
              const numenPosition = uid ? player.numenPositions[uid] : null;
              const isDefensePosition = numenPosition === "defense";

              if (!numen) {
                return (
                  <Box key={`n${i}`} data-name={`numen-slot-${i}`}>
                    <EmptySlot isHighlighted={getHighlighted("numen", i)} zone="numen" slotIndex={i} playerId={playerId} />
                  </Box>
                );
              }

              return (
                <Box key={`n${i}`} data-name={`numen-slot-${i}`}>
                  <FieldCard
                    card={numen}
                    uid={uid}
                    isSelected={isSelectedAttacker || isSelectedDefender}
                    onSelect={() => handleCardClick(numen, uid)}
                    onInspect={onInspect}
                    isFaceDown={false}
                    isDefensePosition={isDefensePosition}
                  />
                </Box>
              );
            })}
          </ZoneRow>
        </>
      ) : (
        <>
          <ZoneRow data-name="numen-zone-row">
            {Array.from({ length: numenSlots }).map((_, i) => {
              const numen = player.fieldNumina[i];
              const uid = numen ? (numen as any).uid || `field_${i}` : null;
              const isSelectedAttacker = uid
                ? selectedAttackers.includes(uid)
                : false;
              const isSelectedDefender = uid ? selectedDefender === uid : false;
              const numenPosition = uid ? player.numenPositions[uid] : null;
              const isDefensePosition = numenPosition === "defense";

              if (!numen) {
                return (
                  <Box key={`n${i}`} data-name={`numen-slot-${i}`}>
                    <EmptySlot isHighlighted={getHighlighted("numen", i)} zone="numen" slotIndex={i} playerId={playerId} />
                  </Box>
                );
              }

              return (
                <Box key={`n${i}`} data-name={`numen-slot-${i}`}>
                  <FieldCard
                    card={numen}
                    uid={uid}
                    isSelected={isSelectedAttacker || isSelectedDefender}
                    onSelect={() => handleCardClick(numen, uid)}
                    onInspect={onInspect}
                    isFaceDown={false}
                    isDefensePosition={isDefensePosition}
                  />
                </Box>
              );
            })}
          </ZoneRow>
          <ZoneRow data-name="magic-zone-row">
            {Array.from({ length: magicSlots }).map((_, i) => {
              const rite = player.fieldRites[i];
              const ward = player.fieldWards[i];
              const card = rite || ward;
              const isFaceDown = card ? !!(card as any).isFaceDown : false;

              if (!card) {
                return (
                  <Box key={`s${i}`} data-name={`magic-slot-${i}`}>
                    <EmptySlot isHighlighted={getHighlighted("magic", i)} zone="magic" slotIndex={i} playerId={playerId} />
                  </Box>
                );
              }

              return (
                <Box key={`s${i}`} data-name={`magic-slot-${i}`}>
                  <FieldCard
                    card={card}
                    uid={(card as any).uid || `spell_${i}`}
                    isSelected={false}
                    onSelect={() => {}}
                    onInspect={() => {
                      if (isFaceDown) {
                        onInspect(card, true, playerId, i);
                      } else {
                        onInspect(card);
                      }
                    }}
                    isFaceDown={isFaceDown}
                    isDefensePosition={false}
                  />
                </Box>
              );
            })}
          </ZoneRow>
        </>
      )}
    </Box>
  );
};

const NatureScalingBadge: React.FC<{
  nature: string;
  label: string;
  value: string;
  themeColors: string[];
}> = ({ nature, label, value, themeColors }) => {
  const bg = themeColors[4] ?? themeColors[2] ?? colors.Gray_6;
  const textColor = nature === "light" || nature === "air" ? colors.Gray_9 : colors.White_1;

  return (
    <Badge
      data-name={`nature-badge-${nature}`}
      size="xs"
      style={{
        backgroundColor: bg,
        color: textColor,
        fontSize: "9px",
        padding: "2px 6px",
        whiteSpace: "nowrap",
      }}
    >
      {label}: {value}
    </Badge>
  );
};

const PlayerInfoBar: React.FC<{
  player: any;
  playerId: string;
  isActive: boolean;
}> = ({ player, playerId, isActive }) => {
  const isP1 = playerId === "player1";
  const scaling = player.natureScaling;

  const natureBadges = [
    {
      nature: "light",
      label: "Light",
      value: `+${scaling.light.manaGainBonus} MG`,
      theme: colors.LightTheme,
    },
    {
      nature: "dark",
      label: "Dark",
      value: `+${scaling.dark.handSizeBonus} HS`,
      theme: colors.DarkTheme,
    },
    {
      nature: "fire",
      label: "Fire",
      value: `+${scaling.fire.damageBonus} DMG`,
      theme: colors.FireTheme,
    },
    {
      nature: "water",
      label: "Water",
      value: `+${scaling.water.hpRegenBonus} HPR`,
      theme: colors.WaterTheme,
    },
    {
      nature: "earth",
      label: "Earth",
      value: `+${scaling.earth.hpBonus} HP`,
      theme: colors.EarthTheme,
    },
    {
      nature: "air",
      label: "Air",
      value: `+${scaling.air.extraInvokes} NS`,
      theme: colors.AirTheme,
    },
  ];

  return (
    <Group
      data-name="player-info-bar"
      justify="space-between"
      style={styles.playerInfoBar}
    >
      <Text c={colors.White_1} size="xs" fw={700}>
        {isP1 ? "Player 1" : "Player 2"}
        {isActive && (
          <Badge ml="xs" size="xs" color="blue">
            ACTIVE
          </Badge>
        )}
      </Text>
      <Group data-name="nature-scaling-group" gap="4px" justify="center">
        {natureBadges.map((badge) => (
          <NatureScalingBadge
            key={badge.nature}
            nature={badge.nature}
            label={badge.label}
            value={badge.value}
            themeColors={badge.theme}
          />
        ))}
      </Group>
      <Group data-name="player-stats-group" gap="sm">
        <Group data-name="player-mana-group" gap="4px" align="center">
          <Text c={colors.Blue_11} size="xs" fw={600}>
            MANA
          </Text>
          <Text c={colors.White_1} size="xs" fw={700}>
            {player.currentMana}
          </Text>
        </Group>
        <Group data-name="player-lp-group" gap="4px" align="center">
          <Text c={colors.Red_1} size="xs" fw={600}>
            LP
          </Text>
          <Text c={colors.White_1} size="xs" fw={700}>
            {player.currentHP}
          </Text>
        </Group>
      </Group>
    </Group>
  );
};

const PlacementOverlay: React.FC<{
  card: Card;
  onClose: () => void;
  onPlace: (position: FieldPosition) => void;
  onCast: () => void;
  onSet: () => void;
  mode: "numen" | "magic";
}> = ({ card, onClose, onPlace, onCast, onSet, mode }) => {
  const bg = getCardBackground(card);

  return (
    <Box
      data-name="placement-overlay"
      onClick={onClose}
      style={{
        ...styles.placementOverlay,
        backgroundColor: "rgba(0,0,0,0.6)",
        cursor: "pointer",
      }}
    >
      <Box
        data-name="placement-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          ...styles.placementDialog,
          animation: "fadeInScale 0.3s ease forwards",
        }}
      >
        <Box
          style={{
            ...styles.placementPreviewCard,
            background: bg,
            border: `2px solid ${getCardBorderColor(card)}`,
          }}
        >
          {getArtUrl((card as any).art) ? (
            <img
              src={getArtUrl((card as any).art)!}
              alt="Card art"
              style={styles.handCardImage}
            />
          ) : (
            <NatureIcon type={(card as any).nature || "dark"} size={60} />
          )}
        </Box>
        <Text c={colors.White_1} size="md" fw={700}>
          {card.name}
        </Text>
        <Group gap="md">
          {mode === "numen" ? (
            <>
              <Button
                size="sm"
                onClick={() => onPlace("attack")}
                styles={{ root: { backgroundColor: colors.Blue_5 } }}
              >
                Attack Position
              </Button>
              <Button
                size="sm"
                onClick={() => onPlace("defense")}
                styles={{ root: { backgroundColor: colors.Green_5 } }}
              >
                Defense Position
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                onClick={onCast}
                styles={{ root: { backgroundColor: colors.Green_5 } }}
              >
                Cast
              </Button>
              <Button
                size="sm"
                onClick={onSet}
                styles={{ root: { backgroundColor: colors.Gray_7 } }}
              >
                Set
              </Button>
            </>
          )}
        </Group>
      </Box>
    </Box>
  );
};

export const GameBoard = () => {
  const gameState = useGameStore((s) => s.gameState);
  const changePhase = useGameStore((s) => s.changePhase);
  const selectAttacker = useGameStore((s) => s.selectAttacker);
  const selectDefender = useGameStore((s) => s.selectDefender);
  const endTurn = useGameStore((s) => s.endTurn);
  const quitGame = useGameStore((s) => s.quitGame);
  const placeNumenFromHand = useGameStore((s) => s.placeNumenFromHand);
  const placeMagicFromHand = useGameStore((s) => s.placeMagicFromHand);
  const flipMagicFaceUp = useGameStore((s) => s.flipMagicFaceUp);

  const currentPlayer = gameState.currentPlayer;
  const player1 = gameState.player1;
  const player2 = gameState.player2;
  const phase = gameState.currentPhase;

  const [inspectedCard, setInspectedCard] = useState<{
    card: Card;
    isSetMagic: boolean;
    ownerPlayerId: string;
    slotIndex: number;
  } | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    card: null,
    handPlayerId: null,
    offset: { x: 0, y: 0 },
    startPos: { x: 0, y: 0 },
    cursorPos: { x: 0, y: 0 },
    isDragging: false,
  });
  const [dragStartPlayerId, setDragStartPlayerId] = useState<string | null>(null);

  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragCursorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragCardRef = useRef<Card | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [placementState, setPlacementState] = useState<{
    card: Card;
    target: PlacementTarget;
  } | null>(null);

  const handleInspect = useCallback((card: Card, isSetMagic = false, ownerPlayerId: string = currentPlayer, slotIndex = -1) => {
    setInspectedCard({ card, isSetMagic, ownerPlayerId, slotIndex });
  }, [currentPlayer]);

  const handleCloseInspect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setInspectedCard(null);
  }, []);

  const handleCastSetMagic = useCallback(() => {
    if (!inspectedCard) return;
    flipMagicFaceUp(inspectedCard.ownerPlayerId, inspectedCard.slotIndex);
    setInspectedCard(null);
  }, [inspectedCard, flipMagicFaceUp]);

  const handleDragStart = useCallback((card: Card, startPos: { x: number; y: number }) => {
    const handPlayer = currentPlayer === "player1" ? player1 : player2;
    dragCardRef.current = card;
    dragOffsetRef.current = { x: 0, y: 0 };
    dragCursorRef.current = { x: startPos.x, y: startPos.y };
    dragStartPosRef.current = startPos;
    setDragState({
      card,
      handPlayerId: handPlayer?.playerId || null,
      offset: { x: 0, y: 0 },
      startPos,
      cursorPos: { x: startPos.x, y: startPos.y },
      isDragging: true,
    });
    setDragStartPlayerId(handPlayer?.playerId || null);
  }, [currentPlayer, player1, player2]);

  const handleDragMove = useCallback((offset: { x: number; y: number }) => {
    dragOffsetRef.current = offset;
    const absCursor = {
      x: dragStartPosRef.current.x + offset.x,
      y: dragStartPosRef.current.y + offset.y,
    };
    dragCursorRef.current = absCursor;
    setDragState((prev: DragState) => ({
      ...prev,
      offset,
      cursorPos: absCursor,
    }));
  }, []);

  const handleDragEnd = useCallback(() => {
    const offset = dragOffsetRef.current;
    const card = dragCardRef.current;
    const cursorPos = dragCursorRef.current;
    const moved = card !== null
      ? Math.sqrt(offset.x ** 2 + offset.y ** 2) > 5
      : false;

    if (!moved && card) {
      handleInspect(card);
    }

    if (moved && card) {
      const el = document.elementFromPoint(cursorPos.x, cursorPos.y);
      if (el) {
        const slotEl = el.closest("[data-slot-zone]");
        if (slotEl) {
          const zone = slotEl.getnature("data-slot-zone");
          const slotIndex = parseInt(slotEl.getnature("data-slot-index") || "-1", 10);
          const targetPlayerId = slotEl.getnature("data-slot-player");

          if (zone === "numen" && slotIndex >= 0 && targetPlayerId && card.type === "numen") {
            setPlacementState({ card, target: { slotIndex, zone: "numen", playerId: targetPlayerId } });
          } else if (zone === "magic" && slotIndex >= 0 && targetPlayerId && (card.type === "rite" || card.type === "ward")) {
            setPlacementState({ card, target: { slotIndex, zone: "magic", playerId: targetPlayerId } });
          }
        }
      }
    }

    dragCardRef.current = null;
    dragOffsetRef.current = { x: 0, y: 0 };
    dragCursorRef.current = { x: 0, y: 0 };
    setDragState({
      card: null,
      handPlayerId: null,
      offset: { x: 0, y: 0 },
      startPos: { x: 0, y: 0 },
      cursorPos: { x: 0, y: 0 },
      isDragging: false,
    });
    setDragStartPlayerId(null);
  }, [handleInspect]);

  const handleDropOnSlot = useCallback((target: PlacementTarget) => {
    if (!dragState.card || !dragState.isDragging) return;

    const card = dragState.card;
    const draggedDistance = Math.sqrt(dragState.offset.x ** 2 + dragState.offset.y ** 2);
    if (draggedDistance <= 5) return;

    if (card.type === "numen" && target.zone === "numen") {
      setPlacementState({ card, target });
    } else if ((card.type === "rite" || card.type === "ward") && target.zone === "magic") {
      setPlacementState({ card, target });
    }

    setDragState({
      card: null,
      handPlayerId: null,
      offset: { x: 0, y: 0 },
      startPos: { x: 0, y: 0 },
      cursorPos: { x: 0, y: 0 },
      isDragging: false,
    });
    setDragStartPlayerId(null);
  }, [dragState]);

  const handlePlaceNumen = useCallback((position: FieldPosition) => {
    if (!placementState) return;
    const { card, target } = placementState;
    placeNumenFromHand(target.playerId, card.id, target.slotIndex, position);
    setPlacementState(null);
  }, [placementState, placeNumenFromHand]);

  const handleCastMagic = useCallback(() => {
    if (!placementState) return;
    const { card, target } = placementState;
    placeMagicFromHand(target.playerId, card.id, target.slotIndex, false);
    setPlacementState(null);
  }, [placementState, placeMagicFromHand]);

  const handleSetMagic = useCallback(() => {
    if (!placementState) return;
    const { card, target } = placementState;
    placeMagicFromHand(target.playerId, card.id, target.slotIndex, true);
    setPlacementState(null);
  }, [placementState, placeMagicFromHand]);

  const handleFlipMagic = useCallback((playerId: string, slotIndex: number) => {
    flipMagicFaceUp(playerId, slotIndex);
  }, [flipMagicFaceUp]);

  if (!player1 || !player2) {
    return (
      <Box
        data-name="no-game-state"
        style={styles.noGameStateMessage}
      >
        <Text c={colors.Gray_3}>No active game</Text>
      </Box>
    );
  }

  const p1Hand = player1.hand || [];
  const p2Hand = player2.hand || [];

  return (
    <Box
      data-name="game-board-root"
      style={styles.gameBoardRoot}
    >
      <Box
        data-name="main-board-area"
        style={{
          ...styles.mainBoardArea,
          filter: inspectedCard || placementState ? "blur(8px)" : "none",
          transition: "filter 0.3s ease",
          pointerEvents: inspectedCard || placementState ? "none" : "auto",
        }}
      >
        <Box
          data-name="left-sidebar"
          style={styles.leftSidebar}
        ></Box>

        <Box
          data-name="center-board"
          style={styles.centerBoard}
        >
          <Box
            data-name="p2-hand"
            style={styles.handRow}
          >
            {p2Hand.map((card: Card, idx: number) => (
              <HandCard
                key={idx}
                card={card}
                onInspect={handleInspect}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                isDraggingThisCard={dragState.card === card}
                dragOffset={dragState.card === card ? dragState.offset : { x: 0, y: 0 }}
                canDrag={currentPlayer === "player2"}
              />
            ))}
          </Box>

          <PlayerInfoBar
            player={player2}
            playerId="player2"
            isActive={currentPlayer === "player2"}
          />

          <PlayerField
            player={player2}
            playerId="player2"
            isCurrentPlayer={currentPlayer === "player2"}
            onToggleAttacker={
              currentPlayer === "player2" ? selectAttacker : () => {}
            }
            onToggleDefender={
              currentPlayer === "player1" ? selectDefender : () => {}
            }
            selectedAttackers={
              currentPlayer === "player2" ? gameState.selectedAttackers : []
            }
            selectedDefender={
              currentPlayer === "player2" ? gameState.selectedDefender : null
            }
            onInspect={handleInspect}
            dragState={dragState}
            onDropOnSlot={handleDropOnSlot}
            onFlipMagic={handleFlipMagic}
            mirrored={true}
          />

          <Group
            data-name="center-controls"
            justify="center"
            gap="xs"
            style={styles.centerControls}
          >
            <Button
              size="xs"
              onClick={changePhase}
              styles={{ root: { backgroundColor: colors.Blue_5 } }}
            >
              Next Phase
            </Button>
            <Text c={colors.Orange_7} size="xs" fw={700}>
              TURN {gameState.turnNumber}
            </Text>
            <Badge
              data-name="phase-badge"
              size="xs"
              style={{ backgroundColor: colors.Blue_5 }}
            >
              {getCurrentPhaseName(phase)}
            </Badge>
            <Button
              size="xs"
              onClick={endTurn}
              styles={{ root: { backgroundColor: colors.Orange_7 } }}
            >
              End Turn
            </Button>
          </Group>

          <PlayerField
            player={player1}
            playerId="player1"
            isCurrentPlayer={currentPlayer === "player1"}
            onToggleAttacker={
              currentPlayer === "player1" ? selectAttacker : () => {}
            }
            onToggleDefender={
              currentPlayer === "player2" ? selectDefender : () => {}
            }
            selectedAttackers={
              currentPlayer === "player1" ? gameState.selectedAttackers : []
            }
            selectedDefender={
              currentPlayer === "player1" ? gameState.selectedDefender : null
            }
            onInspect={handleInspect}
            dragState={dragState}
            onDropOnSlot={handleDropOnSlot}
            onFlipMagic={handleFlipMagic}
            mirrored={false}
          />

          <PlayerInfoBar
            player={player1}
            playerId="player1"
            isActive={currentPlayer === "player1"}
          />

          <Box
            data-name="p1-hand"
            style={styles.handRow}
          >
            {p1Hand.map((card: Card, idx: number) => (
              <HandCard
                key={idx}
                card={card}
                onInspect={handleInspect}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                isDraggingThisCard={dragState.card === card}
                dragOffset={dragState.card === card ? dragState.offset : { x: 0, y: 0 }}
                canDrag={currentPlayer === "player1"}
              />
            ))}
          </Box>
        </Box>

        <Box
          data-name="right-sidebar"
          style={styles.rightSidebar}
        >
          <Button
            size="xs"
            onClick={quitGame}
            styles={{ root: { backgroundColor: colors.Red_10 } }}
          >
            <IconArrowBack size={12} />
          </Button>
        </Box>
      </Box>

      {inspectedCard && (
        <Box
          data-name="card-inspect-overlay"
          onClick={handleCloseInspect}
          style={styles.cardInspectOverlay}
        >
          <Box
            data-name="card-inspect-card"
            onClick={(e) => e.stopPropagation()}
            style={styles.cardInspectCard}
          >
            <CardTemplate
              card={{
                id: (inspectedCard.card as any).id || "",
                name: (inspectedCard.card as any).name || "",
                type: (inspectedCard.card as any).type || "numen",
                cardType: (inspectedCard.card as any).cardType || "",
                description: (inspectedCard.card as any).description || "",
                art: (inspectedCard.card as any).art || "",
                family: (inspectedCard.card as any).family,
                rarity: (inspectedCard.card as any).rarity,
                level: (inspectedCard.card as any).level,
                nature: (inspectedCard.card as any).nature,
                attack: (inspectedCard.card as any).attack,
                defense: (inspectedCard.card as any).defense,
                mana: (inspectedCard.card as any).mana,
                triggers: (inspectedCard.card as any).triggers,
              }}
              size="xl"
              artImage={getArtUrl((inspectedCard.card as any).art)}
            />
            {inspectedCard.isSetMagic && inspectedCard.ownerPlayerId === currentPlayer && (
              <Button
                size="sm"
                onClick={handleCastSetMagic}
                styles={{ root: { backgroundColor: colors.Green_5 } }}
              >
                Cast
              </Button>
            )}
          </Box>
        </Box>
      )}

      {placementState && (
        <PlacementOverlay
          card={placementState.card}
          onClose={() => setPlacementState(null)}
          onPlace={handlePlaceNumen}
          onCast={handleCastMagic}
          onSet={handleSetMagic}
          mode={placementState.card.type === "numen" ? "numen" : "magic"}
        />
      )}

      {gameState.gameActive === false && gameState.winner && (
        <Box
          data-name="game-over-overlay"
          style={styles.gameOverOverlay}
        >
          <Box
            data-name="game-over-dialog"
            style={styles.gameOverDialog}
          >
            <Text c={colors.Orange_7} size="xl" fw={700}>
              Game Over!
            </Text>
            <Text c={colors.White_1} size="lg">
              {gameState.winner === "player1" ? "Player 1" : "Player 2"} Wins!
            </Text>
            <Button
              onClick={quitGame}
              styles={{ root: { backgroundColor: colors.Blue_5 } }}
            >
              Back to Menu
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GameBoard;