import type { CSSProperties } from 'react';

export const boardRoot: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2rem',
  width: '100%',
  minHeight: '100vh',
  padding: '2rem',
  boxSizing: 'border-box',
};

export const boardTitle: CSSProperties = {
  fontWeight: 700,
};
