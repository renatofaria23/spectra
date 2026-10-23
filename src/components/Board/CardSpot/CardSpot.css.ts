import type { CSSProperties } from 'react';

export const spotRoot: CSSProperties = {
  position: 'relative',
};

export const spotWrapper: CSSProperties = {
  borderRadius: '2px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease-out',
};

export const spotTextOverlay: CSSProperties = {
  zIndex: 1,
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const spotText: CSSProperties = {
  pointerEvents: 'none',
};

export const spotOverlay: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
};

export const spotWrapperNoise: CSSProperties = {
  backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)" opacity="0.05"/%3E%3C/svg%3E")',
  backgroundRepeat: 'repeat',
};

export const spotContent: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
};

export const spotFallback: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
};

export const spotChildWrapper: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
};

export const spotNumberText: CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
};