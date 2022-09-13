import { expandLiterals } from "../src/assemble.js";

const expand_literals_test = () => {
  const stmt = { operands: ["=f'1'"] };
  const env = { lits: [], stmts: [] };
  const o = expandLiterals(env, stmt);
  const litName = "_lit_0";
  return (
    o.lits.length === 1 &&
    o.lits[0].label === litName &&
    o.lits[0].value === "f'1'" &&
    o.stmts[0].operands[0] === litName
  );
};

export default [expand_literals_test];
