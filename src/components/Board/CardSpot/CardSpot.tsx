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

interface SIZE_VARIANTS {
  xs: { width: string; height: string };
  sm: { width: string; height: string };
  md: { width: string; height: string };
  lg: { width: string; height: string };
}

const SIZE_VARIANTS: SIZE_VARIANTS = {
  xs: { width: '6vw', height: '12vh' },
  sm: { width: '10vw', height: '20vh' },
  md: { width: '15vw', height: '30vh' },
  lg: { width: '24vw', height: '48vh' },
};

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
    const effectiveSelectedBorder = selectedBorder ?? color;
    const isSelected = selected;

    const positionStyle = absolutePositioning
      ? {
          left: `${x}%`,
          top: `${y}%`,
        }
      : {
          width,
          height,
        };

    const dimensions = width && height ? { width, height } : SIZE_VARIANTS[size] ?? SIZE_VARIANTS.md;

    const createRings = (zoneColor: string) => {
      const ringCount = 8;
      const rings: React.JSX.Element[] = [];

      for (let i = 0; i < ringCount; i++) {
        const progress = i / (ringCount - 1);
        const opacity = 0.6 * (1 - progress);

        rings.push(
          <circle
            key={`ring-${i}`}
            cx="50"
            cy="50"
            r={5 + progress * 42}
            fill="none"
            stroke={zoneColor}
            strokeWidth={4}
            strokeOpacity={opacity}
          />
        );
      }

      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.spotOverlay}>
          {rings}
        </svg>
      );
    };

    return (
      <Box data-name="cardspot-root" onClick={handleClick} style={styles.spotRoot}>
        <div
          data-name="cardspot-wrapper"
          style={{
            ...styles.spotWrapper,
            ...styles.spotWrapperNoise,
            position: absolutePositioning ? 'absolute' : 'relative',
            ...(absolutePositioning ? { transform: 'translate(-50%, -50%)' } : {}),
            backgroundColor,
            cursor: handleClick ? 'pointer' : 'default',
            border: `1px solid ${isSelected ? effectiveSelectedBorder : borderColor}`,
            ...positionStyle,
            ...dimensions,
            ...(additionalStyle || {}),
          }}
        >
          {ringColor && createRings(ringColor)}
          <motion.div
            layoutId={text || ''}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: isSelected ? 1 : 1.02 }}
            whileTap={{ scale: isSelected ? 1 : 0.98 }}
            style={styles.spotContent as any}
          >
            {text && (
              <Box data-name="cardspot-text" style={styles.spotTextOverlay}>
                <Text c={color} size="xs" fw={700} style={styles.spotText}>
                  {text}
                </Text>
              </Box>
            )}

            {card && !children ? (
              React.isValidElement(card) && card.type === 'Card' && 'props' in card
                ? React.cloneElement(card as any, { style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' } })
                : <Box style={styles.spotFallback} />
            ) : null}

            {children ? (
              <Box data-name="cardspot-child-wrapper" style={styles.spotChildWrapper}>
                {children}
              </Box>
            ) : null}

            {!card && !children && !text ? (
              <Text c={colors.White_1} size="lg" fw={900} style={styles.spotNumberText}>
                {String(y + 1).padStart(2, '0')}
              </Text>
            ) : null}
          </motion.div>
        </div>
      </Box>
    );
  }
);

CardSpot.displayName = 'CardSpot';

export default CardSpot;