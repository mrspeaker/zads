import { mk_mem } from "./state.js";

export const vic_regs = {
  BG_COL: 0,
  FG_COL: 1,
};

export function mk_vic(scr_cols = 320, scr_rows = 240) {
  return {
    screen: {
      rows: scr_rows,
      cols: scr_cols,
      mem: mk_mem(scr_cols * scr_rows),
      regs: [0, 1],
    },
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
