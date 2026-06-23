import type { CSSProperties } from 'react';
import colors from '../../../styles/Colors';

export const selectedCard: CSSProperties = {
  position: 'relative',
  cursor: 'pointer',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

export const faceDownCard: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  color: colors.Gray_4,
  fontSize: '26px',
};

export const cardImage: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.Gray_5,
  fontSize: '14px',
  width: '100%',
  height: '100%',
};

export const cardBody: CSSProperties = {
  color: colors.White_1,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  padding: '0.5rem',
};

export const cardStats: CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
};

export const cardBadge: CSSProperties = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 8px',
  borderRadius: '999px',
  fontWeight: 'bold',
};

export const levelTag: CSSProperties = {
  position: 'absolute',
  bottom: '4px',
  left: '4px',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold',
};

export const positionTag: CSSProperties = {
  position: 'absolute',
  bottom: '4px',
  right: '4px',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 'bold',
};
