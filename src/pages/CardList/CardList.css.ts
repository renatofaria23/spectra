import type { CSSProperties } from 'react';
import colors from '../../styles/Colors';

export const cardListContainer: CSSProperties = {
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

export const cardGrid: CSSProperties = {
  display: 'flex',
  gap: '2rem',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

export const cardItemWrapper: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
};

export const cardActionGroup: CSSProperties = {};