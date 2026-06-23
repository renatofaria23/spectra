import React from 'react';
import { motion } from 'framer-motion';
import { Box, Text } from '@mantine/core';
import colors from '../../../styles/Colors';
import * as styles from './CardSpot.css.ts';

interface CardSpotProps {
  x?: number;
  y?: number;
  width?: string;
  height?: string;
  text?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  selectedBorder?: string | null;
  selected?: boolean;
  card?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  absolutePositioning?: boolean;
  ringColor?: string;
  additionalStyle?: Record<string, any>;
}

const SIZE_VARIANTS = {
  xs: { width: '6vw', height: '12vh' },
  sm: { width: '10vw', height: '20vh' },
  md: { width: '15vw', height: '30vh' },
  lg: { width: '24vw', height: '48vh' },
};

const createRings = (zoneColor: string) => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.spotOverlay}>
    {Array.from({ length: 8 }, (_, i) => {
      const p = i / 7;
      return (
        <circle key={i} cx="50" cy="50" r={5 + p * 42} fill="none" stroke={zoneColor} strokeWidth={4} strokeOpacity={0.6 * (1 - p)} />
      );
    })}
  </svg>
);

export const CardSpot = React.memo(
  ({
    x = 0,
    y = 0,
    width,
    height,
    text,
    ringColor,
    color = colors.Blue_3,
    backgroundColor = colors.Blue_7,
    borderColor = colors.Blue_8,
    selectedBorder = null,
    selected = false,
    card = null,
    children = null,
    onClick: handleClick,
    size = 'md',
    absolutePositioning = true,
    additionalStyle,
  }: CardSpotProps) => {
    const effectiveBorder = selectedBorder ?? color;
    const dimensions = width && height ? { width, height } : SIZE_VARIANTS[size] ?? SIZE_VARIANTS.md;

    return (
      <Box data-name="cardspot-root" onClick={handleClick} style={styles.spotRoot}>
        <div
          data-name="cardspot-wrapper"
          style={{
            ...styles.spotWrapper,
            ...styles.spotWrapperNoise,
            position: absolutePositioning ? 'absolute' : 'relative',
            ...(absolutePositioning ? { transform: 'translate(-50%, -50%)', left: `${x}%`, top: `${y}%` } : { width, height }),
            backgroundColor,
            cursor: handleClick ? 'pointer' : 'default',
            border: `1px solid ${selected ? effectiveBorder : borderColor}`,
            ...dimensions,
            ...(additionalStyle || {}),
          }}
        >
          {ringColor && createRings(ringColor)}
          <motion.div
            layoutId={text || ''}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: selected ? 1 : 1.02 }}
            whileTap={{ scale: selected ? 1 : 0.98 }}
            style={styles.spotContent as any}
          >
            {text && (
              <Box data-name="cardspot-text" style={styles.spotTextOverlay}>
                <Text c={color} size="xs" fw={700} style={styles.spotText}>{text}</Text>
              </Box>
            )}
            {card && !children
              ? React.isValidElement(card) && card.type === 'Card' && 'props' in card
                ? React.cloneElement(card as any, { style: styles.spotFallback })
                : <Box style={styles.spotFallback} />
              : null}
            {children && (
              <Box data-name="cardspot-child-wrapper" style={styles.spotChildWrapper}>
                {children}
              </Box>
            )}
            {!card && !children && !text && (
              <Text c={colors.White_1} size="lg" fw={900} style={styles.spotNumberText}>
                {String(y + 1).padStart(2, '0')}
              </Text>
            )}
          </motion.div>
        </div>
      </Box>
    );
  }
);

CardSpot.displayName = 'CardSpot';

export default CardSpot;