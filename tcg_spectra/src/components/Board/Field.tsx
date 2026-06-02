import React from 'react';
import { CardSpot } from './CardSpot';
import colors from '../../styles/Colors';

interface FieldProps {}

export const Field = React.memo(() => {
  const defaultSpotProps: Omit<React.ComponentProps<typeof CardSpot>, 'text'> = {
    color: colors.White_1,
    backgroundColor: colors.Brown_1,
    borderColor: colors.White_1,
    selectedBorder: colors.Teal_2,
    width: '4vw',
    height: '12vh',
    absolutePositioning: false,
  };

  const gradientColors = {
    monster: [colors.Orange_9, colors.Orange_10],
    extraDeck: [colors.Gray_7, colors.Gray_8],
    special: [colors.Green_4, colors.Green_5],
    exile: [colors.Purple_9, colors.Purple_10],
    graveyard: [colors.Gray_9, colors.Gray_10],
    magic: [colors.Blue_16, colors.Blue_17],
    deck: [colors.Brown_8, colors.Brown_9],
  } as const;

  const getGradientStyle = (zoneType: string) => {
    const [startColor, endColor] = gradientColors[zoneType as keyof typeof gradientColors];
    return {
      backgroundImage: `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`,
    };
  };

  const zoneOverrides = {
    monster: { backgroundColor: colors.Orange_1 },
    extraDeck: { backgroundColor: colors.Gray_1 },
    special: { backgroundColor: colors.Green_1 },
    exile: { backgroundColor: colors.Purple_1 },
    graveyard: { backgroundColor: colors.Gray_2 },
    magic: { backgroundColor: colors.Blue_1 },
    deck: { backgroundColor: colors.Brown_1 },
  } as const;

  type CardSpotPropsExtended = React.ComponentProps<typeof CardSpot> & { additionalStyle?: Record<string, any> };
  
  const createSpot = (text: string, spotType?: string) => {
    let resolvedType = spotType || 'normal';

    if (!spotType) {
      if (text === 'Extra Deck') resolvedType = 'extraDeck';
      else if (text === 'Graveyard') resolvedType = 'graveyard';
      else if (text === 'Exile') resolvedType = 'exile';
      else if (text === 'Deck') resolvedType = 'deck';
      else if (text.includes('Zone')) resolvedType = 'magic';
    }

    const zoneOverride = zoneOverrides[resolvedType as keyof typeof zoneOverrides] || {};
    
    let props = { ...defaultSpotProps, ...zoneOverride };
    let additionalStyle: Record<string, any> = {};

    if (resolvedType !== 'normal' && resolvedType !== undefined) {
      const gradientStyle = getGradientStyle(resolvedType);
      additionalStyle = { ...gradientStyle };
    }

    return <CardSpot key={`${props.width}-${props.height}`} text={text} {...(props as unknown as CardSpotPropsExtended)} additionalStyle={additionalStyle} />;
  };

const row2m = [
  createSpot('Deck'),
  ...Array.from({ length: 5 }, () => createSpot('Magic Zone')),
  createSpot('Graveyard'),
];

const row1m = [
  createSpot('Extra Deck'),
  ...Array.from({ length: 5 }, () => createSpot('Monster Zone', 'monster')),
  createSpot('Exile'),
];

const row3m = [
  createSpot('Special Zone', 'special'),
];

const row1 = [
  createSpot('Exile'),
  ...Array.from({ length: 5 }, () => createSpot('Monster Zone', 'monster')),
  createSpot('Extra Deck'),
];

const row2 = [
  createSpot('Graveyard'),
  ...Array.from({ length: 5 }, () => createSpot('Magic Zone')),
  createSpot('Deck'),
];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '1rem 0.25rem',
      boxSizing: 'border-box',
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '0.5rem',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {row2m}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '0.5rem',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {row1m}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '0.5rem',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {row3m}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '0.5rem',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {row1}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '0.5rem',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {row2}
      </div>
    </div>
  );
});

Field.displayName = 'Field';

export default Field;