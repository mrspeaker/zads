import { ops, op_name } from "./ops.js";
import { $, $click, toHex, chunk } from "./utils.js";
import { disp_to_nibs, byte_from, fw_to_bytes } from "./bytes.js";

export const bindAssembleUI = (onAssemble) => {
  $click("#btnAsm", () => {
    onAssemble(assembleText($("#src").value));
  });
};

const parseLine = (line) => {
  const tok = line.split(" ").reduce((ac, el, i) => {
    if (i === 0 || el !== "") {
      ac.push(el);
    }
    return ac;
  }, []);

  const [label, op, operands, ...comment] = tok;
  return {
    label,
    op,
    operands: operands?.split(","),
    comment: comment?.join(" "),
  };
};

const assembleStatement = (env, stmt) => {
  const { stmts, labels } = env;
  const { op, operands, label } = stmt;
  const o = op_name[op.toUpperCase()];
  const lbltxt = label ? `[${label}]` : " ";

  if (["DC", "DS"].includes(op.toUpperCase())) {
    // add padding bytes if not on fullword boundary
    if (env.pc % 4 !== 0) {
      stmts.push({
        stmt: { label: "", op: "dc", comment: "", operands: [0, 0] },
        bytes: [o],
        pc: env.pc,
      });
      env.pc += 2;
    }
  }

  if (label) {
    labels[label] = env.pc;
  }
  if (o) {
    stmts.push({ stmt, bytes: [o], pc: env.pc });
    env.pc += ops[o].len;
  } else {
    if (["DC", "DS"].includes(op.toUpperCase())) {
      stmts.push({ stmt, bytes: [o, ...operands], pc: env.pc });
      env.pc += 4; // TODO: needs to be DC len!
    } else {
      console.log("miss:", op, (operands ?? [" "]).join(","), lbltxt);
    }
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
      default:
        console.log("Other parse immediate:", a, num);
        return [parseInt(num, 10)];
    }
  }

  return [parseInt(v, 10)];
};

const mapLabels = (stmts, labels) => {
  //TODO: should come from Using statement
  const CURRENT_BASE = 15;
  return stmts.map((s) => {
    const opout = [];
    s.stmt.operands.forEach((o, i) => {
      if (labels[o]) {
        opout[i] = [0, CURRENT_BASE, ...disp_to_nibs(labels[o])];
      } else {
        opout[i] = parseImmediate(o);
      }
    });
    // TODO: nooope. some bytes are bytes. some are nibbles...
    if (s.stmt.op.toUpperCase() === "DC") {
      s.bytes = opout.flat();
    } else {
      s.bytes.push(...chunk(opout.flat(), 2).map((b) => byte_from(...b)));
    }
    return s;
  });
};

export const assembleText = (txt) => {
  const out = txt
    .split("\n")
    .filter((v) => !!v)
    .map(parseLine)
    .reduce(assembleStatement, { pc: 0, stmts: [], labels: {} });

  const mapped = mapLabels(out.stmts, out.labels);
  return mapped;
};
