import type { CSSProperties } from 'react';
import colors from '../../../styles/Colors';

export const deckSelectorRoot: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

export const deckList: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

export const deckCard: CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '6px',
};

export const deckCardBase: CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '6px',
};

export const deckOptionText: CSSProperties = {
  marginBottom: '4px',
};

export const modalTitle: CSSProperties = {
  color: colors.White_1,
};

export const modalBody: CSSProperties = {
  backgroundColor: colors.Gray_7,
};

export const modalHeader: CSSProperties = {
  backgroundColor: colors.Gray_8,
};

export const btnDisabled: CSSProperties = {
  backgroundColor: colors.Gray_5,
};

export const btnEnabled: CSSProperties = {
  backgroundColor: colors.Green_6,
};

export const btnEnabledHover: CSSProperties = {
  backgroundColor: colors.Green_5,
};