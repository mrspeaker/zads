import {
  base_displace,
  nib3_to_byte,
  mem_to_reg,
  memcpy,
  bytes_to_fw,
  regset,
} from "./bytes.js";

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
  0x18: {
    op: "LR",
    len: 2,
    f: ([r1, r2], regs) => memcpy(regs[r2], regs[r1]),
    name: "load",
    desc:
      "The second operand is placed unchanged at the first- operand location",
    pdf: "7-150",
    type: "RR",
    form: "OP R1,R2",
    form_int: "OPOP R1,R2",
  },
  0x19: {
    op: "CR",
    len: 2,
    f: ([r1, r2], regs, mem, psw) => {
      const a = bytes_to_fw(...regs[r1]);
      const b = bytes_to_fw(...regs[r2]);
      if (a === b) {
        psw.conditionCode = 0;
      } else if (a < b) {
        psw.conditionCode = 1;
      } else {
        psw.conditionCode = 2;
      }
    },
  },
  //LA R1,D2(X2,B2) [RX-a]
  0x41: {
    op: "LA",
    len: 4,
    f: ([r1, x2, b2, da, db, dc], regs, mem, psw) => {
      const ptr = base_displace(regs[x2], regs[b2], da, db, dc);
      regset(regs[r1], ptr);
    },
    name: "load address",
    desc:
      "The address specified by the X2, B2, and D2 fields is placed in general register R1.",
    pdf: "7-265",
    type: "RX-a",
    form: "OP R1,D2(X2,B2)",
    form_int: "OPOP R1 X2 B2 D2D2D2",
  },

  0x46: {
    op: "BCT",
    len: 4,
    f: ([r1, x2, b2, da, db, dc], regs, mem, psw) => {
      const ptr = base_displace(regs[x2], regs[b2], da, db, dc);
      const v = bytes_to_fw(...regs[r1]);
      regset(regs[r1], v - 1);
      if (v !== 0) {
        // set psw location
        psw.pc = ptr - 3; //(4bytes - 1)
      }
    },
    name: "branch on count",
    desc:
      "A one is subtracted from the first operand. When the result is zero, normal instruction sequencing proceeds with the updated instruction address. When the result is not zero, the instruction address in the current PSW is replaced by the branch address.",
    pdf: "7-2xx",
    type: "RX",
    form: "OP R1,D2(X2,B2)",
    form_int: "OPOP R1 X2 B2 D2D2D2",
  },
  0x47: {
    op: "BC",
    len: 4,
    f: ([m, x, b, da, db, dc], regs, mem, psw) => {
      const cc = [8, 4, 2, 1][psw.conditionCode];
      if (m === cc) {
        const ptr = base_displace(regs[x], regs[b], da, db, dc);
        // set psw location
        psw.pc = ptr - 3; //(4bytes - 1)
      }
    },
  },
  0x50: {
    op: "ST",
    len: 4,
    f: ([r1, x2, b2, da, db, dc], regs, mem, psw) => {
      const ptr = base_displace(regs[x2], regs[b2], da, db, dc);
      memcpy(regs[r1], mem, ptr);
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
      const ptr = base_displace(regs[x], regs[b], d1, d2, d3);
      mem_to_reg(regs[r], mem, ptr);
    },
  },
  0x5a: {
    op: "A",
    len: 4,
    f: ([r1, x2, b2, da, db, dc], regs, mem) => {
      const ptr = base_displace(regs[x2], regs[b2], da, db, dc);
      mem_to_reg(mem, ptr, regs[r1]);
    },
  },
  0x90: { op: "STM", len: 4, f: nop },
  0x92: {
    op: "MVI",
    len: 4,
    f: ([i2a, i2b, b1, d1a, d1b, d1c], regs, mem, psw) => {
      console.log("MVI", i2a, i2b, b1, d1a, d1b, d1c);
      //      const ptr = base_displace(regs[x2], regs[b2], da, db, dc);
      //      memcpy(regs[r1], mem, ptr);
    },
    name: "move",
    desc: "The second operand is placed at the first-operand location.",
    pdf: "7-163",
    type: "SI",
    form: "OP D1(B1),I2",
    form_int: "OPOP I2I2 B1 D1D1D1",
  },
  0x98: {
    op: "LM",
    len: 4,
    f: (ops, regs, mem) => {
      // Erm, check this logic. Looks real bad.
      const [r1, r2, r3, d1, d2, d3] = ops;
      const d = nib3_to_byte(d1, d2, d3);

      // TODO: wrap r1 to r2

      let ptr = regs[r3][3] + d;
      mem_to_reg(mem, ptr, regs[r1]);
      ptr += 4;
      mem_to_reg(mem, ptr, regs[r2]);
      ptr += 4;
      mem_to_reg(mem, ptr, regs[r3]);
      ptr += 4;
    },
  },
  0xd7: { op: "XC", len: 6, f: nop },
};

// TODO: maybe return array for multi-byte ops
export const op_name = Object.entries(ops).reduce((ac, [k, v]) => {
  const { op: name } = v;
  ac[name] = parseInt(k, 10);
  return ac;
}, {});
