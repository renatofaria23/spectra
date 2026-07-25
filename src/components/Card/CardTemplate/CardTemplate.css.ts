import type { CSSProperties } from 'react';
import colors from '../../../styles/Colors';

export const cardOuterFrame: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  padding: '3px',
  overflow: 'hidden',
};

export const cardMainContent: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
  borderRadius: '12px',
};

export const levelRaritySection: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  minHeight: '14px',
  padding: '2px 6px',
  width: '100%',
  position: 'relative',
  borderRadius: '12px 12px 0 0',
  zIndex: 1,
  gap: '4px',
};

export const levelIconsContainer: CSSProperties = {
  display: 'flex',
  gap: '1px',
  flexShrink: 0,
};

export const levelNameDivider: CSSProperties = {
  width: '100%',
  height: '1px',
  backgroundColor: colors.Gray_6,
};

export const cardNameSection: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '4px 6px',
  gap: '8px',
};

export const nameArtDivider: CSSProperties = {
  width: '100%',
  height: '1px',
  backgroundColor: colors.Gray_6,
};

export const artImageSection: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
};

export const descriptionOuterFrame: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

export const descriptionInnerBg: CSSProperties = {
  borderRadius: '3px',
  padding: '2px',
};

export const radialGlowOverlay: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 0,
};

export const cardNameText: CSSProperties = {
  textAlign: 'center',
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const artImage: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
  top: 0,
  left: 0,
};

export const artPlaceholder: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: 0,
  left: 0,
};

export const artImageOverlay: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 1,
};

export const artTopBlur: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '20px',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  maskImage: 'linear-gradient(to bottom, black, transparent)',
  WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
  pointerEvents: 'none',
  zIndex: 2,
};

export const descriptionOuterFrameAbsolute: CSSProperties = {
  position: 'absolute',
  bottom: '12px',
  left: 0,
  right: 0,
  zIndex: 2,
};

export const descriptionText: CSSProperties = {
  lineHeight: 1.4,
  wordWrap: 'break-word',
  textAlign: 'center',
};

export const statsSection: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '2px 6px',
  borderRadius: '0 0 12px 12px',
};

export const statsSectionAbsolute: CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 3,
};

export const statLabelLeft: CSSProperties = {
  textAlign: 'left',
  justifyContent: 'flex-start',
};

export const statLabelMiddle: CSSProperties = {
  textAlign: 'center',
  justifyContent: 'center',
};

export const statLabelRight: CSSProperties = {
  textAlign: 'right',
  justifyContent: 'flex-end',
};

export const statLabelCenter: CSSProperties = {
  textAlign: 'center',
  width: '100%',
  justifyContent: 'center',
};