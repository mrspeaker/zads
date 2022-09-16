import { mk_mem } from "./state.js";

export const vic_regs = {
  BG_COL: 0,
  FG_COL: 4,
  SPR1_COL: 8,
  SPR2_COL: 12,
  SPR1_X: 16,
  SPR1_Y: 20,
  SPR2_X: 24,
  SPR2_Y: 28,
  KEY_LEFT: 32,
  KEY_RIGHT: 36,
  KEY_UP: 40,
  KEY_DOWN: 44,
};

export function mk_vic(scr_cols = 320, scr_rows = 240) {
  return initVic({
    screen: {
      rows: scr_rows,
      cols: scr_cols,
      mem: mk_mem(scr_cols * scr_rows),
      memp: 400,
    },
    regs: mk_mem(Object.keys(vic_regs).length * 4),
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
    },
  });
}

export function initVic(vic) {
  return vic;
}

export function updateVic(vic, mem, input) {
  // Copy regs
  let offset = 200;
  vic.regs.forEach((_, i) => {
    vic.regs[i] = mem[i + offset];
  });

  vic.keys.right = input.right;
  vic.keys.left = input.left;
  vic.keys.up = input.up;
  vic.keys.down = input.down;
  //hmm... why bother stor in vic regs?
  vic.regs[vic_regs.KEY_RIGHT + 3] = vic.keys.right ? 1 : 0;
  vic.regs[vic_regs.KEY_LEFT + 3] = vic.keys.left ? 1 : 0;
  vic.regs[vic_regs.KEY_UP + 3] = vic.keys.up ? 1 : 0;
  vic.regs[vic_regs.KEY_DOWN + 3] = vic.keys.down ? 1 : 0;

  // WRITE
  mem[offset + vic_regs.KEY_LEFT + 3] = vic.keys.left ? 1 : 0;
  mem[offset + vic_regs.KEY_RIGHT + 3] = vic.keys.right ? 1 : 0;
  mem[offset + vic_regs.KEY_UP + 3] = vic.keys.up ? 1 : 0;
  mem[offset + vic_regs.KEY_DOWN + 3] = vic.keys.down ? 1 : 0;

  return vic;
}

export const pal_to_rgb = (pal) => {
  const rgbs = [
    "#000",
    "#fff",
    "#800",
    "#afe",
    "#c4c",
    "#0c5",
    "#00A",
    "#ee7",
    "#d85",
    "#640",
    "#f77",
    "#333",
    "#777",
    "#af6",
    "#08f",
    "#bbb",
  ];
  return rgbs[pal % rgbs.length];
};
export const pal = {
  BLACK: 0,
  WHITE: 1,
  RED: 2,
  CYAN: 3,
  VIOLET: 4,
  GREEN: 5,
  BLUE: 6,
  YELLOW: 7,
  ORANGE: 8,
  BROWN: 9,
  PINK: 10,
  DARK_GREY: 11,
  GREY: 12,
  LIGHT_GREEN: 13,
  LIGHT_BLUE: 14,
  LIGHT_GREY: 15,
};
/*

  # merri_2018-08-31.vpl
# VICE Palette file
#
# Syntax:
# Red Green Blue Dither
#

# Black
00 00 00 0

# White
FF FF FF E

# Red
9F 35 35 4

# Cyan
90 B6 BC C

# Purple
56 68 83 8

# Green
71 A5 43 4

# Blue
0D 54 71 4

# Yellow
DF D0 8B C

# Orange
9A 5B 1E 4

# Brown
6A 39 04 4

# Light Red
B6 7A 70 8

# Dark Gray
4A 5E 3C 4

# Medium Gray
7F 82 74 8

# Light Green
C2 DC 94 8

# Light Blue
47 91 BF 8

# Light Gray
BD A7 91 C
*/
