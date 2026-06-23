import React from 'react';
import { CardSpot } from '../CardSpot/CardSpot';
import colors from '../../../styles/Colors';
import * as s from './Field.css';

const base = {
  color: colors.White_1,
  backgroundColor: colors.Brown_1,
  borderColor: colors.White_1,
  selectedBorder: colors.Teal_2,
  width: '4vw',
  height: '12vh',
  absolutePositioning: false,
} as const;

const G = {
  numen: [colors.Orange_9, colors.Orange_10],
  extraDeck: [colors.Gray_7, colors.Gray_8],
  special: [colors.Green_4, colors.Green_5],
  exile: [colors.Purple_9, colors.Purple_10],
  memora: [colors.Gray_9, colors.Gray_10],
  magic: [colors.Blue_16, colors.Blue_17],
  deck: [colors.Brown_8, colors.Brown_9],
} as const;

const B = {
  numen: colors.Orange_1,
  extraDeck: colors.Gray_1,
  special: colors.Green_1,
  exile: colors.Purple_1,
  memora: colors.Gray_2,
  magic: colors.Blue_1,
  deck: colors.Brown_1,
} as const;

const make = (t: string, p?: string) => {
  const r = p || (t === 'Extra Deck' ? 'extraDeck' : t === 'Memora' ? 'memora' : t === 'Exile' ? 'exile' : t === 'Deck' ? 'deck' : t.includes('Zone') ? 'magic' : 'normal');
  const grad: Record<string, any> = {};
  if (r !== 'normal') {
    const [a, b] = G[r as keyof typeof G];
    grad.backgroundImage = `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
  }
  return <CardSpot key={`${base.width}-${base.height}`} text={t} {...base} backgroundColor={B[r as keyof typeof B]} additionalStyle={grad} />;
};

const R = (a: string, b: string, c: string, t?: string) => [
  make(a), ...Array.from({ length: 5 }, () => make(b, t)), make(c),
];

export const Field = React.memo(() => (
  <div style={s.fieldRoot}>
    <div style={s.fieldRow}>{R('Deck', 'Magic Zone', 'Memora')}</div>
    <div style={s.fieldRow}>{R('Extra Deck', 'Numen Zone', 'Exile', 'numen')}</div>
    <div style={s.fieldRow}>{make('Special Zone', 'special')}</div>
    <div style={s.fieldRow}>{R('Exile', 'Numen Zone', 'Extra Deck', 'numen')}</div>
    <div style={s.fieldRow}>{R('Memora', 'Magic Zone', 'Deck')}</div>
  </div>
));

Field.displayName = 'Field';
export default Field;