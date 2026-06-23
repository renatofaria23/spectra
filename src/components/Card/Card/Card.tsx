import React from 'react';
import { Box, Badge, Group } from '@mantine/core';
import { IconFlame, IconDroplet, IconMountain, IconTornado, IconMoon, IconStar } from '@tabler/icons-react';
import { Gray_4, Blue_3, Orange_4, Yellow_1, Orange_3, White_1, Black_1 } from '../../../styles/Colors';
import * as S from './Card.css';

interface CardProps {
  card: unknown;
  onClick?: (card: unknown) => void;
  selected?: boolean;
  showStats?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const NATURE_ICONS: Record<string, React.ReactNode> = {
  fire: <IconFlame size={14} />,
  water: <IconDroplet size={14} />,
  earth: <IconMountain size={14} />,
  air: <IconTornado size={14} />,
  light: <IconMoon size={14} />,
  dark: <IconStar size={14} />,
};

const RARITY_COLOR: Record<string, string> = {
  common: Gray_4,
  rare: Blue_3,
  epic: Orange_4,
  legendary: Yellow_1,
  mythic: Orange_3,
};

export const Card = React.memo(
  ({ card, onClick, selected = false, showStats = true }: CardProps) => {
    if (!card) return null;

    const c = card as any;
    const isNumen = c.type === 'numen';
    const isFaceDown = c.position === 'face_down';

    if (isFaceDown) {
      return (
        <Box
          className={`selected-card ${selected ? 'selected' : ''}`}
          onClick={() => onClick?.(card)}
          style={S.faceDownCard}
        >
          ?
        </Box>
      );
    }

    const rarityColor = RARITY_COLOR[c.rarity] || Gray_4;
    const attrKey = (c.nature || '').toLowerCase();

    return (
      <Box
        className={`selected-card ${selected ? 'selected' : ''}`}
        onClick={() => onClick?.(card)}
      >
        <Box
          className="card-image"
          style={isNumen ? S.numenCardImage : S.defaultCardImage}
        >
          {c.name?.length > 0 && (
            <div style={S.cardImageText}>{c.name}</div>
          )}
        </Box>

        <Box className="card-body" style={S.cardBody}>
          <div className="card-title" style={S.cardTitle}>{c.name || 'Unknown Card'}</div>

          {isNumen && showStats && (
            <Group justify="space-between" gap="xs">
              <Badge size="xs" color={attrKey}>
                {NATURE_ICONS[attrKey] || NATURE_ICONS.fire}
              </Badge>
              <Box className="card-stats" style={S.cardStats}>
                <span>{c.baseAttack || 0}</span>
                <span>{c.baseDefense || 0}</span>
              </Box>
            </Group>
          )}

          {!isNumen && showStats && (
            <div style={S.nonNumenStats}>
              {c.riteType || c.wardType || 'Unknown'}
            </div>
          )}
        </Box>

        {c.rarity !== undefined && (
          <Box
            className={`card-badge ${c.isMythic ? 'mythic-badge' : ''}`}
            style={{
              ...S.cardBadge,
              backgroundColor: c.isMythic ? Orange_3 : rarityColor,
              color: c.isMythic ? Black_1 : White_1,
            }}
          >
            {c.isMythic ? '★' : String(c.rarity.charAt(0).toUpperCase())}
          </Box>
        )}

        {isNumen && c.level !== undefined && (
          <Box style={S.levelTag}>
            Lv {c.level}
          </Box>
        )}

        {isNumen && c.position && c.position !== 'face_down' && (
          <Box style={c.position === 'attack' ? S.positionTagAttack : S.positionTagDefense}>
            {c.position === 'attack' ? 'ATK' : 'DEF'}
          </Box>
        )}
      </Box>
    );
  }
);

Card.displayName = 'Card';
export default Card;