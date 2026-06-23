import React from "react";
import { Box, Text } from "@mantine/core";
import { IconApiApp } from "@tabler/icons-react";
import colors from "../../../styles/Colors";
import * as styles from './CardTemplate.css.ts';
import { NatureIcon } from "../NatureIcon/NatureIcon";
import { RaritySymbol } from "../RaritySymbol/RaritySymbol";
import type { TriggerEntry } from "../../../logic/Triggers";

type CardType = "numen" | "rite" | "ward";
type CardSize = "xs" | "sm" | "md" | "lg" | "xl";

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
  nature?: string;
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
  xl: { width: 400, height: 600 },
};

const natureThemeMap: Record<string, string[]> = {
  fire: colors.FireTheme,
  water: colors.WaterTheme,
  earth: colors.EarthTheme,
  air: colors.AirTheme,
  light: colors.LightTheme,
  dark: colors.DarkTheme,
};

const LIGHT_NATURES = ["air", "light"];

const createPixelGradient = (colorStops: string[], angle: number = 315) => {
  if (colorStops.length < 2) return colorStops[0] || colors.Gray_7;
  const stops = colorStops
    .map((c, i) => `${c} ${Math.round((i / (colorStops.length - 1)) * 100)}%`)
    .join(", ");
  return `linear-gradient(${angle}deg, ${stops})`;
};

const createRadialGlow = (color: string) => {
  return `radial-gradient(ellipse at center, ${color}44 0%, transparent 70%)`;
};

interface CardTheme {
  border: string;
  borderGradient: string;
  borderOuter: string;
  background: string;
  backgroundGradient: string;
  backgroundInner: string;
  sectionBg: string;
  sectionBgGradient: string;
  sectionBgLight: string;
  accentColor: string;
  accentGlow: string;
  textColor: string;
  textColorSecondary: string;
  dividerColor: string;
}

const getNumenTheme = (nature: string = "dark"): CardTheme => {
  const theme = natureThemeMap[nature.toLowerCase()];
  if (!theme) {
    return {
      border: colors.Gray_6,
      borderGradient: colors.Gray_7,
      borderOuter: colors.Gray_5,
      background: colors.Gray_8,
      backgroundGradient: colors.Gray_8,
      backgroundInner: colors.Gray_9,
      sectionBg: colors.Gray_7,
      sectionBgGradient: colors.Gray_7,
      sectionBgLight: colors.Gray_7,
      accentColor: colors.Gray_5,
      accentGlow: colors.Gray_6,
      textColor: colors.White_1,
      textColorSecondary: colors.Gray_4,
      dividerColor: colors.Gray_6,
    };
  }
  const isLightNature = LIGHT_NATURES.includes(nature.toLowerCase());
  const c0 = theme[0] || colors.Gray_7;
  const c1 = theme[1] || c0;
  const c2 = theme[2] || c1;
  const c3 = theme[3] || c2;
  const c4 = theme[4] || c3;
  const c5 = theme[5] || c4;
  return {
    border: c2,
    borderGradient: createPixelGradient([c0, c1, c2, c3]),
    borderOuter: c1,
    background: c3,
    backgroundGradient: createPixelGradient([c1, c2, c3, c4]),
    backgroundInner: c4,
    sectionBg: c2,
    sectionBgGradient: createPixelGradient([c1, c2, c3]),
    sectionBgLight: c3,
    accentColor: c4,
    accentGlow: c5,
    textColor: isLightNature ? colors.Black_1 : colors.White_1,
    textColorSecondary: isLightNature ? colors.Gray_4 : colors.Gray_5,
    dividerColor: c2,
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
    border: colors.Green_5,
    borderGradient: createPixelGradient([colors.Green_4, colors.Green_5, colors.Green_6]),
    borderOuter: colors.Green_6,
    background: c2,
    backgroundGradient: createPixelGradient([c1, c2, c3, c4]),
    backgroundInner: c3,
    sectionBg: c2,
    sectionBgGradient: createPixelGradient([colors.Green_7, c2, c3]),
    sectionBgLight: c3,
    accentColor: colors.Green_4,
    accentGlow: colors.Green_5,
    textColor: colors.White_1,
    textColorSecondary: colors.Green_3,
    dividerColor: colors.Green_6,
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
    border: colors.Red_8,
    borderGradient: createPixelGradient([colors.Red_7, colors.Red_8, colors.Red_9]),
    borderOuter: colors.Red_9,
    background: c2,
    backgroundGradient: createPixelGradient([c1, c2, c3, c4]),
    backgroundInner: c3,
    sectionBg: c2,
    sectionBgGradient: createPixelGradient([colors.Red_10, c2, c3]),
    sectionBgLight: c3,
    accentColor: colors.Red_6,
    accentGlow: colors.Red_7,
    textColor: colors.White_1,
    textColorSecondary: colors.Red_6,
    dividerColor: colors.Red_10,
  };
};

const getTheme = (cardType: CardType, nature?: string): CardTheme => {
  if (cardType === "numen") return getNumenTheme(nature);
  if (cardType === "rite") return getRiteTheme();
  return getWardTheme();
};

