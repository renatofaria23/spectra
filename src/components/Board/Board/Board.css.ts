import type { CSSProperties } from 'react';
import colors from '../../../styles/Colors';

export const boardRoot: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2rem',
  width: '100%',
  minHeight: '100vh',
  backgroundColor: colors.White_1,
  padding: '2rem',
  boxSizing: 'border-box',
};

export const linkStyle: CSSProperties = { textDecoration: 'none' };

export const boardTitle: CSSProperties = {
  fontWeight: 700,
};
