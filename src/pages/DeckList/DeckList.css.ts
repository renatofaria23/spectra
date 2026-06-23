import type { CSSProperties } from 'react';
import colors from '../../styles/Colors';

export const deckListContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2rem',
  width: '100%',
  minHeight: '100vh',
  backgroundColor: colors.White_1,
  padding: '2rem',
  boxSizing: 'border-box',
};

export const filterGroup: CSSProperties = {
  flexWrap: 'wrap',
  justifyContent: 'center',
  width: '100%',
};

export const deckListGrid: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  width: '100%',
  maxWidth: '600px',
};

export const deckItem: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 1.5rem',
  backgroundColor: colors.Gray_8,
  borderRadius: '8px',
};

export const deckInfoBox: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
};

export const deckBadgesGroup: CSSProperties = {};

export const validationErrorsBox: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
};

export const deckActionGroup: CSSProperties = {};