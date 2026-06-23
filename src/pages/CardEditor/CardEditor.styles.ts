import type { CSSProperties } from 'react';
import colors from '../../styles/Colors';

const scrollbarHiddenStyle: CSSProperties = {
  overflowY: 'auto',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
};

export const cardEditorGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
  width: '100%',
  height: '100vh',
  boxSizing: 'border-box',
  background: `linear-gradient(135deg, ${colors.Blue_8} 0%, ${colors.Blue_12} 100%)`,
};

export const basicInputsColumn: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  padding: '1rem 1.5rem',
  alignItems: 'flex-start',
  justifyContent: 'center',
  ...scrollbarHiddenStyle,
};

export const effectTypeTriggersColumn: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  padding: '1rem 1.5rem',
  alignItems: 'flex-start',
  justifyContent: 'center',
  ...scrollbarHiddenStyle,
};

export const effectsDropdownColumn: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  padding: '1rem 1.5rem',
  alignItems: 'flex-start',
  justifyContent: 'center',
  ...scrollbarHiddenStyle,
};

export const effectsSectionColumn: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...scrollbarHiddenStyle,
};

export const cardPreviewColumn: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const dropzoneContent: CSSProperties = {
  pointerEvents: 'none',
  gap: '0.5rem',
};

export const activeTriggersBox: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  width: '100%',
};

export const pendingEffectsBox: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  width: '100%',
};

export const pendingEffectItem: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  backgroundColor: colors.Gray_6,
  borderRadius: '4px',
  border: `1px solid ${colors.Gray_5}`,
};

export const backToCardListBox: CSSProperties = {
  marginTop: '1rem',
};

export const effectsSection: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  alignItems: 'center',
  justifyContent: 'center',
};

export const effectSlotWrapper: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  width: '100%',
};

export const effectSlotHeader: (isEditing: boolean) => CSSProperties = (isEditing) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 20px',
  backgroundColor: isEditing ? colors.Orange_8 : colors.Gray_7,
  borderRadius: '6px',
  border: `2px solid ${isEditing ? colors.Orange_5 : colors.Gray_5}`,
  minWidth: '300px',
  cursor: 'pointer',
});

export const effectSlotTriggerInfo: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginRight: '1rem',
};

export const effectSlotActionButtons: CSSProperties = {
  display: 'flex',
  gap: '0.2rem',
};

export const expandedEffectsList: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  paddingLeft: '12px',
};

export const effectItem: (isActiveEffect: boolean) => CSSProperties = (isActiveEffect) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 10px',
  backgroundColor: isActiveEffect ? colors.Orange_7 : colors.Gray_6,
  borderRadius: '4px',
  border: `1px solid ${isActiveEffect ? colors.Orange_4 : colors.Gray_5}`,
  fontSize: '12px',
});

export const effectItemActionButtons: CSSProperties = {
  display: 'flex',
  gap: '0.2rem',
};

export const noEffectsText: CSSProperties = {
  opacity: 0.5,
};

export const dropzoneContainer: CSSProperties = {
  width: '100%',
  padding: '1rem',
  borderRadius: '6px',
};

export const smallGrayButton: CSSProperties = {
  backgroundColor: colors.Gray_5,
  padding: '2px 6px',
  minWidth: 'auto',
};

export const smallRedButton: CSSProperties = {
  backgroundColor: colors.Red_8,
  padding: '2px 6px',
  minWidth: 'auto',
};

export const smallGreenButton: CSSProperties = {
  backgroundColor: colors.Green_6,
  padding: '2px 6px',
  minWidth: 'auto',
};

export const smallBlueButton: CSSProperties = {
  backgroundColor: colors.Blue_5,
  padding: '2px 6px',
  minWidth: 'auto',
};

export const pendingRemoveButton: CSSProperties = {
  backgroundColor: colors.Red_8,
  padding: '2px 8px',
};

export const addPendingButton: CSSProperties = {
  backgroundColor: colors.Orange_5,
};

export const saveButton: CSSProperties = {
  backgroundColor: colors.Green_6,
};

export const cancelButton: CSSProperties = {
  backgroundColor: colors.Gray_5,
};

export const addEffectButton: CSSProperties = {
  backgroundColor: colors.Blue_5,
};

export const smallButton: CSSProperties = {
  padding: '2px 6px',
  minWidth: 'auto',
};

export const smallGrayButtonRoot: CSSProperties = {
  backgroundColor: colors.Gray_5,
  ...smallButton,
};

export const smallRedButtonRoot: CSSProperties = {
  backgroundColor: colors.Red_8,
  ...smallButton,
};

export const smallGreenButtonRoot: CSSProperties = {
  backgroundColor: colors.Green_6,
  ...smallButton,
};

export const smallBlueButtonRoot: CSSProperties = {
  backgroundColor: colors.Blue_5,
  ...smallButton,
};

export const clickableText: CSSProperties = {
  cursor: 'pointer',
};
