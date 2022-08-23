import { ops, op_name } from "./ops.js";
import { $, $click, toHex } from "./utils.js";

export const bindAssembleUI = (onAssemble) => {
  $click("#btnAsm", () => {
    onAssemble(assembleText($("#src").value));
  });
};

const parseLine = (line) => {
  const tok = line.split(" ").reduce((ac, el, i) => {
    if (i === 0) {
      ac.push(el);
    } else {
      if (el !== "") {
        ac.push(el);
      }
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
  const { pc, stmts } = env;
  const { op, operands, label } = stmt;
  const o = op_name[op.toUpperCase()];
  const lbltxt = label ? `[${label}]` : " ";
  if (o) {
    console.log(toHex(env.pc, 4), ops[o].op, operands.join(","), lbltxt);
    stmts.push({ stmt, bytes: [o, ...operands], pc: env.pc });
    env.pc += ops[o].len;
  } else {
    if (["DC"].includes(op.toUpperCase())) {
      console.log(toHex(env.pc, 4), "dc", operands.join(","), lbltxt);
      stmts.push({ stmt, bytes: [o, ...operands], pc: env.pc });
      // TODO.. if PC%4!==0... need ot add padding bytes
      env.pc += 4; // TODO: needs to be DC len!
    } else {
      console.log("miss:", op, (operands ?? [" "]).join(","), lbltxt);
    }
  }

  return env;
};

export const assembleText = (txt) => {
  const out = txt
    .split("\n")
    .filter((v) => !!v)
    .map(parseLine)
    .reduce(assembleStatement, { pc: 0, stmts: [] }).stmts;
  console.log(out);
  return out;
};
