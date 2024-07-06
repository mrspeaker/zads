import { assembleStatement, tokenize } from "../src/assemble.js";
import { expandLiterals, LITERAL_GEN_PREFIX } from "../src/operands.js";
const expand_literals_test = () => {
  const stmt = { operands: ["=f'1'"] };
  const env = { lits: [], stmts: [] };
  const o = expandLiterals(env, stmt);
  const gen_litName = LITERAL_GEN_PREFIX + "0";
  return (
    o.lits.length === 1 &&
    o.lits[0].label === gen_litName &&
    o.lits[0].value === "f'1'" &&
    o.stmts[0].operands[0] === gen_litName
  );
};

const tokenize_line_test_1 = () => {
  const toks = tokenize("label mn op1,op2 comment is here");
  return (
    toks.label == "label" &&
    toks.mn == "mn" &&
    toks.operands.length &&
    toks.comment == "comment is here"
  );
};

const tokenize_line_test_2 = () => {
  // Check that skipping label works
  const toks = tokenize(" mn op1,op2 comment is here");
  return (
    toks.label == "" &&
    toks.mn == "mn" &&
    toks.operands.length &&
    toks.comment == "comment is here"
  );
};

const assemble_stmt_test = () => {
  const env = { pc: 0, stmts: [], symbols: {} };
  const stmt = { mn: "LR", label: "test", operands: ["1", "2"] };

  assembleStatement(env, stmt);

  const symbols_ok = env.symbols.test?.pc === 0;
  const stmt_ok = env.stmts[0]?.bytes.op_code[0] === 0x18;
  return symbols_ok && stmt_ok;
};

export default [
  expand_literals_test,
  tokenize_line_test_1,
  tokenize_line_test_2,
  assemble_stmt_test,
];
