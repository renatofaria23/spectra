import React from 'react';
import { Box } from '@mantine/core';
import colors from '../../../styles/Colors';
import * as styles from './RaritySymbol.css.ts';

interface RaritySymbolProps {
  rarity: string;
  size?: number;
  borderColor?: string;
}

const CommonDiamond = ({ size, borderColor }: { size: number; borderColor: string }) => {
  const b = borderColor || colors.Gray_5;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="commonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.Gray_6} />
          <stop offset="100%" stopColor={colors.Gray_3} />
        </linearGradient>
      </defs>
      <polygon
        points={`${size / 2},2 ${size - 2},${size / 2} ${size / 2},${size - 2} 2,${size / 2}`}
        fill="none"
        stroke={b}
        strokeWidth="2"
      />
      <polygon
        points={`${size / 2},${size / 4} ${size / 4},${size / 2} ${size / 2},${size * 0.75} ${size * 0.75},${size / 2}`}
        fill="url(#commonGrad)"
        opacity="0.8"
        stroke={b}
        strokeWidth="1"
      />
    </svg>
  );
};

const RareHexagon = ({ size, borderColor }: { size: number; borderColor: string }) => {
  const b = borderColor || colors.Gray_5;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="rareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.Blue_10} />
          <stop offset="100%" stopColor={colors.Blue_3} />
        </linearGradient>
      </defs>
      <polygon
        points={`${size / 2},1 ${size - 3},${size / 4} ${size - 3},${size * 0.75} ${size / 2},${size - 1} 3,${size * 0.75} 3,${size / 4}`}
        fill="none"
        stroke={b}
        strokeWidth="2"
      />
      <polygon
        points={`${size / 2},${size / 4} ${size * 0.75},${size / 2} ${size / 2},${size * 0.75} ${size * 0.25},${size / 2}`}
        fill="url(#rareGrad)"
        opacity="0.9"
        stroke={b}
        strokeWidth="1"
      />
    </svg>
  );
};

const LegendaryStar = ({ size, borderColor }: { size: number; borderColor: string }) => {
  const b = borderColor || colors.Gray_5;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="legendaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.Orange_3} />
          <stop offset="50%" stopColor={colors.Yellow_1} />
          <stop offset="100%" stopColor={colors.Orange_1} />
        </linearGradient>
      </defs>
      <polygon
        points={generateStarPoints(size / 2, size / 2, size / 2.5, size / 4, 5)}
        fill="url(#legendaryGrad)"
        stroke={b}
        strokeWidth="1.5"
        opacity="0.95"
      />
      <polygon
        points={generateStarPoints(size / 2, size / 2, size / 3.5, size / 6, 5)}
        fill={colors.Yellow_1}
        opacity="0.8"
      />
    </svg>
  );
};

const MythicCrown = ({ size, borderColor }: { size: number; borderColor: string }) => {
  const b = borderColor || colors.Gray_5;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="mythicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.Red_5} />
          <stop offset="50%" stopColor={colors.Orange_2} />
          <stop offset="100%" stopColor={colors.Red_3} />
        </linearGradient>
      </defs>
      <path
        d={`M${size * 0.1},${size * 0.65} L${size * 0.1},${size * 0.45} L${size * 0.25},${size * 0.55} L${size * 0.35},${size * 0.25} L${size * 0.5},${size * 0.5} L${size * 0.65},${size * 0.25} L${size * 0.75},${size * 0.55} L${size * 0.9},${size * 0.45} L${size * 0.9},${size * 0.65} Z`}
        fill="url(#mythicGrad)"
        stroke={b}
        strokeWidth="1.5"
        opacity="0.95"
      />
      <circle cx={size * 0.35} cy={size * 0.25} r={1.5} fill={colors.Yellow_1} />
      <circle cx={size * 0.5} cy={size * 0.5} r={1.5} fill={colors.Yellow_1} />
      <circle cx={size * 0.65} cy={size * 0.25} r={1.5} fill={colors.Yellow_1} />
      <rect x={size * 0.15} y={size * 0.7} width={size * 0.7} height={size * 0.08} rx={1} fill={colors.Orange_4} opacity="0.8" />
    </svg>
  );
};

function generateStarPoints(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const result: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    result.push(`${x},${y}`);
  }
  return result.join(' ');
}

export const RaritySymbol = React.memo(({ rarity, size = 16, borderColor }: RaritySymbolProps) => {
  const rarityKey = rarity?.toLowerCase() || 'common';
  const border = borderColor || colors.Gray_5;

  const renderSymbol = () => {
    switch (rarityKey) {
      case 'mythic':
        return <MythicCrown size={size} borderColor={border} />;
      case 'legendary':
        return <LegendaryStar size={size} borderColor={border} />;
      case 'rare':
        return <RareHexagon size={size} borderColor={border} />;
      default:
        return <CommonDiamond size={size} borderColor={border} />;
    }
  };

  return (
    <Box
      data-name="rarity-symbol-root"
      style={styles.raritySymbolRoot}
    >
      {renderSymbol()}
    </Box>
  );
});

RaritySymbol.displayName = 'RaritySymbol';

export default RaritySymbol;