import React from 'react';
import {
  IconFlame,
  IconMountain,
  IconDroplet,
  IconWind,
  IconSun,
  IconMoon,
} from '@tabler/icons-react';
import { Box } from '@mantine/core';
import colors from '../../../styles/Colors';
import * as styles from './NatureIcon.css.ts';

interface NatureIconProps {
  type: string;
  size?: number;
}

interface NatureConfig {
  icon: React.ReactNode;
  iconColor: string;
  borderColor: string;
  gradientStart: string;
  gradientEnd: string;
}

const NATURE_CONFIGS: Record<string, NatureConfig> = {
  fire: {
    icon: <IconFlame size={24} />,
    iconColor: colors.Fire_6,
    borderColor: colors.Fire_4,
    gradientStart: colors.Fire_2,
    gradientEnd: colors.Fire_7,
  },
  earth: {
    icon: <IconMountain size={24} />,
    iconColor: colors.Earth_6,
    borderColor: colors.Earth_5,
    gradientStart: colors.Earth_8,
    gradientEnd: colors.Earth_7,
  },
  water: {
    icon: <IconDroplet size={24} />,
    iconColor: colors.Water_6,
    borderColor: colors.Water_4,
    gradientStart: colors.Water_2,
    gradientEnd: colors.Water_7,
  },
  air: {
    icon: <IconWind size={24} />,
    iconColor: colors.Air_6,
    borderColor: colors.Air_4,
    gradientStart: colors.Air_2,
    gradientEnd: colors.Air_7,
  },
  light: {
    icon: <IconSun size={24} />,
    iconColor: colors.Light_6,
    borderColor: colors.Light_6,
    gradientStart: colors.Light_1,
    gradientEnd: colors.Light_3,
  },
  dark: {
    icon: <IconMoon size={24} />,
    iconColor: colors.Dark_6,
    borderColor: colors.Dark_4,
    gradientStart: colors.Dark_1,
    gradientEnd: colors.Dark_2,
  },
};

export const NatureIcon = React.memo((props: NatureIconProps) => {
  const { type, size = 48 } = props;
  const config = NATURE_CONFIGS[type.toLowerCase()];

  if (!config) {
    return null;
  }

  const octagonPath = (dimension: number): string => {
    const center = dimension / 2;
    const radius = dimension / 2 - 2;
    const points: string[] = [];

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i - Math.PI / 8;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }

    return points.join(' ');
  };

  return (
    <Box
      data-name="nature-icon-root"
      style={{
        ...styles.natureIconRoot,
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`gradient-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.gradientStart} />
            <stop offset="100%" stopColor={config.gradientEnd} />
          </linearGradient>
        </defs>
        <polygon
          points={octagonPath(size)}
          fill={`url(#gradient-${type})`}
          stroke={config.borderColor}
          strokeWidth={2}
        />
      </svg>
      <Box
        data-name="nature-icon-overlay"
        style={{
          ...styles.natureIconOverlay,
          color: config.iconColor,
          transform: `scale(${size / 48})`,
        }}
      >
        {config.icon}
      </Box>
    </Box>
  );
});

NatureIcon.displayName = 'NatureIcon';

export default NatureIcon;