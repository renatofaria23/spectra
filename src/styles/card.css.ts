import { style } from '@vanilla-extract/css';
import {
  Black_4_40, White_1_20, Blue_4, Blue_5, White_1, Beige_5, Orange_3, Black_1, Green_2, Black_5_50, Gray_3,
} from './Colors';

export const cardContainer = style({
  position: 'relative',
  width: '100%',
  aspectRatio: '3/4',
  borderRadius: '12px',
  boxShadow: Black_4_40,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `2px solid ${White_1_20}`,
});

export const cardImage = style({
  width: '100%',
  height: '60%',
  objectFit: 'cover',
  backgroundColor: Blue_4,
});

export const cardBody = style({
  height: '40%',
  padding: '8px',
  backgroundColor: Blue_5,
  color: White_1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

export const cardTitle = style({
  fontSize: '14px',
  lineHeight: '110%',
  fontWeight: 'bold',
  marginBottom: '4px',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const cardStats = style({
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  lineHeight: '110%',
  fontWeight: 'bold',
});

export const cardBadge = style({
  position: 'absolute',
  top: '4px',
  right: '4px',
  padding: '2px 6px',
  backgroundColor: Beige_5,
  color: Orange_3,
  fontSize: '12px',
  lineHeight: '110%',
  borderRadius: '4px',
});

export const mythicBadge = style({
  backgroundColor: Orange_3,
  color: Black_1,
});

export const selectedCard = style({
  border: `3px solid ${Green_2}`,
  boxShadow: `0 0 20px ${Black_5_50}`,
});

export const playedCard = style({
  opacity: 0.7,
  backgroundColor: Gray_3,
});