export const CardTemplate = React.memo(
  ({ card, size = "lg", style, artImage: artImageProp }: CardTemplateProps) => {
    const dims = sizeDimensions[size];

    const isNumen = card.type === "numen";
    const theme = getTheme(card.type, card.nature);

    return (
      <Box
        data-name="card-outer-frame"
        style={{
          ...styles.cardOuterFrame,
          width: dims.width,
          height: dims.height,
          background: theme.borderGradient,
          boxShadow: `0 0 8px ${theme.accentGlow}66, inset 0 0 8px ${theme.accentGlow}33`,
          ...style,
        }}
      >
        <Box
          data-name="card-main-content"
          style={{
            ...styles.cardMainContent,
            background: theme.backgroundGradient,
          }}
        >
          <Box
            style={{
              ...styles.radialGlowOverlay,
              background: createRadialGlow(theme.accentColor),
            }}
          />

          <Box
            data-name="level-rarity-section"
            style={{
              ...styles.levelRaritySection,
              background: theme.sectionBgGradient,
            }}
          >
            {isNumen && card.level ? (
              <Box
                data-name="level-icons-container"
                style={styles.levelIconsContainer}
              >
                {Array.from({ length: Math.min(card.level, 10) }).map(
                  (_, i) => (
                    <IconApiApp key={i} size={10} color={theme.textColor} />
                  ),
                )}
              </Box>
            ) : (
              <Box />
            )}
            <RaritySymbol rarity={card.rarity || "common"} size={14} borderColor={theme.textColor} />
          </Box>

          <Box
            data-name="level-name-divider"
            style={{
              ...styles.levelNameDivider,
              background: `linear-gradient(90deg, transparent 0%, ${theme.dividerColor} 50%, transparent 100%)`,
            }}
          />

          <Box
            data-name="card-name-section"
            style={{
              ...styles.cardNameSection,
              background: theme.sectionBgGradient,
            }}
          >
            <Text
              c={theme.textColor}
              size="xs"
              fw={700}
              style={{
                ...styles.cardNameText,
                textAlign: 'left',
              }}
            >
              {card.name}
            </Text>
            <Text
              c={theme.textColor}
              size="xs"
              fw={500}
              style={{
                textAlign: 'right',
                whiteSpace: 'nowrap',
              }}
            >
              {isNumen
                ? (card.family
                    ? card.family.charAt(0).toUpperCase() + card.family.slice(1)
                    : card.cardType)
                : card.type.charAt(0).toUpperCase() + card.type.slice(1)}
            </Text>
          </Box>

          <Box
            data-name="name-art-divider"
            style={{
              ...styles.nameArtDivider,
              background: `linear-gradient(90deg, transparent 0%, ${theme.accentColor} 50%, transparent 100%)`,
            }}
          />

          <Box
            data-name="art-image-section"
            style={styles.artImageSection}
          >
            {artImageProp ? (
              <img
                src={artImageProp}
                alt="Card art"
                style={styles.artImage}
              />
            ) : (
              <Box
                data-name="art-placeholder"
                style={{
                  ...styles.artPlaceholder,
                  background: theme.backgroundInner,
                }}
              >
                <NatureIcon type={card.nature || "dark"} size={40} />
              </Box>
            )}
            <Box
              data-name="art-image-overlay"
              style={{
                ...styles.artImageOverlay,
                background: `linear-gradient(180deg, transparent 75%, ${theme.backgroundInner} 100%)`,
              }}
            />
          </Box>

          <Box
            data-name="description-outer-frame"
            style={{
              ...styles.descriptionOuterFrame,
              ...styles.descriptionOuterFrameAbsolute,
            }}
          >
            <Box
              data-name="description-inner-bg"
              style={{
                ...styles.descriptionInnerBg,
                background: theme.backgroundInner,
              }}
            >
              <Text
                c={theme.textColor}
                size="7px"
                fw={400}
                style={styles.descriptionText}
              >
                {card.description.split("\n").map((line, i) => (
                  <span key={i}>
                    <span dangerouslySetInnerHTML={{ __html: line }} />
                    {i < card.description.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </Text>
            </Box>
          </Box>

          <Box
            data-name="stats-section"
            style={{
              ...styles.statsSection,
              ...styles.statsSectionAbsolute,
              background: theme.sectionBgGradient,
            }}
          >
            {isNumen ? (
              <>
                <Text
                  c={theme.textColor}
                  size="8px"
                  fw={700}
                  style={styles.statLabelLeft}
                >
                  ATK: {card.attack}
                </Text>
                <Text
                  c={theme.textColor}
                  size="8px"
                  fw={700}
                  style={styles.statLabelRight}
                >
                  DEF: {card.defense}
                </Text>
              </>
            ) : (
              <Text
                c={theme.textColor}
                size="8px"
                fw={700}
                style={styles.statLabelCenter}
              >
                MANA: {card.mana}
              </Text>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
);

CardTemplate.displayName = "CardTemplate";

export default CardTemplate;