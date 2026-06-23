import type { CSSProperties } from 'react';

export const fieldRoot: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '1rem 0.25rem',
  boxSizing: 'border-box',
};

export const fieldRow: CSSProperties = {
  display: 'flex',
  flexWrap: 'nowrap',
  gap: '0.5rem',
  justifyContent: 'center',
  alignItems: 'center',
};
