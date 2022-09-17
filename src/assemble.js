import { ops, op_by_mn } from "./ops.js";
import { chunk, eb2code } from "./utils.js";
import { to_nibs, from_nibs, fw_to_bytes } from "./bytes.js";
import { ops_extended } from "./ops_extended.js";
import {
  parseOperands,
  parseDataOperand,
  expandLiterals,
  tokenizeOperands,
} from "./operands.js";

export const assemble = (asmTxt, extraEqsF, extraSymbolsF) => {
  const tokens = asmTxt
    .split("\n")
    .filter((v) => !!v.trim() && v[0] !== "*")
    .map(tokenize);

  if (tokens[tokens.length - 2].mn.toLowerCase() !== "end") {
    // If the END instruction is omitted, one is generated by
    // the assembler, and message ASMA140W END record missing is issued
    console.warn("ASMA140W: END record missing");
    // TODO: insert END.
  }

  const expanded = tokens
    .reduce(expandMacros, [])
    .reduce(expandLiterals, { lits: [], stmts: [] });

  // TODO: need to inject literals somewhere - with corresponding PC,
  // _before_ assebmbling the statement. Sould be LTORG
  console.log("Literals:", expanded.lits);

  const equateExpanded = remapEquates(expanded.stmts, extraEqsF);

  const { stmts, symbols, base, base_addr } = equateExpanded
    .map(remapExtendedMnemonics)
    .reduce(assembleStatement, {
      pc: 0,
      stmts: [],
      symbols: {},
      equates: {},
      base: 15, // default to base reg 15. Is that correct?
      base_addr: 0,
    });

  extraSymbolsF && extraSymbolsF(symbols);

  const bytes = stmts
    .map((s) => parseOperands(s, symbols, base, base_addr))
    .map(expandDataStatements);

  return {
    stmts,
    bytes,
    symbols,
    addressing: {
      base,
      base_addr,
    },
  };
};

// TODO: naming! stmt=label+op+opers and stmt=stmt+bytes+pc+type

const mk_stmt_toks = (label, mn, operands, comment) => ({
  label,
  mn,
  operands,
  comment,
});

const addStmt = (env, stmt) => {
  const op_code = op_by_mn[stmt.mn.toUpperCase()];
  const op = ops[op_code];
  return env.stmts.push({
    stmt,
    bytes: {
      op_code: [op_code],
      operands: [],
      bytes: [],
    },
    pc: env.pc,
    type: op?.type ?? "??",
  });
};

const addData = (env, stmt) => {
  const d = {
    stmt,
    bytes: {
      op_code: [],
      operands: [],
      bytes: [],
    },
    pc: env.pc,
    type: "DC",
  };
  env.stmts.push(d);
  return d;
};

const tokenize = (line) => {
  const tok = line.split(" ").reduce((ac, el, i) => {
    if (i === 0 || el !== "") {
      ac.push(el);
    }
    return ac;
  }, []);

  const [label, mn, operands, ...comment] = tok;
  return mk_stmt_toks(
    label.trim(),
    mn,
    tokenizeOperands(operands),
    comment?.join(" ")
  );
};

const remapExtendedMnemonics = (stmt) => {
  const ext = ops_extended[stmt.mn.toUpperCase()];
  if (ext) {
    stmt.mn = ext.mn;
    stmt.operands = [...ext.operands, ...stmt.operands];
  }
  return stmt;
};

const remapEquates = (stmts, injectExtraEqsF) => {
  const eqs = stmts.reduce((ac, el) => {
    const { label, mn, operands } = el;
    if (mn.toLowerCase() === "equ") {
      ac[label.toLowerCase()] = parseImmediate(operands[0])[0] + "";
    }
    return ac;
  }, {});
  injectExtraEqsF && injectExtraEqsF(eqs);
  return stmts.reduce((ac, el) => {
    if (el.mn.toLowerCase() === "equ") return ac;
    ac.push(el);
    if (el.operands) {
      el.operands = el.operands.map((v) => {
        // Split up base/display parens
        const [first, ...rest] = v.split(/[,()]/g);

        const firstEq = eqs[first.toLowerCase()];
        const head = firstEq !== undefined ? firstEq : first;

        const parens = rest.slice(0, -1).map((v) => {
          const equate = eqs[v.toLocaleLowerCase()];
          return v && equate !== undefined ? equate : v;
        });
        // Rebuild them.
        return head + (parens.length ? "(" + parens.join(",") + ")" : "");
      });
    }
    return ac;
  }, []);
};

