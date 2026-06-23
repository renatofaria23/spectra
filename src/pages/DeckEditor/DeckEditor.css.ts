import type { CSSProperties } from "react";
import colors from "../../styles/Colors";

export const root: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  width: "100%",
  height: "100vh",
  boxSizing: "border-box",
  background: `linear-gradient(135deg, ${colors.Blue_8} 0%, ${colors.Blue_12} 100%)`,
};

export const leftColumn: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem",
  padding: "1.5rem",
  minWidth: "400px",
};

export const rightColumn: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem",
  padding: "1.5rem",
};

export const errorsBox: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.3rem",
};

export const cardsList: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

export const cardItem: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.5rem 0.8rem",
  backgroundColor: colors.Gray_8,
  borderRadius: "6px",
};

export const cardInfoBox: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.2rem",
};

export const filterButtonBase: CSSProperties = {
  backgroundColor: colors.Gray_7,
};

export const filterButtonActive: CSSProperties = {
  backgroundColor: colors.Blue_4,
};

export const rarityBadge: CSSProperties = {
  backgroundColor: colors.Gray_5,
};

export const navLink: CSSProperties = {
  cursor: "pointer",
};
