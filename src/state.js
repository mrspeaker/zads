const mk_mem = (size) => [...Array(size)].fill(0);
const mk_regs = (num) => [...Array(num)].fill(0).map(() => [0, 0, 0, 0]);

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
});

export const mk_state = () => ({
  zads: {
    loaded: false,
    showObjBytes: false,
  },
  machine: mk_machine(),
  program: null,
  env: {
    regs: mk_regs(16),
    mem: mk_mem(4096),
    psw: {
      pc: 0, //64-127
      halt: false,
    },
    cpuState: "operating", // stopped, operating, load, check-stop
  },
});
