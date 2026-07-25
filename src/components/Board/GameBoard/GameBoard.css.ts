import type { CSSProperties } from 'react';
import { Gray_2 } from '../../../styles/Colors';

export const fieldCardWrapper: CSSProperties = {
  width: 60,
  height: 90,
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  overflow: 'hidden',
  position: 'relative',
};

export const emptyCardSlot: CSSProperties = {
  width: 60,
  height: 90,
  borderRadius: '6px',
};

export const handCard: CSSProperties = {
  width: 60,
  height: 90,
  borderRadius: '6px',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  overflow: 'visible',
  position: 'relative',
};

export const zoneRow: CSSProperties = {
  display: 'flex',
  gap: '40px',
  justifyContent: 'center',
  alignItems: 'center',
};

export const playerField: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '24px',
  padding: '4px',
  borderRadius: '6px',
};

export const playerInfoBar: CSSProperties = {
  padding: '2px 14px',
  margin: '0 10px',
};

export const placementOverlay: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1001,
  cursor: 'pointer',
};

export const placementDialog: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
};

export const gameBoardRoot: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100vh',
  boxSizing: 'border-box',
  overflow: 'hidden',
  backgroundColor: Gray_2,
};

export const mainBoardArea: CSSProperties = {
  flex: 1,
  display: 'flex',
  gap: '0',
  minHeight: 0,
  padding: '4px 8px',
};

export const leftSidebar: CSSProperties = {
  width: '48px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  justifyContent: 'center',
};

export const centerBoard: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minHeight: 0,
};

export const handRow: CSSProperties = {
  display: 'flex',
  gap: '4px',
  overflow: 'visible',
  padding: '20px 0',
  justifyContent: 'center',
};

export const centerControls: CSSProperties = {
  padding: '4px 0',
};

export const rightSidebar: CSSProperties = {
  width: '48px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  justifyContent: 'flex-end',
  paddingBottom: '8px',
};

export const cardInspectOverlay: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  cursor: 'pointer',
};

export const cardInspectCard: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
};

export const gameOverOverlay: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

export const gameOverDialog: CSSProperties = {
  padding: '2rem',
  borderRadius: '12px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

export const cardContentArea: CSSProperties = {
  flex: 1,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const fieldCardFaceDown: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const placementPreviewCard: CSSProperties = {
  width: 80,
  height: 120,
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

export const handCardImage: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

export const noGameStateMessage: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
};
