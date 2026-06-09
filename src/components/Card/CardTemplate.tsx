import React from 'react';
import { Box, Text } from '@mantine/core';
import { IconApiApp, IconTriangleInvertedFilled } from '@tabler/icons-react';
import colors from '../../styles/Colors';
import { NatureIcon } from './NatureIcon';
import type { TriggerEntry } from '../../logic/Triggers';

type CardType = 'numen' | 'rite' | 'ward';
type CardSize = 'xs' | 'sm' | 'md' | 'lg';

export interface CardData {
  id: string;
  name: string;
  type: CardType;
  cardType: string;
  description: string;
  art: string;
  family?: string;
  rarity?: string;
  level?: number;
  attribute?: string;
  attack?: number;
  defense?: number;
  mana?: number;
  triggers?: TriggerEntry[];
}

interface CardTemplateProps {
  card: CardData;
  size?: CardSize;
  style?: React.CSSProperties;
  artImage?: string | null;
}

const sizeDimensions: Record<CardSize, { width: number; height: number }> = {
  xs: { width: 50, height: 75 },
  sm: { width: 100, height: 150 },
  md: { width: 150, height: 225 },
  lg: { width: 200, height: 300 },
};

const attributeThemeMap: Record<string, string[]> = {
  fire: colors.FireTheme,
  water: colors.WaterTheme,
  earth: colors.EarthTheme,
  air: colors.AirTheme,
  light: colors.LightTheme,
  dark: colors.DarkTheme,
};

const rarityColorsMap: Record<string, string> = {
  common: colors.Gray_10,
  rare: colors.Blue_9,
  mythic: colors.Red_4,
};

const LIGHT_NATURES = ['air', 'light'];

const createPixelGradient = (colorStops: string[]) => {
  if (colorStops.length < 2) return colorStops[0] || colors.Gray_7;
  const stops = colorStops.map((c, i) => `${c} ${Math.round((i / (colorStops.length - 1)) * 100)}%`).join(', ');
  return `linear-gradient(315deg, ${stops})`;
};

interface CardTheme {
  border: string;
  borderGradient: string;
  background: string;
  backgroundGradient: string;
  sectionBg: string;
  sectionBgGradient: string;
  textColor: string;
}

const getNumenTheme = (attribute: string = 'dark'): CardTheme => {
  const theme = attributeThemeMap[attribute.toLowerCase()];
  if (!theme) {
    return {
      border: colors.Gray_7,
      borderGradient: colors.Gray_7,
      background: colors.Gray_8,
      backgroundGradient: colors.Gray_8,
      sectionBg: colors.Gray_7,
      sectionBgGradient: colors.Gray_7,
      textColor: colors.White_1,
    };
  }
  const isLightNature = LIGHT_NATURES.includes(attribute.toLowerCase());
  const c0 = theme[0] || colors.Gray_7;
  const c1 = theme[1] || c0;
  const c2 = theme[2] || c1;
  const c3 = theme[3] || c2;
  const c4 = theme[4] || c3;
  return {
    border: c2,
    borderGradient: createPixelGradient([c0, c1, c2, c3]),
    background: c3,
    backgroundGradient: createPixelGradient([c1, c2, c3, c4]),
    sectionBg: c1,
    sectionBgGradient: createPixelGradient([c0, c1, c2, c3]),
    textColor: isLightNature ? colors.Black_1 : colors.White_1,
  };
};

const getRiteTheme = (): CardTheme => {
  const theme = colors.RiteTheme;
  const c0 = theme[0] || colors.Green_10;
  const c1 = theme[1] || c0;
  const c2 = theme[2] || c1;
  const c3 = theme[3] || c2;
  const c4 = theme[4] || c3;
  return {
    border: c2,
    borderGradient: createPixelGradient([c0, c1, c2, c3]),
    background: c3,
    backgroundGradient: createPixelGradient([c1, c2, c3, c4]),
    sectionBg: c1,
    sectionBgGradient: createPixelGradient([c0, c1, c2, c3]),
    textColor: colors.White_1,
  };
};

const getWardTheme = (): CardTheme => {
  const theme = colors.WardTheme;
  const c0 = theme[0] || colors.Red_13;
  const c1 = theme[1] || c0;
  const c2 = theme[2] || c1;
  const c3 = theme[3] || c2;
  const c4 = theme[4] || c3;
  return {
    border: c2,
    borderGradient: createPixelGradient([c0, c1, c2, c3]),
    background: c3,
    backgroundGradient: createPixelGradient([c1, c2, c3, c4]),
    sectionBg: c1,
    sectionBgGradient: createPixelGradient([c0, c1, c2, c3]),
    textColor: colors.White_1,
  };
};

const getTheme = (cardType: CardType, attribute?: string): CardTheme => {
  if (cardType === 'numen') return getNumenTheme(attribute);
  if (cardType === 'rite') return getRiteTheme();
  return getWardTheme();
};

