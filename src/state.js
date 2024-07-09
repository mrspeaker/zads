import { mk_vic } from "./vic.js";

export const mk_mem = (size) => [...Array(size)].fill(0);
export const mk_regs = (num) => [...Array(num)].fill(0).map(() => [0, 0, 0, 0]);

const dot_sprite = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 15, 15, 12, 0, 0, 0,
  0, 15, 12, 12, 11, 0, 0, 0, 0, 15, 12, 12, 11, 0, 0, 0, 0, 12, 11, 11, 11, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

export const mk_state = () => ({
  zads: {
    showObjBytes: false,
    version: "0.1.2",
  },
  machine: mk_machine(),
  program: null,
  programs: {},
  selected: null,
  cyclesPerFrame: 2,
  sprites: {
    num_sprites: 2,
    use_maps: false,
    cur_sprite: 0,
    cur_colour: 0,
    pen_size: 1,
    copy_buf: [],
    spr_w: 8,
    spr_h: 8,
    sprite_data: Array(8 * 8)
      .fill(0)
      .map((_, i) => (i === 1 ? dot_sprite.slice() : Array(8 * 8).fill(0))),
    map_w: 16,
    map_h: 16,
    map: Array(16 * 16).fill(0),
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
