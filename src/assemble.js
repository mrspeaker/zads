import { ops, op_name } from "./ops.js";
import { chunk, eb2code } from "./utils.js";
import { disp_to_nibs, byte_from, fw_to_bytes } from "./bytes.js";
import { ops_extended } from "./ops_extended.js";

export const assemble = (asmTxt) => {
  const { stmts, symbols, base, base_addr } = asmTxt
    .split("\n")
    .filter((v) => !!v)
    .map(tokenize)
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

  return stmts
    .map((s) => parseOperands(s, symbols, base, base_addr))
    .map(expandDataStatements);
};

// TODO: naming! stmt=label+op+opers and stmt=stmt+bytes+pc+type

const mk_stmt = (label, op, operands, comment) => ({
  label,
  op,
  operands,
  comment,
});

const addStmt = (env, stmt) => {
  const op_code = op_name[stmt.op.toUpperCase()];
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

  const [label, op, operands, ...comment] = tok;
  return mk_stmt(
    label.trim(),
    op,
    tokenizeOperands(operands),
    comment?.join(" ")
  );
};

const parseOperands = (s, symbols, base) => {
  const { stmt, bytes, type } = s;
  stmt.operands.forEach((o, i) => {
    const op_bytes = parseOperand(o, symbols, base, type, i, stmt.op);
    bytes.operands.push(...op_bytes);
  });
  return s;
};

const parseOperand = (o, symbols, base, type, idx, op) => {
  const otype = { RR: ["R", "R"], RX: ["R", "X"] }[type] || [];
  const oidx = otype[idx];
  if (type && (!otype || !oidx)) {
    console.warn("what's this operand?", type, o, idx, op);
  }
  switch (oidx) {
    case "R":
      return parseImmediate(o);
    case "X":
      return parseIndexed(o, base, symbols);
    default: {
      const v = parseImmediate(o);
      return v;
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
  const ext = ops_extended[stmt.op.toUpperCase()];
  if (ext) {
    stmt.op = ext.op;
    stmt.operands = [...ext.operands, ...stmt.operands];
  }
  return stmt;
};

// Ensure data is placed on halfword boundary
const checkBoundaryPadding = (env) => {
  if (env.pc % 4 !== 0) {
    const padding = [0, 0];
    addData(env, mk_stmt("", "DC", padding, ""));
    env.pc += padding.length;
  }
};

const assembleStatement = (env, stmt) => {
  const { symbols } = env;
  const { op, operands, label } = stmt;
  const label_lc = label.toLowerCase(); // make up...
  const op_uc = op.toUpperCase(); // ...your mind
  const op_code = op_name[op_uc];
  const isData = ["DC", "DS"].includes(op_uc);
  const isUsing = ["USING"].includes(op_uc);

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
    console.log("miss:", op, (operands ?? [" "]).join(","), lbltxt);
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

const parseIndexed = (o, base, symbols) => {
  if (!symbols[o]) {
    console.warn("TODO: parse base/disp addresses!", o);
    return [0, base, 0, 0, 0];
  }
  return [0, base, ...disp_to_nibs(symbols[o].pc)];
};

const expandDataStatements = (s) => {
  // TODO: nooope. some bytes are bytes. some are nibbles...
  if (s.stmt.op.toUpperCase() === "DC") {
    s.bytes.bytes = [...s.bytes.operands];
  } else {
    s.bytes.bytes = [
      ...s.bytes.op_code,
      ...chunk(s.bytes.operands.flat(), 2).map((b) => byte_from(...b)),
    ];
  }
  return s;
};
