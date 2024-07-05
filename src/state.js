import { mk_vic } from "./vic.js";

export const mk_mem = (size) => [...Array(size)].fill(0);
export const mk_regs = (num) => [...Array(num)].fill(0).map(() => [0, 0, 0, 0]);

export const mk_state = () => ({
  zads: {
    showObjBytes: false,
  },
  machine: mk_machine(),
  program: null,
  programs: {},
  selected: null,
  cyclesPerFrame: 2,
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
