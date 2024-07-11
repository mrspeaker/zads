import { mk_vic } from "./vic.js";

export const mk_mem = (size) => [...Array(size)].fill(0);
export const mk_regs = (num) => [...Array(num)].fill(0).map(() => [0, 0, 0, 0]);

const dot_sprite = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 15, 15, 12, 0, 0, 0,
  0, 15, 12, 12, 11, 0, 0, 0, 0, 15, 12, 12, 11, 0, 0, 0, 0, 12, 11, 11, 11, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
const char_sprite = [
  0, 0, 14, 14, 14, 14, 0, 0, 0, 14, 14, 14, 14, 14, 12, 0, 14, 14, 0, 1, 14, 0,
  1, 12, 14, 14, 1, 1, 14, 1, 1, 12, 14, 14, 14, 14, 14, 14, 12, 12, 14, 14, 14,
  14, 14, 14, 12, 12, 14, 14, 14, 14, 14, 14, 12, 12, 14, 0, 14, 14, 0, 14, 12,
  12,
];
const mk_sprite = (idx) => {
  switch (idx) {
    case 1:
      return dot_sprite.slice();
    case 2:
      return char_sprite.slice();
    default:
      break;
  }
  return Array(8 * 8).fill(0);
};

export const mk_state = () => ({
  zads: {
    showObjBytes: false,
    version: "0.1.2",
    console: [
      "1. Select (or write) a program",
      "2. Press 'assemble'",
      "3. Press 'run'",
    ],
  },
  machine: mk_machine(),
  program: null,
  programs: {},
  selected: null,
  cyclesPerFrame: 2,
  sprites: {
    num_sprites: 2,
    use_maps: true,
    cur_sprite: 0,
    cur_colour: 0,
    pen_size: 1,
    copy_buf: [],
    spr_w: 8,
    spr_h: 8,
    sprite_data: Array(8 * 8)
      .fill(0)
      .map((_, i) => mk_sprite(i)),
    map_w: 16,
    map_h: 16,
    map: Array(16 * 16)
      .fill(0)
      .map((v, i) => (i < 16 ? 1 : 0)),
  },
});

const mk_machine = () => ({
  regs: mk_regs(16),
  mem: mk_mem(4096),
  psw: {
    conditionCode: 3,
    pc: 0,
    halt: true,
  },
  cpuState: "operating", // stopped, operating, load, check-stop
  vic: mk_vic(32, 32),
});

export const mk_program = () => ({
  goff: false,
  obj: [],
  src: [],
  code: [],
  code_txt: [],
  symbols: {},
  addressing: { base: 15, base_addr: 0 },
  breakpoint: null,
  broke: false,
});
