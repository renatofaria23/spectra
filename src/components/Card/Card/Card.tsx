import React from 'react';
import { Box, Badge, Group } from '@mantine/core';
import { IconFlame, IconDroplet, IconMountain, IconTornado, IconMoon, IconStar } from '@tabler/icons-react';
import {
  Blue_4, Blue_5, Blue_7, Gray_4, Gray_5, Blue_3, Orange_4, Orange_3, Gray_4 as CommonGray_4,
  White_1, Black_1, Beige_5, Orange_8, Teal_2, Yellow_1,
} from '../../../styles/Colors';

interface CardProps {
  card: unknown;
  onClick?: (card: unknown) => void;
  selected?: boolean;
  showStats?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const NATURE_ICONS_OBJ: Record<string, React.ReactNode> = {
  fire: <IconFlame size={14} />,
  water: <IconDroplet size={14} />,
  earth: <IconMountain size={14} />,
  air: <IconTornado size={14} />,
  light: <IconMoon size={14} />,
  dark: <IconStar size={14} />,
};

export const Card = React.memo(
  ({ card, onClick, selected = false, showStats = true, size = 'md' }: CardProps) => {
    if (!card) return null;

    const isNumen = (card as any).type === 'numen';
    const isFaceDown = (card as any).position === 'face_down';

    if (isFaceDown) {
      return (
        <Box
          className={`selected-card ${selected ? 'selected' : ''}`}
          onClick={() => onClick?.(card)}
          style={{
            background: 'linear-gradient(135deg, Blue_4, Blue_5)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: Gray_4,
             fontSize: '26px',
          }}
        >
          ?
        </Box>
      );
    }

    const getRarityColor = (rarity: any) => {
      if (rarity === 'common') return CommonGray_4;
      if (rarity === 'rare') return Blue_3;
      if (rarity === 'epic') return Orange_4;
      if (rarity === 'legendary') return Yellow_1;
      if (rarity === 'mythic') return Orange_3;
      return CommonGray_4;
    };

    const rarityColor = getRarityColor((card as any).rarity);

    const attrKey = ((card as any).nature || '').toLowerCase();
    const attrValue = attrKey;

    return (
      <Box
        className={`selected-card ${selected ? 'selected' : ''}`}
        onClick={() => onClick?.(card)}
      >
        <Box
          className="card-image"
          style={{
            background: isNumen
              ? `linear-gradient(135deg, Blue_7, Blue_5)`
              : 'linear-gradient(135deg, Blue_4, Blue_5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: Gray_5,
             fontSize: '14px',
          }}
        >
          {((card as any).name || '').length > 0 ? (
            <div style={{ textAlign: 'center' }}>
              {(card as any).name}
            </div>
          ) : null}
        </Box>

        <Box className="card-body" style={{ color: White_1 }}>
          <div className="card-title" style={{ color: White_1 }}>{(card as any).name || 'Unknown Card'}</div>

          {isNumen && showStats && (
            <Group justify="space-between" gap="xs">
              <Badge size="xs" color={attrValue}>
                {NATURE_ICONS_OBJ[attrKey] || NATURE_ICONS_OBJ['fire']}
              </Badge>
              <Box className="card-stats">
                <span>{(card as any).baseAttack || 0}</span>
                <span>{(card as any).baseDefense || 0}</span>
              </Box>
            </Group>
          )}

          {!isNumen && showStats && (
            <div style={{ fontSize: '10px', color: Gray_5 }}>
              {(card as any).riteType || (card as any).wardType || 'Unknown'}
            </div>
          )}
        </Box>

        {((card as any).rarity !== undefined) && (
          <Box
            className={`card-badge ${((card as any) as any).isMythic ? 'mythic-badge' : ''}`}
            style={{
              backgroundColor: ((card as any) as any).isMythic ? Orange_3 : rarityColor,
              color: ((card as any) as any).isMythic ? Black_1 : White_1,
            }}
          >
            {((card as any) as any).isMythic ? '★' : String(((card as any).rarity || '').charAt(0).toUpperCase())}
          </Box>
        )}

        {isNumen && (card as any).level !== undefined && (
          <Box
            style={{
              position: 'absolute',
              bottom: '4px',
              left: '4px',
              padding: '2px 6px',
              backgroundColor: Beige_5,
              color: Beige_5,
              fontSize: '12px',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            Lv {(card as any).level}
          </Box>
        )}

        {isNumen && (card as any).position && (card as any).position !== 'face_down' && (
          <Box
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              padding: '2px 6px',
  backgroundColor: (card as any).position === 'attack' ? Orange_8 : Teal_2,
              color: White_1,
              fontSize: '11px',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            {(card as any).position === 'attack' ? 'ATK' : 'DEF'}
          </Box>
        )}
      </Box>
    );
  }
);

Card.displayName = 'Card';

export default Card;