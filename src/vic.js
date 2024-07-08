import { chunk } from "./utils.js";

export const vic_regs = Object.fromEntries(
  Object.entries({
    TIME: 0,
    SPR0_IDX: 2,
    SPR1_IDX: 3,
    SPR2_IDX: 4,
    SPR3_IDX: 5,
    SPR0_X: 6,
    SPR0_Y: 7,
    SPR1_X: 8,
    SPR1_Y: 9,
    SPR2_X: 10,
    SPR2_Y: 11,
    SPR3_X: 12,
    SPR3_Y: 13,
    KEY_LEFT: 14,
    KEY_RIGHT: 15,
    KEY_UP: 16,
    KEY_DOWN: 17,
    KEY_FIRE: 18,
    KEY_FIRE_2: 19,
  })
);

export function mk_vic(cols = 320, rows = 240) {
  return {
    rows,
    cols,
    base: 200,
    regs: 0,
    screen: 100, // Will be end of reg address + 1
    maps: 356, // screens +256
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      fire: false,
      fire_2: false,
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
  keys.fire = input.fire;
  keys.fire_2 = input.fire_2;

  // WRITE
  mem[offset + vic_regs.KEY_LEFT] = keys.left ? 1 : 0;
  mem[offset + vic_regs.KEY_RIGHT] = keys.right ? 1 : 0;
  mem[offset + vic_regs.KEY_UP] = keys.up ? 1 : 0;
  mem[offset + vic_regs.KEY_DOWN] = keys.down ? 1 : 0;
  mem[offset + vic_regs.KEY_FIRE] = keys.fire ? 1 : 0;
  mem[offset + vic_regs.KEY_FIRE_2] = keys.fire_2 ? 1 : 0;

  return vic;
}

export function injectEquates(vic, table) {
  table.boop = 10;
}

const pal_hex_c64 = [
  "#000000",
  "#ffffff",
  "#880000",
  "#aaffee",
  "#cc44cc",
  "#00cc55",
  "#0000aa",
  "#eeee77",
  "#dd8855",
  "#997700", //  "#664400",
  "#ff7777",
  "#333333",
  "#777777",
  "#aaff66",
  "#44bbff", //   "#0088ff,
  "#bbbbbb",
];
const pal_hex_dark = [
  "#000000",
  "#9D9D9D",
  "#FFFFFF",
  "#BE2633",
  "#E06F8B",
  "#493C2B",
  "#A46422",
  "#EB8931",
  "#F7E26B",
  "#2F484E",
  "#44891A",
  "#A3CE27",
  "#1B2632",
  "#005784",
  "#31A2F2",
  "#B2DCEF",
];

const pal_hex_64b = [
  "#000000",
  "#ffffff",
  "#9f3535",
  "#90b6bc",
  "#566883",
  "#71a543",
  "#0d5471",
  "#dfd08b",
  "#9a5b1e",
  "#6a3904",
  "#b67a70",
  "#4a5e3c",
  "#7f8274",
  "#c2dc94",
  "#4791bf",
  "#bda791",
];

export const pal_hex = pal_hex_c64;
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

/*
"#000000"
"#9D9D9D"
"#FFFFFF"
"#BE2633"
"#E06F8B"
"#493C2B"
"#A46422"
"#EB8931"
"#F7E26B"
"#2F484E"
"#44891A"
"#A3CE27"
"#1B2632"
"#005784"
"#31A2F2"
"#B2DCEF"
*/
