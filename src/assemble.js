import { ops, op_by_mn } from "./ops.js";
import { chunk, eb2code } from "./utils.js";
import { nib, to_nibs, disp_to_nibs, byte_from, fw_to_bytes } from "./bytes.js";
import { ops_extended } from "./ops_extended.js";

export const assemble = (asmTxt) => {
  const { stmts, symbols, base, base_addr } = asmTxt
    .split("\n")
    .filter((v) => !!v.trim() && v[0] !== "*")
    .map(tokenize)
    .reduce(expandMacros, [])
    .map(remapExtendedMnemonics)
    .reduce(assembleStatement, {
      pc: 0,
      stmts: [],
      symbols: {},
      base: 15, // default to base reg 15. Is that correct?
      base_addr: 0,
    });

  // Some memory for a addressable "graphics screen"
  symbols["screen"] = { pc: 0x100, len: 0x100 };

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

const tokenizeOperands = (ops) => {
  // comma, followed by NOT open paren, stuff, close paren.
  // Splits on commas, but not inside parens (eg `L R1,0(,R15)`)
  return ops?.split(/,(?![^(]*\))/g);
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

const parseOperands = (s, symbols, base) => {
  const { stmt, bytes, type } = s;
  // Parse to bytes
  const enc = stmt.operands.map((o, i) =>
    parseOperand(o, symbols, base, type, i, stmt.mn)
  );

  // Re-org operands depending on operation.
  switch (type) {
    case "RR":
    case "RX":
      if (enc.length > 2) {
        console.warn("nop, rong length", enc);
      }
      bytes.operands.push(...enc[0], ...enc[1]);
      break;
    case "RI":
      {
        // extract extra opcode byte
        const extra = ops[bytes.op_code[0]].code[1];
        bytes.operands.push(...enc[0], extra, ...enc[1]);
      }
      break;
    case "SI":
      // I2I2 B1 D1D1D1
      bytes.operands.push(...enc[1], ...enc[0].slice(1));
      break;
    case "SS":
      // L1L1 B1 D1D1D1 B2 D2D2D2
      console.log("eg MVC. TODO!");
      break;
    case "DC":
    case undefined:
      // Just dump the bytes
      enc.forEach((bs) => bytes.operands.push(...bs));
      break;
    default:
      console.log("not rr rx si...", type, enc);
  }
  return s;
};

// Return (mostly?) nibbles
const parseOperand = (o, symbols, base, type, idx, mn) => {
  if (type === "DC") {
    return parseImmediate(o);
  }
  const otype =
    {
      RR: ["R", "R"],
      RX: ["R", "X"],
      SI: ["S", "I"],
      SS: ["I", "X", "X"],
      RI: ["R", "I"],
    }[type] || [];
  const oidx = otype[idx];
  if (type && type !== "DC" && (!otype || !oidx)) {
    console.warn("What's this operand?", type, o, idx, mn);
  }
  switch (oidx) {
    case "R":
      // One number? Correct? Should not be over 15 anyway.
      if (o > 15 || o < 0) console.warn("bad reg", o);
      return parseImmediate(o);
    case "I": {
      const nibs = type === "RI" ? 4 : 2;
      return to_nibs(parseImmediate(o), nibs);
    }
    case "X":
    case "S": {
      return parseBaseDisplace(o, base, symbols);
    }
    default: {
      console.warn("unhandeld mn?", oidx, otype, type);
      return parseImmediate(o);
    }
  }
};

const parseDataOperand = (d) => {
  const numReps = parseInt(d, 10);
  if (isNaN(numReps)) {
    return parseImmediate(d);
  }
  // Expand repetitions
  const value = d.slice((numReps + "").length);
  return new Array(numReps).fill(parseImmediate(value)).flat();
};

const remapExtendedMnemonics = (stmt) => {
  const ext = ops_extended[stmt.mn.toUpperCase()];
  if (ext) {
    stmt.mn = ext.mn;
    stmt.operands = [...ext.operands, ...stmt.operands];
  }
  return stmt;
};

const expandMacros = (ac, stmt) => {
  // TODO: expand any macros!
  switch (stmt.mn.toLowerCase()) {
    case "asmdreg":
      {
        console.log("ASMDREG");
        const dcs = [...Array(16)]
          .fill(0)
          .map((_, i) => mk_stmt_toks(`R${i}`, "DC", [`f'${i}'`], ""));
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

const assembleStatement = (env, stmt) => {
  const { symbols } = env;
  const { mn, operands, label } = stmt;
  const label_lc = label.toLowerCase(); // make up...
  const mn_uc = mn.toUpperCase(); // ...your mind

  const op_code = op_by_mn[mn_uc];
  const isData = ["DC", "DS"].includes(mn_uc);
  const isUsing = ["USING"].includes(mn_uc);

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
    // ============= Label ============

    const lbltxt = label ? `[${label}]` : " ";
    label && (symbols[label_lc] = { pc: env.pc, len: 4 });
    console.log("miss:", mn, (operands ?? [" "]).join(","), lbltxt);
  }

  return env;
};

const parseImmediate = (v) => {
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

const parseBaseDisplace = (o, base, symbols) => {
  const INDEX = 0;

  const bdregex = /([0-9]+)\(([0-9]*),([0-9]+)\)/g;
  const matches = [...o.matchAll(bdregex)].flat();

  if (matches.length === 4) {
    //base disp
    const [, disp, index, base] = matches;
    const mindex = !!index ? index : 0;
    const mbase = !!base ? base : 0;
    return [mindex, mbase, 0, 0, disp];
  } else if (symbols[o]) {
    return [INDEX, base, ...disp_to_nibs(symbols[o].pc)];
  } else {
    // Missing symbol.
    console.warn("msising sybmol", o);
  }
  return [INDEX, base, 0, 0, 0];
  //  return [INDEX, base, ...disp_to_nibs(symbols[o].pc)];
};

const expandDataStatements = (s) => {
  if (s.stmt.mn.toUpperCase() === "DC") {
    s.bytes.bytes = [...s.bytes.operands];
  } else {
    s.bytes.bytes = [
      ...s.bytes.op_code,
      ...chunk(s.bytes.operands.flat(), 2).map((b) => byte_from(...b)),
    ];
  }
  return s;
};
