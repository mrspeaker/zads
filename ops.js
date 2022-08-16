import { nib3_to_byte } from "./utils.js";

export const nop = () => {};
export const ops = {
  0x05: ["BALR", 2, nop],
  0x07: ["BCR", 2, nop],
  0x0b: ["BSM", 2, nop],
  0x0d: ["BSR", 2, nop],
  0x18: ["LR", 2, ([r1, r2], regs) => (regs[r1] = regs[r2])],
  0x41: ["LA", 4, nop],
  0x50: ["ST", 4, nop],
  0x58: ["L", 4, nop],
  0x5a: [
    "A",
    4,
    (ops, regs, mem) => {
      const [r1, x2, b2, d1, d2, d3] = ops;
      const d = nib3_to_byte(d1, d2, d3);
      regs[r1][3] = regs[r1][3] + mem[x2 + b2 + d2];
    },
  ],
  0x90: ["STM", 4, nop],
  0x98: [
    "LM",
    4,
    (ops, regs, mem) => {
      const [r1, r2, r3, d1, d2, d3] = ops;
      const d = nib3_to_byte(d1, d2, d3);
      let ptr = regs[r3][3] + d;
      regs[r1][3] = mem[ptr++];
      regs[r2][3] = mem[ptr++];
      regs[r3][3] = mem[ptr++];
    },
  ],
  0xd7: ["XC", 6, nop],
};

export const op_name = Object.entries(ops).reduce((ac, [k, v]) => {
  const [name, bytes, f] = v;
  ac[name] = parseInt(k, 10);
  return ac;
}, {});
