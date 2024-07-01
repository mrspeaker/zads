import { tokenizeOperands } from "../src/operands.js";

const tokenize_simple_operands = () => {
  const toks = tokenizeOperands("op1,op2");
  return toks.length == 2 && toks[0] == "op1" && toks[1] == "op2";
};

export default [tokenize_simple_operands];
