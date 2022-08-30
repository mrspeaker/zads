import { ops, op_name } from "./ops.js";
import { $, $click, toHex, chunk, eb2code } from "./utils.js";
import { disp_to_nibs, byte_from, fw_to_bytes } from "./bytes.js";

export const bindAssembleUI = (onAssemble) => {
  $click("#btnAsm", () => {
    onAssemble(assembleText($("#src").value));
  });
};

const mk_stmt = (label, op, operands, comment) => ({
  label,
  op,
  operands,
  comment,
});

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
  return env.stmts.push({
    stmt,
    bytes: {
      op_code: [],
      operands: [],
      bytes: [],
    },
    pc: env.pc,
  });
};

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
  const label_lc = label.toLowerCase();
  const op_lc = op.toLowerCase();
  const op_code = op_name[op.toUpperCase()];
  const isData = ["dc", "ds"].includes(op_lc);
  const isUsing = ["using"].includes(op_lc);

  if (op_code) {
    addStmt(env, stmt);
    label && (symbols[label_lc] = { pc: env.pc, len: ops[op_code].len });
    env.pc += ops[op_code].len;
  } else if (isData) {
    checkBoundaryPadding(env);
    addData(env, stmt);
    label && (symbols[label_lc] = { pc: env.pc, len: 4 });
    env.pc += 4; // TODO: needs to be DC len!
  } else if (isUsing) {
    const [addr, base] = operands;
    const addr_lc = addr.trim().toLowerCase();
    env.base = parseInt(base, 10);
    // TODO: currently only finds symbols _before_ current statement!
    env.base_addr = addr_lc === "*" ? env.pc : symbols[addr_lc];
  } else {
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

const parseOperands = (stmts, symbols, base) => {
  return stmts.map((s) => {
    const { stmt, bytes, type } = s;
    stmt.operands.forEach((o, i) => {
      const op_bytes = parseOperand(o, symbols, base, type, i, stmt.op);
      bytes.operands.push(...op_bytes);
    });
    return s;
  });
};

const expandData = (stmts) => {
  return stmts.map((s) => {
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
  });
};

export const assembleText = (txt) => {
  const { stmts, symbols, base, base_addr } = txt
    .split("\n")
    .filter((v) => !!v)
    .map(tokenize)
    .reduce(assembleStatement, {
      pc: 0,
      stmts: [],
      symbols: {},
      base: 15,
      base_addr: 0,
    });

  // Some memory for a addressable "graphics screen"
  symbols["screen"] = { pc: 0x100, len: 0x100 };

  const mapped = parseOperands(stmts, symbols, base, base_addr);
  const expanded = expandData(mapped);
  return expanded;
};
