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

const tokenize = (line) => {
  const tok = line.split(" ").reduce((ac, el, i) => {
    if (i === 0 || el !== "") {
      ac.push(el);
    }
    return ac;
  }, []);

  const [label, op, operands, ...comment] = tok;
  return mk_stmt(label, op, operands?.split(","), comment?.join(" "));
};

const addStmt = (env, stmt) => {
  const op_code = op_name[stmt.op.toUpperCase()];
  return env.stmts.push({
    stmt,
    bytes: {
      op_code: [op_code],
      operands: [],
      bytes: [],
    },
    pc: env.pc,
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
  const { labels } = env;
  const { op, operands, label } = stmt;
  const isData = ["DC", "DS"].includes(op.toUpperCase());
  const op_code = op_name[op.toUpperCase()];

  if (op_code) {
    addStmt(env, stmt);
    label && (labels[label] = env.pc);
    env.pc += ops[op_code].len;
  } else if (isData) {
    checkBoundaryPadding(env);
    addData(env, stmt);
    label && (labels[label] = env.pc);
    env.pc += 4; // TODO: needs to be DC len!
  } else {
    const lbltxt = label ? `[${label}]` : " ";
    label && (labels[label] = env.pc);
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
      case "f":
        return fw_to_bytes(parseInt(num, 10));
      case "c":
        console.log("immed:", a, b, num, eb2code(rest[0]));
        return [eb2code(rest[0])];
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

const parseOperand = (o, labels) => {
  //TODO: should come from Using statement
  const CURRENT_BASE = 15;

  // TODO: expand addresses better
  if (labels[o]) {
    return [0, CURRENT_BASE, ...disp_to_nibs(labels[o])];
  } else {
    return parseImmediate(o);
  }
};

const parseOperands = (stmts, labels) => {
  return stmts.map((s) => {
    s.stmt.operands.forEach((o) => {
      s.bytes.operands.push(...parseOperand(o, labels));
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
  const { stmts, labels } = txt
    .split("\n")
    .filter((v) => !!v)
    .map(tokenize)
    .reduce(assembleStatement, { pc: 0, stmts: [], labels: {} });

  const mapped = parseOperands(stmts, labels);
  const expanded = expandData(mapped);
  console.log(expanded);
  return expanded;
};
