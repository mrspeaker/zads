import { nib3_to_byte, toHex, mem2reg } from "./utils.js";

const disp = (n1, n2, n3) => (n1 << 8) + (n2 << 4) + n3;
const fullword = (a, b, c, d) => (a << 24) + (b << 16) + (c << 8) + d;

const reg_to_mem = (mem, offset, reg) => {
    mem[offset] = reg[0];
    mem[offset+1] = reg[1];
    mem[offset+2] = reg[2];
    mem[offset+3] = reg[3];    
}
const mem_to_reg = (reg, mem, offset) => {
    reg[0] = mem[offset];
    reg[1] = mem[offset+1];
    reg[2] = mem[offset+2];
    reg[3] = mem[offset+3];
}

export const nop = () => {};
export const ops = {
  0x05: { op: "BALR", len: 2, f: nop },
  0x07: {
    op: "BCR",
    len: 2,
    f: ([r1, r2], regs, mem, psw) => {
      if (r1 === 15 && r2 == 14) {
        // lol, just faking exit.
        // need to properly figure out exit
        psw.halt = true;
      }
    },
  },
  0x0b: { op: "BSM", len: 2, f: nop },
  0x0d: { op: "BSR", len: 2, f: nop },
  0x18: { op: "LR", len: 2, f: ([r1, r2], regs) => (regs[r1] = regs[r2]) },
  0x19: {
    op: "CR",
    len: 2,
    f: ([r1, r2], regs, mem, psw) => {
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
  },
  0x41: { op: "LA", len: 4, f: nop },
  0x47: {
    op: "BC",
    len: 4,
    f: ([m, x, b, d1, d2, d3], regs, mem, psw) => {
      const cc = [8, 4, 2, 1][psw.conditionCode];
      if (m === cc) {
        // jmp to d(x,b).
        const D = disp(d1, d2, d3);
        const ptr = (x ? regs[x][3] : 0) + (b ? regs[b][3] : 0) + D;
        // set psw location
          psw.pc = ptr - 3; //(4bytes - 1)
      }
    },
  },
  0x50: {
    op: "ST",
    len: 4,
      f: ([r1,x2,b2,d2a,d2b,d2c], regs, mem, psw) => {
          const D = disp(d2a,d2b,d2c);
          // TODO: figure out x,b... convert to offset
          const ptr = 0 + 0 + D;
          reg_to_mem(mem,ptr,regs[r1]);
    },
    name: "store",
    desc:
      "The first operand is placed unchanged at the second- operand location.",
    pdf: "7-211",
    type: "RX",
    form: "OP R1,D2(X2,B2)",
    form_int: "OPOP R1 X2 B2 D2D2D2",
  },
  0x58: {
    op: "L",
    len: 4,
    f: ([r, x, b, d1, d2, d3], regs, mem) => {
      // L R1,D2(X2,B2)   [RX]
      const D = disp(d1, d2, d3);
      const ptr = (x ? regs[x][3] : 0) + (b ? regs[b][3] : 0) + D;
      mem2reg(mem, ptr, regs[r]);
    },
  },
  0x5a: {
    op: "A",
    len: 4,
    f: (ops, regs, mem) => {
      const [r1, x2, b2, d1, d2, d3] = ops;
      const d = nib3_to_byte(d1, d2, d3);
      regs[r1][3] = regs[r1][3] + mem[x2 + b2 + d2];
    },
  },
  0x90: { op: "STM", len: 4, f: nop },
  0x98: {
    op: "LM",
    len: 4,
    f: (ops, regs, mem) => {
      const [r1, r2, r3, d1, d2, d3] = ops;
      const d = nib3_to_byte(d1, d2, d3);
      // Erm, check this.
      let ptr = regs[r3][3] + d;
        mem_to_reg(mem,ptr,regs[r1]);
        ptr+=4;
        mem_to_reg(mem,ptr,regs[r2]);
        ptr+=4;
        mem_to_reg(mem,ptr,regs[r3]);
        ptr+=4;
        
    },
  },
  0xd7: { op: "XC", len: 6, f: nop },
};

export const op_name = Object.entries(ops).reduce((ac, [k, v]) => {
  const { op: name, len: bytes, f } = v;
  ac[name] = parseInt(k, 10);
  return ac;
}, {});
