export const ops_extended = {
  NOP: { mn: "BC", op_code: 0x47, operands: [0] },
  B: { mn: "BC", op_code: 0x47, operands: [15] },
  // After compare
  BH: { mn: "BC", op_code: 0x47, operands: [2] },
  BL: { mn: "BC", op_code: 0x47, operands: [4] },
  BNE: { mn: "BC", op_code: 0x47, operands: [7] },
  BE: { mn: "BC", op_code: 0x47, operands: [8] },
  BNL: { mn: "BC", op_code: 0x47, operands: [11] },
  BNH: { mn: "BC", op_code: 0x47, operands: [13] },
  // After arithmetic
  BO: { mn: "BC", op_code: 0x47, operands: [1] },
  BP: { mn: "BC", op_code: 0x47, operands: [2] },
  BM: { mn: "BC", op_code: 0x47, operands: [4] },
  BNZ: { mn: "BC", op_code: 0x47, operands: [7] },
  BZ: { mn: "BC", op_code: 0x47, operands: [8] },
  BNM: { mn: "BC", op_code: 0x47, operands: [11] },
  BNP: { mn: "BC", op_code: 0x47, operands: [13] },
  BNO: { mn: "BC", op_code: 0x47, operands: [14] },
};
