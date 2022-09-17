import { chunk } from "./utils.js";

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

export function mk_vic(cols = 320, rows = 240) {
  return {
    rows,
    cols,
    base: 200,
    regs: 0,
    screen: 100, // Will be end of reg address + 1
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
    },
  };
}

export function updateVic(vic, mem, input) {
  const { keys, base, regs } = vic;
  const offset = base + regs;

  keys.right = input.right;
  keys.left = input.left;
  keys.up = input.up;
  keys.down = input.down;

  // WRITE
  mem[offset + vic_regs.KEY_LEFT + 3] = keys.left ? 1 : 0;
  mem[offset + vic_regs.KEY_RIGHT + 3] = keys.right ? 1 : 0;
  mem[offset + vic_regs.KEY_UP + 3] = keys.up ? 1 : 0;
  mem[offset + vic_regs.KEY_DOWN + 3] = keys.down ? 1 : 0;

  return vic;
}

export function injectEquates(vic, table) {
  table.boop = 10;
}

const pal_hex = [
  "#000000",
  "#ffffff",
  "#880000",
  "#aaffee",
  "#cc44cc",
  "#00cc55",
  "#0000aa",
  "#eeee77",
  "#dd8855",
  "#664400",
  "#ff7777",
  "#333333",
  "#777777",
  "#aaff66",
  "#0088ff",
  "#bbbbbb",
];
const pal_rgb = pal_hex.map((v) =>
  chunk(v.split("").slice(1), 2).map((v) => parseInt(v.join(""), 16))
);
export const pal_to_hex = (pal) => {
  return pal_hex[pal % pal_hex.length];
};
export const pal_to_rgb = (pal) => {
  return pal_rgb[pal % pal_rgb.length];
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
