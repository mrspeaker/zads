import {
  base_displace,
  bytes_to_fw,
  from_nibs,
  regset,
  regval,
  memset,
  memval,
  mem_to_reg,
} from "./bytes.js";

export const get_op = (obj, psw) => {
  const b1 = obj[psw];
  let op = ops[b1];
  if (!op) {
    if (ext_ops[b1]) {
      // read extra nibble
      const b2 = obj[psw + 1] & 0x0f;
      op = ops[(b1 << 8) + b2];
    }
  }
  return op;
};

const ext_ops = {
  0xa7: true,
};

const addAndCC = (a, b) => {
  // TODO: handle overflow!
  const c = a + b;
  let cc = 0;
  if (c === 0) {
    cc = 0; // == 0
  } else if (c < 0 || c > 0xf0000000) {
    cc = 1; // < 0
  } else {
    cc = 2; // > 0;
  }
  return { res: c, cc };
};

const jump = (addr, psw) => {
  if (addr === 0) {
    psw.halt = true;
    return;
  }
  psw.pc = addr;
};

export const nop = () => {};
export const ops = {
  0x05: { mn: "BALR", code: [0x05], len: 2, f: nop },
  0x07: {
    mn: "BCR",
    code: [0x07],
    len: 2,
    f: ([r1, r2], regs, mem, psw) => {
      if (r1 === 15 && r2 == 14) {
        // lol, just faking exit.
        // need to properly figure out exit
        psw.halt = true;
      }
      // NOTE: when R2 is 0, op is performed without branching.
    },
    type: "RR",
    form: "OP M1,R1",
    form_int: "OPOP M1 R1",
  },
  0x0b: { mn: "BSM", code: [0x0b], len: 2, f: nop },
  0x0d: { mn: "BSR", code: [0x0d], len: 2, f: nop },
  0x18: {
    mn: "LR",
    code: [0x18],
    len: 2,
    f: ([r1, r2], regs) => memset(regs[r2], regs[r1]),
    name: "load",
    desc:
      "The second operand is placed unchanged at the first operand location",
    pdf: "7-150",
    type: "RR",
    form: "OP R1,R2",
    form_int: "OPOP R1 R2",
  },
  0x19: {
    mn: "CR",
    code: [0x19],
    len: 2,
    f: ([r1, r2], regs, mem, psw) => {
      const a = bytes_to_fw(regs[r1]);
      const b = bytes_to_fw(regs[r2]);
      if (a === b) {
        psw.conditionCode = 0;
      } else if (a < b) {
        psw.conditionCode = 1;
      } else {
        psw.conditionCode = 2;
      }
    },
    type: "RR",
    desc:
      "The first operand is compared with the second operand, and the result is indicated in the condition code.",
    pdf: "7-56",
    form: "OP R1,R2",
    form_int: "OPOP R1 R2",
  },
  0x1a: {
    mn: "AR",
    code: [0x1a],
    len: 2,
    f: ([r1, r2], regs, mem, psw) => {
      const a = regval(regs[r1]);
      const b = regval(regs[r2]);
      const { res, cc } = addAndCC(a, b);
      regset(regs[r1], res);
      psw.conditionCode = cc;
    },
    name: "add",
    desc:
      "The second operand is added to the first operand, and the sum is placed at the first-operand location.",
    pdf: "7-20",
    type: "RR",
    form: "OP R1,R2",
    form_int: "OPOP R1 R2",
  },
  0x1b: {
    mn: "SR",
    code: [0x1b],
    len: 2,
    f: ([r1, r2], regs, mem, psw) => {
      const a = regval(regs[r1]);
      const b = regval(regs[r2]);
      const { res, cc } = addAndCC(a, -b);
      regset(regs[r1], res);
      psw.conditionCode = cc;
    },
    name: "subtract",
    desc:
      "The second operand is subtracted from the first operand, and the difference is placed at the first-operand location.",
    pdf: "7-219",
    type: "RR",
    form: "OP R1,R2",
    form_int: "OPOP R1 R2",
  },
  0x1c: {
    mn: "MR",
    code: [0x1c],
    len: 2,
    f: ([r1, r2], regs, mem, psw) => {
      const a = bytes_to_fw(regs[r1]);
      const b = bytes_to_fw(regs[r2]);
      /*if (a === b) {
        psw.conditionCode = 0;
      } else if (a < b) {
        psw.conditionCode = 1;
      } else {
        psw.conditionCode = 2;
        }*/
      regset(regs[r1], a * b);
    },
    type: "RR",
    desc:
      "first operand (the multiplicand) is multiplied by the 32-bit second-operand (the multiplier), and the 64-bit product is placed at the first-operand location.",
    pdf: "7-304",
    form: "OP R1,R2",
    form_int: "OPOP R1 R2",
  },

  0x1d: {
    mn: "DR",
    code: [0x1d],
    len: 2,
    f: ([r1, r2], regs, mem, psw) => {
      const a = bytes_to_fw(regs[r1]);
      const b = bytes_to_fw(regs[r2]);
      /*if (a === b) {
        psw.conditionCode = 0;
      } else if (a < b) {
        psw.conditionCode = 1;
      } else {
        psw.conditionCode = 2;
        }*/
      // TODO: not even close. check even reg etc.
      regset(regs[r1], Math.floor(a / b));
    },
    type: "RR",
    desc:
      "first operand (the multiplicand) is multiplied by the 32-bit second-operand (the multiplier), and the 64-bit product is placed at the first-operand location.The 64-bit first operand (the dividend) is divided by the 32-bit second operand (the divisor), and the 32-bit remainder and quotient are placed at the first operand location",
    pdf: "7-251",
    form: "OP R1,R2",
    form_int: "OPOP R1 R2",
  },

  //LA R1,D2(X2,B2) [RX-a]
  0x41: {
    mn: "LA",
    code: [0x41],
    len: 4,
    f: ([r1, x2, b2, da, db, dc], regs) => {
      const ptr = base_displace(regs[x2], regs[b2], da, db, dc);
      regset(regs[r1], ptr);
    },
    name: "load address",
    desc:
      "The address specified by the X2, B2, and D2 fields is placed in general register R1.",
    pdf: "7-265",
    type: "RX", //RX-a",
    form: "OP R1,D2(X2,B2)",
    form_int: "OPOP R1 X2 B2 D2D2D2",
  },

  0x46: {
    mn: "BCT",
    code: [0x46],
    len: 4,
    f: ([r1, x2, b2, da, db, dc], regs, mem, psw) => {
      const ptr = base_displace(regs[x2], regs[b2], da, db, dc);
      const v = bytes_to_fw(regs[r1]);
      regset(regs[r1], v - 1);
      if (v !== 0) {
        jump(ptr - 3, psw); //(4bytes - 1)
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
    mn: "BC",
    code: [0x47],
    len: 4,
    f: ([m, x, b, da, db, dc], regs, mem, psw) => {
      const cc = [8, 4, 2, 1][psw.conditionCode];
      if (m & cc) {
        const ptr = base_displace(regs[x], regs[b], da, db, dc);
        jump(ptr - 3, psw);
      }
    },
    type: "RX",
    pdf: "7-29",
    desc:
      "The instruction address in the current PSW is replaced by the branch address if the condition code has one of the values specified by M1; otherwise, normal instruction sequencing proceeds with the updated instruction address.",
    form: "OP M1,D2(X2,B2)",
    form_int: "OPOP M1 X2 B2 D2D2D2",
  },
  0x49: {
    mn: "CH",
    code: [0x49],
    len: 4,
    f: ([r1, x, b, da, db, dc], regs, mem, psw) => {
      const ptr = base_displace(regs[x], regs[b], da, db, dc);
      const rval = bytes_to_fw(regs[r1]);
      const sval = memval(mem, ptr); // NOPE! This is Full word, not half.
      if (rval === sval) {
        psw.conditionCode = 0;
      } else if (rval < sval) {
        psw.conditionCode = 1;
      } else {
        psw.conditionCode = 2;
      }
    },
    type: "RX",
    pdf: "7-72",
    desc:
      "The first operand is compared with the second operand, and the result is indicated in the condition code. The second operand is two bytes in length and is treated as a 16-bit signed binary integer.",
    form: "OP R1,D2(X2,B2)",
    form_int: "OPOP R1 X2 B2 D2D2D2",
  },
  0x50: {
    mn: "ST",
    code: [0x50],
    len: 4,
    f: ([r1, x2, b2, da, db, dc], regs, mem, psw) => {
      const ptr = base_displace(regs[x2], regs[b2], da, db, dc);
      memset(regs[r1], mem, ptr);
    },
    name: "store",
    desc:
      "The first operand is placed unchanged at the second operand location.",
    pdf: "7-211",
    type: "RX",
    form: "OP R1,D2(X2,B2)",
    form_int: "OPOP R1 X2 B2 D2D2D2",
  },
  0x58: {
    mn: "L",
    code: [0x58],
    len: 4,
    f: ([r, x, b, d1, d2, d3], regs, mem) => {
      // L R1,D2(X2,B2)   [RX]
      const ptr = base_displace(regs[x], regs[b], d1, d2, d3);
      mem_to_reg(regs[r], mem, ptr);
    },
    pdf: "7-150",
    type: "RX",
    desc:
      "The second operand is placed unchanged at the first operand location",
    form: "OP R1,D2(X2,B2)",
    form_int: "OPOP R1 X2 B2 D2D2D2",
  },
  0x5a: {
    mn: "A",
    code: [0x5a],
    len: 4,
    f: ([r1, x2, b2, da, db, dc], regs, mem, psw) => {
      const ptr = base_displace(regs[x2], regs[b2], da, db, dc);
      const a = regval(regs[r1]);
      const b = memval(mem, ptr);
      const { res, cc } = addAndCC(a, b);
      regset(regs[r1], res);
      psw.conditionCode = cc;
    },
    name: "add",
    desc:
      "The second operand is added to the first operand, and the sum is placed at the first-operand location.",
    pdf: "7-20",
    type: "RX",
    form: "OP R1,D2(X2,B2)",
    form_int: "OP R1 X2 B2 D2D2D2",
  },
  0x5b: {
    mn: "S",
    code: [0x5b],
    len: 4,
    f: ([r1, x2, b2, da, db, dc], regs, mem, psw) => {
      const ptr = base_displace(regs[x2], regs[b2], da, db, dc);
      const a = regval(regs[r1]);
      const b = memval(mem, ptr);
      const { res, cc } = addAndCC(a, -b);
      regset(regs[r1], res);
      psw.conditionCode = cc;
    },
    name: "subtract",
    desc:
      "The second operand is subtracted from the first operand, and the difference is placed at the first-operand location.",
    pdf: "7-219",
    type: "RX",
    form: "OP R1,D2(X2,B2)",
    form_int: "OP R1 X2 B2 D2D2D2",
  },
  0x5c: {
    mn: "M",
    code: [0x5c],
    len: 4,
    f: ([r1, x2, b2, da, db, dc], regs, mem, psw) => {
      const ptr = base_displace(regs[x2], regs[b2], da, db, dc);
      const a = regval(regs[r1]);
      const b = memval(mem, ptr);
      //const { res, cc } = addAndCC(a, -b);
      regset(regs[r1], a * b);
      //psw.conditionCode = cc;
    },
    name: "multiply",
    desc:
      "first operand (the multiplicand) is multiplied by the 32-bit second operand (the multiplier), and the 64-bit product is placed at the first operand location.",
    pdf: "7-304",
    type: "RX",
    form: "OP R1,D2(X2,B2)",
    form_int: "OP R1 X2 B2 D2D2D2",
  },
  0x5d: {
    mn: "D",
    code: [0x5d],
    len: 4,
    f: ([r1, x2, b2, da, db, dc], regs, mem, psw) => {
      const ptr = base_displace(regs[x2], regs[b2], da, db, dc);
      const a = regval(regs[r1]);
      const b = memval(mem, ptr);
      //const { res, cc } = addAndCC(a, -b);
      regset(regs[r1], Math.floor(a / b));
      //psw.conditionCode = cc;
    },
    name: "divide",
    desc:
      "The 64-bit first operand (the dividend) is divided by the 32-bit second operand (the divisor), and the 32-bit remainder and quotient are placed at the first operand location",
    pdf: "7-251",
    type: "RX",
    form: "OP R1,D2(X2,B2)",
    form_int: "OP R1 X2 B2 D2D2D2",
  },
  0x90: { mn: "STM", code: [0x90], len: 4, f: nop },
  0x91: {
    mn: "TM",
    code: [0x91],
    len: 4,
    f: ([i1, i2, r1, da, db, dc], regs, mem, psw) => {
      const val = from_nibs([i1, i2]);
      const ptr = base_displace(0, regs[r1], da, db, dc);
      //TODO: test under mask. CC:
      // 0 Selected bits all zeros; or mask bits all zeros
      // 1 Selected bits mixed zeros and ones (TM and TMY only)
      // 1 Selected bits mixed zeros and ones, and leftmost is zero (TMHH, TMHL, TMLH, TMLL)
      // 2 -- (TM and TMY only)
      // 2 Selected bits mixed zeros and ones, and leftmostis one (TMHH, TMHL, TMLH, TMLL)
      // 3 Selected bits all ones
    },
    name: "test under mask",
    desc:
      "A mask is used to select bits of the first operand, and the result is indicated in the condition code.",
    pdf: "7-400",
    type: "SI",
    form: "OP D1(B1),I2",
    form_int: "OPOP I2I2 B1 D1D1D1",
  },
  0x92: {
    mn: "MVI",
    code: [0x92],
    len: 4,
    f: ([i1, i2, r1, da, db, dc], regs, mem, psw) => {
      const val = from_nibs([i1, i2]);
      const ptr = base_displace(0, regs[r1], da, db, dc);
      mem[ptr] = val;
    },
    name: "move",
    desc: "The second operand is placed at the first-operand location.",
    pdf: "7-163",
    type: "SI",
    form: "OP D1(B1),I2",
    form_int: "OPOP I2I2 B1 D1D1D1",
  },
  0x98: {
    mn: "LM",
    code: [0x98],
    len: 4,
    f: (ops, regs, mem) => {
      // Erm, check this logic. Looks real bad.
      const [r1, r2, r3, ...d] = ops;
      const D = from_nibs(d);

      // TODO: wrap r1 to r2
      let ptr = regs[r3][3] + D;
      mem_to_reg(mem, ptr, regs[r1]);
      ptr += 4;
      mem_to_reg(mem, ptr, regs[r2]);
      ptr += 4;
      mem_to_reg(mem, ptr, regs[r3]);
      ptr += 4;
    },
    pdf: "7-159",
    type: "RS",
    form: "OP R1,R3,D2(B2)",
    form_int: "OPOP R1 R3 B2 D2D2D2",
  },
  0xc20d: {
    mn: "CFI",
    code: [0xc20d],
    len: 4,
    f: ([...args], regs, mem, psw) => {
      /*      const a = regval(regs[r1]);
      const b = from_nibs([ia, ib, ic, id]);
      const { res, cc } = addAndCC(a, b);
      regset(regs[r1], res);
      psw.conditionCode = cc;
      */
      console.log("CFI args:", args);
    },
    name: "compare immediate",
    desc:
      "The first operand is compared with the second operand, and the result is indicated in the condition code.",
    pdf: "7-22",
    type: "RI", //RIL
    form: "OP R1,I2",
    form_int: "OPOP R1 OP I2I2I2I2I2I2I2I2",
  },

  0xd7: { mn: "XC", code: [0xd7], len: 6, f: nop },
  0xd2: {
    mn: "MVC",
    code: [0xd2],
    len: 12,
    f: ([i1, i2, r1, da, db, dc], regs, mem, psw) => {
      const val = from_nibs([i1, i2]);
      const ptr = base_displace(0, regs[r1], da, db, dc);
      // TODO: +3? Where should it write?
      //mem[ptr + 3] = val;
    },
    name: "move",
    desc:
      "The second operand is placed at the first-operand location. Each operand is processed left to right. When the operands overlap, the result is obtained as if the operands were processed one byte at a time and each result byte were stored immedi- ately after fetching the necessary operand byte.",
    pdf: "7-163",
    type: "SS",
    form: "OP D1(L1,B1),D2(B2)",
    form_int: "OPOP L1L1 B1 D1D1D1 B2 D2D2D2",
  },
  0xa70a: {
    mn: "AHI",
    code: [0xa7, 0x0a],
    len: 4,
      f: ([r1,,i2a,i2b,i2c,i2d], regs, mem, psw) => {
          const a = regval(regs[r1]);
          // propagate sign:
          const b = bytes_to_fw([
              from_nibs([i2a,i2a]),
              from_nibs([i2a,i2a]),
              from_nibs([i2a, i2b]),
              from_nibs([i2c, i2d])]);
      const { res, cc } = addAndCC(a, b);
      regset(regs[r1], res);
      psw.conditionCode = cc;
    },
    name: "add halfword immediate",
    desc:
      "The second operand is added to the first operand, and the sum is placed at the first-operand location. The second operand is two bytes in length and is treated as a 16-bit signed binary integer.",
    pdf: "7-22",
    type: "RI",
    form: "OP R1,I2",
    form_int: "OPOP R1 OP I2I2I2I2",
  },
};

export const op_by_mn = Object.values(ops).reduce((ac, op) => {
  const { mn, code } = op;
  // Convert multi-byte ops to decimal (single bytes too)
  ac[mn] = code.reduce(
    (ac, el, i) => ac + (el << (8 * (code.length - 1 - i))),
    0
  );
  return ac;
}, {});
