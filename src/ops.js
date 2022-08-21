import { nib3_to_byte, toHex, mem2reg } from "./utils.js";

const disp = (n1, n2, n3) => (n1 << 8) + (n2 << 4) + n3;
const fullword = (a, b, c, d) => (a << 24) + (b << 16) + (c << 8) + d;

export const nop = () => {};
export const ops = {
  0x05: ["BALR", 2, nop],
  0x07: [
    "BCR",
    2,
    ([r1, r2], regs, mem, psw) => {
      if (r1 === 15 && r2 == 14) {
        // lol, just faking exit.
        // need to properly figure out exit
        psw.halt = true;
      }
    },
  ],
  0x0b: ["BSM", 2, nop],
  0x0d: ["BSR", 2, nop],
  0x18: ["LR", 2, ([r1, r2], regs) => (regs[r1] = regs[r2])],
  0x19: [
    "CR",
    2,
    ([r1, r2], regs, mem, psw) => {
      const a = fullword(...regs[r1]);
      const b = fullword(...regs[r2]);
      if (a === b) {
        psw.conditionCode = 0;
      } else if (a < b) {
        psw.conditionCode = 1;
      } else {
        psw.conditionCode = 2;
      }
    },
  ],
  0x41: ["LA", 4, nop],
  0x47: [
    "BC",
    4,
    ([m, x, b, d1, d2, d3], regs, mem, psw) => {
      const cc = [8, 4, 2, 1][psw.conditionCode];
      if (m === cc) {
        // jmp to d(x,b).
        const D = disp(d1, d2, d3);
        const ptr = (x ? regs[x][3] : 0) + (b ? regs[b][3] : 0) + D;
        // set psw location
        psw.pc = ptr - 3;
      }
    },
  ],
  0x50: ["ST", 4, nop],
  0x58: [
    "L",
    4,
    ([r, x, b, d1, d2, d3], regs, mem) => {
      // L R1,D2(X2,B2)   [RX]
      const D = disp(d1, d2, d3);
      const ptr = (x ? regs[x][3] : 0) + (b ? regs[b][3] : 0) + D;
      mem2reg(mem, ptr, regs[r]);
    },
  ],
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
      // Erm, nope... what?
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