const expandMacros = (ac, stmt) => {
  // TODO: expand any macros!
  switch (stmt.mn.toLowerCase()) {
    case "asmdreg":
      {
        console.log("ASMDREG");
        const dcs = [...Array(16)]
          .fill(0)
          .map((_, i) => mk_stmt_toks(`R${i}`, "equ", [i + ""], ""));
        ac.push(...dcs);
      }
      break;
    default:
      ac.push(stmt);
  }
  return ac;
};

// Ensure data is placed on halfword boundary
const checkBoundaryPadding = (env) => {
  if (env.pc % 4 !== 0) {
    const padding = [0, 0];
    addData(env, mk_stmt_toks("", "DC", padding, ""));
    env.pc += padding.length;
  }
};

// Ok, what is this function actually doing?
// What should be the results? At the moment it
// does a bunch of things depending on the type of op.
// TODO: rename.
export const assembleStatement = (env, stmt) => {
  const { symbols } = env;
  const { mn, operands, label } = stmt;
  const label_lc = label.toLowerCase(); // make up...
  const mn_uc = mn.toUpperCase(); // ...your mind

  const op_code = op_by_mn[mn_uc];
  const isData = ["DC", "DS"].includes(mn_uc);
  const isUsing = ["USING"].includes(mn_uc);

  // SYmbol definition:
  /*
  The symbol must not consist of more than 63 alphanumeric characters.
  The first character must be an alphabetic character.
  An alphabetic character is a letter from A through Z,
  or from a through z, or $, _, #, or @.
  The other characters in the symbol can be alphabetic characters,
  digits, or a combination of the two.
  
  The assembler does not distinguish between upper-case and lower-case letters used in symbols.
  */

  if (op_code) {
    // ====== Regular op code =========

    addStmt(env, stmt);
    label && (symbols[label_lc] = { pc: env.pc, len: ops[op_code].len });
    env.pc += ops[op_code].len;
  } else if (isData) {
    // ======= Data statement: eg `DC 18f'0'` ==========

    checkBoundaryPadding(env);
    const mstmt = addData(env, stmt);
    const bytes = parseDataOperand(mstmt.stmt.operands[0]);
    mstmt.stmt.operands = bytes;
    label && (symbols[label_lc] = { pc: env.pc, len: bytes.length });
    env.pc += bytes.length;
  } else if (isUsing) {
    // ========= USING statement ============

    const [addr, base] = operands;
    const addr_lc = addr.trim().toLowerCase();
    env.base = parseInt(base, 10);
    // TODO: currently only finds symbols _before_ current statement!
    env.base_addr = addr_lc === "*" ? env.pc : symbols[addr_lc];
  } else {
    // ============= Unknown ============

    const lbltxt = label ? `[${label}]` : " ";
    label && (symbols[label_lc] = { pc: env.pc, len: 4 });
    console.log("miss:", mn, (operands ?? [" "]).join(","), lbltxt);
  }

  return env;
};

export const parseImmediate = (v) => {
  const [a, b, ...rest] = v.toString().split("");
  if (b === "'") {
    const num = rest.slice(0, -1).join("");
    switch (a.toLowerCase()) {
      case "b":
        return [parseInt(num, 2)];
      case "x":
        return [parseInt(num, 16)];
      case "c":
        return [eb2code(rest[0])];
      case "f":
        return fw_to_bytes(parseInt(num, 10));

      default:
        console.log("Other parse immediate:", a, num);
        return [parseInt(num, 10)];
    }
  } else {
    switch (a) {
      case "f":
        return [];
    }
  }

  return [parseInt(v, 10)];
};

export const parseBaseDisplace = (o, base, symbols) => {
  const INDEX = 0;
  const bdregex = /([\d\w]+)\(([\d\w]*),([\d\w]+)\)/g;
  const matches = [...o.matchAll(bdregex)].flat();
  if (matches.length === 4) {
    //base disp
    const [, disp, index, base] = matches;
    const mindex = parseInt(index, 10) || 0;
    const mbase = parseInt(base, 10) || 0;
    const mdisp = parseInt(disp, 10) || 0;
    return [mindex, mbase, ...to_nibs(mdisp, 3)];
  } else if (symbols[o.toLowerCase()]) {
    return [INDEX, base, ...to_nibs(symbols[o.toLowerCase()].pc, 3)];
  } else {
    console.warn("Missing symbol:", o);
  }
  return [INDEX, base, 0, 0, 0];
};

const expandDataStatements = (s) => {
  if (s.stmt.mn.toUpperCase() === "DC") {
    s.bytes.bytes = [...s.bytes.operands];
  } else {
    s.bytes.bytes = [
      ...s.bytes.op_code,
      ...chunk(s.bytes.operands.flat(), 2).map(from_nibs),
    ];
  }
  return s;
};
