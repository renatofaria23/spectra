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

export const titleText: CSSProperties = {
  color: colors.Gray_2,
};

export const totalText: CSSProperties = {
  color: colors.Gray_3,
};

export const badgeNumina: CSSProperties = {
  color: colors.White_1,
  backgroundColor: colors.Red_11,
};

export const badgeRites: CSSProperties = {
  color: colors.White_1,
  backgroundColor: colors.Green_8,
};

export const badgeWards: CSSProperties = {
  color: colors.White_1,
  backgroundColor: colors.Red_12,
};

export const badgeCount: CSSProperties = {
  color: colors.White_1,
  backgroundColor: colors.Blue_5,
};

export const inputColor: CSSProperties = {
  color: colors.Gray_2,
  borderColor: colors.Gray_5,
};

export const inputLabelColor: CSSProperties = {
  color: colors.Gray_2,
};

export const deckTitleColor: CSSProperties = {
  color: colors.White_1,
};

export const textColor: CSSProperties = {
  color: colors.Red_4,
};

export const buttonEdit: CSSProperties = {
  backgroundColor: colors.Blue_5,
};

export const buttonEditHover: CSSProperties = {
  backgroundColor: colors.Blue_4,
};

export const buttonDelete: CSSProperties = {
  backgroundColor: colors.Red_8,
};

export const buttonDeleteHover: CSSProperties = {
  backgroundColor: colors.Red_7,
};

export const buttonCreate: CSSProperties = {
  backgroundColor: colors.Green_6,
};

export const buttonCreateHover: CSSProperties = {
  backgroundColor: colors.Green_5,
};

export const linkStyle: CSSProperties = {
  textDecoration: 'none',
  marginTop: '2rem',
};

export const linkTextColor: CSSProperties = {
  color: colors.Blue_3,
};