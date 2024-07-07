import { tokenizeOperands, parseOperands } from "../src/operands.js";
import { arrEq } from "../src/utils.js";

const tokenize_simple_operands = () => {
  const toks = tokenizeOperands("op1,op2");
  return toks.length == 2 && toks[0] == "op1" && toks[1] == "op2";
};

const parse_ri = () => {
  const s = {
    stmt: {
      operands: ["2", "1"],
    },
    bytes: {
      op_code: [0xa7a],
      operands: [],
      bytes: [],
    },
    type: "RI",
  };
  // For RI should split the op_code into 0xa7 and 0xa.
  parseOperands(s, {}, [], 0);
  return (
    s.bytes.op_code[0] == 0xa7 &&
    s.bytes.operands[1] == 0xa &&
    arrEq(s.bytes.operands, [2, 10, 0, 0, 0, 1])
  );
};

const parse_ss = () => {
  //    form: "OP D1(L1,B1),D2(B2)",
  //    form_int: "OPOP L1L1 B1 D1D1D1 B2 D2D2D2",
  const s = {
    stmt: {
      operands: [0xd2, 0xff, 0xf1, 0x2c, 0xf2, 0x2c].map((v) => v.toString()),
      mn: "mvc",
    },
    bytes: {
      op_code: [0xd2],
      operands: [],
      bytes: [],
    },
    type: "SS",
  };

  parseOperands(s, {}, [], 0);
  return (
    s.bytes.op_code[0] == 0xd2 &&
    s.bytes.operands[1] == 0xa &&
    arrEq(s.bytes.operands, [2, 10, 0, 0, 0, 1])
  );
};

export default [tokenize_simple_operands, parse_ri, parse_ss];