export const CardTemplate = React.memo(
  ({ card, size = 'lg', style, artImage: artImageProp }: CardTemplateProps) => {
    const dims = sizeDimensions[size];

    const isNumen = card.type === 'numen';
    const theme = getTheme(card.type, card.attribute);

    return (
      <Box
        data-name="card-outer-frame"
        style={{
          width: dims.width,
          height: dims.height,
          display: 'flex',
          flexDirection: 'column',
          background: theme.borderGradient,
          imageRendering: 'pixelated',
          borderRadius: '12px',
          ...style,
        }}
      >
        <Box
          data-name="left-border-spacer"
          style={{
            width: '2px',
            backgroundColor: colors.Gray_5,
            imageRendering: 'pixelated',
          }}
        />
        <Box
          data-name="card-main-content"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: theme.backgroundGradient,
            imageRendering: 'pixelated',
          }}
        >
           <Box
             data-name="top-spacer"
             style={{
               width: '1px',
               backgroundColor: colors.Gray_5,
               imageRendering: 'pixelated',
             }}
           />
          <Box
            data-name="level-bar-section"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '14px',
              padding: '2px 12px',
              background: theme.sectionBgGradient,
              width: '100%',
              boxSizing: 'border-box',
              imageRendering: 'pixelated',
            }}
          >
            {isNumen && card.level && (
              <Box
                data-name="level-icons-container"
                style={{
                  display: 'flex',
                  gap: '1px',
                  justifyContent: 'center',
                  width: `${Math.min(card.level * 10, 100)}%`,
                  imageRendering: 'pixelated',
                }}
              >
                {Array.from({ length: Math.min(card.level, 10) }).map((_, i) => (
                  <IconApiApp key={i} size={10} color={theme.textColor} />
                ))}
              </Box>
            )}
          </Box>

           <Box
             data-name="level-name-spacer"
             style={{
               height: '1px',
               backgroundColor: colors.Gray_5,
               imageRendering: 'pixelated',
             }}
           />
          <Box
            data-name="card-name-section"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '3px 12px',
              background: theme.sectionBgGradient,
              width: '100%',
              boxSizing: 'border-box',
              imageRendering: 'pixelated',
            }}
          >
            <Text
              c={theme.textColor}
              size="xs"
              fw={700}
              style={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
                textAlign: 'center',
              }}
            >
              {card.name}
            </Text>
          </Box>

           <Box
             data-name="name-art-spacer"
             style={{
               position: 'relative',
               zIndex: 5,
               width: '100%',
               height: '1px',
               backgroundColor: colors.Gray_5,
               alignSelf: 'center',
               imageRendering: 'pixelated',
             }}
           />
          <Box
            data-name="art-image-section"
            style={{
              position: 'relative',
              zIndex: 5,
              width: '170px',
              height: '170px',
              alignSelf: 'center',
              imageRendering: 'pixelated',
            }}
          >
            {artImageProp && (
              <img
                src={artImageProp}
                alt="Card art"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  imageRendering: 'pixelated',
                }}
              />
            )}
          </Box>

           <Box
             data-name="art-info-spacer"
             style={{
               height: '1px',
               backgroundColor: colors.Gray_5,
               width: '100%',
               imageRendering: 'pixelated',
             }}
           />
          <Box
            data-name="info-section"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: '22px',
              padding: '3px 6px',
              background: theme.sectionBgGradient,
              position: 'relative',
              zIndex: 1,
              imageRendering: 'pixelated',
            }}
          >
            {isNumen ? (
              <>
                <Text c={theme.textColor} size="7px" fw={500}>
                  {card.family ? card.family.charAt(0).toUpperCase() + card.family.slice(1) : card.cardType}
                </Text>
                <NatureIcon type={card.attribute || 'dark'} size={16} />
              </>
            ) : (
              <Box />
            )}
            <IconTriangleInvertedFilled
              size={12}
              color={card.rarity ? rarityColorsMap[card.rarity] : colors.Gray_10}
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
          </Box>

           <Box
             data-name="info-desc-spacer"
             style={{
               height: '1px',
               backgroundColor: colors.Gray_5,
               width: '100%',
               imageRendering: 'pixelated',
             }}
           />
          <Box
            data-name="description-outer-frame"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 0,
              backgroundColor: colors.Gray_5,
              imageRendering: 'pixelated',
            }}
          >
            <Box
              data-name="description-inner-bg"
              style={{
                width: '100%',
                height: '100%',
                background: theme.backgroundGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
               <Text
                 c={theme.textColor}
                 size="7px"
                 fw={400}
                 style={{
                   textAlign: 'center',
                  textOverflow: 'ellipsis',
                 }}
               >
                 {card.description.split('\n').map((line, i) => (
                   <span key={i}>
                     <span dangerouslySetInnerHTML={{ __html: line }} />
                     {i < card.description.split('\n').length - 1 && <br />}
                   </span>
                 ))}
               </Text>
            </Box>
          </Box>

           <Box
             data-name="desc-stats-spacer"
             style={{
               height: '1px',
               backgroundColor: colors.Gray_5,
               width: '100%',
               imageRendering: 'pixelated',
             }}
           />
          <Box
            data-name="stats-section"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '3px 20px',
              background: theme.sectionBgGradient,
              imageRendering: 'pixelated',
            }}
          >
            {isNumen ? (
              <>
                <Text c={theme.textColor} size="7px" fw={500} style={{ textAlign: 'left' }}>
                  ATK: {card.attack}
                </Text>
                <Text c={theme.textColor} size="7px" fw={500} style={{ textAlign: 'right' }}>
                  DEF: {card.defense}
                </Text>
              </>
            ) : (
              <>
                <Text c={colors.White_1} size="7px" fw={500}>
                  {card.cardType}
                </Text>
                <Text c={colors.White_1} size="7px" fw={500}>
                  MANA: {card.mana}
                </Text>
              </>
            )}
          </Box>
           <Box
             data-name="bottom-spacer"
             style={{
               width: '1px',
               backgroundColor: colors.Gray_5,
               imageRendering: 'pixelated',
             }}
           />
        </Box>
      </Box>
    );
  }
);

CardTemplate.displayName = 'CardTemplate';

export default CardTemplate;