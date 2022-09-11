import { mk_mem } from "./state.js";

export const vic_regs = {
  BG_COL: 0,
  FG_COL: 4,
  SPR1_COL: 8,
  SPR2_COL: 12,
  SPR3_COL: 16,
  SPR4_COL: 20,
  SPR1_X: 24,
  SPR1_Y: 28,
  SPR2_X: 32,
  SPR2_Y: 36,
  SPR3_X: 40,
  SPR3_Y: 44,
  SPR4_X: 48,
  SPR5_Y: 52,
};

export function mk_vic(scr_cols = 320, scr_rows = 240) {
  return {
    screen: {
      rows: scr_rows,
      cols: scr_cols,
      mem: mk_mem(scr_cols * scr_rows),
    },
    regs: mk_mem(Object.keys(vic_regs).length * 4),
  };
}

export const pal_to_rgb = (pal) => {
  const rgbs = ["#000", "#fff", "#800", "#08a"];
  return rgbs[pal % rgbs.length];
};
export const pal = {
  BLACK: 0,
  WHITE: 1,
  RED: 2,
  CYAN: 3,
};
