const mk_mem = (size) => [...Array(size)].fill(0);
const mk_regs = (num) => [...Array(num)].fill(0).map(() => [0, 0, 0, 0]);

export const mk_state = () => ({
  zads: {
    showObjBytes: false,
  },
  machine: mk_machine(),
  program: null,
  programs: {},
  selected: null,
});

const mk_machine = () => ({
  regs: mk_regs(16),
  mem: mk_mem(4096),
  psw: {
    conditionCode: 3,
    pc: 0,
    halt: false,
  },
  cpuState: "operating", // stopped, operating, load, check-stop
});

export const mk_program = () => ({
  goff: false,
  obj: [],
  src: [],
  code: [],
  code_txt: [],
  symbols: {},
  addressing: { base: 15, base_addr: 0 },
});
