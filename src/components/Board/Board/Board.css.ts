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
  backgroundColor: colors.Gray_8,
  padding: '2rem',
  boxSizing: 'border-box',
};

export const linkStyle: CSSProperties = { textDecoration: 'none' };

export const boardTitle: CSSProperties = {
  fontWeight: 700,
};

export const menuButton: CSSProperties = {
  backgroundColor: colors.Blue_5,
  color: colors.White_1,
  minWidth: '220px',
};

export const playButton: CSSProperties = {
  backgroundColor: colors.Green_6,
  color: colors.White_1,
  minWidth: '220px',
};

export const optionsButton: CSSProperties = {
  backgroundColor: colors.Gray_7,
  color: colors.White_1,
  minWidth: '220px',
};

export const exitButton: CSSProperties = {
  backgroundColor: colors.Red_10,
  color: colors.White_1,
  minWidth: '220px',
};
