import type { CSSProperties } from 'react';
import colors from '../../styles/Colors';

export const deckEditorGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  width: '100%',
  height: '100vh',
  boxSizing: 'border-box',
  background: `linear-gradient(135deg, ${colors.Blue_8} 0%, ${colors.Blue_12} 100%)`,
};

export const deckEditorLeftColumn: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
  padding: '1.5rem',
  minWidth: '400px',
};

export const deckInfoGroup: CSSProperties = {};

export const validationErrorsBox: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
};

export const filterButtonsGroup: CSSProperties = {};

export const availableCardsList: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

export const availableCardItem: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5rem 0.8rem',
  backgroundColor: colors.Gray_8,
  borderRadius: '6px',
};

export const cardInfoBox: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
};

export const cardBadgeGroup: CSSProperties = {};

export const cardQuantityGroup: CSSProperties = {};

export const deckEditorRightColumn: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
  padding: '1.5rem',
};

export const deckHeaderGroup: CSSProperties = {};

export const deckActionsGroup: CSSProperties = {};

export const deckContentsList: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

export const deckEntryItem: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5rem 0.8rem',
  backgroundColor: colors.Gray_8,
  borderRadius: '6px',
};

export const deckEntryInfo: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
};

export const deckEntryActions: CSSProperties = {};