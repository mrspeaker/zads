import {
  assembleStatement,
  expandLiterals,
  LITERAL_GEN_PREFIX,
} from "../src/assemble.js";

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

const assemble_stmt_test = () => {
  const env = { pc: 0, stmts: [] };
  const stmt = { mn: "LR", label: "" };

  //{"pc":0,"stmts":[],"symbols":{},"equates":{},"base":15,"base_addr":0}
  //{"label":"","mn":"l","operands":["1","a1"],"comment":"load register"}
  assembleStatement(env, stmt);
  console.log(env);
  return false;
};

export default [expand_literals_test, assemble_stmt_test];
