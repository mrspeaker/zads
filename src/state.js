const mk_mem = (size) => [...Array(size)].fill(0);
const mk_regs = (num) => [...Array(num)].fill(0).map((r) => [0, 0, 0, 0]);

export const mk_state = () => ({
  env: {
    pc: 0,
    regs: mk_regs(15),
    mem: mk_mem(4096),
    instr_txt: [],
    architectedRegisterContext: {
      general: mk_regs(15),
      fp: [],
      control: [],
      access: [],
    },
    psw: {
      // 128 bits
      PERMask: null, // 0
      pswKey: null, // 8-11
      problemState: null, // 15
      addressSpaceControl: null, // 16-17
      conditionCode: null, // 18-19
      programMask: null, // 20-23
      basicAddressingMode: null, // 32
      extendedAddressingMode: null, // 31
      instructionAddress: null, // 64-127
    },
    cpuState: "operating", // stopped, operating, load, check-stop
  },
  goff: false,
  src: "",
  obj: [],
});
