export const ops_extended = {
  NOP: { op: "BC", op_code: 0x47, operands: [0] },
  B: { op: "BC", op_code: 0x47, operands: [15] },
  // After compare
  BH: { op: "BC", op_code: 0x47, operands: [2] },
  BL: { op: "BC", op_code: 0x47, operands: [4] },
  BNE: { op: "BC", op_code: 0x47, operands: [7] },
  BE: { op: "BC", op_code: 0x47, operands: [8] },
  BNL: { op: "BC", op_code: 0x47, operands: [11] },
  BNH: { op: "BC", op_code: 0x47, operands: [13] },
  // After arithmetic
  BO: { op: "BC", op_code: 0x47, operands: [1] },
  BP: { op: "BC", op_code: 0x47, operands: [2] },
  BM: { op: "BC", op_code: 0x47, operands: [4] },
  BNZ: { op: "BC", op_code: 0x47, operands: [7] },
  BZ: { op: "BC", op_code: 0x47, operands: [8] },
  BNM: { op: "BC", op_code: 0x47, operands: [11] },
  BNP: { op: "BC", op_code: 0x47, operands: [13] },
  BNO: { op: "BC", op_code: 0x47, operands: [14] },
};
